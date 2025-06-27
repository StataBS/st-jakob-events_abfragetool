<script setup>
const props = defineProps({
  text: String,
  infoBoxType: String,
});
</script>

<template>
  <div
    class="w-full md:col-span-7 px-15 pt-20 pb-30 mt-20 rounded-large"
    :class="props.infoBoxType === 'info' ? 'bg-green-200' : 'bg-red-200'"
  >
    {{ props.text }}
  </div>
</template>

<style scoped>
.annotation {
  padding: 20px;
  position: absolute;
  width: 200px;
  border: 1px solid #eee;
  border-radius: 8px;
}
</style>
