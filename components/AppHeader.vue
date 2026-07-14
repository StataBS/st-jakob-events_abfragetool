<script setup lang="ts">
import IconArrowNorthEast from '@kanton-basel-stadt/designsystem/icons/symbol/arrow-north-east'
import IconCaret from '@kanton-basel-stadt/designsystem/icons/symbol/caret'

type ViewMode = 'tag' | 'woche'

const props = defineProps<{
  viewMode: ViewMode
  modelValue: string
  eventCounts?: Record<string, number>
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void
  (e: 'switchView', to: ViewMode): void
  (e: 'shift', deltaDays: number): void
}>()

const link =
    'https://www.bs.ch/jsd/polizei/unsere-hauptabteilungen/verkehr/bikantonale-geschaeftsstelle-eventverkehr-st-jakob'

// date proxy
const selectedDate = computed({
  get: () => props.modelValue,
  set: (v: string) => emit('update:modelValue', v),
})

const fmtCH = (d: Date, opts: Intl.DateTimeFormatOptions) =>
    d.toLocaleDateString('de-CH', opts)

const weekRange = computed(() => {
  if (props.viewMode !== 'woche') return ''
  const start = new Date(props.modelValue)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  const startStr = fmtCH(start, { day: '2-digit' })
  const endStr = fmtCH(end, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
  return `${startStr}.–${endStr}`
})

const targetMode = computed<ViewMode>(() =>
    props.viewMode === 'woche' ? 'tag' : 'woche',
)
const switchLabel = computed(() =>
    props.viewMode === 'woche' ? 'Tagesansicht' : 'Wochenansicht',
)
const onSwitch = () => emit('switchView', targetMode.value)

// prev/next logic for header buttons
const prevAria = computed(() =>
    props.viewMode === 'woche' ? 'Vorherige Woche' : 'Vorheriger Tag',
)
const nextAria = computed(() =>
    props.viewMode === 'woche' ? 'Nächste Woche' : 'Nächster Tag',
)
const shiftBy = (delta: number) => emit('shift', delta)
</script>

<template>
  <header>
    <div class="page-header">
      <div class="flex items-center flex-nowrap min-w-0 gap-30 lg:gap-60">
        <BSLogo :href="link" />
        <a :href="link" target="_blank" rel="noopener" class="flex items-baseline shrink-0">
          <img
              src="/icons/BL-logo.svg"
              alt="BL Logo"
              class="shrink-0 select-none h-[25px] lg:h-[32px] w-auto relative -top-[1px]"
          />
        </a>
      </div>
    </div>

    <section class="bg-green-100">
      <div class="container py-30 lg:py-50">
        <h1 class="header-title text-green-600 mb-20">
          Veranstaltungen im Raum St. Jakob
        </h1>

        <!-- Date input + arrows + switch -->
        <div class="mt-15">
          <div class="flex flex-wrap items-center gap-20">
            <!-- group: prev | DatePicker | next (never splits) -->
            <div class="flex items-center gap-5 shrink-0">
              <!-- previous day/week -->
              <button
                  type="button"
                  class="button is-action is-icon-only shrink-0"
                  @click="shiftBy(viewMode === 'woche' ? -7 : -1)"
                  :aria-label="prevAria"
                  :title="prevAria"
              >
                <span class="arrow-icon" style="transform: rotate(90deg);">
                  <component :is="IconCaret" data-symbol="caret" />
                </span>
              </button>

              <div class="w-[260px] max-w-full">
                <DatePicker
                    v-model="selectedDate"
                    :event-counts="props.eventCounts"
                    class="w-full"
                />
              </div>

              <!-- next day/week -->
              <button
                  type="button"
                  class="button is-action is-icon-only shrink-0"
                  @click="shiftBy(viewMode === 'woche' ? 7 : 1)"
                  :aria-label="nextAria"
                  :title="nextAria"
              >
                <span class="arrow-icon" style="transform: rotate(-90deg);">
                  <component :is="IconCaret" data-symbol="caret" />
                </span>
              </button>
            </div>

            <!-- single switch button: same line if space, else wraps below -->
            <button
                class="button is-action has-icon shrink-0 !px-10"
                @click="onSwitch"
            >
              <span class="arrow-icon">
                <component :is="IconArrowNorthEast" data-symbol="arrow-north-east" />
              </span>
              {{ switchLabel }}
            </button>
          </div>
        </div>
      </div>
    </section>
  </header>
</template>
