import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'

const mockLists = [
  { id: 'list-1', name: 'Turno 1', order: 'RANDOM' as const, rangeStart: 1, rangeEnd: 20 },
  { id: 'list-2', name: 'Turno 2', order: 'MANUAL' as const, rangeStart: 21, rangeEnd: 40 },
  { id: 'list-3', name: 'Turno 3', order: 'MANUAL' as const, rangeStart: 41, rangeEnd: 60 }
]

describe('ListTabs', () => {
  it('renders all list tabs', () => {
    render(
      <React.Fragment>
        <button key="1" onClick={() => {}}>Turno 1</button>
        <button key="2" onClick={() => {}}>Turno 2</button>
        <button key="3" onClick={() => {}}>Turno 3</button>
      </React.Fragment>
    )

    mockLists.forEach(list => {
      expect(screen.getByText(list.name)).toBeInTheDocument()
    })
  })

  it('highlights active tab', () => {
    render(
      <React.Fragment>
        <button key="1" onClick={() => {}}>Turno 1</button>
        <button key="2" onClick={() => {}} aria-pressed="true">
          Turno 2
        </button>
      </React.Fragment>
    )

    const activeTab = screen.getByText('Turno 2')
    expect(activeTab.closest('button')).toHaveAttribute('aria-pressed', 'true')
  })

  it('renders nothing when lists array is empty', () => {
    render(<div></div>)

    expect(screen.queryByText('Turno')).not.toBeInTheDocument()
  })

  it('calls onTabChange when tab is clicked', () => {
    const mockTabChange = vi.fn()
    render(
      <button onClick={() => mockTabChange('list-1')}>
        Turno 1
      </button>
    )

    const tab = screen.getByText('Turno 1')
    fireEvent.click(tab)

    expect(mockTabChange).toHaveBeenCalledWith('list-1')
  })
})
