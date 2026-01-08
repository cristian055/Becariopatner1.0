import type { ModalProps as ModalPropsType } from './Modal.types';
import { X } from 'lucide-react';
import './Modal.css';

/**
 * Modal - Reusable modal component
 * Supports different sizes and animations
 */
const Modal: React.FC<ModalPropsType> = ({
  isOpen,
  onClose,
  title,
  size = 'md',
  children,
  className = '',
  showCloseButton = true,
  closeOnEscape = true,
  closeOnBackdrop = true,
  'aria-label': ariaLabel,
  ...props
}) => {
  // Handle escape key
  React.useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  if (!isOpen) return null;

  const baseClassName = 'modal';
  const sizeClass = `modal--${size}`;

  return (
    <div
      className={`${baseClassName} ${sizeClass}`.trim()}
      onClick={closeOnBackdrop ? onClose : undefined}
      role="dialog"
      aria-modal="true"
      aria-labelledby={props.id}
      aria-label={ariaLabel || title}
    >
      <div
        className="modal__backdrop"
        onClick={e => {
          if (closeOnBackdrop && e.target === e.currentTarget) {
            onClose();
          }
        }}
      />

      <div
        className="modal__content"
        onClick={e => e.stopPropagation()}
        role="document"
      >
        {(title || showCloseButton) && (
          <div className="modal__header">
            {title && (
              <h2 className="modal__title" id={props.id}>
                {title}
              </h2>
            )}

            {showCloseButton && (
              <button
                className="modal__close"
                onClick={onClose}
                aria-label="Close modal"
                type="button"
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}

        <div className={`modal__body ${className}`.trim()}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
