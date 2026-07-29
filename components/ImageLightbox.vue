<script setup lang="ts">
import IconClose from '@kanton-basel-stadt/designsystem/icons/symbol/close'
import IconCaret from '@kanton-basel-stadt/designsystem/icons/symbol/caret'

const props = defineProps<{
  images: string[]
  alts?: string[]
  index: number
  open: boolean
}>()

const emit = defineEmits<{
  close: []
  'update:index': [index: number]
}>()

const currentAlt = computed(() => props.alts?.[props.index] || '')
const hasMultiple = computed(() => props.images.length > 1)

function close() {
  emit('close')
}

function go(delta: number) {
  if (!hasMultiple.value) return
  const next = (props.index + delta + props.images.length) % props.images.length
  emit('update:index', next)
}

function onKeydown(e: KeyboardEvent) {
  if (!props.open) return
  if (e.key === 'Escape') close()
  if (e.key === 'ArrowLeft') go(-1)
  if (e.key === 'ArrowRight') go(1)
}

watch(() => props.open, (isOpen) => {
  if (typeof document === 'undefined') return
  document.body.style.overflow = isOpen ? 'hidden' : ''
})

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  if (typeof document !== 'undefined') document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <div
        v-if="open"
        class="lightbox"
        role="dialog"
        aria-modal="true"
        :aria-label="currentAlt || 'Bildansicht'"
        @click="close"
    >
      <div class="lightbox__toolbar" @click.stop>
        <p v-if="hasMultiple" class="lightbox__counter">
          {{ index + 1 }} / {{ images.length }}
        </p>
        <div v-else />

        <div class="lightbox__actions">
          <button type="button" class="lightbox__btn" aria-label="Schliessen" @click="close">
            <component :is="IconClose" class="lightbox__icon" data-symbol="close" />
          </button>
        </div>
      </div>

      <button
          v-if="hasMultiple"
          type="button"
          class="lightbox__nav lightbox__nav--prev"
          aria-label="Vorheriges Bild"
          @click.stop="go(-1)"
      >
        <component :is="IconCaret" class="lightbox__icon lightbox__icon--prev" data-symbol="caret" />
      </button>

      <button
          v-if="hasMultiple"
          type="button"
          class="lightbox__nav lightbox__nav--next"
          aria-label="Nächstes Bild"
          @click.stop="go(1)"
      >
        <component :is="IconCaret" class="lightbox__icon lightbox__icon--next" data-symbol="caret" />
      </button>

      <div class="lightbox__stage">
        <img
            :src="images[index]"
            :alt="currentAlt"
            class="lightbox__img"
            draggable="false"
        />
      </div>

      <p v-if="currentAlt" class="lightbox__hint">
        {{ currentAlt }}
      </p>
    </div>
  </Teleport>
</template>
