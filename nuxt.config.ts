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

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
    publicDir: resolve('./public'),
  },

  nitro: {
    publicAssets: [
      { baseURL: '/', dir: resolve('./public') },
    ],
  },

  components: [
    { path: '~/components', pathPrefix: false },
  ],

  devtools: { enabled: true },

  compatibilityDate: '2025-01-01',
})
