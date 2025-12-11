import React, { useState } from 'react'

const API_BASE_URL = 'http://localhost:8000'

function Login({ onLogin }) {
  const [apiKey, setApiKey] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    try {
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        headers: { 'X-API-Key': apiKey }
      })
      
      if (response.ok) {
        onLogin(apiKey)
      } else {
        setError('Invalid API key')
      }
    } catch (error) {
      setError('Invalid API key')
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Command Gateway Login</h2>
        <p className="hint">Use your API key to login</p>
        <p className="hint-small">Default admin key: admin_key_12345</p>
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter API Key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            required
            className="api-key-input"
          />
          {error && <div className="error">{error}</div>}
          <button type="submit" className="login-button">Login</button>
        </form>
      </div>
    </div>
  )
}

export default Login

