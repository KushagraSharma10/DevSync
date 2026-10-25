import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// Boots data-theme from localStorage before first paint
import './stores/uiStore'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
