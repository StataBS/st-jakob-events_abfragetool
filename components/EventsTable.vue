<script setup lang="ts">
import { computed } from 'vue'

type Item = Record<string, unknown>
const props = withDefaults(defineProps<{ items?: Item[] }>(), { items: () => [] })

type Column = { key: string; label: string; always?: boolean }

const columns: Column[] = [
  { key: 'name',      label: 'Name', always: true }, // keep if you want it always
  { key: 'start',     label: 'Start' },
  { key: 'ende',      label: 'Ende' },
  { key: 'ort',       label: 'Ort' },
  { key: 'bemerkung', label: 'Bemerkung' },
]

const isBlank = (v: unknown) =>
    v == null || (typeof v === 'string' && v.trim() === '')

const visibleColumns = computed(() =>
    columns.filter(col =>
        col.always ||
        props.items.some(row => !isBlank((row as Item)[col.key]))
    )
)
</script>

<template>
  <Table :columns="visibleColumns" :rows="items" />
</template>
