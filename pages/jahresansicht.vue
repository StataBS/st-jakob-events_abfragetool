<script setup lang="ts">
import { useBsApi } from '~/composables/useBsApi'
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

const { fetchEvents } = useBsApi()
const { data: eventsRaw } = await useAsyncData('events', fetchEvents, { server: false })

function eventIso(e: EventItem): string | null {
  const raw = e.datum_iso || e.datum || e.date
  if (!raw) return null
  const iso = String(raw).slice(0, 10)
  return /^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso : null
}

const yearEvents = computed(() => {
  const year = String(selectedYear.value)
  return (eventsRaw.value || []).filter((e: EventItem) => {
    const iso = eventIso(e)
    return iso && iso.startsWith(`${year}-`)
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
    result[iso] = sortEventsByStart(result[iso])
  }
  return result
})

const sperrungByDay = computed<Record<string, EventItem[]>>(() => {
  const result: Record<string, EventItem[]> = {}
  for (const e of yearEvents.value) {
    if (e.sperrung !== 'ja') continue
    const iso = eventIso(e)
    if (!iso) continue
    if (!result[iso]) result[iso] = []
    result[iso].push(e)
  }
  for (const iso of Object.keys(result)) {
    result[iso] = sortEventsByStart(result[iso])
  }
  return result
})

const eventCounts = computed<Record<string, number>>(() => {
  const result: Record<string, number> = {}
  for (const [iso, list] of Object.entries(eventsByDay.value)) {
    result[iso] = list.length
  }
  return result
})

const kpiEventCount = computed(() => yearEvents.value.length)
const kpiSperrungDays = computed(() => Object.keys(sperrungByDay.value).length)
const kpiMultiEventDays = computed(
  () => Object.values(eventsByDay.value).filter(list => list.length > 1).length,
)

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
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-20 my-40">
      <KPICard title="Anzahl Events" :value="kpiEventCount" />
      <KPICard title="Anzahl Tage mit mehreren Events" :value="kpiMultiEventDays" />
      <KPICard title="Anzahl Sperrungen" :value="kpiSperrungDays" />
    </div>

    <section class="mb-60">
      <h2 class="text-2xl font-bold my-20 text-gray-900">Events</h2>
      <YearCalendar
          :year="selectedYear"
          :selected-date="selectedDate"
          variant="events"
          :events-by-day="eventsByDay"
      />
    </section>

    <section class="mb-40">
      <h2 class="text-2xl font-bold my-20 text-gray-900">Sperrungen</h2>
      <YearCalendar
          :year="selectedYear"
          :selected-date="selectedDate"
          variant="sperrungen"
          :events-by-day="sperrungByDay"
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
