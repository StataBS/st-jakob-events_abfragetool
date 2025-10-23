<script setup lang="ts">
import { useSlots, computed } from 'vue'
import IconSymbolCircleWarning from '@kanton-basel-stadt/designsystem/icons/symbol/circle-warning'
import IconSymbolHinweisRounded from '@kanton-basel-stadt/designsystem/icons/symbol/hinweise_rounded'

const slots = useSlots()

const props = withDefaults(defineProps<{
  title: string
  titleAddon?: string | null
  html?: string | null
  variant?: 'warning' | 'info' | 'empfehlung'
  hideWhenEmpty?: boolean
  iconSrc?: string | null
  images?: string[]
  alts?: string[]
}>(), {
  titleAddon: null,
  html: null,
  variant: 'info',
  hideWhenEmpty: true,
  iconSrc: null,
  images: () => [],
  alts: () => [],
})

const hasContent = computed(() => {
  const hasHtml = !!(props.html && props.html.trim().length)
  const hasImgs = !!(props.images && props.images.length)
  const hasSlot = !!slots.default
  return hasHtml || hasImgs || hasSlot
})
</script>

<template>
  <div
      v-if="!hideWhenEmpty || hasContent"
      :class="[
      'box',
      variant === 'warning' ? 'box--warning'
      : variant === 'empfehlung' ? 'box--empfehlung'
      : 'box--info'
    ]"
  >
    <div class="box__icon" aria-hidden="true">
      <slot name="icon">
        <img
            v-if="iconSrc"
            :src="iconSrc"
            alt=""
            class="w-full h-full object-contain"
            loading="lazy"
            decoding="async"
        />
        <IconSymbolCircleWarning
            v-else-if="variant === 'warning'"
            class="w-full h-full"
        />
        <IconSymbolCircleWarning
            v-else
            class="w-full h-full transform rotate-180"
        />
      </slot>
    </div>
    <!-- Title row -->
    <div class="box__header">
      <strong class="box__title">{{ title }}</strong>
      <span v-if="titleAddon" class="box__addon">({{ titleAddon }})</span>
    </div>

    <!-- Body -->
    <div class="box__content">
      <div v-if="html" v-html="html" class="mb-15"/>
      <slot v-else />

      <!-- Images (moved into Box.vue) -->
      <div v-if="images?.length" class="flex flex-wrap gap-4 my-4">
        <img
            v-for="(src, i) in images"
            :key="`${src}-${i}`"
            :src="src"
            :alt="alts?.[i] || ''"
            class="max-w-full h-auto"
            loading="lazy"
            decoding="async"
        />
      </div>
    </div>

  </div>
</template>
