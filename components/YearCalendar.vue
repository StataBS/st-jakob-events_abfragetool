<script setup lang="ts">
import { toISODateString } from '~/composables/useDateUtils'
import {
  besucherTierForDay,
  type KnownBesucherTier,
} from '~/composables/useBesucher'

type EventItem = Record<string, unknown>
export type CalendarFillMode = 'visitor' | 'event'

const props = withDefaults(defineProps<{
  year: number
  /** Events keyed by YYYY-MM-DD */
  eventsByDay?: Record<string, EventItem[]>
  /** Known visitor tiers keyed by YYYY-MM-DD (dataset 100418) */
  visitorTiersByDay?: Record<string, KnownBesucherTier>
  /**
   * `visitor` = Besucherzahl blues/grays.
   * `event` = yellow for any day with events (Standort filter).
   */
  fillMode?: CalendarFillMode
  /** Sperrung-causing event names keyed by YYYY-MM-DD (all Standorte) */
  sperrungNamesByDay?: Record<string, string[]>
  /** Days with any event across all Standorte (for BesucherIcon under Standort filter) */
  anyEventsByDay?: Record<string, true>
}>(), {
  eventsByDay: () => ({}),
  visitorTiersByDay: () => ({}),
  fillMode: 'visitor',
  sperrungNamesByDay: () => ({}),
  anyEventsByDay: () => ({}),
})

const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
const MONTHS = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
]

/** Monday = 0 … Sunday = 6 */
function mondayOffset(year: number, monthIndex: number) {
  const dow = new Date(year, monthIndex, 1).getDay() // Sun=0
  return (dow + 6) % 7
}

function daysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate()
}

type DayCell = { iso: string | null; day: number | null }

const months = computed(() =>
  MONTHS.map((label, monthIndex) => {
    const offset = mondayOffset(props.year, monthIndex)
    const count = daysInMonth(props.year, monthIndex)
    const cells: DayCell[] = []

    for (let i = 0; i < offset; i++) cells.push({ iso: null, day: null })
    for (let day = 1; day <= count; day++) {
      const iso = toISODateString(new Date(props.year, monthIndex, day))
      cells.push({ iso, day })
    }
    while (cells.length % 7 !== 0) cells.push({ iso: null, day: null })

    return { label, monthIndex, cells }
  }),
)

function eventsFor(iso: string | null): EventItem[] {
  if (!iso) return []
  return props.eventsByDay[iso] || []
}

function visitorTierFor(iso: string | null): KnownBesucherTier | null {
  if (!iso) return null
  return props.visitorTiersByDay[iso] ?? null
}

function sperrungNamesFor(iso: string | null): string[] {
  if (!iso) return []
  return props.sperrungNamesByDay[iso] || []
}

function hasAnyEventsOnDay(iso: string | null): boolean {
  if (!iso) return false
  if (props.anyEventsByDay[iso]) return true
  // Fallback: filtered events (Alle Standorte / when map not provided)
  return eventsFor(iso).length > 0
}

/** Resolve cell fill class here so Standort yellow cannot be skipped. */
function fillClassFor(iso: string | null): string {
  if (!iso) return ''
  const events = eventsFor(iso)
  if (props.fillMode === 'event') {
    return events.length > 0 ? 'year-calendar__cell--event' : ''
  }
  const tier = besucherTierForDay(events.length > 0, visitorTierFor(iso))
  switch (tier) {
    case 'unknown': return 'year-calendar__cell--unknown'
    case 'low': return 'year-calendar__cell--low'
    case 'mid': return 'year-calendar__cell--mid'
    case 'high': return 'year-calendar__cell--high'
    default: return ''
  }
}
</script>

<template>
  <div class="year-calendar" :data-fill-mode="fillMode">
    <div v-for="month in months" :key="month.monthIndex" class="year-calendar__month min-w-0">
      <h3 class="year-calendar__month-title">{{ month.label }}</h3>

      <div class="year-calendar__weekdays" aria-hidden="true">
        <span v-for="wd in WEEKDAYS" :key="wd" class="year-calendar__weekday">{{ wd }}</span>
      </div>

      <div class="year-calendar__days" role="grid" :aria-label="`${month.label} ${year}`">
        <template v-for="(cell, idx) in month.cells" :key="`${month.monthIndex}-${idx}`">
          <div
              v-if="!cell.iso"
              class="year-calendar__cell year-calendar__cell--empty"
              aria-hidden="true"
          />
          <YearCalendarDay
              v-else
              :iso="cell.iso"
              :day="cell.day!"
              :month-label="month.label"
              :events="eventsFor(cell.iso)"
              :known-visitor-tier="visitorTierFor(cell.iso)"
              :fill-class="fillClassFor(cell.iso)"
              :sperrung-names="sperrungNamesFor(cell.iso)"
              :besucher-has-events="hasAnyEventsOnDay(cell.iso)"
          />
        </template>
      </div>
    </div>
  </div>
</template>
