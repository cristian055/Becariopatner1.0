import React from 'react';
import { useCaddieStore } from '../../../stores/caddieStore';
import type { CaddieCategory } from '../../../types';
import { ChevronUp, CheckCircle2, AlertCircle } from 'lucide-react';
import './CategoryPromotion.css';

interface Props {
  caddieId: string;
  currentCategory: CaddieCategory;
}

const ALLOWED_PROMOTIONS: Record<CaddieCategory, CaddieCategory[]> = {
  'PRIMERA': [],
  'SEGUNDA': ['PRIMERA'],
  'TERCERA': ['SEGUNDA', 'PRIMERA'],
};

const CATEGORY_LABELS: Record<CaddieCategory, string> = {
  'PRIMERA': 'Primera',
  'SEGUNDA': 'Segunda',
  'TERCERA': 'Tercera',
};

const CategoryPromotion: React.FC<Props> = ({ caddieId, currentCategory }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const promoteCaddie = useCaddieStore(state => state.promoteCaddie);
  const allowedCategories = ALLOWED_PROMOTIONS[currentCategory];

  const handlePromote = async (toCategory: CaddieCategory): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(false);

      await promoteCaddie(caddieId, toCategory);

      setSuccess(true);
      setIsOpen(false);

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to promote caddie');
    } finally {
      setIsLoading(false);
    }
  };

  const closeDropdown = (): void => setIsOpen(false);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        closeDropdown();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        closeDropdown();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  if (allowedCategories.length === 0) {
    return null;
  }

  return (
    <div className="category-promotion" ref={dropdownRef}>
      <button
        type="button"
        className="category-promotion__trigger"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={`Promote caddie from ${CATEGORY_LABELS[currentCategory]}`}
      >
        <span className="category-promotion__trigger-text">
          {isLoading ? 'Promoting...' : 'Promote'}
        </span>
        <ChevronUp
          className={`category-promotion__icon ${isOpen ? 'category-promotion__icon--open' : ''}`}
          size={16}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          className="category-promotion__dropdown"
          role="menu"
          aria-label="Promotion options"
        >
          <div className="category-promotion__header">
            <h3 className="category-promotion__title">Promote to:</h3>
          </div>

          <div className="category-promotion__options">
            {allowedCategories.map(category => (
              <button
                key={category}
                type="button"
                className="category-promotion__option"
                onClick={() => handlePromote(category)}
                disabled={isLoading}
                role="menuitem"
                aria-label={`Promote to ${CATEGORY_LABELS[category]}`}
              >
                <span className="category-promotion__option-label">
                  {CATEGORY_LABELS[category]}
                </span>
              </button>
            ))}
          </div>

          {error && (
            <div className="category-promotion__error" role="alert">
              <AlertCircle size={16} aria-hidden="true" />
              <span className="category-promotion__error-text">{error}</span>
            </div>
          )}

          {success && (
            <div className="category-promotion__success" role="status">
              <CheckCircle2 size={16} aria-hidden="true" />
              <span className="category-promotion__success-text">
                Promotion successful!
              </span>
            </div>
          )}
        </div>
      )}

      {success && !isOpen && (
        <div className="category-promotion__toast" role="status">
          <CheckCircle2 size={16} aria-hidden="true" />
          <span>Promoted successfully!</span>
        </div>
      )}
    </div>
  );
};

export default CategoryPromotion;
