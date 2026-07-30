<script setup lang="ts">
import { useBsApi } from '~/composables/useBsApi'
import { buildVisitorTiersByDay } from '~/composables/useBesucher'
import { sortEventsByStart } from '~/composables/useFilters'
import {
  addYearsISO,
  normalizeISODateString,
  todayISODateString,
} from '~/composables/useDateUtils'

type EventItem = Record<string, unknown>
type ViewMode = 'tag' | 'woche' | 'jahr'

const route = useRoute()
const router = useRouter()

const MIN_YEAR = 2025
const defaultIso = todayISODateString()

/** Exact `ort` values from dataset 100419 (hyphenated where applicable). */
const LOCATION_OPTIONS = [
  { label: 'Alle Standorte', value: '' },
  { label: 'St. Jakob-Park', value: 'St. Jakob-Park' },
  { label: 'St. Jakobshalle', value: 'St. Jakobshalle' },
  { label: 'St. Jakob-Arena', value: 'St. Jakob-Arena' },
  { label: 'Gartenbad St. Jakob', value: 'Gartenbad St. Jakob' },
  { label: 'Sportanlage St. Jakob', value: 'Sportanlage St. Jakob' },
  { label: 'Schänzli', value: 'Schänzli' },
  { label: 'Park im Grünen', value: 'Park im Grünen' },
] as const

const selectedOrt = ref('')

function clampToMinYear(iso: string): string {
  const year = Number(iso.slice(0, 4))
  if (year >= MIN_YEAR) return iso
  return `${MIN_YEAR}${iso.slice(4)}`
}

const selectedDate = ref<string>(
  clampToMinYear((route.query.datum as string) || defaultIso),
)

function shiftYear(deltaYears: number) {
  const next = addYearsISO(selectedDate.value, deltaYears)
  const year = Number(next.slice(0, 4))
  if (year < MIN_YEAR) return
  selectedDate.value = next
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

watch(selectedDate, (d) => {
  const n = clampToMinYear(normalizeISODateString(d) || defaultIso)
  if (n !== d) selectedDate.value = n
  router.replace({ path: '/jahresansicht', query: { ...route.query, datum: n } })
})

const selectedYear = computed(() => Number(selectedDate.value.slice(0, 4)))

const { fetchEvents, fetchBesucher } = useBsApi()
const { data: eventsRaw } = await useAsyncData('events', fetchEvents, { server: false })
const { data: besucherRaw } = await useAsyncData('besucher', fetchBesucher, { server: false })

function eventIso(e: EventItem): string | null {
  const raw = e.datum_iso || e.datum || e.date
  if (!raw) return null
  const iso = String(raw).slice(0, 10)
  return /^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso : null
}

const yearEvents = computed(() => {
  const year = String(selectedYear.value)
  const ort = selectedOrt.value
  return (eventsRaw.value || []).filter((e: EventItem) => {
    const iso = eventIso(e)
    if (!iso || !iso.startsWith(`${year}-`)) return false
    if (ort && String(e.ort ?? '') !== ort) return false
    return true
  }) as EventItem[]
})

const eventsByDay = computed<Record<string, EventItem[]>>(() => {
  const result: Record<string, EventItem[]> = {}
  for (const e of yearEvents.value) {
    const iso = eventIso(e)
    if (!iso) continue
    if (!result[iso]) result[iso] = []
    result[iso].push(e)
  }
  for (const iso of Object.keys(result)) {
    result[iso] = sortEventsByStart(result[iso] ?? [])
  }
  return result
})

const visitorsByDay = computed(() => buildVisitorTiersByDay(besucherRaw.value))

const eventCounts = computed<Record<string, number>>(() => {
  const result: Record<string, number> = {}
  for (const [iso, list] of Object.entries(eventsByDay.value)) {
    result[iso] = list.length
  }
  return result
})

const kpiEventCount = computed(() => yearEvents.value.length)
const kpiSperrungDays = computed(() => {
  const days = new Set<string>()
  for (const e of yearEvents.value) {
    if (e.sperrung !== 'ja') continue
    const iso = eventIso(e)
    if (iso) days.add(iso)
  }
  return days.size
})
const kpiMultiEventDays = computed(
  () => Object.values(eventsByDay.value).filter(list => list.length > 1).length,
)

const LEGEND = [
  { class: 'bg-gray-50', label: 'keine Veranstaltung' },
  { class: 'bg-gray-300', label: 'Besucherzahl unbekannt' },
  { class: 'bg-blue-300', label: 'unter 5’000' },
  { class: 'bg-blue-500', label: '5’000 bis 14’999' },
  { class: 'bg-blue-700', label: '15’000 und mehr' },
] as const

function onSwitch(to: ViewMode) {
  if (to === 'tag') {
    router.push({ path: '/tagesansicht', query: { datum: selectedDate.value } })
  } else if (to === 'woche') {
    router.push({ path: '/wochenansicht', query: { datum: selectedDate.value } })
  }
}
</script>

<template>
  <AppHeader
      viewMode="jahr"
      v-model="selectedDate"
      :event-counts="eventCounts"
      @switchView="onSwitch"
      @shift="shiftYear"
  />

  <div class="container">
    <div class="max-w-[360px] mt-40 mb-20">
      <DropdownSelect
          v-model="selectedOrt"
          label="Standort"
          :options="[...LOCATION_OPTIONS]"
      />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-20 mb-40">
      <KPICard title="Anzahl Events" :value="kpiEventCount" />
      <KPICard title="Anzahl Tage mit mehreren Events" :value="kpiMultiEventDays" />
      <KPICard title="Anzahl Sperrungen" :value="kpiSperrungDays" />
    </div>

    <section class="mb-40">
      <h2 class="text-2xl font-bold my-20 text-gray-900">
        Erwartete Besucherzahl und Sperrungen
      </h2>

      <div class="year-calendar-legend" role="list">
        <span
            v-for="item in LEGEND"
            :key="item.label"
            class="year-calendar-legend__item"
            role="listitem"
        >
          <span class="year-calendar-legend__swatch" :class="item.class" aria-hidden="true" />
          {{ item.label }}
        </span>
        <span class="year-calendar-legend__item" role="listitem">
          <span
              class="year-calendar-legend__swatch year-calendar-legend__swatch--sperrung"
              aria-hidden="true"
          />
          Sperrung
        </span>
      </div>

      <YearCalendar
          :year="selectedYear"
          :events-by-day="eventsByDay"
          :visitor-tiers-by-day="visitorsByDay"
      />
    </section>

    <div class="my-30 text-gray-700">
      Es kann jederzeit kurzfristig zu Änderungen bei den Events und Sperrungen kommen.<br />
      Je kurzfristiger die Abfrage vor der Veranstaltung getätigt wird, desto verlässlicher ist die Angabe.
    </div>
  </div>

  <hr class="h-[4px] border-none bg-green-600" />
  <SiteFooter />
</template>
