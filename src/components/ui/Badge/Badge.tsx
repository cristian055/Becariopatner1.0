import type { BadgeProps as BadgePropsType } from './Badge.types';
import './Badge.css';

/**
 * Badge - Small status or indicator component
 * Supports different variants and sizes
 */
const Badge: React.FC<BadgePropsType> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  dot = false,
  ...props
}) => {
  const baseClassName = 'badge';
  const variantClass = `badge--${variant}`;
  const sizeClass = `badge--${size}`;
  const isDot = dot;

  return (
    <span
      className={`${baseClassName} ${variantClass} ${sizeClass} ${isDot ? 'badge--dot' : ''} ${className}`.trim()}
      role="status"
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
