import { useState } from 'react'
import api from '../services/api'
import { useToast } from '../context/ToastContext'
import Spinner from './Spinner'
import './Modal.css'

const STATUS_OPTIONS = [
  'ACCEPTED', 'REJECTED', 'DISCUSSION', 'DOCUMENTATION',
  'DEVELOPERS_DISCUSSION', 'TESTING', 'INT', 'QA', 'UAT',
  'QA_SIGN_OFF_IN_PROGRESS', 'QA_SIGN_OFF_COMPLETE',
  'RELEASE_NOTES_PREPARED', 'RELEASED_TO_PRODUCTION'
]

const StatusUpdateModal = ({ id, isChangeRequest, onClose, onSuccess }) => {
  const { showSuccess } = useToast()
  const [status, setStatus] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleClose = () => {
    setStatus('')
    setRejectionReason('')
    setError('')
    setLoading(false)
    onClose()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const endpoint = isChangeRequest 
        ? `/api/change-requests/${id}/status`
        : `/api/projects/${id}/status`
      
      const payload = {
        status,
        rejectionReason: status === 'REJECTED' ? (rejectionReason || '').trim() : null
      }
      
      // Add minimum delay to show spinner
      await Promise.all([
        api.put(endpoint, payload),
        new Promise(resolve => setTimeout(resolve, 1500)) // 1.5 second minimum delay
      ])
      
      setLoading(false)
      showSuccess(`Status updated successfully to ${status.replace(/_/g, ' ')}!`)
      onSuccess()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status')
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Update Status</h2>
          <button className="close-button" onClick={handleClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Status *</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              required
            >
              <option value="">Select Status</option>
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          {status === 'REJECTED' && (
            <div className="form-group">
              <label>Reason for Rejection *</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                required
                rows="4"
                placeholder="Please provide a reason for rejection"
              />
            </div>
          )}
          {error && <div className="error-message">{error}</div>}
          <div className="modal-actions">
            <button type="button" onClick={handleClose}>Cancel</button>
            <button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Spinner size="small" /> Updating...
                </>
              ) : (
                'Update Status'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default StatusUpdateModal
