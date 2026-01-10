import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'
import CaddieEditModal from './CaddieEditModal'
import { CaddieStatus } from '../../../types'
import type { CaddieEditModalProps } from './CaddieManager.types'

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

const mockCaddie = {
  id: '1',
  name: 'Juan Pérez',
  number: 1,
  status: CaddieStatus.AVAILABLE,
  isActive: true,
  listId: null,
  historyCount: 42,
  absencesCount: 5,
  lateCount: 3,
  leaveCount: 2,
  lastActionTime: '2024-01-01T00:00:00Z',
  category: 'Primera',
  location: 'Llanogrande',
  role: 'Golf',
  availability: [],
  weekendPriority: 1,
  isSkippedNextWeek: false
}

const defaultOnSave = vi.fn()
const defaultOnClose = vi.fn()
const defaultOnErrorChange = vi.fn()

const defaultProps: CaddieEditModalProps = {
  isOpen: true,
  caddie: mockCaddie,
  isAdding: false,
  allCaddies: [mockCaddie],
  error: null,
  onClose: defaultOnClose,
  onSave: defaultOnSave,
  onErrorChange: defaultOnErrorChange
}

describe('CaddieEditModal', () => {
  it('renders modal when open', () => {
    render(<CaddieEditModal {...defaultProps} />)

    expect(screen.getByText(/edit profile/i)).toBeInTheDocument()
  })

  it('renders "New Record" title when adding', () => {
    render(<CaddieEditModal {...defaultProps} isAdding={true} />)

    expect(screen.getByText(/new record/i)).toBeInTheDocument()
  })

  it('renders "Edit Profile" title when editing', () => {
    render(<CaddieEditModal {...defaultProps} isAdding={false} />)

    expect(screen.getByText(/edit profile/i)).toBeInTheDocument()
  })

  it('displays caddie name', () => {
    render(<CaddieEditModal {...defaultProps} />)

    expect(screen.getByDisplayValue('Juan Pérez')).toBeInTheDocument()
  })

  it('displays caddie number', () => {
    render(<CaddieEditModal {...defaultProps} />)

    const numberInputs = screen.getAllByDisplayValue('1')
    expect(numberInputs.length).toBeGreaterThan(0)
  })

  it('displays location field', () => {
    render(<CaddieEditModal {...defaultProps} />)

    expect(screen.getByText(/location/i)).toBeInTheDocument()
    expect(screen.getByText(/llanogrande/i)).toBeInTheDocument()
  })

  it('disables location field when editing', () => {
    render(<CaddieEditModal {...defaultProps} isAdding={false} />)

    const locationSelect = screen.getByText(/llanogrande/i).closest('.select__trigger')
    expect(locationSelect).toBeDisabled()
  })

  it('enables location field when adding', () => {
    render(<CaddieEditModal {...defaultProps} isAdding={true} />)

    const locationSelect = screen.getByText(/llanogrande/i).closest('.select__trigger')
    expect(locationSelect).not.toBeDisabled()
  })

  it('displays role field', () => {
    render(<CaddieEditModal {...defaultProps} />)

    expect(screen.getByText(/role/i)).toBeInTheDocument()
    expect(screen.getByText(/golf/i)).toBeInTheDocument()
  })

  it('disables role field when editing', () => {
    render(<CaddieEditModal {...defaultProps} isAdding={false} />)

    const roleSelect = screen.getByText(/golf/i).closest('.select__trigger')
    expect(roleSelect).toBeDisabled()
  })

  it('displays weekend priority field', () => {
    render(<CaddieEditModal {...defaultProps} />)

    expect(screen.getByText(/weekend priority/i)).toBeInTheDocument()
    const priorityInputs = screen.getAllByDisplayValue('1')
    expect(priorityInputs.length).toBeGreaterThan(0)
  })

  it('displays service statistics section when editing', () => {
    render(<CaddieEditModal {...defaultProps} isAdding={false} />)

    expect(screen.getByText(/service statistics/i)).toBeInTheDocument()
    expect(screen.getByText(/history/i)).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
    expect(screen.getByText(/absences/i)).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('does not display service statistics section when adding', () => {
    render(<CaddieEditModal {...defaultProps} isAdding={true} />)

    expect(screen.queryByText(/service statistics/i)).not.toBeInTheDocument()
  })

  it('calls onSave with updated caddie when save button clicked', () => {
    render(<CaddieEditModal {...defaultProps} />)

    const nameInput = screen.getByLabelText(/full name/i)
    fireEvent.change(nameInput, { target: { value: 'New Name' } })

    const saveButton = screen.getByRole('button', { name: /update profile/i })
    fireEvent.click(saveButton)

    expect(defaultOnSave).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'New Name' })
    )
  })

  it('validates name is required', () => {
    const emptyCaddie = { ...mockCaddie, name: '' }
    render(<CaddieEditModal {...defaultProps} caddie={emptyCaddie} />)

    const saveButton = screen.getByRole('button', { name: /update profile/i })
    fireEvent.click(saveButton)

    expect(defaultOnErrorChange).toHaveBeenCalledWith('Name is required')
    expect(defaultOnSave).not.toHaveBeenCalled()
  })

  it('rejects invalid weekend priority values in input', () => {
    render(<CaddieEditModal {...defaultProps} />)

    const priorityInput = screen.getByLabelText(/weekend priority/i)
    fireEvent.change(priorityInput, { target: { value: '1000' } })

    const saveButton = screen.getByRole('button', { name: /update profile/i })
    fireEvent.click(saveButton)

    expect(defaultOnSave).toHaveBeenCalledWith(
      expect.objectContaining({ weekendPriority: 1 })
    )
  })

  it('calls onClose when cancel button clicked', () => {
    render(<CaddieEditModal {...defaultProps} />)

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    fireEvent.click(cancelButton)

    expect(defaultOnClose).toHaveBeenCalled()
    expect(defaultOnErrorChange).toHaveBeenCalledWith(null)
  })

  it('displays status toggle section when editing', () => {
    render(<CaddieEditModal {...defaultProps} isAdding={false} />)

    expect(screen.getByText(/master status/i)).toBeInTheDocument()
    expect(screen.getByText(/caddie active in system/i)).toBeInTheDocument()
  })

  it('does not display status toggle section when adding', () => {
    render(<CaddieEditModal {...defaultProps} isAdding={true} />)

    expect(screen.queryByText(/master status/i)).not.toBeInTheDocument()
  })
})
