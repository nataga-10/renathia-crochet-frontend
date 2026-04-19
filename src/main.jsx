// Punto de entrada de la aplicación React.
// Monta el componente App en el elemento #root del HTML usando la API createRoot de React 18.
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  // StrictMode activa advertencias adicionales en desarrollo (doble render, APIs obsoletas)
  <StrictMode>
    <App />
  </StrictMode>,
)
