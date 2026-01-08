import type { ListConfig } from '../types'
import type {
  UpdateListInput,
  CreateListInput,
  ValidationResult} from '../types/store.types'
import {
  ServiceError,
} from '../types/store.types'
import { validateListInput, validateCategoryRange } from '../utils'
import {
  ERROR_CODES,
  SUCCESS_MESSAGES,
} from '../constants/app.constants'
import { logger } from '../utils'

/**
 * ListService - Handles list configuration operations
 * Includes validation, CRUD operations, and management
 */
class ListService {
  /**
   * Validate list input
   */
  validateInput(input: UpdateListInput): ValidationResult {
    logger.debug('Validating list input', 'ListService');

    const validation = validateListInput(input);

    if (!validation.valid) {
      logger.warn('Validation failed', validation.errors, 'ListService');
    }

    return validation;
  }

  /**
   * Validate category range
   */
  validateRange(rangeStart: number, rangeEnd: number): ValidationResult {
    logger.debug('Validating category range', 'ListService');

    const validation = validateCategoryRange(rangeStart, rangeEnd);

    if (!validation.valid) {
      logger.warn('Range validation failed', validation.errors, 'ListService');
    }

    return validation;
  }

  /**
   * Create new list
   */
  async createList(input: CreateListInput, existingLists: ListConfig[]): Promise<ListConfig> {
    logger.action('createList', { input }, 'ListService');

    // Validate input
    const rangeValidation = this.validateRange(input.rangeStart, input.rangeEnd);
    if (!rangeValidation.valid) {
      throw new ServiceError(
        'Invalid category range: ' + rangeValidation.errors.join(', '),
        ERROR_CODES.VALIDATION_ERROR,
        rangeValidation.errors
      );
    }

    if (!input.name.trim()) {
      throw new ServiceError('List name is required', ERROR_CODES.VALIDATION_ERROR);
    }

    // Check for duplicate name
    const duplicateName = existingLists.some(l => l.name.toLowerCase() === input.name.toLowerCase());
    if (duplicateName) {
      throw new ServiceError('List name already exists', ERROR_CODES.CONFLICT);
    }

    // Simulate async operation (for future API integration)
    await new Promise(resolve => setTimeout(resolve, 100));

    const id = `list-${Math.random().toString(36).substring(2, 11)}`;

    const newList: ListConfig = {
      id,
      name: input.name,
      category: input.category,
      order: 'ASC',
      rangeStart: input.rangeStart,
      rangeEnd: input.rangeEnd,
    };

    logger.info(`List created successfully: ${id}`, 'ListService');
    return newList;
  }

  /**
   * Update existing list
   */
  async updateList(
    id: string,
    updates: Partial<ListConfig>,
    existingLists: ListConfig[]
  ): Promise<ListConfig> {
    logger.action('updateList', { id, updates }, 'ListService');

    // Find list
    const list = existingLists.find(l => l.id === id);
    if (!list) {
      throw new ServiceError(`List not found: ${id}`, ERROR_CODES.NOT_FOUND);
    }

    // Validate range if updating
    if (updates.rangeStart !== undefined || updates.rangeEnd !== undefined) {
      const rangeStart = updates.rangeStart ?? list.rangeStart;
      const rangeEnd = updates.rangeEnd ?? list.rangeEnd;
      const rangeValidation = this.validateRange(rangeStart, rangeEnd);

      if (!rangeValidation.valid) {
        throw new ServiceError(
          'Invalid category range: ' + rangeValidation.errors.join(', '),
          ERROR_CODES.VALIDATION_ERROR,
          rangeValidation.errors
        );
      }
    }

    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 50));

    const updatedList: ListConfig = {
      ...list,
      ...updates,
    };

    logger.info(`List updated successfully: ${id}`, 'ListService');
    return updatedList;
  }

  /**
   * Delete list
   */
  async deleteList(id: string, existingLists: ListConfig[]): Promise<void> {
    logger.action('deleteList', { id }, 'ListService');

    const list = existingLists.find(l => l.id === id);
    if (!list) {
      throw new ServiceError(`List not found: ${id}`, ERROR_CODES.NOT_FOUND);
    }

    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 50));

    logger.info(`List deleted successfully: ${id}`, 'ListService');
  }

  /**
   * Get list by ID
   */
  getListById(id: string, lists: ListConfig[]): ListConfig | undefined {
    logger.debug(`Getting list by ID: ${id}`, 'ListService');

    return lists.find(l => l.id === id);
  }

  /**
   * Get lists by category
   */
  getListsByCategory(
    category: ListConfig['category'],
    lists: ListConfig[]
  ): ListConfig[] {
    logger.debug(`Getting lists by category: ${category}`, 'ListService');

    return lists.filter(l => l.category === category);
  }

  /**
   * Reorder list (manual order)
   */
  async reorderList(
    id: string,
    order: 'MANUAL',
    existingLists: ListConfig[]
  ): Promise<ListConfig> {
    logger.action('reorderList', { id, order }, 'ListService');

    const list = existingLists.find(l => l.id === id);
    if (!list) {
      throw new ServiceError(`List not found: ${id}`, ERROR_CODES.NOT_FOUND);
    }

    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 50));

    const updatedList: ListConfig = {
      ...list,
      order,
    };

    logger.info(`List reordered to MANUAL: ${id}`, 'ListService');
    return updatedList;
  }

  /**
   * Randomize list order
   */
  async randomizeList(id: string, existingLists: ListConfig[]): Promise<ListConfig> {
    logger.action('randomizeList', { id }, 'ListService');

    const list = existingLists.find(l => l.id === id);
    if (!list) {
      throw new ServiceError(`List not found: ${id}`, ERROR_CODES.NOT_FOUND);
    }

    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 50));

    const updatedList: ListConfig = {
      ...list,
      order: 'RANDOM',
    };

    logger.info(`List randomized: ${id}`, 'ListService');
    return updatedList;
  }

  /**
   * Get list statistics
   */
  getListStatistics(lists: ListConfig[]) {
    const totalLists = lists.length;
    const byCategory: Record<string, number> = {
      Primera: lists.filter(l => l.category === 'Primera').length,
      Segunda: lists.filter(l => l.category === 'Segunda').length,
      Tercera: lists.filter(l => l.category === 'Tercera').length,
    };

    const byOrder: Record<string, number> = {
      ASC: lists.filter(l => l.order === 'ASC').length,
      DESC: lists.filter(l => l.order === 'DESC').length,
      RANDOM: lists.filter(l => l.order === 'RANDOM').length,
      MANUAL: lists.filter(l => l.order === 'MANUAL').length,
    };

    return {
      total: totalLists,
      byCategory,
      byOrder,
    };
  }
}

// Export singleton instance
export const listService = new ListService();
