<!-- pages/index.vue -->
<script setup lang="ts">
if (process.server) {
  await navigateTo('/tagesansicht', { redirectCode: 302 })
} else {
  const router = useRouter()
  onMounted(() => router.replace('/tagesansicht'))
}
</script>

<template></template>
