import React from 'react'
import type { ListTabsProps } from './ListManager.types'
import './ListTabs.css'

const ListTabs: React.FC<ListTabsProps> = ({ lists, activeTabId, onTabChange }) => {
  return (
    <div className="list-tabs">
      {lists.map(list => (
        <button
          key={list.id}
          onClick={() => onTabChange(list.id)}
          className={`list-tabs__tab ${
            activeTabId === list.id ? 'list-tabs__tab--active' : ''
          }`}
          aria-label={`Switch to ${list.name}`}
          aria-pressed={activeTabId === list.id}
        >
          {list.name}
        </button>
      ))}
    </div>
  )
}

export default ListTabs
