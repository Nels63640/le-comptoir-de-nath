import { defineConfig } from 'astro/config';

// Site heberge sur GitHub Pages avec le domaine perso lecomptoirdenath.com
export default defineConfig({
  site: 'https://lecomptoirdenath.com',
  // Masque la barre d'outils de dev Astro (visible seulement en mode dev, jamais en ligne)
  devToolbar: { enabled: false },
});
