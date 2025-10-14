<script setup lang="ts">
const model = defineModel<string>({ required: true })

const link =
    'https://www.bs.ch/jsd/polizei/unsere-hauptabteilungen/verkehr/bikantonale-geschaeftsstelle-eventverkehr-st-jakob'
</script>

<template>
  <header>
    <div class="page-header">
      <div class="flex items-center flex-nowrap min-w-0 gap-30 lg:gap-60">
        <BSLogo :href="link" />

        <a :href="link" target="_blank" rel="noopener" class="flex items-baseline shrink-0">
          <img
              src="/icons/BL-logo.svg"
              alt="BL Logo"
              class="shrink-0 select-none
               h-[25px] lg:h-[32px] w-auto
               relative -top-[1px]"
          />
        </a>
      </div>
    </div>

    <section class="bg-green-100">
      <div class="container py-30 lg:py-50">
        <h1 class="header-title text-green-600 mb-20">
          Veranstaltungen im Raum St. Jakob
        </h1>

        <div class="mt-15 flex items-center gap-10">
          <DatePicker v-model="model" />
        </div>
      </div>
    </section>

  </header>
</template>
