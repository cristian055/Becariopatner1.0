import React, { useState } from 'react'
import { Zap, ChevronUp, ChevronDown, Minus, Plus } from 'lucide-react'
import type { BulkDispatchProps } from './ListManager.types'
import './BulkDispatch.css'

const BulkDispatch: React.FC<BulkDispatchProps> = ({
  lists,
  bulkCounts,
  onIncrement,
  onDecrement,
  onConfirm
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const hasSelected = Object.values(bulkCounts).some(count => count > 0)

  return (
    <section className="bulk-dispatch">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bulk-dispatch__toggle"
      >
        <div className="bulk-dispatch__label-container">
          <Zap size={18} className="bulk-dispatch__icon" />
          <span className="bulk-dispatch__label">Bulk Dispatch</span>
        </div>
        {isOpen ? (
          <ChevronUp size={20} className="bulk-dispatch__chevron" />
        ) : (
          <ChevronDown size={20} className="bulk-dispatch__chevron" />
        )}
      </button>
      
      {isOpen && (
        <div className="bulk-dispatch__content">
          <div className="bulk-dispatch__grid">
            {lists.map(list => (
              <div key={list.id} className="bulk-dispatch__item">
                <span className="bulk-dispatch__item-name">{list.name}</span>
                <div className="bulk-dispatch__controls">
                  <button 
                    onClick={() => onDecrement(list.id)} 
                    className="bulk-dispatch__btn"
                    aria-label={`Decrease dispatch count for ${list.name}`}
                  >
                    <Minus size={14}/>
                  </button>
                  <span className="bulk-dispatch__count">{bulkCounts[list.id] || 0}</span>
                  <button 
                    onClick={() => onIncrement(list.id)} 
                    className="bulk-dispatch__btn"
                    aria-label={`Increase dispatch count for ${list.name}`}
                  >
                    <Plus size={14}/>
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button 
            onClick={onConfirm}
            disabled={!hasSelected}
            className="bulk-dispatch__confirm"
          >
            Confirm Dispatch
          </button>
        </div>
      )}
    </section>
  )
}

export default BulkDispatch
