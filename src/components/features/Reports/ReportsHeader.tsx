import React from 'react'
import { Download, Trash2 } from 'lucide-react'
import type { ReportsHeaderProps } from './Reports.types'
import './ReportsHeader.css'

const ReportsHeader: React.FC<ReportsHeaderProps> = ({ onDownload, onOpenReset }) => {
  return (
    <div className="reports-header">
      <div className="reports-header__info">
        <h2 className="reports-header__title">Daily Operational Report</h2>
        <p className="reports-header__subtitle">Manage daily closures and traceability exports</p>
      </div>
      <div className="reports-header__actions">
        <button onClick={onDownload} className="reports-header__btn reports-header__btn--secondary">
          <Download size={16} />
          Export CSV
        </button>
        <button onClick={onOpenReset} className="reports-header__btn reports-header__btn--danger">
          <Trash2 size={16} />
          End Day
        </button>
      </div>
    </div>
  )
}

export default ReportsHeader
