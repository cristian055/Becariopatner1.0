export interface HeaderProps {
  title?: string;
  subtitle?: string;
  onNavigate: (route: string) => void;
  showUserMenu?: boolean;
  showNotifications?: boolean;
  notificationCount?: number;
  className?: string;
}
