<!-- EventsTable.vue -->
<script setup lang="ts">
import { computed } from 'vue'

type Item = Record<string, unknown>
const props = withDefaults(defineProps<{ items?: Item[] }>(), { items: () => [] })

type Column = { key: string; label: string; always?: boolean; hidden?: boolean }

const columns: Column[] = [
  { key: 'name',      label: 'Name', always: true },
  { key: 'start',     label: 'Start' },
  { key: 'ende',      label: 'Ende' },
  { key: 'ort',       label: 'Ort' },
  { key: 'bemerkung', label: 'Bemerkung' },
]

const isBlank = (v: unknown) =>
    v == null || (typeof v === 'string' && v.trim() === '')

const enhancedColumns = computed(() =>
    columns.map(col => {
      const allBlank = props.items.every(row => isBlank((row as Item)[col.key]))
      return {
        ...col,
        hidden: !col.always && allBlank,   // keep column but mark it “hidden”
      }
    })
)
</script>

<template>
  <Table :columns="enhancedColumns" :rows="items">
    <!-- Custom render for the Name column -->
    <template #cell-name="{ row, value }">
      <template v-if="row.link">
        <a
            :href="row.link as string"
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
          v-if="row.ticketintegration"
          :src="'icons/tickets.svg'"
          :alt="'Ticket verfügbar'"
          class="inline-block ml-10 align-text-bottom"
          loading="lazy"
          decoding="async"
          title="Das ÖV-Ticket für die Hin- und Rückreise innerhalb des TNW-Gebiets ist im Veranstaltungspreis inkludiert."
      />
    </template>
  </Table>
</template>
