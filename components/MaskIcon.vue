<script setup lang="ts">
defineProps<{
  src: string
}>()
</script>

<template>
  <span
      class="inline-block bg-current"
      :style="{
        WebkitMask: `url('${src}') center / contain no-repeat`,
        mask: `url('${src}') center / contain no-repeat`,
      }"
      aria-hidden="true"
  />
</template>
