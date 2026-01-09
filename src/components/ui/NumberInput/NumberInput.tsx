import React from 'react'
import { Minus, Plus } from 'lucide-react'

import type { NumberInputProps } from './NumberInput.types'
import './NumberInput.css'

const NumberInput: React.FC<NumberInputProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  error,
  helperText,
  disabled = false,
  'aria-label': ariaLabel,
  ...props
}) => {
  const handleIncrement = (): void => {
    const newValue = value + step
    if (max === undefined || newValue <= max) {
      onChange(newValue)
    }
  }

  const handleDecrement = (): void => {
    const newValue = value - step
    if (min === undefined || newValue >= min) {
      onChange(newValue)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newValue = parseInt(e.target.value, 10)
    if (!isNaN(newValue)) {
      if ((min === undefined || newValue >= min) && (max === undefined || newValue <= max)) {
        onChange(newValue)
      }
    } else if (e.target.value === '') {
      onChange(min ?? 0)
    }
  }

  const isDecrementDisabled = disabled || (min !== undefined && value <= min)
  const isIncrementDisabled = disabled || (max !== undefined && value >= max)

  return (
    <div className={`number-input ${error ? 'number-input--error' : ''}`}>
      {label && <label className="number-input__label">{label}</label>}
      
      <div className="number-input__wrapper">
        <button
          type="button"
          className="number-input__button"
          onClick={handleDecrement}
          disabled={isDecrementDisabled}
          aria-label={`Decrease ${label || 'value'}`}
        >
          <Minus size={18} />
        </button>

        <input
          type="number"
          className="number-input__field"
          value={value}
          onChange={handleInputChange}
          disabled={disabled}
          aria-label={ariaLabel || label}
          aria-invalid={!!error}
          {...props}
        />

        <button
          type="button"
          className="number-input__button"
          onClick={handleIncrement}
          disabled={isIncrementDisabled}
          aria-label={`Increase ${label || 'value'}`}
        >
          <Plus size={18} />
        </button>
      </div>

      {error && (
        <span className="number-input__error-message" role="alert">
          {error}
        </span>
      )}

      {helperText && !error && (
        <span className="number-input__helper-text">{helperText}</span>
      )}
    </div>
  )
}

export default NumberInput
