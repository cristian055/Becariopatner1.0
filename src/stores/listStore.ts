import { create } from 'zustand'
import type { ListConfig } from '../types'
import type { ListState, UpdateListInput } from '../types/store.types'
import { logger } from '../utils'
import { listsApi } from '../services/api'

/**
 * ListStore - Global state for list configuration management
 * Handles list CRUD operations and state updates with backend API integration
 */
interface ListStore extends ListState {
  // Actions
  setLists: (lists: ListConfig[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchLists: () => Promise<void>;
  updateList: (input: UpdateListInput) => Promise<void>;
  randomizeList: (listId: string) => Promise<void>;
  setListOrder: (listId: string, order: 'ASC' | 'DESC' | 'RANDOM' | 'MANUAL') => Promise<void>;
  resetLists: () => Promise<void>;
}

export const useListStore = create<ListStore>((set, get) => ({
  // Initial state
  lists: [],
  loading: false,
  error: null,

  // Set lists
  setLists: (lists) => {
    logger.stateChange('lists', get().lists.length, lists.length, 'ListStore');
    set({ lists });
  },

  // Set loading state
  setLoading: (loading) => {
    set({ loading });
  },

  // Set error state
  setError: (error) => {
    set({ error });
    if (error) {
      logger.error('List store error:', new Error(error), 'ListStore');
    }
  },

  // Fetch lists from backend
  fetchLists: async () => {
    try {
      set({ loading: true, error: null });
      logger.info('Fetching lists from backend...', 'ListStore');

      const lists = await listsApi.getAll();
      set({ lists, loading: false });
      
      logger.info(`Fetched ${lists.length} lists from backend`, 'ListStore');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch lists';
      set({ loading: false, error: errorMessage });
      logger.serviceError('FETCH_ERROR', errorMessage, error, 'ListStore');
    }
  },

  // Update list configuration via backend
  updateList: async (input) => {
    logger.action('updateList', input, 'ListStore');

    try {
      const updatedList = await listsApi.update(input.id, input.updates);
      
      set(state => ({
        lists: state.lists.map(l =>
          l.id === input.id ? updatedList : l
        ),
      }));

      logger.info(`List updated: ${input.id}`, 'ListStore');
    } catch (error) {
      logger.error('Failed to update list', error as Error, 'ListStore');
      // Fallback to local update
      set(state => ({
        lists: state.lists.map(l =>
          l.id === input.id ? { ...l, ...input.updates } : l
        ),
      }));
    }
  },

  // Randomize list (set order to RANDOM) via backend
  randomizeList: async (listId) => {
    logger.action('randomizeList', { listId }, 'ListStore');

    try {
      await get().setListOrder(listId, 'RANDOM');
      logger.info(`List randomized: ${listId}`, 'ListStore');
    } catch (error) {
      logger.error('Failed to randomize list', error as Error, 'ListStore');
    }
  },

  // Set list order via backend
  setListOrder: async (listId, order) => {
    logger.action('setListOrder', { listId, order }, 'ListStore');

    try {
      const updatedList = await listsApi.update(listId, { order });
      
      set(state => ({
        lists: state.lists.map(l =>
          l.id === listId ? updatedList : l
        ),
      }));

      logger.info(`List order set: ${listId} -> ${order}`, 'ListStore');
    } catch (error) {
      logger.error('Failed to set list order', error as Error, 'ListStore');
      // Fallback to local update
      set(state => ({
        lists: state.lists.map(l =>
          l.id === listId ? { ...l, order } : l
        ),
      }));
    }
  },

  // Reset lists by fetching from backend
  resetLists: async () => {
    logger.action('resetLists', null, 'ListStore');

    try {
      await get().fetchLists();
      set({ error: null });
      logger.info('Lists reset from backend', 'ListStore');
    } catch (error) {
      logger.error('Failed to reset lists', error as Error, 'ListStore');
      set({ lists: [], error: 'Failed to reset lists' });
    }
  },
}));
