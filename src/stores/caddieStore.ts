import { create } from 'zustand'
import type { Caddie } from '../types'
import { CaddieStatus } from '../types'
import type {
  CaddieState,
  CreateCaddieInput,
  UpdateCaddieInput,
  BulkUpdateInput,
  DispatchState,
} from '../types/store.types'
import { logger } from '../utils'
import { caddieApiService } from '../services/caddieApiService'

// Initial state - empty array, will be populated from API

/**
 * CaddieStore - Global state for caddie management
 * Handles CRUD operations, filtering, and state updates
 */
interface CaddieStore extends CaddieState, DispatchState {
  // Actions
  setCaddies: (caddies: Caddie[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchCaddies: () => Promise<void>;
  createCaddie: (input: CreateCaddieInput) => Promise<void>;
  updateCaddie: (input: UpdateCaddieInput) => void;
  deleteCaddie: (id: string) => void;
  bulkUpdateCaddies: (input: BulkUpdateInput) => void;
  reorderCaddie: (listId: string, caddieId: string, newIndex: number) => void;
  resetCaddies: () => void;
  setLastDispatchBatch: (batch: { ids: string[]; timestamp: number } | null) => void;
  setShowPopup: (show: boolean) => void;
}

export const useCaddieStore = create<CaddieStore>((set, get) => ({
  // Initial state
  caddies: [],
  loading: false,
  error: null,
  lastDispatchBatch: null,
  showPopup: false,

  // Set caddies
  setCaddies: (caddies) => {
    logger.stateChange('caddies', get().caddies.length, caddies.length, 'CaddieStore');
    set({ caddies });
  },

  // Set loading state
  setLoading: (loading) => {
    set({ loading });
  },

  // Set error state
  setError: (error) => {
    set({ error });
    if (error) {
      logger.error('Caddie store error:', new Error(error), 'CaddieStore');
    }
  },

  setLastDispatchBatch: (batch) => set({ lastDispatchBatch: batch }),
  setShowPopup: (show) => set({ showPopup: show }),

  // Fetch caddies from API
  fetchCaddies: async () => {
    try {
      set({ loading: true, error: null });
      logger.info('Fetching caddies...', 'CaddieStore');

      const caddies = await caddieApiService.fetchCaddies();

      set({ caddies, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch caddies';
      set({ loading: false, error: errorMessage });
      logger.serviceError('FETCH_ERROR', errorMessage, error, 'CaddieStore');
    }
  },

  // Create new caddie via API
  createCaddie: async (input) => {
    try {
      set({ loading: true, error: null });
      logger.action('createCaddie', input as unknown as Record<string, unknown>, 'CaddieStore');

      const newCaddie = await caddieApiService.createCaddie(input);

      set(state => ({
        caddies: [...state.caddies, newCaddie],
        loading: false,
      }));

      logger.info(`Caddie created: ${newCaddie.id}`, 'CaddieStore');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create caddie';
      set({ loading: false, error: errorMessage });
      logger.serviceError('CREATE_ERROR', errorMessage, error, 'CaddieStore');
    }
  },

  // Update existing caddie via API
  updateCaddie: async (input) => {
    logger.action('updateCaddie', input as unknown as Record<string, unknown>, 'CaddieStore');

    try {
      // Check if we need to increment counters based on status change
      const currentCaddie = get().caddies.find(c => c.id === input.id);
      const updatedInput = { ...input };
      
      if (currentCaddie && input.updates?.status) {
        const oldStatus = currentCaddie.status;
        const newStatus = input.updates.status;
        
        // Increment counters when transitioning TO these statuses (not FROM)
        if (oldStatus !== newStatus) {
          if (newStatus === CaddieStatus.ABSENT) {
            updatedInput.updates = { 
              ...updatedInput.updates, 
              absencesCount: currentCaddie.absencesCount + 1 
            };
          } else if (newStatus === CaddieStatus.ON_LEAVE) {
            updatedInput.updates = { 
              ...updatedInput.updates, 
              leaveCount: currentCaddie.leaveCount + 1 
            };
          } else if (newStatus === CaddieStatus.LATE && oldStatus !== CaddieStatus.LATE) {
            updatedInput.updates = { 
              ...updatedInput.updates, 
              lateCount: currentCaddie.lateCount + 1 
            };
          }
        }
      }

      const updatedCaddie = await caddieApiService.updateCaddie(updatedInput);

      set(state => ({
        caddies: state.caddies.map(c => {
          if (c.id !== input.id) return c;
          logger.stateChange(`caddie.${input.id}`, c, updatedCaddie, 'CaddieStore');
          return updatedCaddie;
        }),
      }));

      logger.info(`Caddie updated: ${input.id}`, 'CaddieStore');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update caddie';
      set({ error: errorMessage });
      logger.serviceError('UPDATE_ERROR', errorMessage, error, 'CaddieStore');
    }
  },

  // Delete caddie (soft delete via API)
  deleteCaddie: async (id) => {
    logger.action('deleteCaddie', { id }, 'CaddieStore');

    try {
      await caddieApiService.deleteCaddie(id);

      set(state => ({
        caddies: state.caddies.map(c =>
          c.id === id ? { ...c, isActive: false } : c
        ),
      }));

      logger.info(`Caddie deactivated: ${id}`, 'CaddieStore');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete caddie';
      set({ error: errorMessage });
      logger.serviceError('DELETE_ERROR', errorMessage, error, 'CaddieStore');
    }
  },

  // Bulk update caddies (for dispatch operations) via API
  bulkUpdateCaddies: async (input) => {
    logger.action('bulkUpdateCaddies', { count: input.updates.length } as Record<string, unknown>, 'CaddieStore');

    try {
      const result = await caddieApiService.bulkUpdateCaddies(input);

      const time = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });

      set(state => ({
        caddies: state.caddies.map(c => {
          const update = input.updates.find(u => u.id === c.id);
          if (!update) return c;
          return { ...c, ...update, lastActionTime: time };
        }),
      }));

      // Trigger dispatch popup
      get().setLastDispatchBatch({
        ids: result.dispatched,
        timestamp: result.timestamp,
      });
      get().setShowPopup(true);

      logger.info(`Bulk update completed: ${result.dispatched.length} caddies`, 'CaddieStore');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to bulk update caddies';
      set({ error: errorMessage });
      logger.serviceError('BULK_UPDATE_ERROR', errorMessage, error, 'CaddieStore');
    }
  },

  reorderCaddie: (listId, caddieId, newIndex) => {
    logger.action('reorderCaddie', { listId, caddieId, newIndex }, 'CaddieStore');
    
    // This logic depends on the specific list's caddies. 
    // We'll need to get the list's range to identify relevant caddies.
    // However, since range is in listStore, we'll implement the priority shift here 
    // based on the provided caddieId and newIndex relative to its category peers.
    
    set(state => {
      const caddieToMove = state.caddies.find(c => c.id === caddieId);
      if (!caddieToMove) return state;
      
      const category = caddieToMove.category;
      const categoryCaddies = state.caddies
        .filter(c => c.isActive && c.category === category)
        .sort((a, b) => a.weekendPriority - b.weekendPriority);
      
      const oldIndex = categoryCaddies.findIndex(c => c.id === caddieId);
      if (oldIndex === -1) return state;
      
      const newCategoryCaddies = [...categoryCaddies];
      const [moved] = newCategoryCaddies.splice(oldIndex, 1);
      newCategoryCaddies.splice(newIndex, 0, moved);
      
      const updatedCaddies = state.caddies.map(c => {
        const indexInCategory = newCategoryCaddies.findIndex(nc => nc.id === c.id);
        if (indexInCategory !== -1) {
          return { ...c, weekendPriority: indexInCategory + 1 };
        }
        return c;
      });
      
      return { caddies: updatedCaddies };
    });
  },

  // Reset caddies - refetch from API
  resetCaddies: async () => {
    logger.action('resetCaddies', undefined, 'CaddieStore');

    try {
      set({ loading: true });
      const caddies = await caddieApiService.fetchCaddies();
      set({ caddies, loading: false, error: null });

      logger.info('Caddies reset and refetched from API', 'CaddieStore');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reset caddies';
      set({ loading: false, error: errorMessage });
      logger.serviceError('RESET_ERROR', errorMessage, error, 'CaddieStore');
    }
  },

}));
