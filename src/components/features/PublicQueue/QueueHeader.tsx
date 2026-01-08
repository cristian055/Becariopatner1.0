import React from 'react'
import { CalendarDays } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { QueueHeaderProps } from './PublicQueue.types'
import './QueueHeader.css'

const QueueHeader: React.FC<QueueHeaderProps> = () => {
  const navigate = useNavigate()

  return (
    <header className="queue-header">
      <div className="queue-header__container">
        <div className="queue-header__logo">C</div>
        <div className="queue-header__info">
          <h1 className="queue-header__title">Dispatch Turns</h1>
          <p className="queue-header__subtitle">Club Campestre Medellín</p>
        </div>
      </div>
    </header>
  )
}

export default QueueHeader
