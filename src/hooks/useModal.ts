import { useUIStore } from '@/stores'
import { useEffect, useCallback } from 'react'

/**
 * useModal - Custom hook for modal management
 * Provides modal open/close states and actions
 */
interface UseModalProps {
  modalId: string;
  onClose?: () => void;
  onOpen?: () => void;
}

export const useModal = (props: UseModalProps) => {
  const { isCaddieModalOpen, isListSettingsOpen, isShiftModalOpen } = useUIStore();

  /**
   * Get modal open state by ID
   */
  const isModalOpen = (modalId: string): boolean => {
    switch (modalId) {
      case 'caddie':
        return isCaddieModalOpen;
      case 'listSettings':
        return isListSettingsOpen;
      case 'shift':
        return isShiftModalOpen;
      default:
        return false;
    }
  };

  /**
   * Open modal
   */
  const openModal = useCallback((modalId: string) => {
    switch (modalId) {
      case 'caddie':
        const { openCaddieModal } = useUIStore.getState();
        openCaddieModal();
        break;
      case 'listSettings':
        const { toggleListSettings } = useUIStore.getState();
        toggleListSettings();
        break;
      case 'shift':
        const { toggleShiftModal } = useUIStore.getState();
        toggleShiftModal();
        break;
    }
  }, []);

  /**
   * Close modal
   */
  const closeModal = useCallback((modalId: string) => {
    switch (modalId) {
      case 'caddie':
        const { closeCaddieModal } = useUIStore.getState();
        closeCaddieModal();
        break;
      case 'listSettings':
        const { toggleListSettings } = useUIStore.getState();
        toggleListSettings();
        break;
      case 'shift':
        const { toggleShiftModal } = useUIStore.getState();
        toggleShiftModal();
        break;
    }
  }, []);

  /**
   * Close all modals
   */
  const closeAllModals = useCallback(() => {
    const { closeCaddieModal, closeListSettings, closeShiftModal } = useUIStore.getState();
    closeCaddieModal();
    closeListSettings();
    closeShiftModal();
  }, []);

  /**
   * Handle ESC key to close modals
   */
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeAllModals();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  return {
    isModalOpen,
    openModal,
    closeModal,
    closeAllModals,
  };
};
