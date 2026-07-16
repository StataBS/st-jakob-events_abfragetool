<script setup lang="ts">
import IconArrowNorthEast from '@kanton-basel-stadt/designsystem/icons/symbol/arrow-north-east'
import IconCaret from '@kanton-basel-stadt/designsystem/icons/symbol/caret'
import { parseISO } from '~/composables/useDateUtils'

export type ViewMode = 'tag' | 'woche' | 'jahr'

const props = defineProps<{
  viewMode: ViewMode
  modelValue: string
  eventCounts?: Record<string, number>
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void
  (e: 'switchView', to: ViewMode): void
  (e: 'shift', delta: number): void
}>()

const link =
    'https://www.bs.ch/jsd/polizei/unsere-hauptabteilungen/verkehr/bikantonale-geschaeftsstelle-eventverkehr-st-jakob'

const selectedDate = computed({
  get: () => props.modelValue,
  set: (v: string) => emit('update:modelValue', v),
})

const selectedYear = computed(() => {
  const d = parseISO(props.modelValue)
  return d ? d.getFullYear() : new Date().getFullYear()
})

const switchTargets = computed<{ to: ViewMode; label: string }[]>(() => {
  const all: { to: ViewMode; label: string }[] = [
    { to: 'tag', label: 'Tagesansicht' },
    { to: 'woche', label: 'Wochenansicht' },
    { to: 'jahr', label: 'Jahresansicht' },
  ]
  return all.filter(t => t.to !== props.viewMode)
})

const prevAria = computed(() => {
  if (props.viewMode === 'jahr') return 'Vorheriges Jahr'
  if (props.viewMode === 'woche') return 'Vorherige Woche'
  return 'Vorheriger Tag'
})

const nextAria = computed(() => {
  if (props.viewMode === 'jahr') return 'Nächstes Jahr'
  if (props.viewMode === 'woche') return 'Nächste Woche'
  return 'Nächster Tag'
})

const shiftBy = (direction: -1 | 1) => {
  if (props.viewMode === 'jahr') emit('shift', direction)
  else if (props.viewMode === 'woche') emit('shift', direction * 7)
  else emit('shift', direction)
}
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

        <div class="mt-15">
          <div class="flex flex-wrap items-center gap-20">
            <div class="flex items-center gap-5 shrink-0">
              <button
                  type="button"
                  class="button is-action is-icon-only shrink-0"
                  @click="shiftBy(-1)"
                  :aria-label="prevAria"
                  :title="prevAria"
              >
                <span class="arrow-icon" style="transform: rotate(90deg);">
                  <component :is="IconCaret" data-symbol="caret" />
                </span>
              </button>

              <div v-if="viewMode === 'jahr'" class="w-[260px] max-w-full">
                <div
                    class="flex items-center justify-center h-[44px] px-15 bg-white border border-gray-300 rounded text-base font-bold text-gray-900"
                    aria-live="polite"
                >
                  {{ selectedYear }}
                </div>
              </div>
              <div v-else class="w-[260px] max-w-full">
                <DatePicker
                    v-model="selectedDate"
                    :event-counts="props.eventCounts"
                    class="w-full"
                />
              </div>

              <button
                  type="button"
                  class="button is-action is-icon-only shrink-0"
                  @click="shiftBy(1)"
                  :aria-label="nextAria"
                  :title="nextAria"
              >
                <span class="arrow-icon" style="transform: rotate(-90deg);">
                  <component :is="IconCaret" data-symbol="caret" />
                </span>
              </button>
            </div>

            <div class="flex flex-wrap items-center gap-10">
              <button
                  v-for="t in switchTargets"
                  :key="t.to"
                  type="button"
                  class="button is-action has-icon shrink-0 !px-10"
                  @click="emit('switchView', t.to)"
              >
                <span class="arrow-icon">
                  <component :is="IconArrowNorthEast" data-symbol="arrow-north-east" />
                </span>
                {{ t.label }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </header>
</template>
