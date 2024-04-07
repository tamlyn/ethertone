import './index.css'

import React from 'react'
import ReactDOM from 'react-dom/client'

import { AppProvider } from '~/components/App/AppContext.tsx'

import App from './components/App/App.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>,
)
