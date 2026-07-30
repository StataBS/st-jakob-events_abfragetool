<script setup lang="ts">
export type DropdownOption = {
  label: string
  value: string
}

const model = defineModel<string>({ required: true })

const props = withDefaults(defineProps<{
  label: string
  options: DropdownOption[]
  id?: string
  placeholder?: string
}>(), {
  placeholder: 'Bitte wählen',
})

const uid = props.id ?? `dropdown-${useId()}`
const open = ref(false)
const rootEl = ref<HTMLElement | null>(null)

const selectedOption = computed(() =>
  props.options.find(o => o.value === model.value) ?? null,
)

const triggerLabel = computed(() =>
  selectedOption.value?.label ?? props.placeholder,
)

const isPlaceholder = computed(() => !selectedOption.value)

function toggle() {
  open.value = !open.value
}

function select(option: DropdownOption) {
  model.value = option.value
  open.value = false
}

function onDocPointerDown(e: PointerEvent) {
  if (!rootEl.value?.contains(e.target as Node)) open.value = false
}

function onDocKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') open.value = false
}

onMounted(() => {
  document.addEventListener('pointerdown', onDocPointerDown)
  document.addEventListener('keydown', onDocKeydown)
})

onUnmounted(() => {
  document.removeEventListener('pointerdown', onDocPointerDown)
  document.removeEventListener('keydown', onDocKeydown)
})
</script>

<template>
  <div
      ref="rootEl"
      class="dropdown"
      :data-expanded="open ? 'true' : 'false'"
  >
    <div class="dropdown-wrapper">
      <label class="label" :for="uid" :id="`${uid}_label`">
        {{ label }}
      </label>
      <div class="dropdown-inner" :id="`${uid}_inner`">
        <button
            class="dropdown-trigger"
            :id="uid"
            type="button"
            tabindex="0"
            :name="uid"
            aria-haspopup="listbox"
            :aria-expanded="open ? 'true' : 'false'"
            :aria-controls="`${uid}_listbox`"
            :aria-labelledby="`${uid}_label`"
            @click="toggle"
        >
          <div class="dropdown-option" :class="{ placeholder: isPlaceholder }">
            {{ triggerLabel }}
          </div>
        </button>

        <ul
            v-show="open"
            class="dropdown-list"
            :id="`${uid}_listbox`"
            role="listbox"
            :aria-labelledby="`${uid}_label`"
        >
          <li
              v-for="(option, index) in options"
              :key="option.value"
              class="dropdown-list-item"
              :id="`${uid}_listitem_${index}`"
              :data-value="option.value"
              role="option"
              :aria-selected="option.value === model ? 'true' : 'false'"
              @click="select(option)"
          >
            <div class="dropdown-option">{{ option.label }}</div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
