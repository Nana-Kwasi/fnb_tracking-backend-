import { useState, useEffect } from 'react'
import api from '../services/api'
import Spinner from './Spinner'
import './Modal.css'

const RejectionDetailsModal = ({ project, onClose }) => {
  const [projectDetails, setProjectDetails] = useState(project)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        setLoading(true)
        const response = await api.get(`/api/projects/${project.id}`)
        setProjectDetails(response.data)
      } catch (error) {
        console.error('Failed to fetch project details:', error)
        setProjectDetails(project) // Fallback to passed project
      } finally {
        setLoading(false)
      }
    }
    fetchProjectDetails()
  }, [project.id])

  if (loading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content rejection-details-modal" onClick={(e) => e.stopPropagation()}>
          <div className="loading-container">
            <Spinner /> Loading project details...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content rejection-details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Project Rejection Details</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="project-info-section">
            <h3>Project Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <strong>Project ID:</strong>
                <span>{projectDetails.projectId}</span>
              </div>
              <div className="info-item">
                <strong>Project Name:</strong>
                <span>{projectDetails.projectName}</span>
              </div>
              <div className="info-item">
                <strong>Department:</strong>
                <span>{projectDetails.department || 'N/A'}</span>
              </div>
              <div className="info-item">
                <strong>Branch:</strong>
                <span>{projectDetails.branch || 'N/A'}</span>
              </div>
              <div className="info-item">
                <strong>Priority:</strong>
                <span>{projectDetails.priorityLevel || 'N/A'}</span>
              </div>
              <div className="info-item">
                <strong>Status:</strong>
                <span className={`status-badge ${projectDetails.status?.toLowerCase()}`}>{projectDetails.status}</span>
              </div>
              <div className="info-item">
                <strong>Logged By:</strong>
                <span>{projectDetails.loggedBy}</span>
              </div>
              <div className="info-item">
                <strong>Created Date:</strong>
                <span>{projectDetails.createdAt ? new Date(projectDetails.createdAt).toLocaleString() : 'N/A'}</span>
              </div>
            </div>
          </div>
          
          {projectDetails.description && (
            <div className="description-section">
              <h3>Description / Business Justification</h3>
              <div className="description-text">{projectDetails.description}</div>
            </div>
          )}

          <div className="rejection-section">
            <h3>Rejection Reason</h3>
            <div className="rejection-reason-box">
              {projectDetails.rejectionReason ? (
                <p>{projectDetails.rejectionReason}</p>
              ) : (
                <p className="no-reason">No rejection reason provided.</p>
              )}
            </div>
          </div>
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

export default RejectionDetailsModal
