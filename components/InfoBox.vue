<script setup lang="ts">
const props = withDefaults(defineProps<{
  /** Array of HTML strings */
  htmlBlocks?: string[]
}>(), {
  htmlBlocks: () => [],
})

const uniqueHtml = computed(() =>
    Array.from(new Set((props.htmlBlocks || [])
        .map(h => (h || '').trim())
        .filter(Boolean)))
)
</script>

<template>
  <Box
      v-if="uniqueHtml.length"
      variant="info"
      title="Information"
  >
    <div class="space-y-4">
      <div v-for="(html, i) in uniqueHtml" :key="i" v-html="html" />
    </div>
  </Box>
</template>
