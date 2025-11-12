<script setup lang="ts">
import IconArrowEast from '@kanton-basel-stadt/designsystem/icons/symbol/arrow-east'
import IconArrowSouth from '@kanton-basel-stadt/designsystem/icons/symbol/arrow-south'

type ViewMode = 'tag' | 'woche'

const props = defineProps<{
  viewMode: ViewMode
  // v-model date (ISO: YYYY-MM-DD)
  modelValue: string
  // Only needed for Wochenansicht (7-day strip)
  days?: string[]
  countFor?: (d: string) => number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void
  (e: 'switchView', to: ViewMode): void
  (e: 'goDay', iso: string): void
}>()

const link =
    'https://www.bs.ch/jsd/polizei/unsere-hauptabteilungen/verkehr/bikantonale-geschaeftsstelle-eventverkehr-st-jakob'

// date proxy
const selectedDate = computed({
  get: () => props.modelValue,
  set: (v: string) => emit('update:modelValue', v),
})

// computed week label (visual range) for Wochenansicht
const fmtCH = (d: Date, opts: Intl.DateTimeFormatOptions) =>
    d.toLocaleDateString('de-CH', opts)

const weekRange = computed(() => {
  if (props.viewMode !== 'woche') return ''
  const start = new Date(props.modelValue)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  // Example: 10.–16.11.2025
  const startStr = fmtCH(start, { day: '2-digit' })
  const endStr = fmtCH(end, { day: '2-digit', month: '2-digit', year: 'numeric' })
  return `${startStr}.–${endStr}`
})

// toggle target + label
const targetMode = computed<ViewMode>(() => (props.viewMode === 'woche' ? 'tag' : 'woche'))
const switchLabel = computed(() => (props.viewMode === 'woche' ? 'Tagesansicht' : 'Wochenansicht'))
const onSwitch = () => emit('switchView', targetMode.value)

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

        <!-- Date input + switch -->
        <div class="mt-15 flex items-center gap-10">
          <DatePicker v-model="selectedDate" />

          <!-- switch sits directly right of the date input -->
          <button v-if="props.viewMode === 'tag'" class="button is-action has-icon lg:hidden" @click="onSwitch">
            <span class="arrow-icon">
              <component :is="IconArrowEast" data-symbol="arrow-east" />
            </span>
            {{ switchLabel }}
          </button>
        </div>
        <div
            v-if="props.viewMode === 'woche' && props.days?.length"
            class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-10 my-20"
        >
          <a
              v-for="d in props.days"
              :key="d"
              :href="`#d-${d}`"
              class="button is-action !no-underline w-full max-w-[250px]"
              :class="{ 'is-active': d === props.selectedDate }"
          >
            <div
                class="flex w-full items-center justify-between md:flex-col md:items-start md:gap-2 md:max-w-[300px]"
            >
              <!-- Arrow + date -->
              <div class="flex items-center gap-8">
                <span class="arrow-icon shrink-0">
                  <component :is="IconArrowSouth" data-symbol="arrow-south" />
                </span>
                <span class="font-medium leading-none">
                  {{ new Date(d).toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit' }) }}
                </span>
              </div>

              <!-- Count -->
              <span class="text-sm text-gray-700 md:mt-2 leading-none">
                {{ props.countFor ? props.countFor(d) : 0 }}
                {{ props.countFor && props.countFor(d) === 1 ? 'Event&#8199;' : 'Events' }}
              </span>
            </div>
          </a>
        </div>
      </div>
    </section>
  </header>
</template>
