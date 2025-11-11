<template>
  <Table class="table table--header-only" :columns="[{ key: 'only', label: 'Keine Veranstaltungen an diesem Tag' }]" :rows="[]">
    <template #empty></template>
  </Table>
</template>
<script setup lang="ts">
</script>