<script setup lang="ts">
import { computed } from 'vue'
import { besucherMeta, type BesucherTier } from '~/composables/useBesucher'

const props = withDefaults(defineProps<{
  tier: BesucherTier
  /** Wrap in IconHoverBox (default). Set false when context already explains the tier. */
  withHover?: boolean
}>(), {
  withHover: true,
})

const meta = computed(() => besucherMeta(props.tier))
</script>

<template>
  <IconHoverBox
      v-if="meta && withHover"
      variant="besucher"
      :title="meta.label"
      :body="meta.body"
      :aria-label="meta.label"
  >
    <img
        :src="meta.icon"
        alt=""
        class="h-20 w-auto"
        width="34"
        height="24"
        aria-hidden="true"
    >
  </IconHoverBox>
  <img
      v-else-if="meta"
      :src="meta.icon"
      :alt="meta.label"
      class="h-20 w-auto shrink-0"
      width="34"
      height="24"
  >
</template>
