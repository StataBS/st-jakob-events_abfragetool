<script setup lang="ts">
type Column = {
  key: string
  label: string
  thClass?: string
  tdClass?: string
}
const props = withDefaults(defineProps<{
  columns: Column[]
  rows?: Record<string, any>[]
  caption?: string
  /** applies the mobile stack style from your .table CSS */
  mobile?: boolean
  tableClass?: string
  getRowKey?: (row: any, index: number) => string | number
}>(), {
  rows: () => [],
  mobile: true,
  tableClass: '',
})
</script>

<template>
  <table :class="['table', { 'has-mobile-style': mobile }, tableClass]">
    <caption v-if="caption">{{ caption }}</caption>

    <thead>
    <tr>
      <th v-for="col in columns" :key="col.key" :class="col.thClass">
        {{ col.label }}
      </th>
    </tr>
    </thead>

    <tbody>
    <tr
        v-for="(row, idx) in rows"
        :key="getRowKey ? getRowKey(row, idx) : idx"
    >
      <td
          v-for="col in columns"
          :key="col.key"
          :data-head-label="col.label"
          :class="col.tdClass"
      >
        <!-- Per-column override slot: <template #cell-<key>> -->
        <slot
            :name="`cell-${col.key}`"
            :row="row"
            :value="row[col.key]"
            :col="col"
        >
          {{ row[col.key] ?? '–' }}
        </slot>
      </td>
    </tr>

    <!-- Empty state row (used by NoEvents) -->
    <tr v-if="!rows || rows.length === 0">
      <td :colspan="columns.length" class="py-10">
        <slot name="empty">–</slot>
      </td>
    </tr>
    </tbody>
  </table>
</template>
