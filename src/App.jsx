import React, { useState, useEffect } from 'react'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import AdminPanel from './components/AdminPanel'

const API_BASE_URL = 'http://localhost:8000'

function App() {
  const [apiKey, setApiKey] = useState(localStorage.getItem('apiKey') || '')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (apiKey) {
      fetchUser()
    }
  }, [apiKey])

  const fetchUser = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        headers: { 'X-API-Key': apiKey }
      })
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        setApiKey('')
        localStorage.removeItem('apiKey')
      }
    } catch (error) {
      console.error('Failed to fetch user:', error)
      setApiKey('')
      localStorage.removeItem('apiKey')
    }
  }

  const handleLogin = (key) => {
    setApiKey(key)
    localStorage.setItem('apiKey', key)
  }

  const handleLogout = () => {
    setApiKey('')
    setUser(null)
    localStorage.removeItem('apiKey')
  }

  if (!apiKey) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Command Gateway</h1>
        <div className="user-info">
          <span>Credits: {user?.credits || 0}</span>
          <span>Role: {user?.role || 'loading...'}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>
      
      <div className="main-content">
        <Dashboard apiKey={apiKey} user={user} onUpdate={fetchUser} />
        {user?.role === 'admin' && <AdminPanel apiKey={apiKey} />}
      </div>
    </div>
  )
}

export default App

