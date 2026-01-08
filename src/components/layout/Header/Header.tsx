import type { HeaderProps as HeaderPropsType } from './Header.types'
import { Menu, User, Bell } from 'lucide-react'
import { useUIStore } from '@/stores'
import './Header.css'

/**
 * Header - Application header component
 * Shows app title, navigation, and user menu
 */
const Header: React.FC<HeaderPropsType> = ({
  title = 'CaddiePro',
  subtitle = 'Club Campestre Medellin',
  onNavigate,
  showUserMenu = true,
  showNotifications = false,
  notificationCount = 0,
  className = '',
  ...props
}) => {
  const { currentRoute } = useUIStore();

  return (
    <header className={`header ${className}`.trim()} role="banner" {...props}>
      <div className="header__left">
        <h1 className="header__title">{title}</h1>
        {subtitle && <p className="header__subtitle">{subtitle}</p>}
      </div>

      <div className="header__right">
        <button
          className="header__nav-button"
          onClick={() => onNavigate('/monitor')}
          aria-label="Go to monitor"
          type="button"
        >
          <Monitor size={20} />
          <span className="header__nav-text">Monitor</span>
        </button>

        <div className="header__divider" />

        {showNotifications && (
          <button
            className="header__notification-button"
            aria-label={`View ${notificationCount} notifications`}
            type="button"
          >
            <Bell size={20} />
            {notificationCount > 0 && (
              <span className="header__notification-badge">{notificationCount}</span>
            )}
          </button>
        )}

        {showUserMenu && (
          <div className="header__user-menu">
            <button
              className="header__user-button"
              aria-label="User menu"
              type="button"
            >
              <User size={20} />
              <Menu size={16} className="header__menu-icon" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
