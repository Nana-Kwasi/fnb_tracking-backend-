import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import './NotificationModal.css'

const NotificationModal = ({ notifications, onClose, onMarkAsRead }) => {
  const navigate = useNavigate()
  const [localNotifications, setLocalNotifications] = useState(notifications || [])

  useEffect(() => {
    setLocalNotifications(notifications || [])
  }, [notifications])

  const handleNotificationClick = async (notification) => {
    // Mark as read
    if (!notification.isRead) {
      try {
        await api.put(`/api/notifications/${notification.id}/read`)
        onMarkAsRead(notification.id)
      } catch (error) {
        console.error('Failed to mark notification as read:', error)
      }
    }

    // Navigate based on notification type
    if (notification.notificationType === 'PROJECT_DELETED' || notification.notificationType === 'PROJECT_UPDATED') {
      navigate('/log-project')
    } else if (notification.notificationType === 'CHANGE_REQUEST_UPDATED') {
      navigate('/log-project')
    } else {
      navigate('/dashboard')
    }

    onClose()
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'PROJECT_DELETED':
        return '🗑️'
      case 'PROJECT_UPDATED':
        return '📝'
      case 'CHANGE_REQUEST_UPDATED':
        return '🔄'
      default:
        return '🔔'
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content notification-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Notifications</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="notification-list">
          {localNotifications.length === 0 ? (
            <div className="no-notifications">
              <div className="no-notifications-icon">🔔</div>
              <p>No new notifications</p>
            </div>
          ) : (
            localNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="notification-icon">{getNotificationIcon(notification.notificationType)}</div>
                <div className="notification-content">
                  <p className="notification-message">{notification.message}</p>
                  <span className="notification-time">
                    {new Date(notification.createdAt).toLocaleString()}
                  </span>
                </div>
                {!notification.isRead && <div className="notification-dot"></div>}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default NotificationModal
