import type { SidebarProps as SidebarPropsType } from './Sidebar.types'
import { ListOrdered, Users, BarChart3, CalendarDays, LogOut, Menu, X, Monitor } from 'lucide-react'
import type { ViewType } from '@/types'
import { useUIStore } from '@/stores'
import './Sidebar.css'

/**
 * Sidebar - Application navigation sidebar
 * Displays main navigation items and logout button
 */
const Sidebar: React.FC<SidebarPropsType> = ({
  items = [],
  isOpen = true,
  activeView,
  onViewChange,
  onLogout,
  className = '',
  ...props
}) => {
  const toggleSidebar = useUIStore(state => state.toggleSidebar);

  return (
    <aside
      className={`sidebar ${isOpen ? 'sidebar--open' : 'sidebar--closed'}`.trim()}
      {...props}
    >
      {/* Logo section */}
      <div className="sidebar__logo">
        <div className="sidebar__logo-icon">C</div>
        {isOpen && (
          <span className="sidebar__logo-text">CaddiePro</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="sidebar__nav">
        {items.map(item => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id as ViewType)}
            className={`sidebar__nav-item ${activeView === item.id ? 'sidebar__nav-item--active' : ''}`.trim()}
            aria-label={item.label}
            aria-current={activeView === item.id ? 'page' : undefined}
          >
            <item.icon
              size={isOpen ? 22 : 24}
              strokeWidth={activeView === item.id ? 2.5 : 2}
            />
            {isOpen && <span className="sidebar__nav-text">{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="sidebar__footer">
        {/* Monitor link */}
        <button
          className="sidebar__footer-link"
          onClick={() => window.location.hash = '#/monitor'}
          aria-label="Go to monitor"
        >
          <Monitor size={20} />
          {isOpen && <span className="sidebar__footer-text">Monitor</span>}
        </button>

        {/* Logout */}
        <button
          className="sidebar__logout-button"
          onClick={onLogout}
          aria-label="Logout"
        >
          <LogOut size={22} />
          {isOpen && <span className="sidebar__footer-text">Logout</span>}
        </button>

        {/* Toggle */}
        <button
          className="sidebar__toggle-button"
          onClick={toggleSidebar}
          aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
          aria-expanded={isOpen}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
