import './Modal.css'

const SuspendedAccountModal = ({ onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content suspended-account-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="suspended-icon">⚠️</div>
          <h2>Account Suspended</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="suspended-content">
          <p className="suspended-message">
            Your account has been suspended by an administrator.
          </p>
          <p className="suspended-details">
            You will not be able to access the system until your account is reactivated. 
            Please contact your system administrator for assistance.
          </p>
        </div>
        <div className="modal-actions">
          <button type="button" onClick={onClose} className="primary-button">
            Understood
          </button>
        </div>
      </div>
    </div>
  )
}

export default SuspendedAccountModal
