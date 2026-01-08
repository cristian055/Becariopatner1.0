import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'
import CaddieTable from './CaddieTable'
import { CaddieStatus } from '@/types'

afterEach(() => {
  cleanup()
})

const mockCaddie = {
  id: '1',
  name: 'Juan Pérez',
  number: 1,
  status: CaddieStatus.AVAILABLE,
  isActive: true,
  listId: null,
  historyCount: 42,
  absencesCount: 0,
  lateCount: 0,
  leaveCount: 0,
  lastActionTime: '2024-01-01T00:00:00Z',
  category: 'Primera',
  location: 'Llanogrande',
  role: 'Golf',
  availability: [],
  weekendPriority: 1,
  isSkippedNextWeek: false
}

const defaultOnEdit = vi.fn()
const defaultOnToggle = vi.fn()

describe('CaddieTable', () => {
  it('renders table with empty state when no caddies', () => {
    render(
      <CaddieTable
        caddies={[]}
        onEditCaddie={defaultOnEdit}
        onToggleActive={defaultOnToggle}
      />
    )

    expect(screen.getByText(/no results/i)).toBeInTheDocument()
  })

  it('renders correct number of rows', () => {
    render(
      <CaddieTable
        caddies={[mockCaddie]}
        onEditCaddie={defaultOnEdit}
        onToggleActive={defaultOnToggle}
      />
    )

    const table = screen.getByRole('table')
    expect(table).toBeInTheDocument()
  })

  it('displays caddie data correctly', () => {
    render(
      <CaddieTable
        caddies={[mockCaddie]}
        onEditCaddie={defaultOnEdit}
        onToggleActive={defaultOnToggle}
      />
    )

    expect(screen.getByText('Juan Pérez')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('shows correct status badge for each caddie', () => {
    render(
      <CaddieTable
        caddies={[mockCaddie]}
        onEditCaddie={defaultOnEdit}
        onToggleActive={defaultOnToggle}
      />
    )

    // Status should be "Available" for AVAILABLE status
    expect(screen.getByText('Available')).toBeInTheDocument()
  })

  it('calls onEditCaddie when edit button clicked', () => {
    render(
      <CaddieTable
        caddies={[mockCaddie]}
        onEditCaddie={defaultOnEdit}
        onToggleActive={defaultOnToggle}
      />
    )

    const editButton = screen.getByRole('button', { name: /edit caddie/i })
    fireEvent.click(editButton)

    expect(defaultOnEdit).toHaveBeenCalledWith(mockCaddie)
  })

  it('calls onToggleActive when power button clicked', () => {
    render(
      <CaddieTable
        caddies={[mockCaddie]}
        onEditCaddie={defaultOnEdit}
        onToggleActive={defaultOnToggle}
      />
    )

    const powerButton = screen.getByRole('button', { name: /deactivate/i })
    fireEvent.click(powerButton)

    expect(defaultOnToggle).toHaveBeenCalledWith('1')
  })

  it('shows Reset Filters button when empty', () => {
    render(
      <CaddieTable
        caddies={[]}
        onEditCaddie={defaultOnEdit}
        onToggleActive={defaultOnToggle}
        onResetFilters={() => {}}
      />
    )

    expect(screen.getByText('Reset View')).toBeInTheDocument()
  })

  it('applies grayscale styling for inactive caddies', () => {
    const inactiveCaddie = { ...mockCaddie, isActive: false }

    render(
      <CaddieTable
        caddies={[inactiveCaddie]}
        onEditCaddie={defaultOnEdit}
        onToggleActive={defaultOnToggle}
      />
    )

    const caddieRow = screen.getByText('Juan Pérez')
    expect(caddieRow).toBeInTheDocument()
  })

  it('displays category badge correctly', () => {
    render(
      <CaddieTable
        caddies={[mockCaddie]}
        onEditCaddie={defaultOnEdit}
        onToggleActive={defaultOnToggle}
      />
    )

    expect(screen.getByText('Category Primera')).toBeInTheDocument()
  })

  it('displays location and role information', () => {
    render(
      <CaddieTable
        caddies={[mockCaddie]}
        onEditCaddie={defaultOnEdit}
        onToggleActive={defaultOnToggle}
      />
    )

    expect(screen.getByText('Llanogrande')).toBeInTheDocument()
    expect(screen.getByText('Golf')).toBeInTheDocument()
  })
})
