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
    ['@kanton-basel-stadt/designsystem/nuxt', {
      iconOptions: {
        compiler: 'vue3',
      }
    }],
  ],

  app: {
    baseURL: '/stj-eventverkehr/',
    head: {
      htmlAttrs: { lang: 'de' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
      ],
      title: 'Veranstaltungen im Raum St. Jakob',
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/icons/favicon.png' },
      ],
    },
  },

  runtimeConfig: {
    public: {
      bsApiKey: process.env.BS_API_KEY || '',
    },
  },

  tailwindcss: {
    viewer: false,
  },
  css: ['~/assets/css/tailwind.css'],
  postcss,
})
