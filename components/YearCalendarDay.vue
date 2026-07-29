<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  PopoverContent,
  PopoverPortal,
  PopoverRoot,
  PopoverTrigger,
} from 'reka-ui'
import IconArrowNorthEast from '@kanton-basel-stadt/designsystem/icons/symbol/arrow-north-east'
import IconCaret from '@kanton-basel-stadt/designsystem/icons/symbol/caret'
import { parseISO } from '~/composables/useDateUtils'
import {
  besucherTierForDay,
  type BesucherTier,
  type KnownBesucherTier,
} from '~/composables/useBesucher'

type EventItem = Record<string, unknown>

const TICKET_BODY = 'Das ÖV-Ticket für die Hin- und Rückreise innerhalb des TNW-Gebiets ist im Veranstaltungspreis inkludiert.'
const SPERRUNG_BODY = 'Voraussichtlich wird die Kreuzung im Raum St. Jakob für den motorisierten Individualverkehr zeitweise gesperrt.'

const props = defineProps<{
  iso: string
  day: number
  monthLabel: string
  events: EventItem[]
  /** Known visitor tier for this day from dataset 100418 */
  knownVisitorTier?: KnownBesucherTier | null
}>()

const router = useRouter()
const open = ref(false)
const page = ref(0)

const HOVER_FIELDS: { key: string; label: string }[] = [
  { key: 'name', label: 'Name' },
  { key: 'start', label: 'Start' },
  { key: 'ende', label: 'Ende' },
  { key: 'ort', label: 'Ort' },
  { key: 'bemerkung', label: 'Bemerkung' },
]

const count = computed(() => props.events.length)
const pageCount = computed(() => Math.max(count.value, 1))
const currentEvent = computed(() => props.events[page.value] ?? null)

const tier = computed<BesucherTier>(() =>
  besucherTierForDay(count.value > 0, props.knownVisitorTier),
)

const hasSperrung = computed(() =>
  props.events.some(e => e.sperrung === 'ja'),
)

const dayLabel = computed(() =>
  (parseISO(props.iso) ?? new Date()).toLocaleDateString('de-CH', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }),
)

const fillClass = computed(() => {
  switch (tier.value) {
    case 'unknown': return 'year-calendar__cell--unknown'
    case 'low': return 'year-calendar__cell--low'
    case 'mid': return 'year-calendar__cell--mid'
    case 'high': return 'year-calendar__cell--high'
    default: return ''
  }
})

watch(open, (isOpen) => {
  if (isOpen) page.value = 0
})

watch(count, () => {
  if (page.value > count.value - 1) page.value = Math.max(0, count.value - 1)
})

function displayValue(v: unknown) {
  if (v == null) return '–'
  const s = String(v).trim()
  return s || '–'
}

function goTagesansicht() {
  router.push({ path: '/tagesansicht', query: { datum: props.iso } })
}

function prevPage() {
  if (page.value > 0) page.value -= 1
}

function nextPage() {
  if (page.value < count.value - 1) page.value += 1
}
</script>

<template>
  <PopoverRoot v-model:open="open" :modal="false">
    <PopoverTrigger
        as="button"
        type="button"
        class="year-calendar__cell"
        :class="[
          fillClass,
          hasSperrung ? 'year-calendar__cell--has-sperrung' : '',
          open ? 'year-calendar__cell--open' : '',
        ]"
        :aria-label="`${day}. ${monthLabel}${count ? `: ${count} Einträge` : ''}${hasSperrung ? ', mit Sperrung' : ''}`"
        :aria-expanded="open"
    >
      <span class="sr-only">{{ day }}</span>
    </PopoverTrigger>

    <PopoverPortal>
      <PopoverContent
          side="top"
          :side-offset="6"
          :avoid-collisions="true"
          :collision-padding="8"
          class="year-calendar-hover z-50 w-[min(320px,calc(100vw-16px))] rounded-large border border-gray-200 bg-white p-15 shadow-[0_10px_25px_#BABABA] outline-none"
          @open-auto-focus.prevent
      >
        <div class="year-calendar-hover__title flex items-center gap-10 min-w-0 mb-15">
          <strong class="text-base text-gray-900 capitalize truncate">
            {{ dayLabel }}
          </strong>
          <BesucherIcon :tier="tier" :with-hover="false" />
          <button
              type="button"
              class="button is-action is-icon-only shrink-0"
              :aria-label="`Tagesansicht für ${dayLabel}`"
              @click="goTagesansicht"
          >
            <span class="arrow-icon">
              <component :is="IconArrowNorthEast" data-symbol="arrow-north-east" />
            </span>
          </button>
        </div>

        <div v-if="currentEvent" class="year-calendar-hover__card">
          <div
              v-for="field in HOVER_FIELDS"
              :key="field.key"
              class="year-calendar-hover__field"
          >
            <span class="year-calendar-hover__label">{{ field.label }}</span>
            <span class="year-calendar-hover__value">
              <template v-if="field.key === 'name'">
                <span class="inline-flex items-center gap-8 flex-wrap">
                  <a
                      v-if="currentEvent.link"
                      :href="currentEvent.link as string"
                      target="_blank"
                      rel="noopener"
                      class="inline-link"
                      @click.stop
                  >
                    {{ displayValue(currentEvent[field.key]) }}
                  </a>
                  <template v-else>
                    {{ displayValue(currentEvent[field.key]) }}
                  </template>

                  <span
                      v-if="currentEvent.ticketintegration || currentEvent.sperrung === 'ja'"
                      class="inline-flex items-center gap-8"
                  >
                    <IconHoverBox
                        v-if="currentEvent.ticketintegration"
                        variant="info"
                        title="Ticketintegration"
                        :body="TICKET_BODY"
                        aria-label="Ticketintegration"
                    >
                      <MaskIcon
                          src="/icons/tickets.svg"
                          class="w-20 h-20 text-primary-600"
                      />
                    </IconHoverBox>

                    <IconHoverBox
                        v-if="currentEvent.sperrung === 'ja'"
                        variant="warning"
                        title="Geplante Sperrung"
                        :body="SPERRUNG_BODY"
                        aria-label="Geplante Sperrung"
                    />
                  </span>
                </span>
              </template>
              <template v-else>
                {{ displayValue(currentEvent[field.key]) }}
              </template>
            </span>
          </div>
        </div>
        <p v-else class="year-calendar-hover__empty mb-0">
          Keine Veranstaltungen an diesem Tag
        </p>

        <div
            v-if="count > 1"
            class="year-calendar-hover__pager flex items-center justify-between gap-10 mt-15 pt-10 border-t border-gray-200"
        >
          <button
              type="button"
              class="button is-action is-icon-only shrink-0"
              :disabled="page === 0"
              aria-label="Vorheriges Event"
              @click.stop="prevPage"
          >
            <span class="arrow-icon" style="transform: rotate(90deg);">
              <component :is="IconCaret" data-symbol="caret" />
            </span>
          </button>
          <span class="text-sm text-gray-700 tabular-nums">
            {{ page + 1 }} / {{ pageCount }}
          </span>
          <button
              type="button"
              class="button is-action is-icon-only shrink-0"
              :disabled="page >= count - 1"
              aria-label="Nächstes Event"
              @click.stop="nextPage"
          >
            <span class="arrow-icon" style="transform: rotate(-90deg);">
              <component :is="IconCaret" data-symbol="caret" />
            </span>
          </button>
        </div>
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>
