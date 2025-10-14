<script setup lang="ts">
const props = withDefaults(defineProps<{ items?: any[] }>(), { items: () => [] })

const columns = [
  { key: 'name',       label: 'Name' },
  { key: 'start',      label: 'Start' },
  { key: 'ende',       label: 'Ende' },
  { key: 'ort',        label: 'Ort' },
  { key: 'bemerkung',  label: 'Bemerkung' },
]
</script>

<template>
  <Table :columns="columns" :rows="items" />
</template>
