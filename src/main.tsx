import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// IAD TECH Signature
console.log(
  '%c FEDERADA SYSTEM v2.0 %c DEVELOPED BY IAD TECH ',
  'background: #000; color: #fff; padding: 5px; border-radius: 3px 0 0 3px; font-weight: bold',
  'background: #00FFFF; color: #000; padding: 5px; border-radius: 0 3px 3px 0; font-weight: bold'
);
console.log(
  '%c Precisa de um sistema de alta performance? Contate IAD TECH: https://wa.me/5569993242656 ',
  'color: #888; font-family: monospace; font-size: 10px;'
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
