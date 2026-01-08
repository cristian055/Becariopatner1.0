import type { CardProps as CardPropsType } from './Card.types';
import './Card.css';

/**
 * Card - Reusable card component
 * Supports different variants and elevation levels
 */
const Card: React.FC<CardPropsType> = ({
  children,
  variant = 'default',
  elevation = 'md',
  hover = false,
  padding = 'md',
  className = '',
  ...props
}) => {
  const baseClassName = 'card';
  const variantClass = `card--${variant}`;
  const elevationClass = `card--elevation-${elevation}`;
  const paddingClass = `card--padding-${padding}`;
  const hoverClass = hover ? 'card--hover' : '';

  return (
    <div
      className={`${baseClassName} ${variantClass} ${elevationClass} ${paddingClass} ${hoverClass} ${className}`.trim()}
      role="article"
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
