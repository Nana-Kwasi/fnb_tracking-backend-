import { useState } from 'react'
import api from '../services/api'
import Spinner from './Spinner'
import './Modal.css'

const DeleteChangeRequestModal = ({ changeRequest, onClose, onSuccess }) => {
  const [deletionReason, setDeletionReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showWarning, setShowWarning] = useState(true)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!deletionReason.trim()) {
      setError('Please provide a reason for deletion')
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      // Add minimum delay to show spinner
      await Promise.all([
        api.delete(`/api/change-requests/${changeRequest.id}`, {
          data: { deletionReason: deletionReason.trim() }
        }),
        new Promise(resolve => setTimeout(resolve, 1500)) // 1.5 second minimum delay
      ])
      setLoading(false)
      onSuccess()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete change request')
      setLoading(false)
    }
  }

  if (showWarning) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content delete-warning-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>⚠️ Warning: Delete Change Request</h2>
            <button className="close-button" onClick={onClose}>×</button>
          </div>
          <div className="warning-content">
            <div className="warning-icon">⚠️</div>
            <h3>Are you sure you want to delete this change request?</h3>
            <div className="warning-details">
              <p><strong>Project ID:</strong> {changeRequest.projectProjectId}</p>
              <p><strong>Requested Feature:</strong> {changeRequest.requestedFeature}</p>
            </div>
            <div className="warning-effects">
              <h4>Effects of this action:</h4>
              <ul>
                <li>The change request will be permanently deleted</li>
                <li>All associated attachments will also be deleted</li>
                <li>This action cannot be undone</li>
                <li>The user who created this change request will not be notified</li>
              </ul>
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button 
              type="button" 
              onClick={() => setShowWarning(false)}
              className="warning-button"
            >
              I Understand, Continue
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Delete Change Request</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Project ID</label>
            <input type="text" value={changeRequest.projectProjectId || ''} readOnly />
          </div>
          <div className="form-group">
            <label>Requested Feature</label>
            <textarea
              value={changeRequest.requestedFeature || ''}
              readOnly
              rows="3"
            />
          </div>
          <div className="form-group">
            <label>Deletion Reason *</label>
            <textarea
              value={deletionReason}
              onChange={(e) => setDeletionReason(e.target.value)}
              required
              rows="6"
              placeholder="Please provide a detailed reason for deleting this change request."
            />
            <small className="form-hint">This reason will help document why this change request was deleted.</small>
          </div>
          {error && <div className="error-message">{error}</div>}
          <div className="modal-actions">
            <button type="button" onClick={() => setShowWarning(true)}>Back</button>
            <button type="submit" disabled={loading} className="delete-button">
              {loading ? (
                <>
                  <Spinner size="small" /> Deleting...
                </>
              ) : (
                'Delete Change Request'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default DeleteChangeRequestModal
