import { useState, useEffect } from 'react'
import api from '../services/api'
import Spinner from './Spinner'
import './Modal.css'

const UserModal = ({ user, onClose, onSuccess, onDelete, onSuspend }) => {
  const [formData, setFormData] = useState({
    fNumber: '',
    role: 'ADMIN',
    isActive: true
  })
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [suspending, setSuspending] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      setFormData({
        fNumber: user.fNumber,
        role: user.role,
        isActive: user.isActive
      })
    }
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      // Add minimum delay to show spinner
      await Promise.all([
        user 
          ? api.put(`/api/users/${user.id}`, formData)
          : api.post('/api/users', formData),
        new Promise(resolve => setTimeout(resolve, 1500)) // 1.5 second minimum delay
      ])
      setLoading(false)
      onSuccess()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save user')
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this admin user? This action cannot be undone.')) {
      return
    }
    
    setDeleting(true)
    setError('')
    try {
      if (onDelete) {
        await onDelete(user.id)
      } else {
        await api.delete(`/api/users/${user.id}`)
      }
      onSuccess()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user')
      setDeleting(false)
    }
  }

  const handleSuspend = async () => {
    const action = user.isActive ? 'suspend' : 'activate'
    const confirmMessage = user.isActive 
      ? 'Are you sure you want to suspend this admin user? They will not be able to log in.'
      : 'Are you sure you want to activate this admin user?'
    
    if (!window.confirm(confirmMessage)) {
      return
    }

    setSuspending(true)
    setError('')
    try {
      if (onSuspend) {
        await onSuspend(user)
      } else {
        await api.put(`/api/users/${user.id}`, {
          ...user,
          isActive: !user.isActive
        })
      }
      onSuccess()
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${action} user`)
      setSuspending(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{user ? 'Edit Admin User' : 'Add Admin User'}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          {!user && (
            <div className="form-group">
              <label>F-Number *</label>
              <input
                type="text"
                value={formData.fNumber}
                onChange={(e) => setFormData({ ...formData, fNumber: e.target.value })}
                required
                placeholder="e.g., F001"
              />
            </div>
          )}
          <div className="form-group">
            <label>Role *</label>
            <select
              value={formData.role}
              disabled
              required
            >
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
              Active
            </label>
          </div>
          {error && <div className="error-message">{error}</div>}
          <div className="modal-actions">
            {user && (
              <>
                <button 
                  type="button" 
                  className="action-button suspend-action-button"
                  onClick={handleSuspend}
                  disabled={loading || suspending || deleting}
                >
                  {suspending ? (
                    <>
                      <Spinner size="small" /> {user.isActive ? 'Suspending...' : 'Activating...'}
                    </>
                  ) : (
                    <>
                      <span className="action-icon">{user.isActive ? '⏸️' : '▶️'}</span>
                      {user.isActive ? 'Suspend' : 'Activate'}
                    </>
                  )}
                </button>
                <button 
                  type="button" 
                  className="action-button delete-action-button"
                  onClick={handleDelete}
                  disabled={loading || suspending || deleting}
                >
                  {deleting ? (
                    <>
                      <Spinner size="small" /> Deleting...
                    </>
                  ) : (
                    <>
                      <span className="action-icon">🗑️</span>
                      Delete
                    </>
                  )}
                </button>
              </>
            )}
            <button type="button" onClick={onClose} disabled={loading || suspending || deleting}>
              Cancel
            </button>
            <button type="submit" disabled={loading || suspending || deleting}>
              {loading ? (
                <>
                  <Spinner size="small" /> {user ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                user ? 'Update User' : 'Create User'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UserModal
