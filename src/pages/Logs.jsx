import { useState, useEffect } from 'react'
import api from '../services/api'
import Spinner from '../components/Spinner'
import jsPDF from 'jspdf'
import { autoTable } from 'jspdf-autotable'
import './Logs.css'

const Logs = () => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState('')
  const [exportLoading, setExportLoading] = useState(false)

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async (date = null) => {
    setLoading(true)
    try {
      const params = date ? { date } : {}
      const response = await api.get('/api/logs', { params })
      setLogs(response.data)
    } catch (error) {
      console.error('Failed to fetch logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDateChange = (e) => {
    const date = e.target.value
    setSelectedDate(date)
    if (date) {
      fetchLogs(date)
    } else {
      fetchLogs()
    }
  }

  const handleExportPDF = async () => {
    if (logs.length === 0) {
      alert('No logs to export')
      return
    }
    
    setExportLoading(true)
    try {
      const doc = new jsPDF()
      
      // Header - Text on left
      doc.setFontSize(18)
      doc.setTextColor(0, 168, 168)
      doc.text('FNB Project Management System', 14, 25)
      doc.setFontSize(14)
      doc.setTextColor(0, 0, 0)
      doc.text('System Logs Report', 14, 35)
      
      // Add logo on right side (try to load, but continue if it fails)
      try {
        const logoResponse = await fetch('/Images/images.png')
        if (logoResponse.ok) {
          const logoBlob = await logoResponse.blob()
          const logoUrl = URL.createObjectURL(logoBlob)
          const logoImg = new Image()
          await new Promise((resolve) => {
            logoImg.onload = () => {
              const pageWidth = doc.internal.pageSize.getWidth()
              const logoWidth = 30
              const logoHeight = 30
              const logoX = pageWidth - logoWidth - 14 // Right side with 14mm margin
              doc.addImage(logoImg, 'PNG', logoX, 10, logoWidth, logoHeight)
              URL.revokeObjectURL(logoUrl)
              resolve()
            }
            logoImg.onerror = () => {
              URL.revokeObjectURL(logoUrl)
              resolve() // Continue without logo
            }
            logoImg.src = logoUrl
          })
        }
      } catch (logoError) {
        console.warn('Could not load logo:', logoError)
        // Continue without logo
      }
      
      // Report info
      doc.setFontSize(10)
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 45)
      if (selectedDate) {
        doc.text(`Date: ${selectedDate}`, 14, 50)
      } else {
        doc.text('Period: Latest 10 logs', 14, 50)
      }
      
      // Logs table
      const logsData = logs.map(log => [
        log.createdAt ? new Date(log.createdAt).toLocaleString() : 'N/A',
        log.user?.fNumber || log.user?.fnumber || 'N/A',
        log.actionType || 'N/A',
        log.entityType || 'N/A',
        log.description || 'N/A',
        log.ipAddress || 'N/A'
      ]);
      
      // Call autoTable function with doc and options
      autoTable(doc, {
        startY: 60,
        head: [['Date & Time', 'User (F-Number)', 'Action Type', 'Entity Type', 'Description', 'IP Address']],
        body: logsData,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [0, 168, 168] }
      });
      
      // Footer
      const pageCount = doc.internal.pages.length - 1
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.text(
          `FNB Project Management System ${new Date().getFullYear()}. All Rights Reserved. Page ${i} of ${pageCount}`,
          14,
          doc.internal.pageSize.height - 10
        )
      }
      
      const filename = selectedDate 
        ? `FNB_Logs_${selectedDate}.pdf`
        : `FNB_Logs_${new Date().toISOString().split('T')[0]}.pdf`
      
      // Add minimum delay to show spinner
      await new Promise(resolve => setTimeout(resolve, 1500)) // 1.5 second minimum delay
      
      doc.save(filename)
      setExportLoading(false)
    } catch (err) {
      alert('Failed to export PDF: ' + err.message)
      console.error('PDF export error:', err)
      setExportLoading(false)
    }
  }

  if (loading) return <div className="loading-container"><Spinner size="medium" /> Loading logs...</div>

  return (
    <div className="logs-page">
      <div className="logs-header">
        <div className="logs-controls">
          <div className="form-group">
            <label>Filter by Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
            />
          </div>
          <button 
            className="primary-button"
            onClick={handleExportPDF}
            disabled={exportLoading || logs.length === 0}
          >
            {exportLoading ? (
              <>
                <Spinner size="small" /> Exporting...
              </>
            ) : (
              'Export PDF'
            )}
          </button>
        </div>
      </div>
      
      <div className="table-container">
        <div className="table-info">
          {selectedDate ? (
            <p>Showing logs for {selectedDate} ({logs.length} {logs.length === 1 ? 'log' : 'logs'})</p>
          ) : (
            <p>Showing latest 10 logs ({logs.length} {logs.length === 1 ? 'log' : 'logs'})</p>
          )}
        </div>
        <table>
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>User (F-Number)</th>
              <th>Action Type</th>
              <th>Entity Type</th>
              <th>Description</th>
              <th>IP Address</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td>{log.createdAt ? new Date(log.createdAt).toLocaleString() : 'N/A'}</td>
                <td>{log.user?.fNumber || log.user?.fnumber || 'N/A'}</td>
                <td>{log.actionType || 'N/A'}</td>
                <td>{log.entityType || 'N/A'}</td>
                <td>{log.description || 'N/A'}</td>
                <td>{log.ipAddress || 'N/A'}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center' }}>No logs found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Logs
