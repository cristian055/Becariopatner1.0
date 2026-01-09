import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import NumberInput from './NumberInput'

describe('NumberInput Component', () => {
  it('should render with label', () => {
    const handleChange = vi.fn()
    render(<NumberInput label="Test Label" value={10} onChange={handleChange} />)
    
    expect(screen.getByText('Test Label')).toBeInTheDocument()
    expect(screen.getByDisplayValue('10')).toBeInTheDocument()
  })

  it('should increment value when plus button is clicked', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    render(<NumberInput label="Count" value={5} onChange={handleChange} />)
    
    const incrementButton = screen.getByLabelText('Increase Count')
    await user.click(incrementButton)
    
    expect(handleChange).toHaveBeenCalledWith(6)
  })

  it('should decrement value when minus button is clicked', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    render(<NumberInput label="Count" value={5} onChange={handleChange} />)
    
    const decrementButton = screen.getByLabelText('Decrease Count')
    await user.click(decrementButton)
    
    expect(handleChange).toHaveBeenCalledWith(4)
  })

  it('should respect min value', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    render(<NumberInput label="Count" value={0} min={0} onChange={handleChange} />)
    
    const decrementButton = screen.getByLabelText('Decrease Count')
    expect(decrementButton).toBeDisabled()
    
    await user.click(decrementButton)
    expect(handleChange).not.toHaveBeenCalled()
  })

  it('should respect max value', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    render(<NumberInput label="Count" value={10} max={10} onChange={handleChange} />)
    
    const incrementButton = screen.getByLabelText('Increase Count')
    expect(incrementButton).toBeDisabled()
    
    await user.click(incrementButton)
    expect(handleChange).not.toHaveBeenCalled()
  })

  it('should allow direct input of number', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    render(<NumberInput label="Count" value={5} onChange={handleChange} />)
    
    const input = screen.getByDisplayValue('5')
    await user.clear(input)
    await user.type(input, '25')
    
    expect(handleChange).toHaveBeenCalled()
  })

  it('should render error message when error prop is provided', () => {
    const handleChange = vi.fn()
    render(<NumberInput label="Count" value={5} onChange={handleChange} error="Invalid value" />)
    
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid value')
  })

  it('should render helper text when provided', () => {
    const handleChange = vi.fn()
    render(<NumberInput label="Count" value={5} onChange={handleChange} helperText="Enter a number" />)
    
    expect(screen.getByText('Enter a number')).toBeInTheDocument()
  })

  it('should disable all controls when disabled prop is true', () => {
    const handleChange = vi.fn()
    render(<NumberInput label="Count" value={5} onChange={handleChange} disabled />)
    
    expect(screen.getByDisplayValue('5')).toBeDisabled()
    expect(screen.getByLabelText('Increase Count')).toBeDisabled()
    expect(screen.getByLabelText('Decrease Count')).toBeDisabled()
  })

  it('should use custom step value', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    render(<NumberInput label="Count" value={10} step={5} onChange={handleChange} />)
    
    const incrementButton = screen.getByLabelText('Increase Count')
    await user.click(incrementButton)
    
    expect(handleChange).toHaveBeenCalledWith(15)
  })
})
