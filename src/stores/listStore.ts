import { create } from 'zustand'
import type { ListConfig } from '../types'
import { INITIAL_LISTS, LIST_ORDER_TYPES } from '../constants/app.constants'
import type { ListState, UpdateListInput } from '../types/store.types'
import { logger } from '../utils'
import { listApiService } from '../services/listApiService'

/**
 * ListStore - Global state for list configuration management
 * Handles list CRUD operations and state updates
 */
interface ListStore extends ListState {
  // Actions
  setLists: (lists: ListConfig[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchLists: () => Promise<void>;
  updateList: (input: UpdateListInput) => void;
  randomizeList: (listId: string) => void;
  setListOrder: (listId: string, order: typeof LIST_ORDER_TYPES[keyof typeof LIST_ORDER_TYPES]) => void;
  resetLists: () => void;
}

export const useListStore = create<ListStore>((set, get) => ({
  // Initial state
  lists: INITIAL_LISTS,
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

  // Fetch lists from API
  fetchLists: async () => {
    try {
      set({ loading: true, error: null });
      logger.info('Fetching lists...', 'ListStore');

      const lists = await listApiService.fetchLists();

      set({ lists, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch lists';
      set({ loading: false, error: errorMessage });
      logger.serviceError('FETCH_ERROR', errorMessage, error, 'ListStore');
    }
  },

  // Update list configuration
  updateList: (input) => {
    logger.action('updateList', input, 'ListStore');

    try {
      set(state => ({
        lists: state.lists.map(l =>
          l.id === input.id ? { ...l, ...input.updates } : l
        ),
      }));

      logger.info(`List updated: ${input.id}`, 'ListStore');
    } catch (error) {
      logger.error('Failed to update list', error as Error, 'ListStore');
    }
  },

  // Randomize list (set order to RANDOM)
  randomizeList: (listId) => {
    logger.action('randomizeList', { listId }, 'ListStore');

    setListOrder(listId, LIST_ORDER_TYPES.RANDOM);
    logger.info(`List randomized: ${listId}`, 'ListStore');
  },

  // Set list order
  setListOrder: (listId, order) => {
    logger.action('setListOrder', { listId, order }, 'ListStore');

    set(state => ({
      lists: state.lists.map(l =>
        l.id === listId ? { ...l, order } : l
      ),
    }));

    logger.info(`List order set: ${listId} -> ${order}`, 'ListStore');
  },

  // Reset lists to initial state
  resetLists: () => {
    logger.action('resetLists', null, 'ListStore');

    set({
      lists: INITIAL_LISTS,
      error: null,
    });

    logger.info('Lists reset to initial state', 'ListStore');
  },
}));
