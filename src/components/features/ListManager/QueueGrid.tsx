import React, { useMemo } from 'react'
import { 
  ArrowUpCircle, 
  CalendarX,
  FileText,
  ClockAlert,
  GripVertical,
  MapPin,
  Activity,
  Hash
} from 'lucide-react'
import { CaddieStatus } from '../../../types'
import type { QueueGridProps } from './ListManager.types'
import './QueueGrid.css'

const QueueGrid: React.FC<QueueGridProps> = ({
  caddies,
  lists,
  activeTabId,
  isManualReorderMode,
  onDragStart,
  onDragOver,
  onDrop,
  onPositionChange,
  onUpdateCaddie
}) => {
  const activeList = useMemo(() => lists.find(l => l.id === activeTabId), [lists, activeTabId])

  const queue = useMemo(() => {
    if (!activeList) return []
    return caddies
      .filter(c => 
        c.isActive && 
        c.category === activeList.category &&
        (c.status === CaddieStatus.AVAILABLE || c.status === CaddieStatus.LATE)
      )
      .sort((a, b) => {
        if (a.status !== b.status) return a.status === CaddieStatus.AVAILABLE ? -1 : 1
        if (activeList.order === 'RANDOM' || activeList.order === 'MANUAL') {
          return a.weekendPriority - b.weekendPriority
        }
        return activeList.order === 'ASC' ? a.number - b.number : b.number - a.number
      })
  }, [caddies, activeList])

  if (!activeList) return null

  return (
    <div className="queue-grid">
      <div className="queue-grid__header">
        <div className="queue-grid__dot"></div>
        {isManualReorderMode ? 'Manual Reorder Mode Active' : 'Queue by Category'}
      </div>
      
      <div className="queue-grid__list">
        {queue.map((caddie, idx) => (
          <div 
            key={caddie.id} 
            draggable={isManualReorderMode}
            onDragStart={(e) => onDragStart(e, caddie.id)}
            onDragOver={(e) => onDragOver(e, caddie.id)}
            onDrop={(e) => onDrop(e, caddie.id)}
            className={`queue-grid__card ${
              isManualReorderMode ? 'queue-grid__card--manual' : 'queue-grid__card--normal'
            }`}
          >
            <div className="queue-grid__card-content">
              {isManualReorderMode && (
                <div className="queue-grid__grip">
                  <GripVertical size={24} />
                </div>
              )}
              
              <div className="queue-grid__position-circle">
                {idx + 1}
                <div className="queue-grid__position-badge">
                  POS
                </div>
              </div>
              
              <div className="queue-grid__info">
                <div className="queue-grid__info-header">
                  <div className="flex flex-col">
                    <p className="queue-grid__name">{caddie.name}</p>
                    <div className="queue-grid__details">
                       <div className="queue-grid__tag">
                         <Hash size={10} className="text-campestre-400" />
                         <span className="queue-grid__tag-label">ID: {caddie.number}</span>
                       </div>
                       <span className="queue-grid__separator">|</span>
                       <span className="queue-grid__category">Cat. {caddie.category}</span>
                    </div>
                  </div>
                  
                  <div className="queue-grid__actions-container">
                     {isManualReorderMode ? (
                       <div className="queue-grid__reorder-control">
                         <span className="queue-grid__reorder-label">Change Turn</span>
                         <input 
                           type="number" 
                           value={idx + 1}
                           min={1}
                           max={queue.length}
                           onChange={(e) => onPositionChange(caddie.id, parseInt(e.target.value, 10) || 1)}
                           className="queue-grid__reorder-input"
                         />
                       </div>
                     ) : (
                       <div className="queue-grid__badge-group">
                         <div className="queue-grid__status-tag">
                           <MapPin size={10} />
                           <span className="queue-grid__status-label">{caddie.location}</span>
                         </div>
                         <div className="queue-grid__status-tag queue-grid__status-tag--role">
                           <Activity size={10} />
                           <span className="queue-grid__status-label">{caddie.role}</span>
                         </div>
                       </div>
                     )}
                  </div>
                </div>
                <p className={`queue-grid__status-text ${idx === 0 ? 'queue-grid__status-text--ready' : 'queue-grid__status-text--waiting'}`}>
                  {idx === 0 ? 'READY FOR DISPATCH' : `TURN #${idx + 1} IN QUEUE`}
                </p>
              </div>
            </div>

            {!isManualReorderMode && (
              <div className="queue-grid__actions">
                <button 
                  onClick={() => onUpdateCaddie?.(caddie.id, { status: CaddieStatus.IN_PREP, listId: activeList.id })}
                  className="queue-grid__main-action"
                >
                  <ArrowUpCircle size={18} />
                  Authorize Dispatch
                </button>
                
                <div className="queue-grid__quick-actions">
                  <button 
                    onClick={() => onUpdateCaddie?.(caddie.id, { status: CaddieStatus.ABSENT })} 
                    className="queue-grid__quick-btn queue-grid__quick-btn--absent"
                  >
                    <CalendarX size={20} />
                    <span className="queue-grid__quick-btn-label">Absence</span>
                  </button>
                  <button 
                    onClick={() => onUpdateCaddie?.(caddie.id, { status: CaddieStatus.ON_LEAVE })} 
                    className="queue-grid__quick-btn queue-grid__quick-btn--leave"
                  >
                    <FileText size={20} />
                    <span className="queue-grid__quick-btn-label">Permission</span>
                  </button>
                  <button 
                    onClick={() => onUpdateCaddie?.(caddie.id, { status: caddie.status === CaddieStatus.LATE ? CaddieStatus.AVAILABLE : CaddieStatus.LATE })} 
                    className={`queue-grid__quick-btn queue-grid__quick-btn--late ${caddie.status === CaddieStatus.LATE ? 'queue-grid__quick-btn--late-active' : ''}`}
                  >
                    <ClockAlert size={20} />
                    <span className="queue-grid__quick-btn-label">Late</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default QueueGrid
