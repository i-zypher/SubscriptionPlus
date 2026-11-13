import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { isApp } from './platform'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Inside the iOS/Android apps: lets CSS keep the game clear of the notch
if (isApp) document.documentElement.classList.add('is-app')

// Lets the website install as an app. Production only, so local dev never
// gets a stale worker, and never inside the real apps (they don't need it).
if (import.meta.env.PROD && !isApp && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`, { scope: import.meta.env.BASE_URL })
      .catch((err) => console.error('Service worker failed:', err))
  })
}
