import './Modal.css'

const SuccessModal = ({ projectId, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content success-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Project Created Successfully!</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="success-content">
          <div className="success-icon">✓</div>
          <p className="success-message">
            Your project has been created successfully.
          </p>
          <div className="project-id-display">
            <strong>Project ID:</strong>
            <span className="project-id-value">{projectId}</span>
          </div>
          <p className="search-info">
            You can use this Project ID to search for your project in the system.
          </p>
        </div>
        <div className="modal-actions">
          <button type="button" onClick={onClose} className="primary-button">
            Got it
          </button>
        </div>
      </div>
    </div>
  )
}

export default SuccessModal
