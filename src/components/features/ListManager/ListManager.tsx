import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { RotateCcw } from 'lucide-react'

import type { Caddie } from '../../../types'
import { useCaddieStore, useListStore } from '../../../stores'
import { useLists } from '../../../hooks/useLists'
import { socketService } from '../../../services/socketService'
import { queueApiService } from '../../../services/queueApiService'
import { caddieApiService } from '../../../services/caddieApiService'
import type { ListManagerProps } from './ListManager.types'
import { NumberInput } from '../../ui'
import ListTabs from './ListTabs'
import QueueGrid from './QueueGrid'
import ListControls from './ListControls'
import BulkDispatch from './BulkDispatch'
import './ListManager.css'

const ListManager: React.FC<ListManagerProps> = () => {
  const { caddies, updateCaddie, bulkUpdateCaddies, reorderCaddie } = useCaddieStore()
  const { lists, queues, setQueue, handleQueueUpdated: handleQueueUpdate } = useListStore()
  const { randomizeCategoryList, reverseCategoryList, updateList } = useLists()

  const [activeTabId, setActiveTabId] = useState<string>(lists[0]?.id || 'list-1')
  const [isManualMode, setIsManualMode] = useState(false)
  const [bulkCounts, setBulkCounts] = useState<Record<string, number>>(
    lists.reduce((acc, list) => ({ ...acc, [list.id]: 0 }), {})
  )
  const [editingListId, setEditingListId] = useState<string | null>(null)
  const [draggedCaddieId, setDraggedCaddieId] = useState<string | null>(null)

  const activeList = useMemo(() => lists.find(l => l.id === activeTabId) || null, [lists, activeTabId])

  const fetchQueuePositions = useCallback(async (category: string) => {
    try {
      const queuePositions = await queueApiService.fetchQueueByCategory(
        category as 'PRIMERA' | 'SEGUNDA' | 'TERCERA'
      )
      setQueue(category, queuePositions)
    } catch (error) {
      console.error('Failed to fetch queue positions:', error)
    }
  }, [setQueue])

  useEffect(() => {
    if (activeList) {
      fetchQueuePositions(activeList.category)
    }
  }, [activeList, fetchQueuePositions])

  useEffect(() => {
    if (!activeList) return

    const handleQueueUpdatedEvent = (data: { category: string; queue: any[] }) => {
      if (data.category === activeList.category) {
        handleQueueUpdate({
          category: data.category,
          queuePositions: data.queue.map(q => ({
            id: q.id || q.position.toString(),
            caddieId: q.id,
            category: q.category,
            position: q.weekendPriority,
            operationalStatus: q.status,
            caddie: {
              id: q.id,
              name: q.name,
              number: q.number,
              role: q.role || 'Golf',
            },
          })),
        })
      }
    }

    const unsubscribe = socketService.onQueueUpdated(handleQueueUpdatedEvent)

    return unsubscribe
  }, [activeList, handleQueueUpdate])

  const getQueue = useCallback((listId: string) => {
    const list = lists.find(l => l.id === listId)
    if (!list) return []
    
    const categoryQueue = queues[list.category] || []
    
    if (categoryQueue.length > 0) {
      return categoryQueue
        .filter(qp => {
          return qp.operationalStatus === 'AVAILABLE' || qp.operationalStatus === 'LATE'
        })
        .slice(0, list.rangeEnd - list.rangeStart + 1)
        .map(qp => ({
          ...qp.caddie,
          id: qp.caddie.id,
          status: qp.operationalStatus === 'AVAILABLE' ? 'AVAILABLE' : 'LATE',
          weekendPriority: qp.position,
        }))
    }

    return caddies
      .filter(c =>
        c.isActive &&
        c.category === list.category &&
        (c.status === 'AVAILABLE' || c.status === 'LATE') &&
        c.number >= list.rangeStart &&
        c.number <= list.rangeEnd
      )
      .sort((a, b) => {
        if (a.status !== b.status) return a.status === 'AVAILABLE' ? -1 : 1
        if (list.order === 'RANDOM' || list.order === 'MANUAL') {
          return a.weekendPriority - b.weekendPriority
        }
        return list.order === 'ASC' ? a.number - b.number : b.number - a.number
      })
  }, [caddies, lists, queues])

  const getReturns = useMemo(() => {
    if (!activeList) return []
    return caddies.filter(c => 
      c.isActive && 
      c.category === activeList.category &&
      (c.status === 'IN_FIELD' || c.status === 'IN_PREP')
    )
  }, [caddies, activeList])

  const getUnavailable = useMemo(() => {
    if (!activeList) return []
    return caddies.filter(c => 
      c.isActive && 
      c.category === activeList.category &&
      (c.status === 'ABSENT' || c.status === 'ON_LEAVE')
    )
  }, [caddies, activeList])

  const handleBulkDispatch = () => {
    const updates: { id: string, status: string, listId?: string }[] = []
    lists.forEach(list => {
      const count = bulkCounts[list.id] || 0
      if (count > 0) {
        const queue = getQueue(list.id)
        const toDispatch = queue.slice(0, count)
        toDispatch.forEach(c => {
          updates.push({ id: c.id, status: 'IN_PREP', listId: list.id })
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

  const handleReverseList = (listId: string) => {
    const list = lists.find(l => l.id === listId)
    if (!list) return

    if (list.order === 'ASC') {
      updateList({ id: listId, updates: { order: 'DESC' } })
    } else if (list.order === 'DESC') {
      updateList({ id: listId, updates: { order: 'ASC' } })
    } else if (list.order === 'MANUAL') {
      reverseCategoryList(listId)
    } else if (list.order === 'RANDOM') {
      updateList({ id: listId, updates: { order: 'DESC' } })
    }
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
              onReverseList={handleReverseList}
              onOpenEdit={() => setEditingListId(editingListId === activeList.id ? null : activeList.id)}
            />

            {editingListId === activeList.id && (
              <div className="list-manager__edit-panel">
                <NumberInput
                  label="Range Start"
                  value={activeList.rangeStart}
                  onChange={(value) => updateList({id: activeList.id, updates: {rangeStart: value}})}
                  min={0}
                  max={activeList.rangeEnd}
                />
                <NumberInput
                  label="Range End"
                  value={activeList.rangeEnd}
                  onChange={(value) => updateList({id: activeList.id, updates: {rangeEnd: value}})}
                  min={activeList.rangeStart}
                />
              </div>
            )}

            <QueueGrid 
              caddies={caddies} lists={lists} activeTabId={activeTabId}
              isManualReorderMode={isManualMode}
              onDragStart={handleDragStart} onDragOver={handleDragOver} onDrop={handleDrop}
              onPositionChange={handlePositionChange} 
              onUpdateCaddie={(id, updates) => updateCaddie({ id, updates })}
              queuePositions={queues[activeList.category]}
            />

            <div className="list-manager__returns">
              <div className="list-manager__returns-header"><RotateCcw size={12} className="list-manager__returns-icon" />Return Control</div>
              <div className="list-manager__returns-grid">
                {getReturns.map((caddie: Caddie) => (
                  <div key={caddie.id} className="list-manager__return-card">
                    <div className="list-manager__return-circle">
                      <span className="list-manager__return-number">{caddie.number}</span>
                      <div className="list-manager__return-badge">ID</div>
                      <span className={`list-manager__return-indicator ${caddie.status === 'IN_PREP' ? 'list-manager__return-indicator--prep' : 'list-manager__return-indicator--field'}`}></span>
                    </div>
                    <p className="list-manager__return-name">{caddie.name}</p>
                    <button onClick={() => caddieApiService.updateCaddieStatus(caddie.id, 'AVAILABLE')} className="list-manager__return-btn">Return</button>
                  </div>
                ))}
              </div>
            </div>

            {getUnavailable.length > 0 && (
              <div className="list-manager__returns">
                <div className="list-manager__returns-header">
                  <RotateCcw size={12} className="list-manager__returns-icon" />
                  Unavailable Caddies
                </div>
                <div className="list-manager__returns-grid">
                  {getUnavailable.map((caddie: Caddie) => (
                    <div key={caddie.id} className="list-manager__return-card">
                      <div className="list-manager__return-circle">
                        <span className="list-manager__return-number">{caddie.number}</span>
                        <div className="list-manager__return-badge">ID</div>
                        <span className={`list-manager__return-indicator ${
                          caddie.status === 'ABSENT'
                            ? 'list-manager__return-indicator--absent'
                            : 'list-manager__return-indicator--leave'
                        }`}></span>
                      </div>
                      <p className="list-manager__return-name">{caddie.name}</p>
                      <div className="list-manager__status-badge">
                        {caddie.status === 'ABSENT' ? 'Absent' : 'On Leave'}
                      </div>
                      <button 
                        onClick={() => updateCaddie({ id: caddie.id, updates: { status: 'AVAILABLE' } })} 
                        className="list-manager__return-btn"
                      >
                        Restore to Available
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default ListManager
