import { useCallback, useMemo } from 'react'
import type { ListConfig } from '../types'
import { useListStore } from '../stores'
import {
  LIST_ORDER_TYPES,
} from '../constants/app.constants'

/**
 * useLists - Custom hook for list management
 * Provides list CRUD operations and order management
 */
interface UseListsProps {
  categoryId?: 'Primera' | 'Segunda' | 'Tercera';
}

export const useLists = (props: UseListsProps = {}) => {
  const { lists, updateList, randomizeList, setListOrder } = useListStore();

  /**
   * Get lists by category
   */
  const getListsByCategory = (category: ListConfig['category']): ListConfig[] => {
    return lists.filter(l => l.category === category);
  };

  /**
   * Get list by ID
   */
  const getListById = (id: string): ListConfig | undefined => {
    return lists.find(l => l.id === id);
  };

  /**
   * Get list for specific category
   */
  const getListForCategory = (category: ListConfig['category']): ListConfig | undefined => {
    return getListsByCategory(category)[0];
  };

  /**
   * Update list range
   */
  const updateListRange = useCallback((
    id: string,
    rangeStart: number,
    rangeEnd: number,
  ) => {
    updateList({
      id,
      updates: {
        rangeStart,
        rangeEnd,
      },
    });
  }, [updateList]);

  /**
   * Randomize list
   */
  const randomizeCategoryList = useCallback((id: string) => {
    randomizeList(id);
  }, [randomizeList]);

  /**
   * Set list order
   */
  const setListOrder = useCallback((
    id: string,
    order: typeof LIST_ORDER_TYPES[keyof typeof LIST_ORDER_TYPES],
  ) => {
    setListOrder(id, order);
  }, [setListOrder]);

  /**
   * Statistics
   */
  const statistics = useMemo(() => {
    const total = lists.length;
    const byCategory: Record<string, number> = {
      Primera: lists.filter(l => l.category === 'Primera').length,
      Segunda: lists.filter(l => l.category === 'Segunda').length,
      Tercera: lists.filter(l => l.category === 'Tercera').length,
    };

    const byOrder: Record<string, number> = {
      ASC: lists.filter(l => l.order === LIST_ORDER_TYPES.ASC).length,
      DESC: lists.filter(l => l.order === LIST_ORDER_TYPES.DESC).length,
      RANDOM: lists.filter(l => l.order === LIST_ORDER_TYPES.RANDOM).length,
      MANUAL: lists.filter(l => l.order === LIST_ORDER_TYPES.MANUAL).length,
    };

    return {
      total,
      byCategory,
      byOrder,
    };
  }, [lists]);

  // If categoryId is provided, get that list
  const currentList = props.categoryId ? getListForCategory(props.categoryId) : undefined;

  return {
    // Data
    lists,
    currentList,

    // Actions
    updateList,
    updateListRange,
    randomizeCategoryList,
    setListOrder,

    // Getters
    getListsByCategory,
    getListById,
    getListForCategory,

    // Statistics
    statistics,
  };
};
