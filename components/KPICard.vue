<script setup lang="ts">
const props = defineProps<{
  title: string
  description?: string
  value: string | number
  href?: string
  to?: string
  sparkline?: number[]
}>()

const isExternalHref = computed(() =>
  Boolean(props.href && /^https?:\/\//i.test(props.href)),
)

const tag = computed(() => {
  if (props.to) return resolveComponent('NuxtLink')
  if (props.href) return 'a'
  return 'div'
})

const linkAttrs = computed(() => {
  if (props.to) return { to: props.to }
  if (props.href) {
    if (isExternalHref.value) {
      return { href: props.href, target: '_blank', rel: 'noopener noreferrer' }
    }
    return { href: props.href }
  }
  return {}
})

const hasSparkline = computed(
  () => Array.isArray(props.sparkline) && props.sparkline.length > 0,
)
</script>

<template>
  <component
    :is="tag"
    v-bind="linkAttrs"
    :class="['kpi-card', { 'kpi-card--clickable': href || to }]"
  >
    <div class="kpi-card__intro">
      <strong class="text-base font-bold">{{ title }}</strong>
      <p v-if="description" class="text-xs mt-5">{{ description }}</p>
    </div>
    <p class="kpi-card__value">{{ value }}</p>
    <div v-if="hasSparkline" class="kpi-card__sparkline">
      <Sparkline :values="sparkline!" />
    </div>
  </component>
</template>
