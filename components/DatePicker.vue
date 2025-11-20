<!-- components/DatePicker.vue -->
<script setup lang="ts">
const model = defineModel<string>({ required: true })
const today = new Date().toISOString().slice(0, 10)
</script>

<template>
  <input
      type="date"
      :value="model || today"
      @change="e => (model = (e.target as HTMLInputElement).value)"
      class="input w-full"
      aria-label="Datum wählen"
  />
</template>
