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

type EventItem = Record<string, unknown>

const props = defineProps<{
  iso: string
  day: number
  monthLabel: string
  selectedDate: string
  variant: 'events' | 'sperrungen'
  events: EventItem[]
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

const dayLabel = computed(() =>
  (parseISO(props.iso) ?? new Date()).toLocaleDateString('de-CH', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }),
)

const fillClass = computed(() => {
  if (props.variant === 'sperrungen') {
    return count.value > 0 ? 'year-calendar__cell--sperrungen' : ''
  }
  if (count.value >= 3) return 'year-calendar__cell--events-3'
  if (count.value === 2) return 'year-calendar__cell--events-2'
  if (count.value === 1) return 'year-calendar__cell--events-1'
  return ''
})

const emptyMessage = computed(() =>
  props.variant === 'sperrungen'
    ? 'Keine Sperrungen an diesem Tag'
    : 'Keine Veranstaltungen an diesem Tag',
)

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
          iso === selectedDate ? 'year-calendar__cell--selected' : '',
          open ? 'year-calendar__cell--open' : '',
        ]"
        :aria-label="`${day}. ${monthLabel}${count ? `: ${count} Einträge` : ''}`"
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
              <a
                  v-if="field.key === 'name' && currentEvent.link"
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
            </span>
          </div>
        </div>
        <p v-else class="year-calendar-hover__empty mb-0">
          {{ emptyMessage }}
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
