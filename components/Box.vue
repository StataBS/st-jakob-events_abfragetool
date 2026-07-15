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

const lightboxOpen = ref(false)
const lightboxIndex = ref(0)

function openLightbox(index: number) {
  lightboxIndex.value = index
  lightboxOpen.value = true
}
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
        <MaskIcon
            v-else-if="variant === 'warning'"
            src="/icons/triangle-warning.svg"
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
        <button
            v-for="(src, i) in images"
            :key="`${src}-${i}`"
            type="button"
            class="box__image-btn"
            :aria-label="alts?.[i] ? `Bild vergrössern: ${alts[i]}` : 'Bild vergrössern'"
            @click="openLightbox(i)"
        >
          <img
              :src="src"
              :alt="alts?.[i] || ''"
              class="max-w-full h-auto"
              loading="lazy"
              decoding="async"
          />
        </button>
      </div>
    </div>

    <ImageLightbox
        v-if="images?.length"
        :images="images"
        :alts="alts"
        :index="lightboxIndex"
        :open="lightboxOpen"
        @close="lightboxOpen = false"
        @update:index="lightboxIndex = $event"
    />
  </div>
</template>
