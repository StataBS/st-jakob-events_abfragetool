// https://nuxt.com/docs/api/configuration/nuxt-config
import postcss from './postcss.config.js'
import { resolve } from 'path'
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  alias: {
    'tailwind-config': resolve(__dirname, './tailwind.config.ts'),
  },
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  modules: [
    'motion-v/nuxt',     
    '@nuxtjs/tailwindcss',
  ],
  tailwindcss: {
    viewer: false,
  },
  css: ['~/public/fonts.css'],
  postcss,
})
