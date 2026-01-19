import { useState } from 'react'
import { useToast } from '../context/ToastContext'
import { copyToClipboard } from '../utils/copyToClipboard'
import './CopyButton.css'

const CopyButton = ({ text, label = 'Copy', size = 'small' }) => {
  const { showSuccess, showError } = useToast()
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await copyToClipboard(
      text,
      () => {
        setCopied(true)
        showSuccess('Copied to clipboard!', 2000)
        setTimeout(() => setCopied(false), 2000)
      },
      () => {
        showError('Failed to copy')
      }
    )
  }

  return (
    <button
      className={`copy-button copy-button-${size} ${copied ? 'copied' : ''}`}
      onClick={handleCopy}
      title={`Copy ${text}`}
    >
      {copied ? (
        <span className="copy-icon">✓</span>
      ) : (
        <svg className="copy-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
      )}
    </button>
  )
}

export default CopyButton
