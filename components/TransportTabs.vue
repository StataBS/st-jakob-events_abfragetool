<script setup lang="ts">
const props = withDefaults(defineProps<{
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
  <div class="tabs-container" role="tablist" aria-label="Anreiseempfehlungen">
    <button
        v-for="t in tabs"
        :key="t.key"
        class="button is-tab has-icon"
        :class="{ 'is-active': modelValue === t.key }"
        @click="onSelect(t.key)"
        @keydown.enter.prevent="onSelect(t.key)"
        @keydown.space.prevent="onSelect(t.key)"
    >
      <img
          :src="iconSrcMap[t.key]"
          :alt="t.label"
          class="tab-icon"
          loading="lazy"
          decoding="async"
      />
      {{ t.label }}
    </button>
  </div>

</template>
