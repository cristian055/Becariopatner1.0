import React from 'react'
import type { CaddieRowProps } from './PublicQueue.types'
import './CaddieRow.css'

const CaddieRow: React.FC<CaddieRowProps> = ({ caddie, index }) => {
  const isNext = index === 0

  return (
    <div className={`caddie-row ${isNext ? 'caddie-row--active' : 'caddie-row--idle'}`}>
      <div className="caddie-row__content">
        <div className={`caddie-row__number-box ${isNext ? 'caddie-row__number-box--active' : 'caddie-row__number-box--idle'}`}>
          <span className="caddie-row__number">{caddie.number}</span>
          <span className="caddie-row__label">ID</span>
        </div>
        <div className="caddie-row__info">
          <p className={`caddie-row__name ${isNext ? 'caddie-row__name--active' : 'caddie-row__name--idle'}`}>
            {caddie.name}
          </p>
          <p className={`caddie-row__status ${isNext ? 'caddie-row__status--active' : 'caddie-row__status--idle'}`}>
            {isNext ? 'NEXT IN TURN' : `POSITION #${index + 1}`}
          </p>
        </div>
      </div>
      {isNext && <div className="caddie-row__indicator"></div>}
    </div>
  )
}

export default CaddieRow
