import React from 'react'
import { ExternalLink } from 'lucide-react'
import { CaddieStatus } from '../../../types'
import { Trophy, Star, Users as UsersIcon } from 'lucide-react'
import { useDispatchMonitor } from '../../../hooks/useDispatchMonitor'
import MonitorNavBar from '../../MonitorNavBar'
import type { PublicQueueProps, QueueCategoryInfo } from './PublicQueue.types'
import QueueHeader from './QueueHeader'
import QueueCategory from './QueueCategory'
import DispatchPopup from './DispatchPopup'
import { useCaddieStore, useListStore } from '../../../stores'
import './PublicQueue.css'

const CATEGORIES: QueueCategoryInfo[] = [
  { name: 'Primera', icon: Star, color: 'bg-campestre-800' },
  { name: 'Segunda', icon: Trophy, color: 'bg-campestre-600' },
  { name: 'Tercera', icon: UsersIcon, color: 'bg-campestre-500' },
]

const PublicQueue: React.FC<PublicQueueProps> = ({ onBack }) => {
  const { caddies, lastDispatchBatch } = useCaddieStore()
  const { lists } = useListStore()
  const { showPopup, callingCaddies, layout } = useDispatchMonitor(lastDispatchBatch, caddies)

  const getCategoryTop = (category: string) => {
    const list = lists.find((l) => l.category === category)
    if (!list) return []
    return caddies
      .filter(
        (c) =>
          c.isActive &&
          c.category === category &&
          (c.status === CaddieStatus.AVAILABLE || c.status === CaddieStatus.LATE)
      )
      .sort((a, b) => {
        if (a.status !== b.status) return a.status === CaddieStatus.AVAILABLE ? -1 : 1

        if (list.order === 'RANDOM' || list.order === 'MANUAL') {
          return a.weekendPriority - b.weekendPriority
        }
        return list.order === 'ASC' ? a.number - b.number : b.number - a.number
      })
      .slice(0, 5)
  }

  return (
    <div className="public-queue">
      <MonitorNavBar onBack={() => onBack?.()} />

      {showPopup && callingCaddies.length > 0 && (
        <DispatchPopup callingCaddies={callingCaddies} layout={layout} />
      )}

      <QueueHeader onBack={onBack} />

      <main className="public-queue__content">
        {CATEGORIES.map((cat) => (
          <QueueCategory key={cat.name} category={cat} topCaddies={getCategoryTop(cat.name)} />
        ))}
      </main>

      <footer className="public-queue__footer">
        <div className="public-queue__footer-status">
          <div className="public-queue__sync-indicator">
            <div className="public-queue__sync-dot"></div>
            <span className="public-queue__sync-text">Synchronized</span>
          </div>
          <p className="public-queue__notice">Please watch the screen for your turn</p>
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
