<script setup lang="ts">
import { fmtDE } from '~/composables/useDateUtils'

type Item = { start?: string; ende?: string; text_html?: string }

const props = withDefaults(defineProps<{
  items?: Item[]
}>(), {
  items: () => [],
})

const ranges = computed(() => {
  const set = new Set(
      (props.items || [])
          .map(it => [it.start, it.ende])
          .filter(([s, e]) => s && e)
          .map(([s, e]) => `${fmtDE(s as string)} – ${fmtDE(e as string)}`)
  )
  return Array.from(set)
})

const uniqueHtml = computed(() =>
    Array.from(new Set(
        (props.items || [])
            .map(it => (it.text_html || '').trim())
            .filter(Boolean)
    ))
)
</script>

<template>
  <Box
      v-if="uniqueHtml.length"
      variant="info"
      title="Information"
      :title-addon="ranges.length ? ranges.join(', ') : null"
  >
    <div class="space-y-4">
      <div v-for="(html, i) in uniqueHtml" :key="i" v-html="html" />
    </div>
  </Box>
</template>
