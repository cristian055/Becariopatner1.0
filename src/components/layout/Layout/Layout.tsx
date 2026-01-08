import type { LayoutProps as LayoutPropsType } from './Layout.types';
import { Outlet, useNavigation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import './Layout.css';

/**
 * Layout - Main application layout component
 * Provides header, sidebar, and content area
 */
const Layout: React.FC<LayoutPropsType> = ({
  showSidebar = true,
  showFooter = true,
  className = '',
  ...props
}) => {
  const navigate = useNavigation();

  return (
    <div className={`layout ${showSidebar ? 'layout--with-sidebar' : 'layout--without-sidebar'} ${className}`.trim()}>
      {showSidebar && <Sidebar />}

      <div className="layout__main">
        <Header onNavigate={navigate} />

        <main className="layout__content">
          <Outlet />
        </main>

        {showFooter && <Footer />}
      </div>
    </div>
  );
};

export default Layout;
