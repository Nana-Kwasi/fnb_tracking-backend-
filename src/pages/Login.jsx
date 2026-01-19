import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Spinner from '../components/Spinner'
import SuspendedAccountModal from '../components/SuspendedAccountModal'
import './Login.css'

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSuspendedModal, setShowSuspendedModal] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setShowSuspendedModal(false)
    try {
      const result = await login(username, password)
      if (result.success) {
        navigate('/dashboard')
      } else {
        if (result.suspended) {
          setShowSuspendedModal(true)
        } else {
          setError(result.error || 'Invalid credentials')
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const currentYear = new Date().getFullYear()

  return (
    <div className="login-container">
      <div className="login-left">
      </div>
      <div className="login-divider"></div>
      <div className="login-right">
        <div className="login-card">
          <img src="/Images/images.png" alt="FNB Logo" className="login-card-image" />
          <h1>Welcome Back</h1>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <div className="error-message">{error}</div>}
            <button type="submit" className="login-button" disabled={loading}>
              {loading ? (
                <>
                  <Spinner size="small" /> Logging in...
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>
        </div>
      </div>

      {showSuspendedModal && (
        <SuspendedAccountModal
          onClose={() => {
            setShowSuspendedModal(false)
            setUsername('')
            setPassword('')
          }}
        />
      )}

      <footer className="login-footer">
        <div className="login-footer-line"></div>
        <p className="login-footer-text">
          FNB Project Management System {currentYear}. All Rights Reserved
        </p>
      </footer>
    </div>
  )
}

export default Login
