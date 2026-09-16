import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import 'regenerator-runtime/runtime'
import { AuthProvider } from './context/AuthContext'
import { ChatProvider } from './context/ChatContext' // Import ChatProvider

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <ChatProvider> 
        <App />
      </ChatProvider>
    </AuthProvider>
  </React.StrictMode>,
)
