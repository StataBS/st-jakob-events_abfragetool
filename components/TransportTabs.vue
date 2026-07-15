<script setup lang="ts">
withDefaults(defineProps<{
  modelValue?: string
  /** map of transport key -> absolute/relative icon URL (already resolved by parent) */
  iconSrcMap?: Record<string, string>
}>(), {
  modelValue: 'Velo',
  iconSrcMap: () => ({}),
})

const emit = defineEmits<{ (e: 'update:modelValue', v: string): void }>()
const onSelect = (key: string) => emit('update:modelValue', key)

const tabs = [
  { key: 'Velo',         label: 'Velo' },
  { key: 'Bus',          label: 'Bus' },
  { key: 'Tram',         label: 'Tram' },
  { key: 'Zug',          label: 'Zug' },
  { key: 'Auto',         label: 'Auto' },
  { key: 'Barrierefrei', label: 'Barrierefrei' },
] as const
</script>

<template>
  <div class="tabs my-20">
    <div
        class="tabs__list"
        role="tablist"
        aria-label="Anreiseempfehlungen"
    >
      <button
          v-for="t in tabs"
          :key="t.key"
          type="button"
          role="tab"
          class="tabs__trigger"
          :class="{ 'tabs__trigger--active': modelValue === t.key }"
          :aria-selected="modelValue === t.key"
          @click="onSelect(t.key)"
          @keydown.enter.prevent="onSelect(t.key)"
          @keydown.space.prevent="onSelect(t.key)"
      >
        <MaskIcon
            v-if="iconSrcMap[t.key]"
            :src="iconSrcMap[t.key]"
            class="tabs__icon"
        />
        {{ t.label }}
      </button>
    </div>
  </div>
</template>
