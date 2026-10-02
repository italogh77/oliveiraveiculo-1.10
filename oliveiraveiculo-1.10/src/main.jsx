import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './firebase.js' // Inicializa Firebase e Analytics
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { startAutoRefresh } from './lib/autoRefresh.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)

startAutoRefresh()
