import React from 'react'
import { 
  MoveVertical, 
  Dices, 
  SlidersHorizontal 
} from 'lucide-react'
import type { ListControlsProps } from './ListManager.types'
import './ListControls.css'

const ListControls: React.FC<ListControlsProps> = ({
  activeList,
  isManualMode,
  onToggleManualMode,
  onRandomizeList,
  onOpenEdit
}) => {
  if (!activeList) return null

  const getOrderLabel = () => {
    switch (activeList.order) {
      case 'RANDOM': return 'Random Order'
      case 'MANUAL': return 'Manual Order'
      default: return 'Numeric Order'
    }
  }

  const getOrderBadgeClass = () => {
    switch (activeList.order) {
      case 'RANDOM': return 'list-controls__order-badge--random'
      case 'MANUAL': return 'list-controls__order-badge--manual'
      default: return 'list-controls__order-badge--numeric'
    }
  }

  return (
    <div className="list-controls">
      <div className="list-controls__info">
        <h3 className="list-controls__title">{activeList.name}</h3>
        <div className="list-controls__subtitle-container">
          <span className="list-controls__subtitle">Campestre Medellín</span>
          <span className={`list-controls__order-badge ${getOrderBadgeClass()}`}>
            {getOrderLabel()}
          </span>
        </div>
      </div>
      
      <div className="list-controls__actions">
        <button 
          onClick={onToggleManualMode}
          className={`list-controls__btn list-controls__btn--reorder ${isManualMode ? 'list-controls__btn--reorder-active' : ''}`}
          title="Toggle Manual Reorder"
        >
          <MoveVertical size={14} />
          Reorder
        </button>
        
        <button 
          onClick={() => onRandomizeList?.(activeList.id)}
          className="list-controls__btn list-controls__btn--randomize"
          title="Randomize List"
        >
          <Dices size={14} />
          Shuffle
        </button>
        
        <button 
          onClick={onOpenEdit}
          className="list-controls__btn list-controls__btn--edit"
          title="List Settings"
        >
          <SlidersHorizontal size={18} />
        </button>
      </div>
    </div>
  )
}

export default ListControls
