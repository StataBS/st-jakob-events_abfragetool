<script setup lang="ts">
import { useBsApi } from '~/composables/useBsApi'
import { useFilters } from '~/composables/useFilters'
import { normalizeISODateString } from '~/composables/useDateUtils'

const route = useRoute()
const router = useRouter()

// date param (default today, ISO-UTC)
const defaultIso = new Date().toISOString().slice(0,10);
const selectedDate = ref<string>((route.query.datum as string) || defaultIso);

// whenever it changes, normalize + reflect in query
watch(selectedDate, (d) => {
  const n = normalizeISODateString(d) || defaultIso;
  if (n !== d) selectedDate.value = n;               // snap to a valid day (e.g., 2025-02-31 → 2025-02-28)
  router.replace({ query: { ...route.query, datum: n } });
});

// fetch data
const { fetchEvents, fetchAnreise, fetchTimedInfo } = useBsApi()
const { data: eventsRaw }  = await useAsyncData('events', fetchEvents)
const { data: anreiseRaw } = await useAsyncData('anreise', fetchAnreise)
const { data: infoTRaw }   = await useAsyncData('infoT',  fetchTimedInfo)

// computed filters
const { filterEventsByDate, filterTimedInfoCoveringDate } = useFilters()
const events = computed(() => filterEventsByDate(eventsRaw.value || [], selectedDate.value))
const timedInfosForDay = computed(() => filterTimedInfoCoveringDate(infoTRaw.value || [], selectedDate.value))

// warning box: event names where sperrung === "ja"
const warningNames = computed<string[]>(() => {
  const names = new Set((events.value || []).filter((e:any) => e.sperrung === 'ja').map((e:any) => e.name))
  return Array.from(names)
})

// info texts from events (non-empty HTML)
const infoTexts = computed<string[]>(() => {
  const set = new Set((events.value || [])
      .map((e:any) => (e.info_text_html || '').trim())
      .filter(Boolean))
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
  Velo: 'bicycle.svg',
  Bus: 'bus.svg',
  Tram: 'tram.svg',
  Zug: 'train.svg',
  Auto: 'car.svg',
  Barrierefrei: 'accessibility.svg',
} as const

const iconSrcMap = computed<Record<string, string>>(() =>
    Object.fromEntries(
        Object.entries(iconFileByTransport).map(([k, f]) => [k, iconUrl(f)])
    )
)
</script>

<template>
  <!-- Header -->
  <AppHeader v-model="selectedDate" />
  <div class="container">
    <!-- Data blocks -->
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
  <footer class="footer print:hidden">
    <h1 class="sr-only">Fusszeile</h1>
    <div class="footer-container container">
      <nav aria-label="Kontakt & Datenquellen">
        <ul class="links links--spaced">
          <li>
            <a
                class="link link--tall"
                href="https://www.bs.ch/jsd/polizei/fuer-ihre-sicherheit/im-verkehr/im-strassenverkehr/bikantonale-geschaeftsstelle-eventverkehr-st-jakob"
                target="_blank"
            >
              Bikantonale Geschäftsstelle Eventverkehr St. Jakob
            </a>
          </li>
          <li>
            <a
                class="link link--tall"
                href="https://data.bs.ch/explore/?refine.tags=eventverkehr-st.jakob"
                target="_blank"
            >
              Datenquelle: Kantonales Datenportal Basel-Stadt
            </a>
          </li>
        </ul>
      </nav>

      <div class="footer-copyright">
        © 2025 Basel-Stadt
      </div>
    </div>
  </footer>
</template>
