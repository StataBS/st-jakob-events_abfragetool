<script setup lang="ts">
import IconClose from '@kanton-basel-stadt/designsystem/icons/symbol/close'
import IconCaret from '@kanton-basel-stadt/designsystem/icons/symbol/caret'

const props = defineProps<{
  images: string[]
  alts?: string[]
  index: number
  open: boolean
}>()

const emit = defineEmits<{
  close: []
  'update:index': [index: number]
}>()

const MIN_SCALE = 1
const MAX_SCALE = 5

const scale = ref(1)
const tx = ref(0)
const ty = ref(0)

const dragging = ref(false)
const dragStart = { x: 0, y: 0, tx: 0, ty: 0 }

let pinchStartDist = 0
let pinchStartScale = 1

const transformStyle = computed(() => ({
  transform: `translate(${tx.value}px, ${ty.value}px) scale(${scale.value})`,
  cursor: scale.value > 1 ? (dragging.value ? 'grabbing' : 'grab') : 'zoom-in',
}))

const currentAlt = computed(() => props.alts?.[props.index] || '')
const hasMultiple = computed(() => props.images.length > 1)

function resetTransform() {
  scale.value = 1
  tx.value = 0
  ty.value = 0
}

function close() {
  resetTransform()
  emit('close')
}

function go(delta: number) {
  if (!hasMultiple.value) return
  const next = (props.index + delta + props.images.length) % props.images.length
  resetTransform()
  emit('update:index', next)
}

function clampScale(value: number) {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, value))
}

function zoomAt(delta: number) {
  const next = clampScale(scale.value + delta)
  if (next === 1) {
    tx.value = 0
    ty.value = 0
  }
  scale.value = next
}

function onWheel(e: WheelEvent) {
  e.preventDefault()
  zoomAt(-e.deltaY * 0.002)
}

function onPointerDown(e: PointerEvent) {
  if (e.button !== 0) return
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  dragging.value = true
  dragStart.x = e.clientX
  dragStart.y = e.clientY
  dragStart.tx = tx.value
  dragStart.ty = ty.value
}

function onPointerMove(e: PointerEvent) {
  if (!dragging.value || scale.value <= 1) return
  tx.value = dragStart.tx + (e.clientX - dragStart.x)
  ty.value = dragStart.ty + (e.clientY - dragStart.y)
}

function onPointerUp(e: PointerEvent) {
  dragging.value = false
  try {
    ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
  } catch {
    /* already released */
  }
}

function onDblClick() {
  if (scale.value > 1) {
    resetTransform()
  } else {
    scale.value = 2.5
  }
}

function touchDistance(touches: TouchList) {
  const [a, b] = [touches[0], touches[1]]
  return Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY)
}

function onTouchStart(e: TouchEvent) {
  if (e.touches.length === 2) {
    pinchStartDist = touchDistance(e.touches)
    pinchStartScale = scale.value
  }
}

function onTouchMove(e: TouchEvent) {
  if (e.touches.length === 2 && pinchStartDist > 0) {
    e.preventDefault()
    const ratio = touchDistance(e.touches) / pinchStartDist
    const next = clampScale(pinchStartScale * ratio)
    scale.value = next
    if (next === 1) {
      tx.value = 0
      ty.value = 0
    }
  }
}

function onKeydown(e: KeyboardEvent) {
  if (!props.open) return
  if (e.key === 'Escape') close()
  if (e.key === 'ArrowLeft') go(-1)
  if (e.key === 'ArrowRight') go(1)
  if (e.key === '+' || e.key === '=') zoomAt(0.25)
  if (e.key === '-') zoomAt(-0.25)
  if (e.key === '0') resetTransform()
}

watch(() => props.open, (isOpen) => {
  if (typeof document === 'undefined') return
  document.body.style.overflow = isOpen ? 'hidden' : ''
  if (isOpen) resetTransform()
})

watch(() => props.index, () => {
  if (props.open) resetTransform()
})

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  if (typeof document !== 'undefined') document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <div
        v-if="open"
        class="lightbox"
        role="dialog"
        aria-modal="true"
        :aria-label="currentAlt || 'Bildansicht'"
        @click.self="close"
    >
      <div class="lightbox__toolbar">
        <p v-if="hasMultiple" class="lightbox__counter">
          {{ index + 1 }} / {{ images.length }}
        </p>
        <div v-else />

        <div class="lightbox__actions">
          <button type="button" class="lightbox__btn" aria-label="Verkleinern" @click="zoomAt(-0.5)">−</button>
          <button type="button" class="lightbox__btn" aria-label="Vergrössern" @click="zoomAt(0.5)">+</button>
          <button type="button" class="lightbox__btn" aria-label="Schliessen" @click="close">
            <component :is="IconClose" class="lightbox__icon" data-symbol="close" />
          </button>
        </div>
      </div>

      <button
          v-if="hasMultiple"
          type="button"
          class="lightbox__nav lightbox__nav--prev"
          aria-label="Vorheriges Bild"
          @click="go(-1)"
      >
        <component :is="IconCaret" class="lightbox__icon lightbox__icon--prev" data-symbol="caret" />
      </button>

      <button
          v-if="hasMultiple"
          type="button"
          class="lightbox__nav lightbox__nav--next"
          aria-label="Nächstes Bild"
          @click="go(1)"
      >
        <component :is="IconCaret" class="lightbox__icon lightbox__icon--next" data-symbol="caret" />
      </button>

      <div
          class="lightbox__stage"
          @wheel.prevent="onWheel"
          @touchstart.passive="onTouchStart"
          @touchmove="onTouchMove"
          @click.self="close"
      >
        <img
            :src="images[index]"
            :alt="currentAlt"
            class="lightbox__img"
            :style="transformStyle"
            draggable="false"
            @pointerdown="onPointerDown"
            @pointermove="onPointerMove"
            @pointerup="onPointerUp"
            @pointercancel="onPointerUp"
            @dblclick.prevent="onDblClick"
            @click.stop
        />
      </div>

      <p class="lightbox__hint">
        Scrollen oder Pinch zum Zoomen · Doppelklick · Esc schliesst
      </p>
    </div>
  </Teleport>
</template>
