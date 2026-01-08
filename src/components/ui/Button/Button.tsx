import type { ButtonProps as ButtonPropsType } from './Button.types';
import './Button.css';

/**
 * Button - Reusable button component with multiple variants
 * Supports different sizes, variants, and loading states
 */
const Button: React.FC<ButtonPropsType> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  'aria-label': ariaLabel,
  ...props
}) => {
  const baseClassName = 'button';
  const variantClass = `button--${variant}`;
  const sizeClass = `button--${size}`;
  const isDisabled = disabled || loading;

  return (
    <button
      type="button"
      className={`${baseClassName} ${variantClass} ${sizeClass} ${className}`.trim()}
      onClick={onClick}
      disabled={isDisabled}
      aria-label={ariaLabel}
      aria-busy={loading}
      {...props}
    >
      {loading && (
        <span className="button__loader" aria-hidden="true">
          <span className="button__loader-dot"></span>
          <span className="button__loader-dot"></span>
          <span className="button__loader-dot"></span>
        </span>
      )}

      {!loading && Icon && iconPosition === 'left' && (
        <span className="button__icon button__icon--left" aria-hidden="true">
          <Icon size={size === 'sm' ? 16 : size === 'lg' ? 20 : 18} />
        </span>
      )}

      <span className="button__content">{children}</span>

      {!loading && Icon && iconPosition === 'right' && (
        <span className="button__icon button__icon--right" aria-hidden="true">
          <Icon size={size === 'sm' ? 16 : size === 'lg' ? 20 : 18} />
        </span>
      )}
    </button>
  );
};

export default Button;
