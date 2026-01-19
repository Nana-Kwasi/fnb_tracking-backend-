import { useState } from 'react'
import Spinner from './Spinner'
import './RefreshButton.css'

const RefreshButton = ({ onRefresh, disabled = false }) => {
  const [refreshing, setRefreshing] = useState(false)

  const handleClick = async () => {
    if (refreshing || disabled) return
    setRefreshing(true)
    try {
      await onRefresh()
    } finally {
      setTimeout(() => setRefreshing(false), 500)
    }
  }

  return (
    <button
      className="refresh-button"
      onClick={handleClick}
      disabled={refreshing || disabled}
      title="Refresh data"
    >
      {refreshing ? (
        <>
          <Spinner size="small" /> Refreshing...
        </>
      ) : (
        <>
          <span className="refresh-icon">↻</span>
          Refresh
        </>
      )}
    </button>
  )
}

export default RefreshButton
