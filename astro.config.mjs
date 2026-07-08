import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Site heberge sur GitHub Pages avec le domaine perso lecomptoirdenath.com
export default defineConfig({
  site: 'https://lecomptoirdenath.com',
  integrations: [
    // Genere sitemap-index.xml pour Google (exclut l'admin et la carte imprimable)
    sitemap({
      filter: (page) => !page.includes('/admin') && !page.includes('/carte-imprimable'),
    }),
  ],
  // Masque la barre d'outils de dev Astro (visible seulement en mode dev, jamais en ligne)
  devToolbar: { enabled: false },
});
