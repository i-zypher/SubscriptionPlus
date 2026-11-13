import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// The website lives at /subscriptionplus/. The iOS and Android apps
// (`vite build --mode app`) serve the game from the root instead.
export default defineConfig(({ mode }) => ({
  base: mode === 'app' ? '/' : '/subscriptionplus/',
  plugins: [react()],
}))
