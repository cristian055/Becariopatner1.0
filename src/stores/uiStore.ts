import { create } from 'zustand'
import type { ViewType } from '@/types'
import { STORAGE_KEYS, THEME } from '@/constants/app.constants'
import { logger } from '@/utils'

/**
 * UIStore - Global state for application UI
 * Handles routing, sidebar state, modal states, and theme preferences
 */
interface UIState {
  // Route state
  currentRoute: string;
  currentView: ViewType;

  // Sidebar state
  isSidebarOpen: boolean;

  // Modal states
  isCaddieModalOpen: boolean;
  isListSettingsOpen: boolean;
  isShiftModalOpen: boolean;

  // Theme
  theme: typeof THEME[keyof typeof THEME];

  // Dispatch state
  lastDispatchBatch: { ids: string[]; timestamp: number } | null;
  showDispatchPopup: boolean;

  // Actions
  setCurrentRoute: (route: string) => void;
  setCurrentView: (view: ViewType) => void;
  toggleSidebar: () => void;
  openCaddieModal: () => void;
  closeCaddieModal: () => void;
  toggleListSettings: () => void;
  toggleShiftModal: () => void;
  setTheme: (theme: typeof THEME[keyof typeof THEME]) => void;
  setLastDispatchBatch: (batch: { ids: string[]; timestamp: number } | null) => void;
  setShowDispatchPopup: (show: boolean) => void;
}

// Load saved theme from localStorage
const loadSavedTheme = (): typeof THEME[keyof typeof THEME] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    return (saved as typeof THEME[keyof typeof THEME]) || THEME.LIGHT;
  } catch (error) {
    logger.warn('Failed to load theme from localStorage', error as Error, 'UIStore');
    return THEME.LIGHT;
  }
};

export const useUIStore = create<UIState>((set, get) => ({
  // Initial state
  currentRoute: window.location.hash || '#/monitor',
  currentView: 'lists',
  isSidebarOpen: true,
  isCaddieModalOpen: false,
  isListSettingsOpen: false,
  isShiftModalOpen: false,
  theme: loadSavedTheme(),
  lastDispatchBatch: null,
  showDispatchPopup: false,

  // Set current route
  setCurrentRoute: (route) => {
    logger.stateChange('currentRoute', get().currentRoute, route, 'UIStore');

    set({ currentRoute: route });
    window.location.hash = route;
  },

  // Set current admin view
  setCurrentView: (view) => {
    logger.stateChange('currentView', get().currentView, view, 'UIStore');

    set({ currentView: view });
  },

  // Toggle sidebar
  toggleSidebar: () => {
    const isOpen = !get().isSidebarOpen;
    set({ isSidebarOpen: isOpen });

    logger.info(`Sidebar ${isOpen ? 'opened' : 'closed'}`, 'UIStore');
  },

  // Open caddie modal
  openCaddieModal: () => {
    set({ isCaddieModalOpen: true });
    logger.info('Caddie modal opened', 'UIStore');
  },

  // Close caddie modal
  closeCaddieModal: () => {
    set({ isCaddieModalOpen: false });
    logger.info('Caddie modal closed', 'UIStore');
  },

  // Toggle list settings
  toggleListSettings: () => {
    const isOpen = !get().isListSettingsOpen;
    set({ isListSettingsOpen: isOpen });

    logger.info(`List settings ${isOpen ? 'opened' : 'closed'}`, 'UIStore');
  },

  // Toggle shift modal
  toggleShiftModal: () => {
    const isOpen = !get().isShiftModalOpen;
    set({ isShiftModalOpen: isOpen });

    logger.info(`Shift modal ${isOpen ? 'opened' : 'closed'}`, 'UIStore');
  },

  // Set theme
  setTheme: (theme) => {
    logger.stateChange('theme', get().theme, theme, 'UIStore');

    set({ theme });
    localStorage.setItem(STORAGE_KEYS.THEME, theme);

    // Apply theme to document
    if (theme === THEME.DARK) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    logger.info(`Theme set to ${theme}`, 'UIStore');
  },

  // Set last dispatch batch (for popup notification)
  setLastDispatchBatch: (batch) => {
    set({ lastDispatchBatch: batch });

    if (batch) {
      logger.debug(`Dispatch batch set: ${batch.ids.length} caddies`, 'UIStore');

      // Auto-show popup
      set({ showDispatchPopup: true });

      // Auto-dismiss after 8 seconds
      setTimeout(() => {
        set({ showDispatchPopup: false });
        logger.debug('Dispatch popup dismissed', 'UIStore');
      }, 8000);
    }
  },

  // Show/hide dispatch popup
  setShowDispatchPopup: (show) => {
    set({ showDispatchPopup: show });
    logger.info(`Dispatch popup ${show ? 'shown' : 'hidden'}`, 'UIStore');
  },
}));
