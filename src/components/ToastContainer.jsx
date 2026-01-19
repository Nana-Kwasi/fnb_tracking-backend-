import { useState, useCallback } from 'react'
import Toast from './Toast'
import './Toast.css'

let toastId = 0
let toastListeners = []

export const useToast = () => {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = toastId++
    const newToast = { id, message, type, duration }
    setToasts(prev => [...prev, newToast])
    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const showSuccess = useCallback((message, duration) => {
    return addToast(message, 'success', duration)
  }, [addToast])

  const showError = useCallback((message, duration) => {
    return addToast(message, 'error', duration)
  }, [addToast])

  const showWarning = useCallback((message, duration) => {
    return addToast(message, 'warning', duration)
  }, [addToast])

  const showInfo = useCallback((message, duration) => {
    return addToast(message, 'info', duration)
  }, [addToast])

  return {
    toasts,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeToast
  }
}

export const ToastContainer = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </div>
  )
}
