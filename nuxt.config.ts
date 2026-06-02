import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineNuxtConfig({
  srcDir: 'src',

  modules: [
    '@pinia/nuxt',
    '@nuxtjs/google-fonts',
  ],

  googleFonts: {
    families: {
      Poppins: [400, 500, 600, 700],
      Inter: [400],
    },
    display: 'swap',
    download: true,
  },

  css: [
    '~/assets/css/design-system.css',
    '~/assets/css/main.css',
  ],

  dir: {
    public: 'public',
  },

  vite: {
    plugins: [tailwindcss()],
  },

  components: [
    { path: '~/components', pathPrefix: false },
  ],

  experimental: {
    inlineSSRStyles: false,
  },

  devtools: { enabled: true },

  compatibilityDate: '2025-01-01',
})
