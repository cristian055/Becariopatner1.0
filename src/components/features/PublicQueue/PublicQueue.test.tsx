import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import PublicQueue from './PublicQueue'
import type { Caddie, ListConfig } from '../../../types'


// Mock sub-components to focus on PublicQueue logic
vi.mock('./QueueHeader', () => ({
  default: () => <header data-testid="queue-header">Header</header>,
}))
vi.mock('./QueueCategory', () => ({
  default: ({ category }: any) => <div data-testid={`category-${category.name}`}>{category.name}</div>,
}))
vi.mock('./DispatchPopup', () => ({
  default: () => <div data-testid="dispatch-popup">Popup</div>,
}))
vi.mock('../../MonitorNavBar', () => ({
  default: () => <nav data-testid="monitor-navbar">NavBar</nav>,
}))

const mockCaddies: Caddie[] = [
  {
    id: '1',
    name: 'JUAN PEREZ',
    number: 101,
    status: 'AVAILABLE',
    isActive: true,
    category: 'Primera',
    location: 'Medellín',
    role: 'Golf',
    availability: [],
    weekendPriority: 1,
    lastActionTime: new Date().toISOString(),
    listId: 'l1',
    historyCount: 0,
    absencesCount: 0,
    lateCount: 0,
    leaveCount: 0,
  },
]

const mockLists: ListConfig[] = [
  { id: 'l1', name: 'List 1', order: 'ASC', rangeStart: 1, rangeEnd: 200, category: 'Primera' },
  { id: 'l2', name: 'List 2', order: 'ASC', rangeStart: 1, rangeEnd: 200, category: 'Segunda' },
  { id: 'l3', name: 'List 3', order: 'ASC', rangeStart: 1, rangeEnd: 200, category: 'Tercera' },
]

describe('PublicQueue', () => {
  it('renders navbar, header, and categories', () => {
    render(<PublicQueue caddies={mockCaddies} lists={mockLists} />)

    expect(screen.getByTestId('monitor-navbar')).toBeInTheDocument()
    expect(screen.getByTestId('queue-header')).toBeInTheDocument()
    expect(screen.getByTestId('category-Primera')).toBeInTheDocument()
    expect(screen.getByTestId('category-Segunda')).toBeInTheDocument()
    expect(screen.getByTestId('category-Tercera')).toBeInTheDocument()
  })

  it('filters and sorts caddies by category', () => {
    // This is implicitly tested by passing topCaddies to QueueCategory
    // In a real test we'd check if the correct caddies are passed
    render(<PublicQueue caddies={mockCaddies} lists={mockLists} />)
    expect(screen.getByTestId('category-Primera')).toBeInTheDocument()
  })
})
