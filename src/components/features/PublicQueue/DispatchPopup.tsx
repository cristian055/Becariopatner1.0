import React from 'react'
import { Volume2, Hash } from 'lucide-react'
import type { DispatchPopupProps } from './PublicQueue.types'
import './DispatchPopup.css'

const DispatchPopup: React.FC<DispatchPopupProps> = ({ callingCaddies, layout }) => {
  return (
    <div className="dispatch-popup">
      <div className="dispatch-popup__container">
        <div className="dispatch-popup__header">
          <div className="dispatch-popup__header-main">
            <Volume2 className="dispatch-popup__header-icon" />
            <h2 className={`dispatch-popup__title ${callingCaddies.length > 2 ? 'dispatch-popup__title--small' : 'dispatch-popup__title--large'}`}>
              Called
            </h2>
          </div>
          <p className="dispatch-popup__subtitle">Please report to Starter now</p>
        </div>

        <div className={`dispatch-popup__grid ${layout.grid}`}>
          {callingCaddies.map((caddie) => (
            <div key={caddie.id} className={`dispatch-card ${layout.card}`}>
              <div className="dispatch-card__id-label">
                <Hash size={12} />
                <span>ID</span>
              </div>

              <div className={`dispatch-card__number ${layout.circle}`}>
                {caddie.number}
              </div>

              <div className="dispatch-card__info">
                <p className={`dispatch-card__name ${layout.name}`}>
                  {caddie.name}
                </p>
                <div className={`dispatch-card__category ${layout.badge}`}>
                  {caddie.category}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="dispatch-popup__timer">
          <div className="dispatch-popup__timer-progress"></div>
        </div>
      </div>
    </div>
  )
}

export default DispatchPopup
