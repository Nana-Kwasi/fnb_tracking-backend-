import { useState } from 'react'
import api from '../services/api'
import Spinner from './Spinner'
import './Modal.css'

const DeleteProjectModal = ({ project, onClose, onSuccess }) => {
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
        api.delete(`/api/projects/${project.id}`, {
          data: { deletionReason: deletionReason.trim() }
        }),
        new Promise(resolve => setTimeout(resolve, 1500)) // 1.5 second minimum delay
      ])
      setLoading(false)
      onSuccess()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete project')
      setLoading(false)
    }
  }

  if (showWarning) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content delete-warning-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>⚠️ Warning: Delete Project</h2>
            <button className="close-button" onClick={onClose}>×</button>
          </div>
          <div className="warning-content">
            <div className="warning-icon">⚠️</div>
            <h3>Are you sure you want to delete this project?</h3>
            <div className="warning-details">
              <p><strong>Project ID:</strong> {project.projectId}</p>
              <p><strong>Project Name:</strong> {project.projectName}</p>
            </div>
            <div className="warning-effects">
              <h4>Effects of this action:</h4>
              <ul>
                <li>The project will be marked as deleted and hidden from active project lists</li>
                <li>The user who created this project will be notified with your deletion reason</li>
                <li>All associated change requests and attachments will remain but linked to a deleted project</li>
                <li>This action can be viewed in the deleted projects list</li>
                <li>The deletion reason will be visible to the project creator</li>
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
          <h2>Delete Project</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Project ID</label>
            <input type="text" value={project.projectId} readOnly />
          </div>
          <div className="form-group">
            <label>Project Name</label>
            <input type="text" value={project.projectName} readOnly />
          </div>
          <div className="form-group">
            <label>Deletion Reason *</label>
            <textarea
              value={deletionReason}
              onChange={(e) => setDeletionReason(e.target.value)}
              required
              rows="6"
              placeholder="Please provide a detailed reason for deleting this project. This reason will be visible to the user who created the project."
            />
            <small className="form-hint">This reason will be sent to the project creator as a notification.</small>
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
                'Delete Project'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default DeleteProjectModal
