import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import api from '../services/api'
import StatusUpdateModal from '../components/StatusUpdateModal'
import DeleteProjectModal from '../components/DeleteProjectModal'
import DeleteChangeRequestModal from '../components/DeleteChangeRequestModal'
import RefreshButton from '../components/RefreshButton'
import CopyButton from '../components/CopyButton'
import EmptyState from '../components/EmptyState'
import Spinner from '../components/Spinner'
import './Projects.css'
import '../styles/statusBadges.css'

const Projects = () => {
  const { user } = useAuth()
  const { showError } = useToast()
  const [projects, setProjects] = useState([])
  const [changeRequests, setChangeRequests] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [selectedChangeRequest, setSelectedChangeRequest] = useState(null)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showDeleteChangeRequestModal, setShowDeleteChangeRequestModal] = useState(false)
  const [isChangeRequest, setIsChangeRequest] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(null)
  const [projectSearch, setProjectSearch] = useState('')
  const [changeRequestSearch, setChangeRequestSearch] = useState('')
  const [openDropdown, setOpenDropdown] = useState(null)
  
  const isAdmin = user?.role === 'ADMIN'

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

  const handleStatusUpdate = (id, isChangeReq = false) => {
    setUpdatingStatus(id)
    if (isChangeReq) {
      setSelectedChangeRequest(id)
      setIsChangeRequest(true)
    } else {
      setSelectedProject(id)
      setIsChangeRequest(false)
    }
    setShowStatusModal(true)
  }
  
  const handleStatusUpdated = () => {
    setUpdatingStatus(null)
    setShowStatusModal(false)
    setSelectedProject(null)
    setSelectedChangeRequest(null)
    fetchData()
  }

  const handleDeleteProject = (project) => {
    setSelectedProject(project)
    setShowDeleteModal(true)
  }

  const handleDeleteSuccess = () => {
    setShowDeleteModal(false)
    setSelectedProject(null)
    setOpenDropdown(null)
    fetchData()
  }

  const handleDeleteChangeRequest = (changeRequest) => {
    setSelectedChangeRequest(changeRequest)
    setShowDeleteChangeRequestModal(true)
  }

  const handleDeleteChangeRequestSuccess = () => {
    setShowDeleteChangeRequestModal(false)
    setSelectedChangeRequest(null)
    setOpenDropdown(null)
    fetchData()
  }

  const toggleDropdown = (projectId, event) => {
    event.stopPropagation()
    setOpenDropdown(openDropdown === projectId ? null : projectId)
  }

  useEffect(() => {
    const handleClickOutside = () => {
      setOpenDropdown(null)
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])


  const STATUS_OPTIONS = [
    'PENDING', 'ACCEPTED', 'REJECTED', 'DISCUSSION', 'DOCUMENTATION',
    'DEVELOPERS_DISCUSSION', 'TESTING', 'INT', 'QA', 'UAT',
    'QA_SIGN_OFF_IN_PROGRESS', 'QA_SIGN_OFF_COMPLETE',
    'RELEASE_NOTES_PREPARED', 'RELEASED_TO_PRODUCTION'
  ]

  return (
    <div className="projects-page">
      <div className="page-header">
        <h1>Projects Management</h1>
        <RefreshButton onRefresh={fetchData} />
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
                <th>Date Logged</th>
                <th>Updated By</th>
                <th>Actions</th>
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
                  <td><span className={`status-badge ${project.status.toLowerCase()}`}>{project.status}</span></td>
                  <td>
                    {project.attachments && project.attachments.length > 0 ? (
                      <div className="files-list">
                        {project.attachments.map((file) => (
                          <div key={file.id} className="file-link">
                            <span 
                              className="file-name" 
                              onClick={() => window.open(`http://localhost:8080/api/files/view/${file.id}`, '_blank')}
                              title="Click to view"
                            >
                              {file.fileName}
                            </span>
                            <button
                              className="file-download-btn"
                              onClick={async () => {
                                try {
                                  const response = await api.get(`/api/files/download/${file.id}`, {
                                    responseType: 'blob'
                                  })
                                  const url = window.URL.createObjectURL(new Blob([response.data]))
                                  const link = document.createElement('a')
                                  link.href = url
                                  link.setAttribute('download', file.fileName)
                                  document.body.appendChild(link)
                                  link.click()
                                  link.remove()
                                  window.URL.revokeObjectURL(url)
                                } catch (error) {
                                  console.error('Download error:', error)
                                  showError('Failed to download file')
                                }
                              }}
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
                  <td>{project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'}</td>
                  <td>{project.updatedBy || '-'}</td>
                  <td>
                    <div className="action-menu-container">
                      <button
                        className="action-menu-trigger"
                        onClick={(e) => toggleDropdown(project.id, e)}
                        title="Actions"
                      >
                        <span className="action-menu-dots">⋯</span>
                      </button>
                      {openDropdown === project.id && (
                        <div className="action-menu-dropdown" onClick={(e) => e.stopPropagation()}>
                          <button
                            className="action-menu-item"
                            onClick={() => {
                              handleStatusUpdate(project.id, false)
                              setOpenDropdown(null)
                            }}
                            disabled={updatingStatus === project.id}
                          >
                            {updatingStatus === project.id ? (
                              <>
                                <Spinner size="small" /> Updating...
                              </>
                            ) : (
                              <>
                                <span className="action-menu-icon">📝</span>
                                Update Status
                              </>
                            )}
                          </button>
                          {isAdmin && (
                            <button
                              className="action-menu-item action-menu-item-danger"
                              onClick={() => {
                                handleDeleteProject(project)
                                setOpenDropdown(null)
                              }}
                            >
                              <span className="action-menu-icon">🗑️</span>
                              Delete
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
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
                <th>Impact Level</th>
                <th>Status</th>
                <th>Files</th>
                <th>Logged By</th>
                <th>Date Logged</th>
                <th>Updated By</th>
                <th>Actions</th>
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
                  <td>{cr.impactLevel}</td>
                  <td><span className={`status-badge ${cr.status.toLowerCase()}`}>{cr.status}</span></td>
                  <td>
                    {cr.attachments && cr.attachments.length > 0 ? (
                      <div className="files-list">
                        {cr.attachments.map((file) => (
                          <div key={file.id} className="file-link">
                            <span 
                              className="file-name" 
                              onClick={() => window.open(`http://localhost:8080/api/files/view/${file.id}`, '_blank')}
                              title="Click to view"
                            >
                              {file.fileName}
                            </span>
                            <button
                              className="file-download-btn"
                              onClick={async () => {
                                try {
                                  const response = await api.get(`/api/files/download/${file.id}`, {
                                    responseType: 'blob'
                                  })
                                  const url = window.URL.createObjectURL(new Blob([response.data]))
                                  const link = document.createElement('a')
                                  link.href = url
                                  link.setAttribute('download', file.fileName)
                                  document.body.appendChild(link)
                                  link.click()
                                  link.remove()
                                  window.URL.revokeObjectURL(url)
                                } catch (error) {
                                  console.error('Download error:', error)
                                  showError('Failed to download file')
                                }
                              }}
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
                  <td>{cr.createdAt ? new Date(cr.createdAt).toLocaleDateString() : 'N/A'}</td>
                  <td>{cr.updatedBy || '-'}</td>
                  <td>
                    <div className="action-menu-container">
                      <button
                        className="action-menu-trigger"
                        onClick={(e) => toggleDropdown(`cr-${cr.id}`, e)}
                        title="Actions"
                      >
                        <span className="action-menu-dots">⋯</span>
                      </button>
                      {openDropdown === `cr-${cr.id}` && (
                        <div className="action-menu-dropdown" onClick={(e) => e.stopPropagation()}>
                          <button
                            className="action-menu-item"
                            onClick={() => {
                              handleStatusUpdate(cr.id, true)
                              setOpenDropdown(null)
                            }}
                            disabled={updatingStatus === cr.id}
                          >
                            {updatingStatus === cr.id ? (
                              <>
                                <Spinner size="small" /> Updating...
                              </>
                            ) : (
                              <>
                                <span className="action-menu-icon">📝</span>
                                Update Status
                              </>
                            )}
                          </button>
                          {isAdmin && (
                            <button
                              className="action-menu-item action-menu-item-danger"
                              onClick={() => {
                                handleDeleteChangeRequest(cr)
                                setOpenDropdown(null)
                              }}
                            >
                              <span className="action-menu-icon">🗑️</span>
                              Delete
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showStatusModal && (
        <StatusUpdateModal
          id={isChangeRequest ? selectedChangeRequest : selectedProject}
          isChangeRequest={isChangeRequest}
          onClose={() => {
            setShowStatusModal(false)
            setUpdatingStatus(null)
            setSelectedProject(null)
            setSelectedChangeRequest(null)
          }}
          onSuccess={handleStatusUpdated}
        />
      )}

      {showDeleteModal && selectedProject && (
        <DeleteProjectModal
          project={selectedProject}
          onClose={() => {
            setShowDeleteModal(false)
            setSelectedProject(null)
          }}
          onSuccess={handleDeleteSuccess}
        />
      )}

      {showDeleteChangeRequestModal && selectedChangeRequest && (
        <DeleteChangeRequestModal
          changeRequest={selectedChangeRequest}
          onClose={() => {
            setShowDeleteChangeRequestModal(false)
            setSelectedChangeRequest(null)
          }}
          onSuccess={handleDeleteChangeRequestSuccess}
        />
      )}

    </div>
  )
}

export default Projects
