export const copyToClipboard = async (text, onSuccess, onError) => {
  try {
    await navigator.clipboard.writeText(text)
    if (onSuccess) onSuccess()
  } catch (err) {
    if (onError) onError(err)
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    document.body.appendChild(textArea)
    textArea.select()
    try {
      document.execCommand('copy')
      if (onSuccess) onSuccess()
    } catch (fallbackErr) {
      if (onError) onError(fallbackErr)
    }
    document.body.removeChild(textArea)
  }
}
