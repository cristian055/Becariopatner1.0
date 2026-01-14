import { create } from 'zustand'
import type { ListConfig } from '../types'
import { INITIAL_LISTS, LIST_ORDER_TYPES } from '../constants/app.constants'
import type { UpdateListInput } from '../types/store.types'
import { logger } from '../utils'
import { listApiService } from '../services/listApiService'

interface QueuePosition {
  id: string;
  caddieId: string;
  category: string;
  position: number;
  operationalStatus: string;
  caddie: {
    id: string;
    name: string;
    number: number;
    role: string;
  };
}

interface ListState {
  lists: ListConfig[];
  queues: Record<string, QueuePosition[]>;
  loading: boolean;
  error: string | null;
}

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
  updateList: (input: UpdateListInput) => Promise<void>;
  handleListUpdated: (list: ListConfig) => void;
  randomizeList: (listId: string) => void;
  setListOrder: (listId: string, order: typeof LIST_ORDER_TYPES[keyof typeof LIST_ORDER_TYPES]) => void;
  resetLists: () => void;
  setQueue: (category: string, queuePositions: QueuePosition[]) => void;
  updateQueuePosition: (caddieId: string, updates: Partial<QueuePosition>) => void;
  handleQueueUpdated: (data: { category: string; queuePositions: QueuePosition[] }) => void;
}

export const useListStore = create<ListStore>((set, get) => ({
  // Initial state
  lists: INITIAL_LISTS,
  queues: {},
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
  updateList: async (input) => {
    logger.action('updateList', input, 'ListStore');

    try {
      // Call backend API
      await listApiService.updateList(input);

      // Update local state
      set(state => ({
        lists: state.lists.map(l =>
          l.id === input.id ? { ...l, ...input.updates } : l
        ),
      }));

      logger.info(`List updated: ${input.id}`, 'ListStore');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update list';
      set({ error: errorMessage });
      logger.error('Failed to update list', error as Error, 'ListStore');
    }
  },

  // Handle list updated WebSocket event
  handleListUpdated: (list) => {
    logger.action('handleListUpdated', list, 'ListStore');

    set(state => ({
      lists: state.lists.map(l =>
        l.id === list.id ? {
          ...l,
          rangeStart: list.rangeStart,
          rangeEnd: list.rangeEnd,
          order: list.order,
          name: list.name,
        } : l
      ),
    }));

    logger.info(`List updated via WebSocket: ${list.id}`, 'ListStore');
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
      queues: {},
      error: null,
    });

    logger.info('Lists reset to initial state', 'ListStore');
  },

  // Set queue positions for a category
  setQueue: (category, queuePositions) => {
    logger.action('setQueue', { category, count: queuePositions.length }, 'ListStore');

    set(state => ({
      queues: { ...state.queues, [category]: queuePositions },
    }));

    logger.info(`Queue set for category: ${category}`, 'ListStore');
  },

  // Update a specific queue position
  updateQueuePosition: (caddieId, updates) => {
    logger.action('updateQueuePosition', { caddieId, updates }, 'ListStore');

    set(state => ({
      queues: Object.fromEntries(
        Object.entries(state.queues).map(([cat, positions]) => [
          cat,
          positions.map(p =>
            p.caddieId === caddieId ? { ...p, ...updates } : p
          ),
        ])
      ),
    }));

    logger.info(`Queue position updated: ${caddieId}`, 'ListStore');
  },

  // Handle queue updated WebSocket event
  handleQueueUpdated: (data) => {
    logger.action('handleQueueUpdated', { category: data.category }, 'ListStore');

    set(state => ({
      queues: { ...state.queues, [data.category]: data.queuePositions },
    }));

    logger.info(`Queue updated via WebSocket: ${data.category}`, 'ListStore');
  },
}));
