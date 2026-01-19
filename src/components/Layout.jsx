import { useState, useEffect } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ProjectDetailsModal from './ProjectDetailsModal'
import Spinner from './Spinner'
import './Layout.css'

const Layout = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const isAdmin = user?.role === 'ADMIN'
  const [logoutLoading, setLogoutLoading] = useState(false)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [searchQuery, setSearchQuery] = useState('')
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [searchedProjectId, setSearchedProjectId] = useState('')

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatDate = (date) => {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }
    return date.toLocaleDateString('en-US', options)
  }

  const handleLogout = () => {
    setLogoutLoading(true)
    setShowProfileDropdown(false)
    setTimeout(() => {
      logout()
      navigate('/login')
    }, 300)
  }

  const isActive = (path) => location.pathname === path

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setSearchedProjectId(searchQuery.trim())
      setShowProjectModal(true)
    }
  }

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileDropdown && !event.target.closest('.profile-container')) {
        setShowProfileDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showProfileDropdown])

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <img src="/Images/images.png" alt="FNB Logo" className="sidebar-logo" />
          <h2>FNB Project Tracking</h2>
        </div>
        <nav className="sidebar-nav">
          <Link 
            to="/dashboard" 
            className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}
          >
            <span className="nav-icon">📊</span>
            <span>Dashboard</span>
          </Link>
          <Link 
            to="/log-project" 
            className={`nav-item ${isActive('/log-project') ? 'active' : ''}`}
          >
            <span className="nav-icon">📝</span>
            <span>Log Project</span>
          </Link>
          {isAdmin && (
            <Link 
              to="/projects" 
              className={`nav-item ${isActive('/projects') ? 'active' : ''}`}
            >
              <span className="nav-icon">📁</span>
              <span>Projects</span>
            </Link>
          )}
          {isAdmin && (
            <Link 
              to="/users" 
              className={`nav-item ${isActive('/users') ? 'active' : ''}`}
            >
              <span className="nav-icon">👥</span>
              <span>Users</span>
            </Link>
          )}
          <Link 
            to="/reports" 
            className={`nav-item ${isActive('/reports') ? 'active' : ''}`}
          >
            <span className="nav-icon">📈</span>
            <span>Reports</span>
          </Link>
          {isAdmin && (
            <Link 
              to="/logs" 
              className={`nav-item ${isActive('/logs') ? 'active' : ''}`}
            >
              <span className="nav-icon">📋</span>
              <span>Logs</span>
            </Link>
          )}
        </nav>
      </aside>
      <main className="main-content">
        <header className="top-header">
          <div className="date-display">
            <span className="date-icon">📅</span>
            <span className="date-text">{formatDate(currentDate)}</span>
          </div>
          <form className="header-search-form" onSubmit={handleSearch}>
            <input
              type="text"
              className="header-search-input"
              placeholder="Search by Project ID..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <button type="submit" className="header-search-button" title="Search project">
              🔍
            </button>
          </form>
          <div className="profile-container">
            <div 
              className="profile-section" 
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            >
              <img 
                src="/Images/man.png" 
                alt="Profile" 
                className="profile-icon"
              />
              <span className="profile-fnumber">{user?.fNumber || 'N/A'}</span>
            </div>
            {showProfileDropdown && (
              <div className="profile-dropdown">
                <div className="dropdown-header">
                  <span className="dropdown-fnumber">{user?.fNumber || 'N/A'}</span>
                  <span className="dropdown-role">{user?.role === 'ADMIN' ? 'Administrator' : 'User'}</span>
                </div>
                <div className="dropdown-divider"></div>
                <button 
                  className="dropdown-logout-btn" 
                  onClick={handleLogout} 
                  disabled={logoutLoading}
                >
                  {logoutLoading ? (
                    <>
                      <Spinner size="small" /> <span>Logging out...</span>
                    </>
                  ) : (
                    <>
                      <span className="logout-icon">🚪</span>
                      <span>Logout</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </header>
        <div className="content-wrapper">
          <Outlet />
        </div>
      </main>

      {showProjectModal && (
        <ProjectDetailsModal
          projectId={searchedProjectId}
          onClose={() => {
            setShowProjectModal(false)
            setSearchQuery('')
            setSearchedProjectId('')
          }}
        />
      )}
    </div>
  )
}

export default Layout
