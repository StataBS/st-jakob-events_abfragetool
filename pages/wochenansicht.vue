<!-- pages/wochenansicht.vue -->
<script setup lang="ts">
import { useBsApi } from '~/composables/useBsApi'
import { useFilters } from '~/composables/useFilters'
import { normalizeISODateString, formatGermanLong } from '~/composables/useDateUtils'

const route = useRoute()
const router = useRouter()

const defaultIso = new Date().toISOString().slice(0,10)
const selectedDate = ref<string>((route.query.datum as string) || defaultIso)

// normalize + keep in query (stays on /wochenansicht)
watch(selectedDate, (d) => {
  const n = normalizeISODateString(d) || defaultIso
  if (n !== d) selectedDate.value = n
  router.replace({ path: '/wochenansicht', query: { ...route.query, datum: n } })
})

// date helpers
const iso = (d: Date) => d.toISOString().slice(0,10)
const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x }
// simple: 7-day window starting at selectedDate
const start = computed(() => new Date(selectedDate.value))
const days = computed(() => Array.from({ length: 7 }, (_, i) => iso(addDays(start.value, i))))

// data
const { fetchEvents } = useBsApi()
const { data: eventsRaw } = await useAsyncData('events-week', fetchEvents)
const { filterEventsByDate } = useFilters()

const eventsByDay = computed<Record<string, any[]>>(() => {
  const src = eventsRaw.value || []
  return Object.fromEntries(days.value.map(d => [d, filterEventsByDate(src, d)]))
})

const countFor = (d:string) => (eventsByDay.value[d]?.length || 0)
const goDay = (d:string) => router.push({ path: '/tagesansicht', query: { datum: d } })
const label = (d:string) => formatGermanLong(d) // "Montag, 10.11.2025"
</script>

<template>
  <AppHeader v-model="selectedDate">
    <template #right>
      <!-- right of the datepicker -->
      <NuxtLink
          class="button is-action has-icon"
          :to="{ path: '/tagesansicht', query: { datum: selectedDate } }"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7 10h10v4H7z"/>
        </svg>
        Tagesansicht
      </NuxtLink>
    </template>
  </AppHeader>

  <div class="container">
    <!-- Day tiles under the date picker -->
    <div class="flex gap-20 overflow-x-auto my-20 pb-10">
      <a
          v-for="d in days"
          :key="d"
          :href="`#d-${d}`"
          class="button is-tab"
          :class="{ 'is-active': d === selectedDate }"
      >
        <div class="text-sm mr-10">
          {{ new Date(d).toLocaleDateString('de-CH', { day:'2-digit', month:'2-digit' }) }}
        </div>
        <div class="font-semibold">
          {{ countFor(d) }} {{ countFor(d) === 1 ? 'Event' : 'Events' }}
        </div>
      </a>
    </div>

    <!-- 7 tables -->
    <section v-for="(d, idx) in days" :key="d" :id="`d-${d}`" class="my-60">
      <h2 class="text-2xl font-bold text-gray-900 mb-20">{{ label(d) }}</h2>

      <EventsTable v-if="eventsByDay[d]?.length" :items="eventsByDay[d]" />
      <NoEvents v-else />

      <!-- Switch to Tagesansicht for this day (under every table) -->
      <div class="mt-20">
        <button class="button is-action" @click="goDay(d)">
          Tagesansicht für diesen Tag
        </button>
      </div>
    </section>
  </div>

  <hr class="h-[4px] border-none bg-green-600" />
  <SiteFooter />
</template>
