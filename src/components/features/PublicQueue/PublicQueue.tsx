import React from 'react'
import { ExternalLink } from 'lucide-react'
import { Trophy, Star, Users as UsersIcon } from 'lucide-react'
import { usePublicDispatchMonitor } from '../../../hooks/usePublicDispatchMonitor'
import MonitorNavBar from '../../MonitorNavBar'
import type { PublicQueueProps, QueueCategoryInfo } from './PublicQueue.types'
import QueueHeader from './QueueHeader'
import QueueCategory from './QueueCategory'
import DispatchPopup from './DispatchPopup'
import { usePublicStore } from '../../../stores'
import { isAuthenticated } from '../../../services/authService'
import type { PublicCaddie } from '../../../services/publicApiService'
import './PublicQueue.css'

const CATEGORIES: QueueCategoryInfo[] = [
  { name: 'Primera', icon: Star, color: 'bg-campestre-800' },
  { name: 'Segunda', icon: Trophy, color: 'bg-campestre-600' },
  { name: 'Tercera', icon: UsersIcon, color: 'bg-campestre-500' },
]

const PublicQueue: React.FC<PublicQueueProps> = ({ onBack }) => {
  const { primera, segunda, tercera, loading, error } = usePublicStore()
  const authenticated = isAuthenticated()

  // Use public store dispatch monitor for real-time WebSocket updates
  const { showPopup, callingCaddies, layout } = usePublicDispatchMonitor()

  // Get top caddies for each category
  // For public users: use publicStore data (already sorted by backend)
  // For admin: use caddieStore data (original behavior)
  const getCategoryTop = (category: string): PublicCaddie[] => {
    if (!authenticated) {
      // Use public store data
      switch (category) {
        case 'Primera':
          return Array.isArray(primera) ? primera : []
        case 'Segunda':
          return Array.isArray(segunda) ? segunda : []
        case 'Tercera':
          return Array.isArray(tercera) ? tercera : []
        default:
          return []
      }
    }
    // Admin users - data not needed in public queue, return empty
    return []
  }

  return (
    <div className="public-queue">
      <MonitorNavBar onBack={() => onBack?.()} />

      {showPopup && callingCaddies.length > 0 && (
        <DispatchPopup callingCaddies={callingCaddies} layout={layout} />
      )}

      <QueueHeader onBack={onBack} />

      {loading && (
        <div className="public-queue__loading">
          <p>Loading queue...</p>
        </div>
      )}

      {error && (
        <div className="public-queue__error">
          <p>Error loading queue: {error}</p>
        </div>
      )}

      <main className="public-queue__content">
        {CATEGORIES.map((cat) => (
          <QueueCategory key={cat.name} category={cat} topCaddies={getCategoryTop(cat.name)} />
        ))}
      </main>

      <footer className="public-queue__footer">
        <div className="public-queue__footer-status">
          <div className="public-queue__sync-indicator">
            <div className="public-queue__sync-dot"></div>
          </div>
          <p className="public-queue__notice">Por favor, observe la pantalla para su turno</p>
        </div>

        <div className="public-queue__credits">
          <a
            href="https://berracode.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="public-queue__credits-link"
          >
            <span className="public-queue__credits-label">Developed by</span>
            <span className="public-queue__credits-brand">Berracode.com</span>
            <ExternalLink size={10} className="public-queue__credits-icon" />
          </a>
        </div>
      </footer>
    </div>
  )
}

export default PublicQueue
