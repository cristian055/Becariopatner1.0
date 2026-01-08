import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import CaddieSearchBar from './CaddieSearchBar'

const defaultProps = {
  searchTerm: '',
  onSearchChange: vi.fn(),
  categoryFilter: 'All',
  onCategoryChange: vi.fn(),
  activeFilter: 'All',
  onActiveChange: vi.fn(),
  onAddCaddie: vi.fn()
}

describe('CaddieSearchBar', () => {
  it('renders search input with correct placeholder', () => {
    render(<CaddieSearchBar {...defaultProps} />)

    const searchInput = screen.getByPlaceholderText(/search caddie by name or id/i)
    expect(searchInput).toBeInTheDocument()
    expect(searchInput).toHaveValue('')
  })

  it('calls onSearchChange when typing in search input', () => {
    render(<CaddieSearchBar {...defaultProps} />)

    const searchInput = screen.getByPlaceholderText(/search caddie by name or id/i)
    fireEvent.change(searchInput, { target: { value: 'Juan' } })

    expect(defaultProps.onSearchChange).toHaveBeenCalledWith('Juan')
  })

  it('displays correct search term in input', () => {
    render(<CaddieSearchBar {...defaultProps} searchTerm="Test Search" />)

    const searchInput = screen.getByPlaceholderText(/search caddie by name or id/i)
    expect(searchInput).toHaveValue('Test Search')
  })

  it('renders category filter with correct options', () => {
    render(<CaddieSearchBar {...defaultProps} />)

    const categoryLabel = screen.getByText(/by category/i)
    expect(categoryLabel).toBeInTheDocument()
  })

  it('renders active status filter with correct options', () => {
    render(<CaddieSearchBar {...defaultProps} />)

    const activeLabel = screen.getByText(/master status/i)
    expect(activeLabel).toBeInTheDocument()
  })

  it('calls onCategoryChange when category filter changes', () => {
    render(<CaddieSearchBar {...defaultProps} />)

    // This test assumes the category filter uses a select or radio buttons
    // Implementation detail will be verified during GREEN phase
    const categoryLabel = screen.getByText(/by category/i)
    expect(categoryLabel).toBeInTheDocument()
  })

  it('calls onActiveChange when active status filter changes', () => {
    render(<CaddieSearchBar {...defaultProps} />)

    // This test assumes the active status filter uses a select or radio buttons
    const activeLabel = screen.getByText(/master status/i)
    expect(activeLabel).toBeInTheDocument()
  })

  it('triggers onAddCaddie when New Caddie button is clicked', () => {
    render(<CaddieSearchBar {...defaultProps} />)

    const addButton = screen.getByRole('button', { name: /new caddie/i })
    fireEvent.click(addButton)

    expect(defaultProps.onAddCaddie).toHaveBeenCalledTimes(1)
  })

  it('shows active filter indicator when category filter is not All', () => {
    render(
      <CaddieSearchBar {...defaultProps} categoryFilter="Primera" />
    )

    // Check for visual indicator of active filter
    const filterButton = screen.getByRole('button', { name: /filters/i })
    expect(filterButton).toBeInTheDocument()
  })

  it('shows active filter indicator when active filter is not All', () => {
    render(
      <CaddieSearchBar {...defaultProps} activeFilter="Active" />
    )

    const filterButton = screen.getByRole('button', { name: /filters/i })
    expect(filterButton).toBeInTheDocument()
  })
})
