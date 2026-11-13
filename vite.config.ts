import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// Three builds:
//   npm run build       → ceymer-studios.com/subscriptionplus/ (the old home)
//   npm run build:site  → subscriptionplusgame.com, the game's own site (auto-deploy)
//   npm run build:app   → the iOS and Android apps
// The site and the apps serve the game from the root.
export default defineConfig(({ mode }) => ({
  base: mode === 'app' || mode === 'site' ? '/' : '/subscriptionplus/',
  plugins: [react()],
}))
