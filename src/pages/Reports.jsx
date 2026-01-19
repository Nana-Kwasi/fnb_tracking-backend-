import { useState } from 'react'
import api from '../services/api'
import Spinner from '../components/Spinner'
import jsPDF from 'jspdf'
import { autoTable } from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import './Reports.css'

const Reports = () => {
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    status: '',
    user: '',
    projectType: ''
  })
  const [loading, setLoading] = useState(false)
  const [exportPdfLoading, setExportPdfLoading] = useState(false)
  const [exportExcelLoading, setExportExcelLoading] = useState(false)
  const [reportData, setReportData] = useState(null)
  const [error, setError] = useState('')

  const STATUS_OPTIONS = [
    'PENDING', 'ACCEPTED', 'REJECTED', 'DISCUSSION', 'DOCUMENTATION',
    'DEVELOPERS_DISCUSSION', 'TESTING', 'INT', 'QA', 'UAT',
    'QA_SIGN_OFF_IN_PROGRESS', 'QA_SIGN_OFF_COMPLETE',
    'RELEASE_NOTES_PREPARED', 'RELEASED_TO_PRODUCTION'
  ]

  const handleGenerateReport = async () => {
    setLoading(true)
    setError('')
    setReportData(null)
    
    try {
      // Remove empty filter values to avoid sending empty strings
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '' && v != null)
      )
      
      // Add minimum delay to show spinner
      const [response] = await Promise.all([
        api.get('/api/reports', { params: cleanFilters }),
        new Promise(resolve => setTimeout(resolve, 1500)) // 1.5 second minimum delay
      ])
      setReportData(response.data)
      setLoading(false)
    } catch (err) {
      if (err.response?.status === 403) {
        setError('Access denied. Please ensure you are logged in and have the necessary permissions. If the backend was just restarted, please refresh the page and try again.')
      } else if (err.response?.status === 404) {
        setError('Reports endpoint not found. Please ensure the backend is running and has been restarted to load the new ReportController.')
      } else {
        setError(err.response?.data?.message || 'Failed to generate report. Please try again.')
      }
      console.error('Report generation error:', err)
      setLoading(false)
    }
  }

  const handleExportPDF = async () => {
    if (!reportData) {
      setError('Please generate a report first')
      return
    }
    
    setExportPdfLoading(true)
    try {
      const doc = new jsPDF()
      
      // Header - Text on left
      doc.setFontSize(18)
      doc.setTextColor(0, 168, 168)
      doc.text('FNB Project Management System', 14, 25)
      doc.setFontSize(14)
      doc.setTextColor(0, 0, 0)
      doc.text('Project Report', 14, 35)
      
      // Add logo on right side (try to load, but continue if it fails)
      try {
        const logoResponse = await fetch('/Images/images.png')
        if (logoResponse.ok) {
          const logoBlob = await logoResponse.blob()
          const logoUrl = URL.createObjectURL(logoBlob)
          const logoImg = new Image()
          await new Promise((resolve, reject) => {
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
      if (filters.dateFrom) doc.text(`Date From: ${filters.dateFrom}`, 14, 50)
      if (filters.dateTo) doc.text(`Date To: ${filters.dateTo}`, 14, 55)
      if (filters.status) doc.text(`Status: ${filters.status}`, 14, 60)
      
      let yPos = 70
      
      // Projects table
      if (reportData.projects && reportData.projects.length > 0) {
        doc.setFontSize(12)
        doc.text('Projects', 14, yPos)
        yPos += 5
        
        const projectsData = reportData.projects.map(p => [
          p.projectId || '',
          p.projectName || '',
          p.department || 'N/A',
          p.branch || 'N/A',
          p.priorityLevel || 'N/A',
          p.status || '',
          p.loggedBy || 'N/A',
          p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'N/A'
        ]);
        
        // Call autoTable function with doc and options
        autoTable(doc, {
          startY: yPos,
          head: [['Project ID', 'Project Name', 'Department', 'Branch', 'Priority', 'Status', 'Logged By', 'Created Date']],
          body: projectsData,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [0, 168, 168] }
        });
        
        // Get final Y position after table
        const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : yPos + 50;
        yPos = finalY + 10;
      }
      
      // Change Requests table
      if (reportData.changeRequests && reportData.changeRequests.length > 0) {
        doc.setFontSize(12)
        doc.text('Change Requests', 14, yPos)
        yPos += 5
        
        const crData = reportData.changeRequests.map(cr => [
          cr.projectProjectId || 'N/A',
          cr.requestedFeature || '',
          cr.impactLevel || 'N/A',
          cr.status || '',
          cr.loggedBy || 'N/A',
          cr.createdAt ? new Date(cr.createdAt).toLocaleDateString() : 'N/A'
        ]);
        
        // Call autoTable function with doc and options
        autoTable(doc, {
          startY: yPos,
          head: [['Project ID', 'Requested Feature', 'Impact Level', 'Status', 'Logged By', 'Created Date']],
          body: crData,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [0, 168, 168] }
        });
      }
      
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
      
      // Add minimum delay to show spinner
      await new Promise(resolve => setTimeout(resolve, 1500)) // 1.5 second minimum delay
      
      doc.save(`FNB_Project_Report_${new Date().toISOString().split('T')[0]}.pdf`)
      setExportPdfLoading(false)
    } catch (err) {
      setError('Failed to export PDF: ' + err.message)
      console.error('PDF export error:', err)
      setExportPdfLoading(false)
    }
  }

  const handleExportExcel = async () => {
    if (!reportData) {
      setError('Please generate a report first')
      return
    }
    
    setExportExcelLoading(true)
    try {
      const workbook = XLSX.utils.book_new()
      
      // Projects sheet
      if (reportData.projects && reportData.projects.length > 0) {
        const projectsData = [
          ['Project ID', 'Project Name', 'Department', 'Branch', 'Priority', 'Status', 'Logged By', 'Created Date'],
          ...reportData.projects.map(p => [
            p.projectId || '',
            p.projectName || '',
            p.department || 'N/A',
            p.branch || 'N/A',
            p.priorityLevel || 'N/A',
            p.status || '',
            p.loggedBy || 'N/A',
            p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'N/A'
          ])
        ]
        const projectsSheet = XLSX.utils.aoa_to_sheet(projectsData)
        XLSX.utils.book_append_sheet(workbook, projectsSheet, 'Projects')
      }
      
      // Change Requests sheet
      if (reportData.changeRequests && reportData.changeRequests.length > 0) {
        const crData = [
          ['Project ID', 'Requested Feature', 'Impact Level', 'Status', 'Logged By', 'Created Date'],
          ...reportData.changeRequests.map(cr => [
            cr.projectProjectId || 'N/A',
            cr.requestedFeature || '',
            cr.impactLevel || 'N/A',
            cr.status || '',
            cr.loggedBy || 'N/A',
            cr.createdAt ? new Date(cr.createdAt).toLocaleDateString() : 'N/A'
          ])
        ]
        const crSheet = XLSX.utils.aoa_to_sheet(crData)
        XLSX.utils.book_append_sheet(workbook, crSheet, 'Change Requests')
      }
      
      // Add minimum delay to show spinner
      await new Promise(resolve => setTimeout(resolve, 1500)) // 1.5 second minimum delay
      
      XLSX.writeFile(workbook, `FNB_Project_Report_${new Date().toISOString().split('T')[0]}.xlsx`)
      setExportExcelLoading(false)
    } catch (err) {
      setError('Failed to export Excel: ' + err.message)
      console.error('Excel export error:', err)
      setExportExcelLoading(false)
    }
  }

  return (
    <div className="reports-page">
      <div className="filters-section">
        <h2>Filters</h2>
        <div className="filters-grid">
          <div className="form-group">
            <label>Date From</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Date To</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Project Type</label>
            <select
              value={filters.projectType}
              onChange={(e) => setFilters({ ...filters, projectType: e.target.value })}
            >
              <option value="">All</option>
              <option value="PROJECT">Project</option>
              <option value="CHANGE_REQUEST">Change Request</option>
            </select>
          </div>
        </div>
        <div className="filter-actions">
          <button 
            className="primary-button" 
            onClick={handleGenerateReport}
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner size="small" /> Generating...
              </>
            ) : (
              'Generate Report'
            )}
          </button>
          <button 
            className="secondary-button"
            onClick={handleExportPDF}
            disabled={exportPdfLoading}
          >
            {exportPdfLoading ? (
              <>
                <Spinner size="small" /> Exporting...
              </>
            ) : (
              'Export PDF'
            )}
          </button>
          <button 
            className="secondary-button"
            onClick={handleExportExcel}
            disabled={exportExcelLoading}
          >
            {exportExcelLoading ? (
              <>
                <Spinner size="small" /> Exporting...
              </>
            ) : (
              'Export Excel'
            )}
          </button>
        </div>
        {error && <div className="error-message">{error}</div>}
        {reportData && (
          <div className="report-results">
            <h3>Report Results</h3>
            <p className="report-summary">
              Report generated successfully with {reportData.total || 0} total records.
              {reportData.projectCount !== undefined && ` Projects: ${reportData.projectCount}`}
              {reportData.changeRequestCount !== undefined && ` Change Requests: ${reportData.changeRequestCount}`}
            </p>
            
            {reportData.projects && reportData.projects.length > 0 && (
              <div className="report-table-section">
                <h4>Projects ({reportData.projects.length})</h4>
                <div className="table-container">
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
                        <th>Created Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.projects.map((project) => (
                        <tr key={project.id}>
                          <td>{project.projectId}</td>
                          <td>{project.projectName}</td>
                          <td>{project.department || 'N/A'}</td>
                          <td>{project.branch || 'N/A'}</td>
                          <td>{project.priorityLevel || 'N/A'}</td>
                          <td><span className={`status-badge ${project.status?.toLowerCase()}`}>{project.status}</span></td>
                          <td>{project.loggedBy || 'N/A'}</td>
                          <td>{project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {reportData.changeRequests && reportData.changeRequests.length > 0 && (
              <div className="report-table-section">
                <h4>Change Requests ({reportData.changeRequests.length})</h4>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Project ID</th>
                        <th>Requested Feature</th>
                        <th>Impact Level</th>
                        <th>Status</th>
                        <th>Logged By</th>
                        <th>Created Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.changeRequests.map((cr) => (
                        <tr key={cr.id}>
                          <td>{cr.projectProjectId || 'N/A'}</td>
                          <td>{cr.requestedFeature}</td>
                          <td>{cr.impactLevel || 'N/A'}</td>
                          <td><span className={`status-badge ${cr.status?.toLowerCase()}`}>{cr.status}</span></td>
                          <td>{cr.loggedBy || 'N/A'}</td>
                          <td>{cr.createdAt ? new Date(cr.createdAt).toLocaleDateString() : 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Reports
