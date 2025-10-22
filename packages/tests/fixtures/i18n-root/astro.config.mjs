import { defineConfig } from 'astro/config'
import starlight from '@astrojs/starlight'

export default defineConfig({
  integrations: [
    starlight({
      title: 'i18n with root locale',
      locales: {
        root: { label: 'English', lang: 'en' },
        fr: { label: 'French', lang: 'fr' },
      },
    }),
  ],
})
