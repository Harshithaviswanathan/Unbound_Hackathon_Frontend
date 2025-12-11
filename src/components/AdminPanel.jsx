import React, { useState, useEffect } from 'react'

const API_BASE_URL = 'http://localhost:8000'

function AdminPanel({ apiKey }) {
  const [activeTab, setActiveTab] = useState('rules')
  const [rules, setRules] = useState([])
  const [users, setUsers] = useState([])
  const [auditLogs, setAuditLogs] = useState([])
  const [newRule, setNewRule] = useState({ pattern: '', action: 'AUTO_ACCEPT' })
  const [newUser, setNewUser] = useState({ role: 'member', credits: 100 })
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (activeTab === 'rules') fetchRules()
    if (activeTab === 'users') fetchUsers()
    if (activeTab === 'audit') fetchAuditLogs()
  }, [activeTab])

  const fetchRules = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/rules`, {
        headers: { 'X-API-Key': apiKey }
      })
      if (response.ok) {
        const data = await response.json()
        setRules(data)
      }
    } catch (error) {
      console.error('Failed to fetch rules:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        headers: { 'X-API-Key': apiKey }
      })
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
  }

  const fetchAuditLogs = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/audit-logs`, {
        headers: { 'X-API-Key': apiKey }
      })
      if (response.ok) {
        const data = await response.json()
        setAuditLogs(data)
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error)
    }
  }

  const handleCreateRule = async (e) => {
    e.preventDefault()
    setMessage('')

    try {
      const response = await fetch(`${API_BASE_URL}/rules`, {
        method: 'POST',
        headers: {
          'X-API-Key': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newRule)
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Rule created successfully!')
        setNewRule({ pattern: '', action: 'AUTO_ACCEPT' })
        fetchRules()
      } else {
        setMessage(data.detail || 'Failed to create rule')
      }
    } catch (error) {
      setMessage(error.message || 'Failed to create rule')
    }
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    setMessage('')

    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'X-API-Key': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newUser)
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(`User created! API Key: ${data.api_key} (save this - it won't be shown again)`)
        setNewUser({ role: 'member', credits: 100 })
        fetchUsers()
      } else {
        setMessage(data.detail || 'Failed to create user')
      }
    } catch (error) {
      setMessage(error.message || 'Failed to create user')
    }
  }

  const handleUpdateCredits = async (userId, credits) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/credits`, {
        method: 'PUT',
        headers: {
          'X-API-Key': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ credits })
      })

      if (response.ok) {
        fetchUsers()
      }
    } catch (error) {
      console.error('Failed to update credits:', error)
    }
  }

  const handleDeleteRule = async (ruleId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/rules/${ruleId}`, {
        method: 'DELETE',
        headers: { 'X-API-Key': apiKey }
      })

      if (response.ok) {
        fetchRules()
      }
    } catch (error) {
      console.error('Failed to delete rule:', error)
    }
  }

  return (
    <div className="admin-panel">
      <div className="admin-tabs">
        <button className={activeTab === 'rules' ? 'active' : ''} onClick={() => setActiveTab('rules')}>
          Rules
        </button>
        <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>
          Users
        </button>
        <button className={activeTab === 'audit' ? 'active' : ''} onClick={() => setActiveTab('audit')}>
          Audit Logs
        </button>
      </div>

      {message && <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>{message}</div>}

      {activeTab === 'rules' && (
        <div className="admin-section">
          <h3>Create New Rule</h3>
          <form onSubmit={handleCreateRule}>
            <input
              type="text"
              placeholder="Regex pattern (e.g., ^ls|rm\\s+-rf)"
              value={newRule.pattern}
              onChange={(e) => setNewRule({ ...newRule, pattern: e.target.value })}
              required
            />
            <select
              value={newRule.action}
              onChange={(e) => setNewRule({ ...newRule, action: e.target.value })}
            >
              <option value="AUTO_ACCEPT">AUTO_ACCEPT</option>
              <option value="AUTO_REJECT">AUTO_REJECT</option>
            </select>
            <button type="submit">Create Rule</button>
          </form>

          <h3>Existing Rules</h3>
          <div className="rules-list">
            {rules.map((rule) => (
              <div key={rule.id} className="rule-item">
                <div className="rule-pattern">{rule.pattern}</div>
                <div className={`rule-action ${rule.action}`}>{rule.action}</div>
                <button onClick={() => handleDeleteRule(rule.id)} className="delete-btn">Delete</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="admin-section">
          <h3>Create New User</h3>
          <form onSubmit={handleCreateUser}>
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
            <input
              type="number"
              placeholder="Initial Credits"
              value={newUser.credits}
              onChange={(e) => setNewUser({ ...newUser, credits: parseInt(e.target.value) })}
              required
            />
            <button type="submit">Create User</button>
          </form>

          <h3>Existing Users</h3>
          <div className="users-list">
            {users.map((u) => (
              <div key={u.id} className="user-item">
                <div className="user-info">
                  <span>ID: {u.id}</span>
                  <span>Role: {u.role}</span>
                  <span>Credits: {u.credits}</span>
                </div>
                <div className="user-actions">
                  <input
                    type="number"
                    placeholder="New credits"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleUpdateCredits(u.id, parseInt(e.target.value))
                        e.target.value = ''
                      }
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="admin-section">
          <h3>Audit Logs</h3>
          <div className="audit-logs">
            {auditLogs.map((log) => (
              <div key={log.id} className="audit-log-item">
                <div className="log-header">
                  <span>User ID: {log.user_id}</span>
                  <span>{new Date(log.created_at).toLocaleString()}</span>
                </div>
                <div className="log-action">{log.action}</div>
                <div className="log-details">{log.details}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPanel

