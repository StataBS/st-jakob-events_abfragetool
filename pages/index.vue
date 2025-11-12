<script setup lang="ts">
const router = useRouter()
const route = useRoute()
onMounted(() => {
  router.replace({ path: '/tagesansicht', query: route.query })
})
</script>

<template />
