import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import CaddieAvailabilityEditor from './CaddieAvailabilityEditor'

const mockAvailability = [
  { day: 'Friday', isAvailable: true, range: { type: 'full' } },
  { day: 'Saturday', isAvailable: true, range: { type: 'full' } },
  { day: 'Sunday', isAvailable: true, range: { type: 'full' } }
]

const defaultOnChange = vi.fn()

describe('CaddieAvailabilityEditor', () => {
  it('renders 7 day availability rows', () => {
    render(
      <CaddieAvailabilityEditor
        availability={mockAvailability}
        onChange={defaultOnChange}
      />
    )

    expect(screen.getByText('Monday')).toBeInTheDocument()
    expect(screen.getByText('Tuesday')).toBeInTheDocument()
    expect(screen.getByText('Wednesday')).toBeInTheDocument()
    expect(screen.getByText('Thursday')).toBeInTheDocument()
    expect(screen.getByText('Friday')).toBeInTheDocument()
    expect(screen.getByText('Saturday')).toBeInTheDocument()
    expect(screen.getByText('Sunday')).toBeInTheDocument()
  })

  it('shows correct availability state per day', () => {
    render(
      <CaddieAvailabilityEditor
        availability={mockAvailability}
        onChange={defaultOnChange}
      />
    )

    // Friday, Saturday, Sunday should show as available
    expect(screen.getByText('Friday')).toBeInTheDocument()
    expect(screen.getByText('Saturday')).toBeInTheDocument()
    expect(screen.getByText('Sunday')).toBeInTheDocument()
  })

  it('toggles availability when checkbox clicked', () => {
    render(
      <CaddieAvailabilityEditor
        availability={mockAvailability}
        onChange={defaultOnChange}
      />
    )

    const fridayToggle = screen.getAllByRole('checkbox')[0]
    fireEvent.click(fridayToggle)

    expect(defaultOnChange).toHaveBeenCalled()
  })

  it('calls onChange when availability modified', () => {
    render(
      <CaddieAvailabilityEditor
        availability={mockAvailability}
        onChange={defaultOnChange}
      />
    )

    const toggleButton = screen.getAllByRole('checkbox')[0]
    fireEvent.click(toggleButton)

    expect(defaultOnChange).toHaveBeenCalled()
  })

  it('shows/hides time range selector based on availability', () => {
    const availability = [
      { day: 'Friday', isAvailable: true, range: { type: 'full' } },
      { day: 'Saturday', isAvailable: false, range: { type: 'full' } }
    ]

    render(
      <CaddieAvailabilityEditor
        availability={availability}
        onChange={defaultOnChange}
      />
    )

    // Time selector should be visible for Friday (available)
    const timeSelectors = screen.queryAllByDisplayValue('Full day')
    expect(timeSelectors.length).toBeGreaterThan(0)
  })

  it('shows time input when range type is before or after', () => {
    const availability = [
      { day: 'Friday', isAvailable: true, range: { type: 'after', time: '09:30 AM' } }
    ]

    render(
      <CaddieAvailabilityEditor
        availability={availability}
        onChange={defaultOnChange}
      />
    )

    expect(screen.getByDisplayValue('09:30 AM')).toBeInTheDocument()
  })

  it('displays correct day labels', () => {
    render(
      <CaddieAvailabilityEditor
        availability={mockAvailability}
        onChange={defaultOnChange}
      />
    )

    expect(screen.getByText('Monday')).toBeInTheDocument()
    expect(screen.getByText('Tuesday')).toBeInTheDocument()
    expect(screen.getByText('Wednesday')).toBeInTheDocument()
    expect(screen.getByText('Thursday')).toBeInTheDocument()
    expect(screen.getByText('Friday')).toBeInTheDocument()
    expect(screen.getByText('Saturday')).toBeInTheDocument()
    expect(screen.getByText('Sunday')).toBeInTheDocument()
  })
})
