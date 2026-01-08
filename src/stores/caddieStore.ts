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
import { caddiesApi } from '../services/api'

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

  // Fetch caddies from backend API
  fetchCaddies: async () => {
    try {
      set({ loading: true, error: null });
      logger.info('Fetching caddies from backend...', 'CaddieStore');

      const caddies = await caddiesApi.getAll();
      set({ caddies, loading: false });
      
      logger.info(`Fetched ${caddies.length} caddies from backend`, 'CaddieStore');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch caddies';
      set({ loading: false, error: errorMessage });
      logger.serviceError('FETCH_ERROR', errorMessage, error, 'CaddieStore');
    }
  },

  // Create new caddie via backend API
  createCaddie: async (input) => {
    try {
      set({ loading: true, error: null });
      logger.action('createCaddie', input as unknown as Record<string, unknown>, 'CaddieStore');

      const newCaddie = await caddiesApi.create(input);

      set(state => ({
        caddies: [...state.caddies, newCaddie],
        loading: false,
      }));

      logger.info(`Caddie created: ${newCaddie.id}`, 'CaddieStore');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create caddie';
      set({ loading: false, error: errorMessage });
      logger.serviceError('CREATE_ERROR', errorMessage, error, 'CaddieStore');
      throw error;
    }
  },

  // Update existing caddie via backend API
  updateCaddie: async (input) => {
    logger.action('updateCaddie', input as unknown as Record<string, unknown>, 'CaddieStore');

    try {
      const time = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });

      // Get the current caddie to check status changes
      const currentCaddie = get().caddies.find(c => c.id === input.id);
      if (!currentCaddie) {
        throw new Error(`Caddie not found: ${input.id}`);
      }

      const updates = { ...input.updates };
      
      // Increment counters when status changes to specific values
      if (updates.status) {
        const oldStatus = currentCaddie.status;
        const newStatus = updates.status;
        
        // Only increment if transitioning from a different status
        if (oldStatus !== newStatus) {
          if (newStatus === CaddieStatus.ABSENT && oldStatus !== CaddieStatus.ABSENT) {
            updates.absencesCount = (currentCaddie.absencesCount || 0) + 1;
          }
          if (newStatus === CaddieStatus.ON_LEAVE && oldStatus !== CaddieStatus.ON_LEAVE) {
            updates.leaveCount = (currentCaddie.leaveCount || 0) + 1;
          }
          if (newStatus === CaddieStatus.LATE && oldStatus !== CaddieStatus.LATE) {
            updates.lateCount = (currentCaddie.lateCount || 0) + 1;
          }
        }
      }

      // Update in backend
      const updatedCaddie = await caddiesApi.update(input.id, updates);

      // Update local state
      set(state => ({
        caddies: state.caddies.map(c => 
          c.id === input.id ? { ...updatedCaddie, lastActionTime: time } : c
        ),
      }));

      logger.info(`Caddie updated: ${input.id}`, 'CaddieStore');
    } catch (error) {
      logger.error('Failed to update caddie', error as Error, 'CaddieStore');
      // Keep local state as fallback
      const time = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });

      set(state => ({
        caddies: state.caddies.map(c => {
          if (c.id !== input.id) return c;
          
          const updates = { ...input.updates };
          
          // Increment counters when status changes to specific values
          if (updates.status) {
            const oldStatus = c.status;
            const newStatus = updates.status;
            
            // Only increment if transitioning from a different status
            if (oldStatus !== newStatus) {
              if (newStatus === CaddieStatus.ABSENT && oldStatus !== CaddieStatus.ABSENT) {
                updates.absencesCount = (c.absencesCount || 0) + 1;
              }
              if (newStatus === CaddieStatus.ON_LEAVE && oldStatus !== CaddieStatus.ON_LEAVE) {
                updates.leaveCount = (c.leaveCount || 0) + 1;
              }
              if (newStatus === CaddieStatus.LATE && oldStatus !== CaddieStatus.LATE) {
                updates.lateCount = (c.lateCount || 0) + 1;
              }
            }
          }
          
          logger.stateChange(`caddie.${input.id}`, c, { ...c, ...updates }, 'CaddieStore');
          return { ...c, ...updates, lastActionTime: time };
        }),
      }));
    }
  },

  // Delete caddie (soft delete - set inactive) via backend API
  deleteCaddie: async (id) => {
    logger.action('deleteCaddie', { id }, 'CaddieStore');

    try {
      await caddiesApi.delete(id);
      
      set(state => ({
        caddies: state.caddies.map(c =>
          c.id === id ? { ...c, isActive: false } : c
        ),
      }));

      logger.info(`Caddie deactivated: ${id}`, 'CaddieStore');
    } catch (error) {
      logger.error('Failed to delete caddie', error as Error, 'CaddieStore');
      // Fallback to local update
      set(state => ({
        caddies: state.caddies.map(c =>
          c.id === id ? { ...c, isActive: false } : c
        ),
      }));
    }
  },

  // Bulk update caddies (for dispatch operations) via backend API
  bulkUpdateCaddies: async (input) => {
    logger.action('bulkUpdateCaddies', { count: input.updates.length } as Record<string, unknown>, 'CaddieStore');

    try {
      const time = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      const ids = input.updates.map(u => u.id);

      // Call backend API for bulk update
      await caddiesApi.bulkUpdateStatus(ids, input.updates[0].status!);

      // Update local state with counter increments
      set(state => ({
        caddies: state.caddies.map(c => {
          const update = input.updates.find(u => u.id === c.id);
          if (!update) return c;
          
          const updates = { ...update };
          
          // Increment counters when status changes to specific values
          if (updates.status) {
            const oldStatus = c.status;
            const newStatus = updates.status;
            
            // Only increment if transitioning from a different status
            if (oldStatus !== newStatus) {
              if (newStatus === CaddieStatus.ABSENT && oldStatus !== CaddieStatus.ABSENT) {
                updates.absencesCount = (c.absencesCount || 0) + 1;
              }
              if (newStatus === CaddieStatus.ON_LEAVE && oldStatus !== CaddieStatus.ON_LEAVE) {
                updates.leaveCount = (c.leaveCount || 0) + 1;
              }
              if (newStatus === CaddieStatus.LATE && oldStatus !== CaddieStatus.LATE) {
                updates.lateCount = (c.lateCount || 0) + 1;
              }
            }
          }
          
          return { ...c, ...updates, lastActionTime: time };
        }),
      }));

      // Trigger dispatch popup
      get().setLastDispatchBatch({
        ids,
        timestamp: Date.now(),
      });
      get().setShowPopup(true);

      logger.info(`Bulk update completed: ${ids.length} caddies`, 'CaddieStore');
    } catch (error) {
      logger.error('Failed to bulk update caddies', error as Error, 'CaddieStore');
      
      // Fallback to local update
      const time = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      const ids = input.updates.map(u => u.id);

      set(state => ({
        caddies: state.caddies.map(c => {
          const update = input.updates.find(u => u.id === c.id);
          if (!update) return c;
          
          const updates = { ...update };
          
          // Increment counters when status changes to specific values
          if (updates.status) {
            const oldStatus = c.status;
            const newStatus = updates.status;
            
            // Only increment if transitioning from a different status
            if (oldStatus !== newStatus) {
              if (newStatus === CaddieStatus.ABSENT && oldStatus !== CaddieStatus.ABSENT) {
                updates.absencesCount = (c.absencesCount || 0) + 1;
              }
              if (newStatus === CaddieStatus.ON_LEAVE && oldStatus !== CaddieStatus.ON_LEAVE) {
                updates.leaveCount = (c.leaveCount || 0) + 1;
              }
              if (newStatus === CaddieStatus.LATE && oldStatus !== CaddieStatus.LATE) {
                updates.lateCount = (c.lateCount || 0) + 1;
              }
            }
          }
          
          return { ...c, ...updates, lastActionTime: time };
        }),
      }));
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

  // Reset caddies by fetching from backend
  resetCaddies: async () => {
    logger.action('resetCaddies', undefined, 'CaddieStore');

    try {
      await get().fetchCaddies();
      set({ error: null });
      logger.info('Caddies reset from backend', 'CaddieStore');
    } catch (error) {
      logger.error('Failed to reset caddies', error as Error, 'CaddieStore');
      set({ caddies: [], error: 'Failed to reset caddies' });
    }
  },

}));
