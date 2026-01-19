import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import api from '../services/api'
import ProjectModal from '../components/ProjectModal'
import ChangeRequestModal from '../components/ChangeRequestModal'
import DeletedProjectsModal from '../components/DeletedProjectsModal'
import RejectionDetailsModal from '../components/RejectionDetailsModal'
import SuccessModal from '../components/SuccessModal'
import RefreshButton from '../components/RefreshButton'
import CopyButton from '../components/CopyButton'
import EmptyState from '../components/EmptyState'
import Spinner from '../components/Spinner'
import './LogProject.css'
import '../styles/statusBadges.css'

const LogProject = () => {
  const { user } = useAuth()
  const { showError } = useToast()
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [showChangeRequestModal, setShowChangeRequestModal] = useState(false)
  const [projects, setProjects] = useState([])
  const [changeRequests, setChangeRequests] = useState([])
  const [projectSearch, setProjectSearch] = useState('')
  const [changeRequestSearch, setChangeRequestSearch] = useState('')
  const [editingProject, setEditingProject] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeletedProjectsModal, setShowDeletedProjectsModal] = useState(false)
  const [selectedRejectedProject, setSelectedRejectedProject] = useState(null)
  const [showRejectionModal, setShowRejectionModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successProjectId, setSuccessProjectId] = useState(null)
  const [successChangeRequestId, setSuccessChangeRequestId] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [projectsRes, changeRequestsRes] = await Promise.all([
        api.get('/api/projects'),
        api.get('/api/change-requests')
      ])
      setProjects(projectsRes.data)
      setChangeRequests(changeRequestsRes.data)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }

  const handleProjectCreated = (projectId) => {
    setShowProjectModal(false)
    setSuccessProjectId(projectId)
    setShowSuccessModal(true)
    fetchData()
  }

  const handleChangeRequestCreated = (changeRequestId) => {
    setShowChangeRequestModal(false)
    setSuccessChangeRequestId(changeRequestId)
    setShowSuccessModal(true)
    fetchData()
  }

  const canEditProject = (project) => {
    if (!project.createdAt) return false
    const createdAt = new Date(project.createdAt)
    const now = new Date()
    const diffMinutes = (now - createdAt) / (1000 * 60)
    const userFNumber = user?.fNumber || user?.fnumber || ''
    return diffMinutes <= 15 && project.loggedBy === userFNumber
  }

  const handleEditProject = (project) => {
    setEditingProject(project)
    setShowEditModal(true)
  }

  const handleEditSuccess = () => {
    setShowEditModal(false)
    setEditingProject(null)
    fetchData()
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
      showError('Failed to download file')
    }
  }

  const handleViewFile = (fileId) => {
    window.open(`http://localhost:8080/api/files/view/${fileId}`, '_blank')
  }

  return (
    <div className="log-project">
      <div className="page-header">
        <div className="page-header-left">
          <button 
            className="view-deleted-button"
            onClick={() => setShowDeletedProjectsModal(true)}
          >
            View Deleted Projects
          </button>
        </div>
        <RefreshButton onRefresh={fetchData} />
      </div>
      
      <div className="log-sections">
        <div className="log-section">
          <h2>Log New Project Request</h2>
          <button 
            className="project-request-button"
            onClick={() => setShowProjectModal(true)}
          >
            + New Project Request
          </button>
        </div>

        <div className="divider"></div>

        <div className="log-section">
          <h2>Log Change Request</h2>
          <button 
            className="change-request-button"
            onClick={() => setShowChangeRequestModal(true)}
          >
            + New Change Request
          </button>
        </div>
      </div>

      <div className="tables-section">
        <div className="table-container">
          <div className="table-header-with-search">
            <h2>New Project Requests</h2>
            <input
              type="text"
              placeholder="Search by Project ID or Name..."
              className="search-input"
              value={projectSearch}
              onChange={(e) => setProjectSearch(e.target.value)}
            />
          </div>
          <table>
            <thead>
                    <tr>
                      <th>Project ID</th>
                      <th>Project Name</th>
                      <th>Department</th>
                      <th>Branch</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Files</th>
                      <th>Logged By</th>
                      <th>Date</th>
                    </tr>
            </thead>
            <tbody>
              {projects
                .filter((project) => {
                  if (!projectSearch) return true
                  const search = projectSearch.toLowerCase()
                  return (
                    project.projectId?.toLowerCase().includes(search) ||
                    project.projectName?.toLowerCase().includes(search)
                  )
                })
                .map((project) => (
                <tr key={project.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>{project.projectId}</span>
                      <CopyButton text={project.projectId} size="small" />
                    </div>
                  </td>
                  <td>{project.projectName}</td>
                  <td>{project.department}</td>
                  <td>{project.branch}</td>
                  <td>{project.priorityLevel}</td>
                  <td>
                    <div className="status-cell">
                      <span className={`status-badge ${project.status.toLowerCase()}`}>{project.status}</span>
                      {project.status === 'REJECTED' && (
                        <button
                          className="view-rejection-btn"
                          onClick={() => {
                            setSelectedRejectedProject(project)
                            setShowRejectionModal(true)
                          }}
                          title="View rejection details"
                        >
                          View
                        </button>
                      )}
                    </div>
                  </td>
                  <td>
                    {project.attachments && project.attachments.length > 0 ? (
                      <div className="files-list">
                        {project.attachments.map((file) => (
                          <div key={file.id} className="file-link">
                            <span 
                              className="file-name" 
                              onClick={() => handleViewFile(file.id)}
                              title="Click to view"
                            >
                              {file.fileName}
                            </span>
                            <button
                              className="file-download-btn"
                              onClick={() => handleDownloadFile(file.id, file.fileName)}
                              title="Download"
                            >
                              ↓
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span style={{ color: '#999' }}>No files</span>
                    )}
                  </td>
                  <td>{project.loggedBy || 'N/A'}</td>
                  <td>{new Date(project.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {projects.length === 0 && (
                <tr>
                  <td colSpan="9" style={{ padding: '3rem' }}>
                    <EmptyState
                      icon="📋"
                      title="No Projects Found"
                      message="You haven't logged any project requests yet. Click 'New Project Request' to get started."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="table-container">
          <div className="table-header-with-search">
            <h2>Change Requests</h2>
            <input
              type="text"
              placeholder="Search by Project ID or Feature..."
              className="search-input"
              value={changeRequestSearch}
              onChange={(e) => setChangeRequestSearch(e.target.value)}
            />
          </div>
          <table>
            <thead>
              <tr>
                <th>Project ID</th>
                <th>Requested Feature</th>
                <th>Reason for Change</th>
                <th>Impact Level</th>
                <th>Status</th>
                <th>Files</th>
                <th>Logged By</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {changeRequests
                .filter((cr) => {
                  if (!changeRequestSearch) return true
                  const search = changeRequestSearch.toLowerCase()
                  return (
                    cr.projectProjectId?.toLowerCase().includes(search) ||
                    cr.requestedFeature?.toLowerCase().includes(search)
                  )
                })
                .map((cr) => (
                <tr key={cr.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>{cr.projectProjectId}</span>
                      <CopyButton text={cr.projectProjectId} size="small" />
                    </div>
                  </td>
                  <td>{cr.requestedFeature}</td>
                  <td>{cr.reasonForChange || '-'}</td>
                  <td>{cr.impactLevel || '-'}</td>
                  <td><span className={`status-badge ${cr.status.toLowerCase()}`}>{cr.status}</span></td>
                  <td>
                    {cr.attachments && cr.attachments.length > 0 ? (
                      <div className="files-list">
                        {cr.attachments.map((file) => (
                          <div key={file.id} className="file-link">
                            <span 
                              className="file-name" 
                              onClick={() => handleViewFile(file.id)}
                              title="Click to view"
                            >
                              {file.fileName}
                            </span>
                            <button
                              className="file-download-btn"
                              onClick={() => handleDownloadFile(file.id, file.fileName)}
                              title="Download"
                            >
                              ↓
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span style={{ color: '#999' }}>No files</span>
                    )}
                  </td>
                  <td>{cr.loggedBy || 'N/A'}</td>
                  <td>{new Date(cr.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {changeRequests.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ padding: '3rem' }}>
                    <EmptyState
                      icon="🔄"
                      title="No Change Requests Found"
                      message="You haven't logged any change requests yet. Click 'New Change Request' to get started."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showProjectModal && (
        <ProjectModal
          onClose={() => setShowProjectModal(false)}
          onSuccess={handleProjectCreated}
        />
      )}

      {showChangeRequestModal && (
        <ChangeRequestModal
          onClose={() => setShowChangeRequestModal(false)}
          onSuccess={handleChangeRequestCreated}
        />
      )}

      {showEditModal && editingProject && (
        <ProjectModal
          project={editingProject}
          isEdit={true}
          onClose={() => {
            setShowEditModal(false)
            setEditingProject(null)
          }}
          onSuccess={handleEditSuccess}
        />
      )}

      {showDeletedProjectsModal && (
        <DeletedProjectsModal
          onClose={() => setShowDeletedProjectsModal(false)}
        />
      )}

      {showRejectionModal && selectedRejectedProject && (
        <RejectionDetailsModal
          project={selectedRejectedProject}
          onClose={() => {
            setShowRejectionModal(false)
            setSelectedRejectedProject(null)
          }}
        />
      )}

      {showSuccessModal && (successProjectId || successChangeRequestId) && (
        <SuccessModal
          projectId={successProjectId || successChangeRequestId}
          onClose={() => {
            setShowSuccessModal(false)
            setSuccessProjectId(null)
            setSuccessChangeRequestId(null)
          }}
        />
      )}
    </div>
  )
}

export default LogProject
