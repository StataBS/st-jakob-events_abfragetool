// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from 'nuxt/config'
import designSystemPlugin from '@kanton-basel-stadt/designsystem/vite'

const allPlugins = designSystemPlugin({
  iconOptions: {
    compiler: 'vue3',
  },
})
const designSystemPlugins = (Array.isArray(allPlugins) ? allPlugins : [allPlugins])
  .filter((p: any) => p.name !== '@kanton-basel-stadt/designsystem/postcss-tailwind')

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  extends: [
    'github:DCC-BS/nuxt-layers/feedback-control',
  ],

  modules: [
    'motion-v/nuxt',
    '@vite-pwa/nuxt'
  ],

  vite: {
    plugins: designSystemPlugins as any,
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

  runtimeConfig: {
    feedback: {
      repo: process.env.FEEDBACK_REPO || 'Feedback_st-jakob-events',
      repoOwner: process.env.FEEDBACK_REPO_OWNER || 'DCC-BS',
      project: process.env.FEEDBACK_PROJECT || 'st-jakob-events_abfragetool',
      githubToken: process.env.FEEDBACK_GITHUB_TOKEN || process.env.GITHUB_TOKEN || '',
    },
  },

  pwa: {
    registerType: 'autoUpdate',
    strategies: 'injectManifest',
    srcDir: 'public',
    filename: 'sw.js',

    manifest: {
      name: 'Veranstaltungen im Raum St. Jakob',
      short_name: 'Veranstaltungen',
      lang: 'de',
      start_url: '/',
      scope: '/',
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: '#00838f',
    },
  },

  i18n: {
    defaultLocale: 'de',
  },

  css: [
    'v-calendar/style.css',
    '~/assets/css/tailwind.css'
  ],
})
