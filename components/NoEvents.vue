<template>
  <Table
      :columns="[{ key: 'only', label: 'Keine Veranstaltungen an diesem Tag' }]"
      :rows="[]"
  >
    <template #empty>
      <!-- intentionally empty body to keep a clean header-only table -->
    </template>
  </Table>
</template>
<script setup lang="ts">
</script>