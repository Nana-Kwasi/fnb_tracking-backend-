import { useState, useEffect } from 'react'
import api from '../services/api'
import Spinner from './Spinner'
import './Modal.css'

const DeletedProjectsModal = ({ onClose }) => {
  const [deletedProjects, setDeletedProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDeletedProjects()
  }, [])

  const fetchDeletedProjects = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/projects/deleted')
      setDeletedProjects(response.data)
    } catch (err) {
      setError('Failed to load deleted projects')
      console.error('Error fetching deleted projects:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content deleted-projects-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Deleted Projects</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {loading ? (
            <div className="loading-container">
              <Spinner /> Loading deleted projects...
            </div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : deletedProjects.length === 0 ? (
            <div className="empty-state">
              <p>No deleted projects found.</p>
            </div>
          ) : (
            <div className="deleted-projects-list">
              {deletedProjects.map((project) => (
                <div key={project.id} className="deleted-project-item">
                  <div className="project-header">
                    <h3>{project.projectId} - {project.projectName}</h3>
                    <span className="deleted-badge">DELETED</span>
                  </div>
                  <div className="project-details">
                    <p><strong>Department:</strong> {project.department || 'N/A'}</p>
                    <p><strong>Branch:</strong> {project.branch || 'N/A'}</p>
                    <p><strong>Logged By:</strong> {project.loggedBy}</p>
                    <p><strong>Deleted At:</strong> {project.deletedAt ? new Date(project.deletedAt).toLocaleString() : 'N/A'}</p>
                    <p><strong>Deleted By:</strong> {project.deletedBy || 'N/A'}</p>
                  </div>
                  <div className="deletion-reason">
                    <strong>Deletion Reason:</strong>
                    <div className="reason-text">{project.deletionReason || 'No reason provided'}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="modal-actions">
          <button type="button" onClick={onClose} className="primary-button">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeletedProjectsModal
