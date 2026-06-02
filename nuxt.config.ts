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
    resolve('./node_modules/@abi-shai/tolbi-design-system/dist/tokens/index.css'),
    '~/assets/css/main.css',
    resolve('./node_modules/@abi-shai/tolbi-design-system/dist/index.css'),
  ],

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
