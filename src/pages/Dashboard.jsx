import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { Pie, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js'
import RefreshButton from '../components/RefreshButton'
import EmptyState from '../components/EmptyState'
import NotificationModal from '../components/NotificationModal'
import Spinner from '../components/Spinner'
import './Dashboard.css'

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
)

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotificationModal, setShowNotificationModal] = useState(false)
  const [shownNotificationIds, setShownNotificationIds] = useState(new Set())
  const [notificationsLoading, setNotificationsLoading] = useState(false)

  useEffect(() => {
    fetchDashboard()
    fetchNotifications()
  }, [])

  useEffect(() => {
    // Check for new notifications and show modal if there are unread ones
    // Only run once when notifications are first loaded
    if (notifications.length > 0 && !showNotificationModal) {
      const unreadNotifications = notifications.filter(n => !n.isRead)
      
      if (unreadNotifications.length > 0) {
        // Get stored shown notification IDs from localStorage
        const storedIds = JSON.parse(localStorage.getItem('shownNotificationIds') || '[]')
        const shownIdsSet = new Set(storedIds)
        
        // Filter out notifications that have already been shown
        const newNotifications = unreadNotifications.filter(n => !shownIdsSet.has(n.id))
        
        if (newNotifications.length > 0) {
          // Small delay to ensure user sees the dashboard first
          const timer = setTimeout(() => {
            setShowNotificationModal(true)
            // Mark these as shown in localStorage
            const updatedIds = [...storedIds, ...newNotifications.map(n => n.id)]
            localStorage.setItem('shownNotificationIds', JSON.stringify(updatedIds))
            setShownNotificationIds(new Set(updatedIds))
          }, 1500)
          
          return () => clearTimeout(timer)
        }
      }
    }
  }, [notifications, showNotificationModal])

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/api/dashboard')
      console.log('Dashboard data:', response.data)
      console.log('Status map:', response.data?.projectsByStatusMap)
      console.log('Department map:', response.data?.projectsByDepartmentMap)
      console.log('Priority map:', response.data?.projectsByPriorityMap)
      setStats(response.data)
    } catch (error) {
      console.error('Failed to fetch dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchNotifications = async () => {
    if (notificationsLoading) return // Prevent concurrent calls
    
    setNotificationsLoading(true)
    try {
      const [notificationsRes, countRes] = await Promise.all([
        api.get('/api/notifications'),
        api.get('/api/notifications/unread-count')
      ])
      setNotifications(notificationsRes.data)
      setUnreadCount(countRes.data)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      // Set empty arrays on error to prevent UI issues
      setNotifications([])
      setUnreadCount(0)
    } finally {
      setNotificationsLoading(false)
    }
  }

  const handleMarkAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  if (loading) {
    return (
      <div className="loading-container">
        <Spinner size="medium" />
        <p>Loading dashboard...</p>
      </div>
    )
  }

  // Prepare chart data
  const statusColors = {
    PENDING: '#ffc107',
    ACCEPTED: '#28a745',
    REJECTED: '#dc3545',
    IN_PROGRESS: '#17a2b8',
    COMPLETED: '#6c757d'
  }

  const statusData = {
    labels: stats?.projectsByStatusMap ? Object.keys(stats.projectsByStatusMap) : [],
    datasets: [{
      label: 'Projects by Status',
      data: stats?.projectsByStatusMap ? Object.values(stats.projectsByStatusMap) : [],
      backgroundColor: stats?.projectsByStatusMap ? Object.keys(stats.projectsByStatusMap).map(status => 
        statusColors[status] || '#6c757d'
      ) : [],
      borderColor: '#fff',
      borderWidth: 2
    }]
  }

  const departmentData = {
    labels: stats?.projectsByDepartmentMap ? Object.keys(stats.projectsByDepartmentMap) : [],
    datasets: [{
      label: 'Projects by Department',
      data: stats?.projectsByDepartmentMap ? Object.values(stats.projectsByDepartmentMap) : [],
      backgroundColor: '#00A8A8',
      borderColor: '#008080',
      borderWidth: 1
    }]
  }

  const priorityData = {
    labels: stats?.projectsByPriorityMap ? Object.keys(stats.projectsByPriorityMap) : [],
    datasets: [{
      label: 'Projects by Priority',
      data: stats?.projectsByPriorityMap ? Object.values(stats.projectsByPriorityMap) : [],
      backgroundColor: ['#28a745', '#ffc107', '#dc3545'],
      borderColor: '#fff',
      borderWidth: 1
    }]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        padding: 10
      }
    }
  }

  const barOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <div className="dashboard-header-actions">
          <button
            className="notification-bell-button"
            onClick={() => {
              fetchNotifications()
              setShowNotificationModal(true)
            }}
            title="View notifications"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
            )}
          </button>
          <RefreshButton onRefresh={fetchDashboard} />
        </div>
      </div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <h3>Total Projects</h3>
            <div className="stat-card-icon">📊</div>
          </div>
          <p className="stat-value">{(stats?.newProjectRequests || 0) + (stats?.changeRequests || 0)}</p>
          <div className="stat-card-footer">All Projects</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <h3>New Project Requests</h3>
            <div className="stat-card-icon">📝</div>
          </div>
          <p className="stat-value">{stats?.newProjectRequests || 0}</p>
          <div className="stat-card-footer">Active Requests</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <h3>Change Requests</h3>
            <div className="stat-card-icon">🔄</div>
          </div>
          <p className="stat-value">{stats?.changeRequests || 0}</p>
          <div className="stat-card-footer">Pending Changes</div>
        </div>
      </div>

      <div className="tables-section">
        <div className="table-container">
          <h2>New Project Requests</h2>
          <table>
            <thead>
              <tr>
                <th>Project ID</th>
                <th>Project Name</th>
                <th>Department</th>
                <th>Branch</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Logged By</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {stats?.newProjectRequestsList?.map((project) => (
                <tr key={project.id}>
                  <td>{project.projectId}</td>
                  <td>{project.projectName}</td>
                  <td>{project.department}</td>
                  <td>{project.branch}</td>
                  <td>{project.priorityLevel}</td>
                  <td><span className={`status-badge ${project.status.toLowerCase()}`}>{project.status}</span></td>
                  <td>{project.loggedBy}</td>
                  <td>{new Date(project.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {(!stats?.newProjectRequestsList || stats.newProjectRequestsList.length === 0) && (
                <tr>
                  <td colSpan="8">
                    <EmptyState
                      icon="📋"
                      title="No Projects"
                      message="No project requests found. Start by logging a new project request."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="table-container">
          <h2>Change Requests</h2>
          <table>
            <thead>
              <tr>
                <th>Project ID</th>
                <th>Requested Feature</th>
                <th>Impact Level</th>
                <th>Status</th>
                <th>Logged By</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {stats?.changeRequestsList?.map((cr) => (
                <tr key={cr.id}>
                  <td>{cr.projectProjectId}</td>
                  <td>{cr.requestedFeature}</td>
                  <td>{cr.impactLevel}</td>
                  <td><span className={`status-badge ${cr.status.toLowerCase()}`}>{cr.status}</span></td>
                  <td>{cr.loggedBy}</td>
                  <td>{new Date(cr.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {(!stats?.changeRequestsList || stats.changeRequestsList.length === 0) && (
                <tr>
                  <td colSpan="6">
                    <EmptyState
                      icon="🔄"
                      title="No Change Requests"
                      message="No change requests found. Start by logging a new change request."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="charts-section">
        <div className="chart-container">
          <h2>Projects by Status</h2>
          <div className="chart-wrapper">
            {stats?.projectsByStatusMap && Object.keys(stats.projectsByStatusMap).length > 0 ? (
              <Pie data={statusData} options={chartOptions} />
            ) : (
              <div className="no-data">No data available</div>
            )}
          </div>
        </div>

        <div className="chart-container">
          <h2>Projects by Department</h2>
          <div className="chart-wrapper">
            {stats?.projectsByDepartmentMap && Object.keys(stats.projectsByDepartmentMap).length > 0 ? (
              <Bar data={departmentData} options={barOptions} />
            ) : (
              <div className="no-data">No data available</div>
            )}
          </div>
        </div>

        <div className="chart-container">
          <h2>Projects by Priority</h2>
          <div className="chart-wrapper">
            {stats?.projectsByPriorityMap && Object.keys(stats.projectsByPriorityMap).length > 0 ? (
              <Bar data={priorityData} options={barOptions} />
            ) : (
              <div className="no-data">No data available</div>
            )}
          </div>
        </div>
      </div>

      {showNotificationModal && (
        <NotificationModal
          notifications={notifications.filter(n => !n.isRead)}
          onClose={() => {
            setShowNotificationModal(false)
            fetchNotifications() // Refresh notifications after closing
          }}
          onMarkAsRead={handleMarkAsRead}
        />
      )}
    </div>
  )
}

export default Dashboard
