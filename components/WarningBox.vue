<script setup lang="ts">
const props = withDefaults(defineProps<{
  names?: string[]
  text?: string | null
}>(), {
  names: () => [],
  text: 'Voraussichtlich wird die Kreuzung im Raum St. Jakob für den motorisierten Individualverkehr zeitweise gesperrt.',
})

const titleAddon = computed(() => {
  const set = new Set((props.names || []).filter(Boolean))
  const arr = Array.from(set)
  return arr.length ? arr.join(', ') : null
})

const hasContent = computed(() => !!titleAddon.value)
</script>

<template>
  <Box
      v-if="hasContent"
      variant="warning"
      title="Geplante Sperrung"
      :title-addon="titleAddon"
  >
    <p class="mb-0">{{ text }}</p>
  </Box>
</template>
