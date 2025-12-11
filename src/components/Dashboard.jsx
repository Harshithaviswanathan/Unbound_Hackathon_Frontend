import React, { useState, useEffect } from 'react'

const API_BASE_URL = 'http://localhost:8000'

function Dashboard({ apiKey, user, onUpdate }) {
  const [commandText, setCommandText] = useState('')
  const [commands, setCommands] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchCommands()
  }, [])

  const fetchCommands = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/commands`, {
        headers: { 'X-API-Key': apiKey }
      })
      if (response.ok) {
        const data = await response.json()
        setCommands(data)
      }
    } catch (error) {
      console.error('Failed to fetch commands:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!commandText.trim()) return

    setLoading(true)
    setMessage('')

    try {
      const response = await fetch(`${API_BASE_URL}/commands`, {
        method: 'POST',
        headers: {
          'X-API-Key': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ command_text: commandText })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(`Command ${data.status}! ${data.new_balance !== undefined ? `New balance: ${data.new_balance}` : ''}`)
        setCommandText('')
        fetchCommands()
        onUpdate()
      } else {
        setMessage(data.detail || 'Failed to submit command')
      }
    } catch (error) {
      setMessage(error.message || 'Failed to submit command')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dashboard">
      <div className="command-submit-section">
        <h2>Submit Command</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter command (e.g., ls -la, git status)"
            value={commandText}
            onChange={(e) => setCommandText(e.target.value)}
            className="command-input"
            disabled={loading}
          />
          <button type="submit" disabled={loading || !commandText.trim()}>
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </form>
        {message && <div className={`message ${message.includes('executed') ? 'success' : 'error'}`}>{message}</div>}
      </div>

      <div className="commands-history">
        <h2>Command History</h2>
        <div className="commands-list">
          {commands.length === 0 ? (
            <p>No commands yet</p>
          ) : (
            commands.map((cmd) => (
              <div key={cmd.id} className={`command-item ${cmd.status}`}>
                <div className="command-header">
                  <span className="command-text">{cmd.command_text}</span>
                  <span className={`status-badge ${cmd.status}`}>{cmd.status}</span>
                </div>
                <div className="command-details">
                  <span>Credits: {cmd.credits_deducted}</span>
                  <span>{new Date(cmd.created_at).toLocaleString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard

