<script setup lang="ts">
import IconSymbolBaselstab from '@kanton-basel-stadt/designsystem/icons/symbol/baselstab'
const props = withDefaults(defineProps<{
  href: string
  targetBlank?: boolean
  ariaLabel?: string
}>(), {
  targetBlank: true,
  ariaLabel: 'Logo - Kanton Basel-Stadt',
})
</script>

<template>
  <a
      :href="href"
      :target="targetBlank ? '_blank' : undefined"
      :aria-label="ariaLabel"
      class="inline-flex items-baseline no-underline text-gray-900 hover:opacity-80
           whitespace-nowrap leading-none min-w-0
           text-base lg:text-[24px]"
  >
    <IconSymbolBaselstab
        class="relative -top-[-4px] inline-block shrink-0
             w-[10.58px] h-[17.94px] lg:w-[14.12px] lg:h-[23.93px]"
    />
    <span
        class="ml-[0.3em] pl-[0.25em] border-l border-gray-900 font-bold
             leading-[1.2em] whitespace-nowrap truncate"
        title="Kanton Basel-Stadt"
    >
      Kanton Basel-Stadt
    </span>
  </a>
</template>
