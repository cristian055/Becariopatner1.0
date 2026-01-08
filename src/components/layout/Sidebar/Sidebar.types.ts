import type { ViewType } from '@/types'

export interface SidebarItem {
  id: ViewType;
  label: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
}

export interface SidebarProps {
  items?: SidebarItem[];
  isOpen?: boolean;
  activeView?: ViewType;
  onViewChange: (view: ViewType) => void;
  onLogout: () => void;
  className?: string;
}
