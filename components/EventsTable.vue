<!-- EventsTable.vue -->
<script setup lang="ts">
import { computed } from 'vue'

type Item = Record<string, unknown>
const props = withDefaults(defineProps<{ items?: Item[] }>(), { items: () => [] })

type Column = { key: string; label: string; always?: boolean }

const columns: Column[] = [
  { key: 'name',      label: 'Name', always: true },
  { key: 'start',     label: 'Start' },
  { key: 'ende',      label: 'Ende' },
  { key: 'ort',       label: 'Ort' },
  { key: 'bemerkung', label: 'Bemerkung' },
]

const isBlank = (v: unknown) =>
    v == null || (typeof v === 'string' && v.trim() === '')

const visibleColumns = computed(() =>
    columns.filter(col =>
        col.always || props.items.some(row => !isBlank((row as Item)[col.key]))
    )
)
</script>

<template>
  <Table :columns="visibleColumns" :rows="items">
    <!-- Custom render for the Name column -->
    <template #cell-name="{ row, value }">
      <template v-if="row.Link || row.link">
        <a
            :href="(row.Link as string) || (row.link as string)"
            target="_blank"
            rel="noopener"
        >
          {{ value }}
        </a>
      </template>
      <template v-else>
        {{ value ?? '–' }}
      </template>

      <!-- Tickets icon if Ticketintegration is truthy -->
      <img
          :src="'icons/tickets.svg'"
          :alt="'Ticket verfügbar'"
          class="inline-block ml-2 align-text-bottom"
          loading="lazy"
          decoding="async"
      />
    </template>
  </Table>
</template>
