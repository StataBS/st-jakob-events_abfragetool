<script setup lang="ts">
import { max } from 'd3-array'
import { scaleLinear } from 'd3-scale'
import { select } from 'd3-selection'
import { area, line } from 'd3-shape'

const props = withDefaults(
  defineProps<{
    values: number[]
    color?: string
    height?: number
  }>(),
  {
    color: '#2A9749',
    height: 90,
  },
)

const LABEL_LEFT = 'Januar'
const LABEL_RIGHT = 'Dezember'

const rootEl = ref<HTMLElement | null>(null)
const svgEl = ref<SVGSVGElement | null>(null)
const width = ref(0)

const gradientId = `sparkline-fill-${Math.random().toString(36).slice(2, 9)}`

function draw() {
  const svgNode = svgEl.value
  if (!svgNode || width.value <= 0) return

  const values = props.values
  const h = props.height
  const w = width.value
  const padX = 4
  const padTop = 8
  const labelH = 18
  const chartBottom = h - labelH

  const svg = select(svgNode)
  svg.selectAll('*').remove()
  svg.attr('width', w).attr('height', h).attr('viewBox', `0 0 ${w} ${h}`)

  if (values.length === 0) return

  const yMax = Math.max(max(values) ?? 0, 1)
  // Stretch available months across full width (partial years like 2026 fill the card).
  const xMax = Math.max(values.length - 1, 1)
  const x = scaleLinear().domain([0, xMax]).range([padX, w - padX])
  const y = scaleLinear()
    .domain([-yMax * 0.08, yMax * 1.1])
    .range([chartBottom, padTop])

  const defs = svg.append('defs')
  const gradient = defs
    .append('linearGradient')
    .attr('id', gradientId)
    .attr('x1', '0')
    .attr('y1', '0')
    .attr('x2', '0')
    .attr('y2', '1')
  gradient
    .append('stop')
    .attr('offset', '0%')
    .attr('stop-color', props.color)
    .attr('stop-opacity', 0.35)
  gradient
    .append('stop')
    .attr('offset', '100%')
    .attr('stop-color', props.color)
    .attr('stop-opacity', 0)

  const areaGen = area<number>()
    .x((_, i) => x(i))
    .y0(y(0))
    .y1(d => y(d))

  const lineGen = line<number>()
    .x((_, i) => x(i))
    .y(d => y(d))

  svg
    .append('path')
    .datum(values)
    .attr('fill', `url(#${gradientId})`)
    .attr('d', areaGen)

  svg
    .append('path')
    .datum(values)
    .attr('fill', 'none')
    .attr('stroke', props.color)
    .attr('stroke-width', 2)
    .attr('stroke-linejoin', 'round')
    .attr('stroke-linecap', 'round')
    .attr('d', lineGen)

  const labelY = h - 4
  svg
    .append('text')
    .attr('x', padX)
    .attr('y', labelY)
    .attr('text-anchor', 'start')
    .attr('fill', '#949494')
    .attr('font-size', 11)
    .text(LABEL_LEFT)

  svg
    .append('text')
    .attr('x', w - padX)
    .attr('y', labelY)
    .attr('text-anchor', 'end')
    .attr('fill', '#949494')
    .attr('font-size', 11)
    .text(LABEL_RIGHT)
}

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  if (!rootEl.value) return
  resizeObserver = new ResizeObserver((entries) => {
    const entry = entries[0]
    if (!entry) return
    const next = Math.floor(entry.contentRect.width)
    if (next > 0 && next !== width.value) {
      width.value = next
    }
  })
  resizeObserver.observe(rootEl.value)
  width.value = Math.floor(rootEl.value.clientWidth)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
})

watch(
  () => [props.values, props.color, props.height, width.value] as const,
  () => draw(),
  { deep: true },
)
</script>

<template>
  <div
    ref="rootEl"
    class="sparkline"
    role="img"
    :aria-label="`Trend von ${LABEL_LEFT} bis ${LABEL_RIGHT}`"
  >
    <svg ref="svgEl" class="sparkline__svg" />
  </div>
</template>
