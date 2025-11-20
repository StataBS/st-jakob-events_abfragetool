<script setup lang="ts">
import { useBsApi } from '~/composables/useBsApi'
import { useFilters } from '~/composables/useFilters'
import { normalizeISODateString } from '~/composables/useDateUtils'

const route = useRoute()
const router = useRouter()

// date param (default today, ISO-UTC)
const defaultIso = new Date().toISOString().slice(0,10)
const selectedDate = ref<string>((route.query.datum as string) || defaultIso)

// shift by +/- N days (used by AppHeader arrows)
function shiftDay(delta: number) {
  const base = new Date(selectedDate.value)
  base.setDate(base.getDate() + delta)
  const nextIso = base.toISOString().slice(0, 10)
  selectedDate.value = nextIso
}

// normalize + reflect in query
watch(selectedDate, (d) => {
  const n = normalizeISODateString(d) || defaultIso
  if (n !== d) selectedDate.value = n
  router.replace({ path: '/tagesansicht', query: { ...route.query, datum: n } })
})

// normalize + reflect in query
watch(selectedDate, (d) => {
  const n = normalizeISODateString(d) || defaultIso
  if (n !== d) selectedDate.value = n
  router.replace({ path: '/tagesansicht', query: { ...route.query, datum: n } })
})

// fetch
const { fetchEvents, fetchAnreise, fetchTimedInfo } = useBsApi()
const { data: eventsRaw }  = await useAsyncData('events', fetchEvents)
const { data: anreiseRaw } = await useAsyncData('anreise', fetchAnreise)
const { data: infoTRaw }   = await useAsyncData('infoT',  fetchTimedInfo)

// filters
const { filterEventsByDate, filterTimedInfoCoveringDate } = useFilters()
const events = computed(() => filterEventsByDate(eventsRaw.value || [], selectedDate.value))
const timedInfosForDay = computed(() => filterTimedInfoCoveringDate(infoTRaw.value || [], selectedDate.value))

// warning names
const warningNames = computed<string[]>(() => {
  const names = new Set((events.value || []).filter((e:any) => e.sperrung === 'ja').map((e:any) => e.name))
  return Array.from(names)
})

// info texts
const infoTexts = computed<string[]>(() => {
  const set = new Set((events.value || []).map((e:any) => (e.info_text_html || '').trim()).filter(Boolean))
  return Array.from(set)
})

// transport + recommendation
const activeTransport = ref<'Velo'|'Bus'|'Tram'|'Zug'|'Auto'|'Barrierefrei'>('Velo')
const anreiseItem = computed(() => {
  const data = anreiseRaw.value || []
  const hasSperrung = (events.value || []).some((e:any) => e.sperrung === 'ja')
  const hasZusatzpp = (events.value || []).some((e:any) => e.zusatzpp === true)
  return data.find((it:any) =>
      it.verkehrsmittel === activeTransport.value &&
      it.sperrung === hasSperrung &&
      (activeTransport.value !== 'Auto' || it.zusatzpp === hasZusatzpp)
  )
})

const iconUrl = (file: string) => `icons/${file}`
const iconFileByTransport = {
  Velo: 'bicycle.svg', Bus: 'bus.svg', Tram: 'tram.svg',
  Zug: 'train.svg', Auto: 'car.svg', Barrierefrei: 'accessibility-sign.svg',
} as const
const iconSrcMap = computed<Record<string, string>>(
    () => Object.fromEntries(Object.entries(iconFileByTransport).map(([k,f]) => [k, iconUrl(f)]))
)

// switch handler (go to Wochenansicht)
function onSwitch(to: 'tag'|'woche') {
  if (to === 'woche') {
    router.push({ path: '/wochenansicht', query: { datum: selectedDate.value } })
  }
}
</script>

<template>
  <AppHeader
      viewMode="tag"
      v-model="selectedDate"
      @switchView="onSwitch"
      @shift="shiftDay"
  />

  <div class="container">
    <div class="my-60">
      <EventsTable v-if="events.length" :items="events" />
      <NoEvents v-else />
    </div>

    <WarningBox :names="warningNames" />
    <InfoBox :htmlBlocks="infoTexts" />
    <TimedInfoBox :items="timedInfosForDay" />

    <h2 class="text-2xl font-bold my-20 text-gray-900">Anreiseempfehlungen</h2>
    <TransportTabs v-model="activeTransport" :icon-src-map="iconSrcMap" />

    <RecommendationBox
        :title="`${activeTransport}`"
        :html="anreiseItem?.text_html"
        :images="anreiseItem?.bildquellen"
        :alts="anreiseItem?.alt_texte"
        :icon-src="iconSrcMap[activeTransport]"
    />

    <div class="my-30 text-gray-700">
      Es kann jederzeit kurzfristig zu Änderungen bei den Events und Sperrungen kommen. Je kurzfristiger die Abfrage vor der Veranstaltung getätigt wird, desto verlässlicher ist die Angabe.
    </div>
  </div>

  <hr class="h-[4px] border-none bg-green-600" />
  <SiteFooter />
</template>
