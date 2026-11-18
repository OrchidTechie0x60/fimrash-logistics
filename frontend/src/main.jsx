import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/indigo.css'
import App from './App.jsx'
import { installNativeBackButton } from './lib/native'

installNativeBackButton()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
