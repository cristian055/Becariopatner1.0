import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import Button from './Button'
import Input from '../Input/Input'

describe('Button Component', () => {
  it('renders button text', () => {
    render(<Button onClick={() => {}}>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('renders loading state', () => {
    render(<Button onClick={() => {}} loading>Click me</Button>);
    expect(screen.getByRole('button', { busy: true })).toBeInTheDocument();
    expect(screen.getByText(/click me/i)).toBeInTheDocument();
  });

  it('triggers onClick handler', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when prop is set', () => {
    render(<Button onClick={() => {}} disabled>Click me</Button>);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });
});

describe('Input Component', () => {
  beforeEach(() => {
    // Reset DOM before each test
    document.body.innerHTML = '';
  });

  it('renders label', () => {
    render(<Input label="Test Label" value="test" onChange={() => {}} />);

    expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
  });

  it('renders placeholder', () => {
    render(<Input placeholder="Enter value" value="" onChange={() => {}} />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('placeholder', 'Enter value');
  });

  it('displays error message', () => {
    render(<Input label="Test" error="This is required" value="" onChange={() => {}} />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/this is required/i)).toBeInTheDocument();
  });

  it('calls onChange on input', () => {
    const handleChange = vi.fn();
    render(<Input label="Test" value="initial" onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'new value' } });

    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('is disabled when prop is set', () => {
    render(<Input label="Test" disabled value="test" onChange={() => {}} />);

    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('shows required indicator', () => {
    render(<Input label="Test" required value="test" onChange={() => {}} />)

    const label = screen.getByText('Test')
    const requiredIndicator = label.querySelector('.input__required')
    expect(requiredIndicator).toBeInTheDocument()
    expect(requiredIndicator).toHaveTextContent('*')
  })
});
