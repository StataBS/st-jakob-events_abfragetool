<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { DatePicker as VDatePicker } from 'v-calendar'
import IconCalendar from '@kanton-basel-stadt/designsystem/icons/symbol/calendar'
import IconCircleError from '@kanton-basel-stadt/designsystem/icons/symbol/circle-error'

const model = defineModel<string>({ required: true })

const props = defineProps<{
  eventCounts?: Record<string, number>
}>()

// ---------------------------
// 1) BASIC STATE
// ---------------------------
const rawDigits = ref('')     // "12022025"
const inputValue = ref('')    // "12.02.2025"
const errorMsg = ref('')
const inputEl = ref<HTMLInputElement | null>(null)

// ISO "YYYY-MM-DD" -> Date (local, noon)
function isoToDate(iso: string | null | undefined): Date {
  if (!iso) return new Date()
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return new Date()
  const [, y, mth, d] = m
  return new Date(Number(y), Number(mth) - 1, Number(d), 12, 0, 0, 0)
}

// Date -> ISO "YYYY-MM-DD" (no UTC conversion)
function dateToIso(d: Date): string {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

const initialDate = isoToDate(model.value)
const lastValidDate = ref<Date>(isNaN(initialDate.getTime()) ? new Date() : initialDate)

// ---------------------------
// 2) DIGITS <-> MASK <-> DATE
// ---------------------------
function dateToDigits(d: Date): string {
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = String(d.getFullYear())
  return `${dd}${mm}${yyyy}`      // "DDMMYYYY"
}

function digitsToMask(digits: string): string {
  if (!digits) return ''
  const dd = digits.slice(0, 2)
  const mm = digits.slice(2, 4)
  const yyyy = digits.slice(4, 8)

  if (digits.length <= 2) return dd
  if (digits.length <= 4) return `${dd}.${mm}`
  return `${dd}.${mm}.${yyyy}`
}

function digitsToDate(digits: string): Date | null {
  if (digits.length !== 8) return null
  const dd = Number(digits.slice(0, 2))
  const mm = Number(digits.slice(2, 4))
  const yyyy = Number(digits.slice(4, 8))
  const d = new Date(yyyy, mm - 1, dd, 12, 0, 0, 0)
  if (
      d.getFullYear() !== yyyy ||
      d.getMonth() !== mm - 1 ||
      d.getDate() !== dd
  ) {
    return null
  }
  return d
}

function syncInputFromDate(d: Date) {
  const digits = dateToDigits(d)
  rawDigits.value = digits
  inputValue.value = digitsToMask(digits)
}

function resetToLastValid() {
  syncInputFromDate(lastValidDate.value || new Date())
}

function showErrorAndRevert() {
  const display = inputValue.value || 'TT.MM.JJJJ'
  errorMsg.value = `"${display}" ist kein gültiges Datum`
  resetToLastValid()
}

// ---------------------------
// 3) INTERNAL DATE FOR VCALENDAR
// ---------------------------
const internalDate = computed<Date>({
  get: () => lastValidDate.value,
  set: (d) => {
    if (!d || isNaN(d.getTime())) return
    lastValidDate.value = d
    model.value = dateToIso(d)
    syncInputFromDate(d)
  },
})

watch(
    () => model.value,
    (iso) => {
      const d = isoToDate(iso)
      if (isNaN(d.getTime())) return
      lastValidDate.value = d
      syncInputFromDate(d)
    },
    { immediate: true },
)

// ---------------------------
// 4) INPUT HANDLERS (with caret preservation)
// ---------------------------
function onInput(e: Event) {
  errorMsg.value = ''
  const el = e.target as HTMLInputElement
  const raw = el.value
  const caretRaw = el.selectionStart ?? raw.length

  // strip non-digits, max 8
  const digits = raw.replace(/\D/g, '').slice(0, 8)

  // how many digits before caret in this raw string?
  const digitsBeforeCaret = raw.slice(0, caretRaw).replace(/\D/g, '').length

  rawDigits.value = digits
  const masked = digitsToMask(digits)
  inputValue.value = masked

  nextTick(() => {
    const input = inputEl.value
    if (!input) return

    // position caret after same number of digits in masked string
    let seenDigits = 0
    let newPos = masked.length
    for (let i = 0; i < masked.length; i++) {
      if (/\d/.test(masked[i])) {
        seenDigits++
      }
      if (seenDigits === digitsBeforeCaret) {
        newPos = i + 1
        break
      }
    }
    input.setSelectionRange(newPos, newPos)
  })
}

function commitInput() {
  errorMsg.value = ''
  const digits = rawDigits.value

  if (!digits) {
    resetToLastValid()
    return
  }

  if (digits.length !== 8) {
    showErrorAndRevert()
    return
  }

  const d = digitsToDate(digits)
  if (!d) {
    showErrorAndRevert()
    return
  }

  internalDate.value = d
}

function onBlur() {
  commitInput()
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    e.preventDefault()
    commitInput()
  }
}

// ---------------------------
// 5) DOT ATTRIBUTES & HIGHLIGHT
// ---------------------------
const dotAttributes = computed(() => {
  const counts = props.eventCounts
  if (!counts) return []

  const attrs: any[] = []

  for (const [iso, count] of Object.entries(counts)) {
    if (!count) continue
    const date = isoToDate(iso)
    const dots = Math.min(count, 4)

    for (let i = 0; i < dots; i++) {
      attrs.push({
        key: `${iso}-${i}`,
        dates: date,
        dot: {
          style: { backgroundColor: '#2A9749' },
        },
        order: 5,
      })
    }
  }

  return attrs
})

const selectAttribute = {
  highlight: {
    style: {
      backgroundColor: '#C196DC',
      color: 'white',
    },
  },
}
</script>

<template>
  <div>
    <VDatePicker
        v-model="internalDate"
        mode="date"
        is-required
        :select-attribute="selectAttribute"
        :attributes="dotAttributes"
        :popover="{ visibility: 'focus', placement: 'bottom-start' }"
    >
      <template #default="{ togglePopover }">
        <div class="relative">
          <input
              ref="inputEl"
              class="input w-full pr-40"
              :value="inputValue"
              @input="onInput"
              @keydown="onKeydown"
              @blur="onBlur"
              placeholder="TT.MM.JJJJ"
          />
          <button
              type="button"
              class="absolute inset-y-0 right-10 flex items-center"
              @click.stop="togglePopover()"
              tabindex="-1"
              aria-label="Datum im Kalender wählen"
          >
            <component
                :is="IconCalendar"
                data-symbol="calendar"
                class="w-20 h-20"
            />
          </button>
        </div>
      </template>
    </VDatePicker>

    <div
        v-if="errorMsg"
        class="mt-10 flex items-center gap-10 rounded-[6px] border border-red-600 bg-red-100 p-10 text-sm text-red-600 animate-[shake_0.5s_ease-in-out]"
    >
      <span class="inline-flex items-center justify-center mr-5">
        <component
            :is="IconCircleError"
            data-symbol="circle-error"
            class="w-20 h-20"
        />
      </span>
      <span>{{ errorMsg }}</span>
    </div>
  </div>
</template>
