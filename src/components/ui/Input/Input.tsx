import type { InputProps as InputPropsType } from './Input.types';
import './Input.css';

/**
 * Input - Reusable input component with validation support
 * Supports different input types and validation states
 */
const Input: React.FC<InputPropsType> = ({
  label,
  error,
  type = 'text',
  placeholder,
  value,
  onChange,
  disabled = false,
  className = '',
  required = false,
  icon: Icon,
  'aria-label': ariaLabel,
  helperText,
  ...props
}) => {
  const baseClassName = 'input';
  const hasError = !!error;
  const hasIcon = !!Icon;
  const isRequired = required && !disabled;

  return (
    <div className={`${baseClassName} ${hasError ? 'input--error' : ''}`.trim()}>
      {label && (
        <label className="input__label">
          {label}
          {isRequired && <span className="input__required">*</span>}
        </label>
      )}

      <div className="input__wrapper">
        {hasIcon && (
          <span className="input__icon" aria-hidden="true">
            <Icon size={18} />
          </span>
        )}

        <input
          type={type}
          className={`input__field ${hasIcon ? 'input__field--with-icon' : ''}`.trim()}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          aria-label={ariaLabel || label}
          aria-invalid={hasError}
          aria-describedby={error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined}
          required={required}
          {...props}
        />
      </div>

      {error && (
        <span className="input__error-message" id={`${props.id}-error`} role="alert">
          {error}
        </span>
      )}

      {helperText && !error && (
        <span className="input__helper-text" id={`${props.id}-helper`}>
          {helperText}
        </span>
      )}
    </div>
  );
};

export default Input;
