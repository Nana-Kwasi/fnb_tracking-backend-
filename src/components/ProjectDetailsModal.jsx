import { useState, useEffect } from 'react'
import api from '../services/api'
import Spinner from './Spinner'
import './ProjectDetailsModal.css'
import '../styles/statusBadges.css'

const ProjectDetailsModal = ({ projectId, onClose }) => {
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (projectId) {
      fetchProjectDetails()
    }
  }, [projectId])

  const fetchProjectDetails = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await api.get(`/api/projects/search/${projectId}`)
      setProject(response.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Project not found')
      setProject(null)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadFile = async (fileId, fileName) => {
    try {
      const response = await api.get(`/api/files/download/${fileId}`, {
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', fileName)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download error:', error)
    }
  }

  const handleViewFile = (fileId) => {
    window.open(`http://localhost:8080/api/files/view/${fileId}`, '_blank')
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content project-details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Project Details</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {loading ? (
            <div className="loading-state">
              <Spinner size="medium" />
              <p>Loading project details...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <div className="error-icon">⚠️</div>
              <p>{error}</p>
              <p className="error-hint">Please check the Project ID and try again.</p>
            </div>
          ) : project ? (
            <>
              <div className="project-header-section">
                <div className="project-id-badge">
                  <span className="project-id-label">Project ID</span>
                  <span className="project-id-value">{project.projectId}</span>
                </div>
                <span className={`status-badge-large ${project.status?.toLowerCase()}`}>
                  {project.status}
                </span>
              </div>

              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">Project Name</span>
                  <span className="detail-value">{project.projectName || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Department</span>
                  <span className="detail-value">{project.department || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Branch</span>
                  <span className="detail-value">{project.branch || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Priority Level</span>
                  <span className="detail-value priority-badge">{project.priorityLevel || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Logged By</span>
                  <span className="detail-value">{project.loggedBy || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Updated By</span>
                  <span className="detail-value">{project.updatedBy || '-'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Date Created</span>
                  <span className="detail-value">
                    {project.createdAt ? new Date(project.createdAt).toLocaleString() : 'N/A'}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Last Updated</span>
                  <span className="detail-value">
                    {project.updatedAt ? new Date(project.updatedAt).toLocaleString() : 'N/A'}
                  </span>
                </div>
              </div>

              {project.description && (
                <div className="description-section">
                  <h3>Description / Business Justification</h3>
                  <div className="description-text">{project.description}</div>
                </div>
              )}

              {project.rejectionReason && (
                <div className="rejection-section">
                  <h3>Rejection Reason</h3>
                  <div className="rejection-text">{project.rejectionReason}</div>
                </div>
              )}

              {project.attachments && project.attachments.length > 0 && (
                <div className="attachments-section">
                  <h3>Attachments ({project.attachments.length})</h3>
                  <div className="attachments-list">
                    {project.attachments.map((file) => (
                      <div key={file.id} className="attachment-item">
                        <div className="attachment-info">
                          <span className="file-icon">📄</span>
                          <span className="file-name">{file.fileName}</span>
                          <span className="file-size">({(file.fileSize / 1024).toFixed(2)} KB)</span>
                        </div>
                        <div className="attachment-actions">
                          <button
                            className="view-file-btn"
                            onClick={() => handleViewFile(file.id)}
                            title="View file"
                          >
                            👁️ View
                          </button>
                          <button
                            className="download-file-btn"
                            onClick={() => handleDownloadFile(file.id, file.fileName)}
                            title="Download file"
                          >
                            ⬇️ Download
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : null}
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

export default ProjectDetailsModal
