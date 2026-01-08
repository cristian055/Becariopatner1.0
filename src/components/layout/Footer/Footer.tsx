import type { FooterProps as FooterPropsType } from './Footer.types';
import './Footer.css';

/**
 * Footer - Application footer component
 * Displays copyright, version, and links
 */
const Footer: React.FC<FooterPropsType> = ({
  copyright = '2024 Club Campestre Medellin',
  version = 'v1.0.0',
  showLinks = true,
  className = '',
  ...props
}) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`footer ${className}`.trim()} role="contentinfo" {...props}>
      <div className="footer__content">
        <div className="footer__copyright">
          <p>Copyright {currentYear} {copyright}</p>
          <p className="footer__version">{version}</p>
        </div>

        {showLinks && (
          <div className="footer__links">
            <a
              href="/privacy"
              className="footer__link"
              aria-label="View privacy policy"
            >
              Privacy Policy
            </a>
            <a
              href="/terms"
              className="footer__link"
              aria-label="View terms of service"
            >
              Terms of Service
            </a>
            <a
              href="/support"
              className="footer__link"
              aria-label="Get support"
            >
              Support
            </a>
          </div>
        )}
      </div>
    </footer>
  );
};

export default Footer;
