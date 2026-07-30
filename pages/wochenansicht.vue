<script setup lang="ts">
import { useBsApi } from '~/composables/useBsApi'
import {
  besucherTierForDay,
  buildVisitorTiersByDay,
} from '~/composables/useBesucher'
import { useFilters } from '~/composables/useFilters'
import {
  addDaysISO,
  normalizeISODateString,
  parseISO,
  todayISODateString,
} from '~/composables/useDateUtils'
import IconArrowNorthEast from '@kanton-basel-stadt/designsystem/icons/symbol/arrow-north-east'
import IconCaret from '@kanton-basel-stadt/designsystem/icons/symbol/caret'

// helper to move the selected week by +/- 7 days
function shiftWeek(deltaDays: number) {
  selectedDate.value = addDaysISO(selectedDate.value, deltaDays)
  // scroll to top so users see the new week header immediately
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const route = useRoute()
const router = useRouter()

const defaultIso = todayISODateString()
const selectedDate = ref<string>((route.query.datum as string) || defaultIso)

watch(selectedDate, (d) => {
  const n = normalizeISODateString(d) || defaultIso
  if (n !== d) selectedDate.value = n
  router.replace({ path: '/wochenansicht', query: { ...route.query, datum: n } })
})

const days = computed(() =>
  Array.from({ length: 7 }, (_, i) => addDaysISO(selectedDate.value, i)),
)

const { fetchEvents, fetchBesucher } = useBsApi()
const { data: eventsRaw } = await useAsyncData('events', fetchEvents, { server: false })
const { data: besucherRaw } = await useAsyncData('besucher', fetchBesucher, { server: false })
const { filterEventsByDate } = useFilters()

const eventsByDay = computed<Record<string, any[]>>(() => {
  const src = eventsRaw.value || []
  return Object.fromEntries(days.value.map(d => [d, filterEventsByDate(src, d)]))
})

const visitorsByDay = computed(() => buildVisitorTiersByDay(besucherRaw.value))

const countFor = (d:string) => (eventsByDay.value[d]?.length || 0)

const tierFor = (d: string) =>
  besucherTierForDay(countFor(d) > 0, visitorsByDay.value[d])

const eventCounts = computed<Record<string, number>>(() => {
  const result: Record<string, number> = {}
  const src = eventsRaw.value || []

  for (const e of src) {
    const raw = e.datum_iso || e.datum || e.date
    if (!raw) continue

    const iso = String(raw).slice(0, 10)
    if (!iso.match(/^\d{4}-\d{2}-\d{2}$/)) continue

    result[iso] = (result[iso] || 0) + 1
  }

  return result
})


// label like "Montag, 10.11.2025"
const label = (d: string) =>
    (parseISO(d) ?? new Date()).toLocaleDateString('de-CH', {
      weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric'
    })

// short date for KPI titles, e.g. "30.07.2026"
const dayTitle = (d: string) =>
  (parseISO(d) ?? new Date()).toLocaleDateString('de-CH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

// scroll to the table section for the clicked day
function onGoDay(d: string) {
  const el = document.getElementById(`d-${d}`)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// switch to Tagesansicht / Jahresansicht with same date
function onSwitch(to: 'tag'|'woche'|'jahr') {
  if (to === 'tag') router.push({ path: '/tagesansicht', query: { datum: selectedDate.value } })
  else if (to === 'jahr') router.push({ path: '/jahresansicht', query: { datum: selectedDate.value } })
}
</script>

<template>
  <AppHeader
      viewMode="woche"
      v-model="selectedDate"
      :event-counts="eventCounts"
      @switchView="onSwitch"
      @shift="shiftWeek"
  />

  <div class="container">
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-20 mt-40 mb-40">
      <KPICard
          v-for="d in days"
          :key="d"
          :title="dayTitle(d)"
          description="Anzahl Events"
          :value="countFor(d)"
          :href="`#d-${d}`"
          @click.prevent="onGoDay(d)"
      />
    </div>

    <div class="space-y-40">
      <section
          v-for="d in days"
          :key="d"
          :id="`d-${d}`"
      >
        <div class="flex items-center gap-10 min-w-[200px] mb-10">
          <h2 class="text-2xl font-bold text-gray-900 whitespace-nowrap">
            {{ label(d) }}
          </h2>
          <BesucherIcon :tier="tierFor(d)" />

          <!-- icon-only Tagesansicht button -->
          <button
              class="button is-action is-icon-only shrink-0"
              @click="$router.push({ path: '/tagesansicht', query: { datum: d } })"
              :aria-label="`Tagesansicht für ${label(d)}`"
          >
        <span class="arrow-icon">
          <component :is="IconArrowNorthEast" data-symbol="arrow-north-east" />
        </span>
          </button>
        </div>

        <EventsTable v-if="eventsByDay[d]?.length" :items="eventsByDay[d]" show-sperrung-hover />
        <NoEvents v-else />
      </section>
    </div>
    <!-- Week paging controls -->
    <div class="flex flex-wrap justify-center items-center gap-20 mt-40 mb-40">
      <button
          class="button !px-10 is-action has-icon"
          @click="shiftWeek(-7)"
      >
        <span class="arrow-icon" style="transform: rotate(90deg);">
          <component :is="IconCaret" data-symbol="caret" />
        </span>
        Vorherige Woche
      </button>
      <button
          class="button !px-10 is-action has-icon"
          @click="shiftWeek(7)"
      >
        Nächste Woche
        <span class="arrow-icon" style="transform: rotate(-90deg);">
          <component :is="IconCaret" data-symbol="caret" />
        </span>
      </button>
    </div>
    <div class="mt-40 mb-30 text-gray-700">
      Es kann jederzeit kurzfristig zu Änderungen bei den Events und Sperrungen kommen.<br />
      Je kurzfristiger die Abfrage vor der Veranstaltung getätigt wird, desto verlässlicher ist die Angabe.
    </div>
  </div>

  <hr class="h-[4px] border-none bg-green-600" />
  <SiteFooter />
</template>
