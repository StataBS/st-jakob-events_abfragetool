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
      repo: process.env.FEEDBACK_REPO,
      repoOwner: process.env.FEEDBACK_REPO_OWNER,
      project: process.env.FEEDBACK_PROJECT,
      githubToken: process.env.GITHUB_TOKEN,
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
