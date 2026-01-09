import React, { useState, useMemo, useCallback } from 'react'
import { RotateCcw } from 'lucide-react'
import { CaddieStatus } from '../../../types'
import type { Caddie } from '../../../types'
import { useCaddieStore, useListStore } from '../../../stores'
import { useLists } from '../../../hooks/useLists'
import type { ListManagerProps } from './ListManager.types'
import ListTabs from './ListTabs'
import QueueGrid from './QueueGrid'
import ListControls from './ListControls'
import BulkDispatch from './BulkDispatch'
import './ListManager.css'

const ListManager: React.FC<ListManagerProps> = () => {
  const { caddies, updateCaddie, bulkUpdateCaddies, reorderCaddie } = useCaddieStore()
  const { lists } = useListStore()
  const { randomizeCategoryList, updateList } = useLists()

  const [activeTabId, setActiveTabId] = useState<string>(lists[0]?.id || 'list-1')
  const [isManualMode, setIsManualMode] = useState(false)
  const [bulkCounts, setBulkCounts] = useState<Record<string, number>>(
    lists.reduce((acc, list) => ({ ...acc, [list.id]: 0 }), {})
  )
  const [editingListId, setEditingListId] = useState<string | null>(null)
  const [draggedCaddieId, setDraggedCaddieId] = useState<string | null>(null)

  const activeList = useMemo(() => lists.find(l => l.id === activeTabId) || null, [lists, activeTabId])

  const getQueue = useCallback((listId: string) => {
    const list = lists.find(l => l.id === listId)
    if (!list) return []
    return caddies
      .filter(c => 
        c.isActive && 
        c.category === list.category &&
        (c.status === CaddieStatus.AVAILABLE || c.status === CaddieStatus.LATE)
      )
      .sort((a, b) => {
        if (a.status !== b.status) return a.status === CaddieStatus.AVAILABLE ? -1 : 1
        if (list.order === 'RANDOM' || list.order === 'MANUAL') {
          return a.weekendPriority - b.weekendPriority
        }
        return list.order === 'ASC' ? a.number - b.number : b.number - a.number
      })
  }, [caddies, lists])

  const getReturns = useMemo(() => {
    if (!activeList) return []
    return caddies.filter(c => 
      c.isActive && 
      c.category === activeList.category &&
      (c.status === CaddieStatus.IN_FIELD || c.status === CaddieStatus.IN_PREP)
    )
  }, [caddies, activeList])

  const handleBulkDispatch = () => {
    const updates: { id: string, status: CaddieStatus, listId?: string }[] = []
    lists.forEach(list => {
      const count = bulkCounts[list.id] || 0
      if (count > 0) {
        const queue = getQueue(list.id)
        const toDispatch = queue.slice(0, count)
        toDispatch.forEach(c => {
          updates.push({ id: c.id, status: CaddieStatus.IN_PREP, listId: list.id })
        })
      }
    })
    if (updates.length > 0) {
      bulkUpdateCaddies({ updates })
      setBulkCounts(lists.reduce((acc, list) => ({ ...acc, [list.id]: 0 }), {}))
    }
  }

  const handleDragStart = (e: React.DragEvent, id: string) => {
    if (!isManualMode) return
    setDraggedCaddieId(id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    if (!isManualMode || !draggedCaddieId || draggedCaddieId === targetId) return
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    if (!isManualMode || !draggedCaddieId || draggedCaddieId === targetId) return
    e.preventDefault()
    const queue = getQueue(activeTabId)
    const targetIndex = queue.findIndex(c => c.id === targetId)
    if (targetIndex !== -1) {
      reorderCaddie(activeTabId, draggedCaddieId, targetIndex)
    }
    setDraggedCaddieId(null)
  }

  const handlePositionChange = (caddieId: string, newPos: number) => {
    const queue = getQueue(activeTabId)
    const newIndex = Math.max(0, Math.min(queue.length - 1, newPos - 1))
    reorderCaddie(activeTabId, caddieId, newIndex)
  }

  return (
    <div className="list-manager">
      <BulkDispatch 
        lists={lists}
        bulkCounts={bulkCounts}
        onIncrement={(id) => setBulkCounts(p => ({...p, [id]: Math.min(getQueue(id).length, (p[id] || 0) + 1)}))}
        onDecrement={(id) => setBulkCounts(p => ({...p, [id]: Math.max(0, (p[id] || 0) - 1)}))}
        onConfirm={handleBulkDispatch}
      />

      <div className="list-manager__tabs-container">
        <ListTabs lists={lists} activeTabId={activeTabId} onTabChange={setActiveTabId} />
      </div>

      <div className="list-manager__content">
        {activeList && (
          <>
            <ListControls 
              activeList={activeList}
              isManualMode={isManualMode}
              onToggleManualMode={() => setIsManualMode(!isManualMode)}
              onRandomizeList={randomizeCategoryList}
              onOpenEdit={() => setEditingListId(editingListId === activeList.id ? null : activeList.id)}
            />

            {editingListId === activeList.id && (
              <div className="list-manager__edit-panel">
                <div className="list-manager__field">
                  <label className="list-manager__label">Range Start</label>
                  <input type="number" value={activeList.rangeStart} onChange={e => updateList({id: activeList.id, updates: {rangeStart: parseInt(e.target.value, 10) || 0}})} className="w-full p-3 bg-arena border border-campestre-100 rounded-xl font-bold outline-none" />
                </div>
                <div className="list-manager__field">
                  <label className="list-manager__label">Range End</label>
                  <input type="number" value={activeList.rangeEnd} onChange={e => updateList({id: activeList.id, updates: {rangeEnd: parseInt(e.target.value, 10) || 0}})} className="w-full p-3 bg-arena border border-campestre-100 rounded-xl font-bold outline-none" />
                </div>
              </div>
            )}

            <QueueGrid 
              caddies={caddies} lists={lists} activeTabId={activeTabId}
              isManualReorderMode={isManualMode}
              onDragStart={handleDragStart} onDragOver={handleDragOver} onDrop={handleDrop}
              onPositionChange={handlePositionChange} 
              onUpdateCaddie={(id, updates) => updateCaddie({ id, updates })}
            />

            <div className="list-manager__returns">
              <div className="list-manager__returns-header"><RotateCcw size={12} className="list-manager__returns-icon" />Return Control</div>
              <div className="list-manager__returns-grid">
                {getReturns.map((caddie: Caddie) => (
                  <div key={caddie.id} className="list-manager__return-card">
                    <div className="list-manager__return-circle">
                      <span className="list-manager__return-number">{caddie.number}</span>
                      <div className="list-manager__return-badge">ID</div>
                      <span className={`list-manager__return-indicator ${caddie.status === CaddieStatus.IN_PREP ? 'list-manager__return-indicator--prep' : 'list-manager__return-indicator--field'}`}></span>
                    </div>
                    <p className="list-manager__return-name">{caddie.name}</p>
                    <button onClick={() => updateCaddie({ id: caddie.id, updates: { status: CaddieStatus.AVAILABLE } })} className="list-manager__return-btn">Return</button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ListManager
