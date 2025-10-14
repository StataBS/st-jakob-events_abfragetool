<script setup lang="ts">
defineProps<{
  title: string
  html?: string | null
  images?: string[]
  alts?: string[]
  iconSrc?: string | null
}>()
</script>

<template>
  <Box
      variant="empfehlung"
      :title="title"
      :html="html || undefined"
      :images="images"
      :alts="alts"
      :icon-src="iconSrc || undefined"
      :hide-when-empty="false"
      class="mt-0"
  />
</template>
