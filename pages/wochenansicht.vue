<script setup lang="ts">
import { useBsApi } from '~/composables/useBsApi'
import { useFilters } from '~/composables/useFilters'
import { normalizeISODateString } from '~/composables/useDateUtils'
import IconArrowNorthEast from '@kanton-basel-stadt/designsystem/icons/symbol/arrow-north-east'
import IconCaret from '@kanton-basel-stadt/designsystem/icons/symbol/caret'

// helper to move the selected week by +/- 7 days
function shiftWeek(deltaDays: number) {
  const base = new Date(selectedDate.value)
  base.setDate(base.getDate() + deltaDays)
  const nextIso = iso(base)
  selectedDate.value = nextIso
  // scroll to top so users see the new week header immediately
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const route = useRoute()
const router = useRouter()

const defaultIso = new Date().toISOString().slice(0,10)
const selectedDate = ref<string>((route.query.datum as string) || defaultIso)

watch(selectedDate, (d) => {
  const n = normalizeISODateString(d) || defaultIso
  if (n !== d) selectedDate.value = n
  router.replace({ path: '/wochenansicht', query: { ...route.query, datum: n } })
})

const iso = (d: Date) => d.toISOString().slice(0,10)
const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate()+n); return x }
const start = computed(() => new Date(selectedDate.value))
const days = computed(() => Array.from({length:7}, (_,i) => iso(addDays(start.value, i))))

const { fetchEvents } = useBsApi()
const { data: eventsRaw } = await useAsyncData('events', fetchEvents)
const { filterEventsByDate } = useFilters()

const eventsByDay = computed<Record<string, any[]>>(() => {
  const src = eventsRaw.value || []
  return Object.fromEntries(days.value.map(d => [d, filterEventsByDate(src, d)]))
})

const countFor = (d:string) => (eventsByDay.value[d]?.length || 0)

// label like "Montag, 10.11.2025"
const label = (d:string) =>
    new Date(d).toLocaleDateString('de-CH', {
      weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric'
    })

// scroll to the table section for the clicked day
function onGoDay(d:string) {
  const el = document.getElementById(`d-${d}`)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// switch to Tagesansicht with same date
function onSwitch(to: 'tag'|'woche') {
  if (to === 'tag') router.push({ path: '/tagesansicht', query: { datum: selectedDate.value } })
}
</script>

<template>
  <AppHeader
      viewMode="woche"
      v-model="selectedDate"
      :days="days"
      :countFor="countFor"
      @goDay="onGoDay"
      @switchView="onSwitch"
      @shift="shiftWeek"
  />

  <div class="container">
    <section
        v-for="d in days"
        :key="d"
        :id="`d-${d}`"
        class="my-60"
    >
      <div class="flex items-center gap-10 min-w-[200px] mb-10">
        <h2 class="text-2xl font-bold text-gray-900 whitespace-nowrap">
          {{ label(d) }}
        </h2>

        <!-- icon-only Tagesansicht button (mobile only) -->
        <button
            class="button is-action is-icon-only lg:hidden shrink-0"
            @click="$router.push({ path: '/tagesansicht', query: { datum: d } })"
            :aria-label="`Tagesansicht für ${label(d)}`"
        >
      <span class="arrow-icon">
        <component :is="IconArrowNorthEast" data-symbol="arrow-north-east" />
      </span>
        </button>
      </div>

      <EventsTable v-if="eventsByDay[d]?.length" :items="eventsByDay[d]" />
      <NoEvents v-else />
    </section>
    <!-- Week paging controls -->
    <div class="flex flex-wrap justify-center items-center gap-20 my-40">
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
    <div class="my-30 text-gray-700">
      Es kann jederzeit kurzfristig zu Änderungen bei den Events und Sperrungen kommen. Je kurzfristiger die Abfrage vor der Veranstaltung getätigt wird, desto verlässlicher ist die Angabe.
    </div>
  </div>

  <hr class="h-[4px] border-none bg-green-600" />
  <SiteFooter />
</template>
