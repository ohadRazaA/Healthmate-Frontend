import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './lib/axiosConfig.js'
import { ThemeProvider } from '@emotion/react'
import CssBaseline from '@mui/material/CssBaseline'
import { getTheme } from './theme.js'
import { ToastContainer } from 'react-toastify'
import { Toaster } from 'sonner'
import { QueryClientProvider } from '@tanstack/react-query'
import queryClient from './queryClient.js'
import { RouterProvider } from 'react-router-dom'
import { router } from './router.jsx'
import { AppProvider, useApp } from './lib/app-context.jsx'

function AppShell() {
  const { theme } = useApp()

  return (
    <ThemeProvider theme={getTheme(theme === 'dark' ? 'dark' : 'light')}>
      <CssBaseline />
      <RouterProvider router={router} />
      <ToastContainer />
      <Toaster richColors position="top-center" />
    </ThemeProvider>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <AppShell />
      </AppProvider>
    </QueryClientProvider>
  </StrictMode>
)