import React from 'react'
import type { QueueCategoryProps } from './PublicQueue.types'
import CaddieRow from './CaddieRow'
import './QueueCategory.css'

const QueueCategory: React.FC<QueueCategoryProps> = ({ category, topCaddies }) => {
  const { name, icon: Icon, color } = category
  const emptySlots = Math.max(0, 5 - topCaddies.length)

  return (
    <div className="queue-category">
      <div className={`queue-category__header ${color}`}>
        <div className="queue-category__header-content">
          <h2 className="queue-category__title">{name}</h2>
          <p className="queue-category__subtitle">Lista de caddies</p>
        </div>
        <Icon className="queue-category__icon" />
      </div>

      <div className="queue-category__list">
        {topCaddies.map((caddie, idx) => (
          <CaddieRow key={caddie.id} caddie={caddie} index={idx} />
        ))}

        {Array.from({ length: emptySlots }).map((_, i) => (
          <div key={`empty-${i}`} className="queue-category__empty-slot">
            <div className="queue-category__empty-bar"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default QueueCategory
