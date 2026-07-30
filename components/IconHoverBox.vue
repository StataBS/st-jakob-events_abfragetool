<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  HoverCardContent,
  HoverCardPortal,
  HoverCardRoot,
  HoverCardTrigger,
} from 'reka-ui'
import IconSymbolCircleWarning from '@kanton-basel-stadt/designsystem/icons/symbol/circle-warning'

const props = withDefaults(defineProps<{
  variant?: 'info' | 'warning' | 'besucher'
  title: string
  titleAddon?: string | null
  body?: string | null
  ariaLabel?: string
}>(), {
  variant: 'info',
  titleAddon: null,
  body: null,
  ariaLabel: undefined,
})

const open = ref(false)

const triggerLabel = computed(() => {
  const base = props.ariaLabel || props.title
  return `${base} – Infos anzeigen`
})

/** Accent classes analogous to info (green) / warning (red). */
const accent = computed(() => {
  switch (props.variant) {
    case 'warning':
      return {
        triggerHover: 'hover:border-red-800 focus-visible:outline-red-800',
        triggerOpen: 'bg-black/5 border-red-800',
        panel: 'bg-red-50 border-red-800',
        text: 'text-red-800',
      }
    case 'besucher':
      return {
        triggerHover: 'hover:border-blue-700 focus-visible:outline-blue-700',
        triggerOpen: 'bg-black/5 border-blue-700',
        panel: 'bg-blue-50 border-blue-700',
        text: 'text-blue-700',
      }
    default:
      return {
        triggerHover: 'hover:border-primary-600 focus-visible:outline-primary-600',
        triggerOpen: 'bg-black/5 border-primary-600',
        panel: 'bg-green-50 border-primary-600',
        text: 'text-primary-600',
      }
  }
})

function isTouchLike() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(hover: none), (pointer: coarse)').matches
}

/** On phones/tablets hover is unreliable — click/tap toggles the box. */
function onTriggerClick(event: MouseEvent) {
  if (!isTouchLike()) return
  event.preventDefault()
  open.value = !open.value
}
</script>

<template>
  <HoverCardRoot v-model:open="open" :open-delay="150" :close-delay="100">
    <HoverCardTrigger
        as="button"
        type="button"
        class="inline-flex items-center justify-center p-4 -my-5 rounded-full border border-transparent bg-transparent cursor-pointer transition-colors duration-150 hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        :class="[
          accent.triggerHover,
          open ? accent.triggerOpen : '',
        ]"
        :aria-label="triggerLabel"
        :aria-expanded="open"
        @click="onTriggerClick"
    >
      <slot>
        <MaskIcon
            v-if="variant === 'warning'"
            src="/icons/triangle-warning.svg"
            class="w-20 h-20 text-red-800"
        />
        <img
            v-else-if="variant === 'besucher'"
            src="/icons/users-3.svg"
            alt=""
            class="h-20 w-auto"
            width="34"
            height="24"
            aria-hidden="true"
        >
        <IconSymbolCircleWarning
            v-else
            class="w-20 h-20 text-primary-600 transform rotate-180"
            aria-hidden="true"
        />
      </slot>
    </HoverCardTrigger>

    <HoverCardPortal>
      <HoverCardContent
          side="top"
          :side-offset="6"
          :avoid-collisions="true"
          :collision-padding="8"
          class="z-50 w-[min(360px,calc(100vw-16px))] rounded-large border p-15 shadow-[0_10px_25px_#BABABA] outline-none"
          :class="[accent.panel, variant === 'besucher' ? '' : 'pr-50']"
      >
        <div
            v-if="variant !== 'besucher'"
            class="absolute right-10 top-10 flex items-center justify-center w-28 h-28"
            :class="accent.text"
            aria-hidden="true"
        >
          <MaskIcon
              v-if="variant === 'warning'"
              src="/icons/triangle-warning.svg"
              class="w-full h-full"
          />
          <IconSymbolCircleWarning
              v-else
              class="w-full h-full transform rotate-180"
          />
        </div>

        <div
            class="flex flex-wrap items-baseline"
            :class="variant === 'besucher' ? '' : 'mr-20'"
        >
          <strong
              class="text-base mr-[6px]"
              :class="accent.text"
          >
            {{ title }}
          </strong>
          <span v-if="titleAddon" class="text-sm text-gray-900">({{ titleAddon }})</span>
        </div>

        <p v-if="body" class="mb-0 mt-10 text-sm text-gray-900 hyphens-auto">
          {{ body }}
        </p>
      </HoverCardContent>
    </HoverCardPortal>
  </HoverCardRoot>
</template>
