// https://nuxt.com/docs/api/configuration/nuxt-config
import postcss from './postcss.config.js'
import { resolve } from 'path'
import { defineNuxtConfig } from 'nuxt/config'
import {undefined} from "zod";

export default defineNuxtConfig({
  $development: undefined, $env: undefined, $meta: undefined, $production: undefined, $test: undefined,
  alias: {
    'tailwind-config': resolve(__dirname, './tailwind.config.ts'),
  },
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  modules: [
    'motion-v/nuxt',
    '@dcc-bs/feedback-control.bs.js',
    '@nuxtjs/tailwindcss',
    ['@kanton-basel-stadt/designsystem/nuxt', {
      iconOptions: {
        compiler: 'vue3',
      }
    }],
    '@vite-pwa/nuxt',
  ],
  "feedback-control.bs.js": {
    repo: "Feedback_st-jakob-events",
    owner: "DCC-BS",
    project: "st-jakob-events_abfragetool"
  },

  app: {
    baseURL: '/',
    head: {
      htmlAttrs: { lang: 'de' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
        { name: 'theme-color', content: '#00838f' },
      ],
      title: 'Veranstaltungen im Raum St. Jakob',
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/icons/favicon.png' },
      ],
    },
  },

  pwa: {
    registerType: 'autoUpdate',
    workbox: {
      navigateFallback: '/',     // fallback for SPA-style routing
    },
    manifest: {
      name: 'Veranstaltungen im Raum St. Jakob',
      short_name: 'Veranstaltungen',
      lang: 'de',
      start_url: '/',
      scope: '/',
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: '#00838f',
      icons: [
        {
          src: '/icons/pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/icons/pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
        {
          src: '/icons/pwa-maskable-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
      ],
    },
    client: {
      installPrompt: true, // enables custom "Install app" prompt helpers
    },
  },

  runtimeConfig: {
    githubToken: process.env.GITHUB_TOKEN || '',
    public: {
      bsApiKey: process.env.BS_API_KEY || '',
    },
  },

  tailwindcss: {
    viewer: false,
  },
  css: ['~/assets/css/tailwind.css'],
  postcss
})
