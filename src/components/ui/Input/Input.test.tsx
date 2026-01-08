import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import Input from './Input'

describe('Input Component', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('renders label', () => {
    render(<Input label="Caddie Name" value="Test" onChange={() => {}} />);

    expect(screen.getByLabelText('Caddie Name')).toBeInTheDocument();
  });

  it('renders helper text', () => {
    render(<Input label="Test" helperText="Enter caddie number" value="" onChange={() => {}} />);

    expect(screen.getByText(/enter caddie number/i)).toBeInTheDocument();
  });

  it('shows error state', () => {
    render(<Input label="Test" error="Invalid number" value="" onChange={() => {}} />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('input__field');
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/invalid number/i)).toBeInTheDocument();
  });

  it('handles number input', () => {
    const handleChange = vi.fn();
    render(<Input label="Test" type="number" value="" onChange={handleChange} />);

    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '42' } });

    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('is required when prop is set', () => {
    render(<Input label="Test" required value="" onChange={() => {}} />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('required', '');
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('has icon when prop is set', () => {
    const IconComponent = ({ size }: { size?: number }) => <span data-testid="icon" style={{ width: size }}>Icon</span>
    render(<Input label="Test" icon={IconComponent} value="" onChange={() => {}} />)

    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('is disabled when prop is set', () => {
    render(<Input label="Test" disabled value="" onChange={() => {}} />);

    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });
});
