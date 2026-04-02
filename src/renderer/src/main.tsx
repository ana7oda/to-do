import './assets/main.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import NotificationWindow from './components/NotificationWindow'

const root = createRoot(document.getElementById('root')!)

// لو الرابط فيه #notification، اعرض نافذة الإشعار
if (window.location.hash === '#notification') {
  root.render(
    <StrictMode>
      <NotificationWindow />
    </StrictMode>
  )
} else {
  // غير كده، اعرض التطبيق الأساسي بتاعنا
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  )
}