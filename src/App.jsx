import React from 'react'
import './App.css'
import { Outlet } from 'react-router-dom'
import AuthProvider from './context api/AuthContext'

function App() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  )
}

export default App