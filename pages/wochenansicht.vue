<script setup lang="ts">
import { useBsApi } from '~/composables/useBsApi'
import { useFilters } from '~/composables/useFilters'
import { normalizeISODateString } from '~/composables/useDateUtils'
import IconArrowNorthEast from '@kanton-basel-stadt/designsystem/icons/symbol/arrow-north-east'
import IconArrowSouth from '@kanton-basel-stadt/designsystem/icons/symbol/arrow-south'
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
const { data: eventsRaw } = await useAsyncData('events', fetchEvents, { server: false })
const { filterEventsByDate } = useFilters()

const eventsByDay = computed<Record<string, any[]>>(() => {
  const src = eventsRaw.value || []
  return Object.fromEntries(days.value.map(d => [d, filterEventsByDate(src, d)]))
})

const countFor = (d:string) => (eventsByDay.value[d]?.length || 0)

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
      :event-counts="eventCounts"
      @switchView="onSwitch"
      @shift="shiftWeek"
  />

  <div class="container">
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-10 my-20">
      <a
          v-for="d in days"
          :key="d"
          :href="`#d-${d}`"
          class="button is-action !no-underline w-full max-w-[250px]"
          :class="{ 'is-active': d === selectedDate }"
          @click.prevent="onGoDay(d)"
      >
        <div class="flex w-full items-center justify-between md:flex-col md:items-start md:gap-2 md:max-w-[300px]">
          <div class="flex items-center gap-8">
            <span class="arrow-icon shrink-0">
              <component :is="IconArrowSouth" data-symbol="arrow-south" />
            </span>
            <span class="font-medium leading-none text-inherit">
              {{ new Date(d).toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit' }) }}
            </span>
          </div>
          <span class="text-sm text-inherit md:mt-2 ml-5 leading-none">
            {{ countFor(d) }}
            {{ countFor(d) === 1 ? 'Event&#8199;' : 'Events' }}
          </span>
        </div>
      </a>
    </div>

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
      Es kann jederzeit kurzfristig zu Änderungen bei den Events und Sperrungen kommen.<br />
      Je kurzfristiger die Abfrage vor der Veranstaltung getätigt wird, desto verlässlicher ist die Angabe.
    </div>
  </div>

  <hr class="h-[4px] border-none bg-green-600" />
  <SiteFooter />
</template>
