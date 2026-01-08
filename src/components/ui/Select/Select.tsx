import React from 'react'
import type { SelectProps as SelectPropsType } from './Select.types';
import { ChevronDown } from 'lucide-react';
import './Select.css';

/**
 * Select - Reusable select dropdown component
 * Supports custom options and validation states
 */
const Select: React.FC<SelectPropsType> = ({
  label,
  options,
  value,
  onChange,
  disabled = false,
  error,
  placeholder = 'Select...',
  className = '',
  required = false,
  'aria-label': ariaLabel,
  ...props
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const selectRef = React.useRef<HTMLDivElement>(null);
  const hasError = !!error;

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={`select ${hasError ? 'select--error' : ''}`.trim()}>
      {label && (
        <label className="select__label">
          {label}
          {required && <span className="select__required">*</span>}
        </label>
      )}

      <div
        ref={selectRef}
        className="select__wrapper"
      >
        <button
          type="button"
          className="select__trigger"
          onClick={toggleDropdown}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-label={ariaLabel || label}
          {...props}
        >
          <span className="select__value">
            {selectedOption ? selectedOption.label : placeholder}
          </span>

          <ChevronDown
            className={`select__icon ${isOpen ? 'select__icon--open' : ''}`.trim()}
            size={16}
            aria-hidden="true"
          />
        </button>

        {isOpen && (
          <ul className="select__dropdown" role="listbox">
            {options.map(option => (
              <li
                key={option.value}
                className={`select__option ${value === option.value ? 'select__option--selected' : ''}`.trim()}
                onClick={() => handleSelect(option.value)}
                role="option"
                aria-selected={value === option.value}
              >
                {option.label}
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && (
        <span className="select__error-message" role="alert">
          {error}
        </span>
      )}
    </div>
  );
};

export default Select;
