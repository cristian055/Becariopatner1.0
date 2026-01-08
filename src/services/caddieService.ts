import type { Caddie } from '../types'
import { CaddieStatus } from '../types'
import type {
  CreateCaddieInput,
  ValidationResult,
  BulkUpdateInput,
} from '../types/store.types'
import {
  validateCreateCaddieInput,
  validateCaddieNumber,
  logger,
} from '../utils'


/**
 * CaddieService - Handles all caddie-related operations
 * Includes validation, CRUD operations, and data management
 */

class CaddieService {
  /**
   * Validate caddie creation input
   */
  validateCreateInput(
    input: CreateCaddieInput,
    existingCaddies: Caddie[]
  ): ValidationResult {
    logger.debug('Validating caddie creation input', 'CaddieService');

    const validation = validateCreateCaddieInput(input, existingCaddies);

    if (!validation.valid) {
      logger.warn('Validation failed', validation.errors, 'CaddieService');
    }

    return validation;
  }

  /**
   * Validate caddie number uniqueness
   */
  validateCaddieNumberUniqueness(
    number: number,
    excludeId?: string,
    caddies: Caddie[]
  ): ValidationResult {
    const duplicateCaddie = caddies.find(
      c => c.number === number && c.id !== excludeId
    );

    if (duplicateCaddie) {
      logger.warn(`Duplicate caddie number detected: ${number}`, 'CaddieService');
      return {
        valid: false,
        errors: [`Caddie number ${number} is already assigned`],
      };
    }

    return { valid: true, errors: [] };
  }

  /**
   * Create new caddie (in-memory for now, will be API call in future)
   */
  async createCaddie(
    input: CreateCaddieInput,
    existingCaddies: Caddie[]
  ): Promise<Caddie> {
    logger.action('createCaddie', { input }, 'CaddieService');

    // Validate input
    const validation = this.validateCreateInput(input, existingCaddies);
    if (!validation.valid) {
      throw new ServiceError(
        'Validation failed: ' + validation.errors.join(', '),
        ERROR_CODES.VALIDATION_ERROR,
        validation.errors
      );
    }

    // Simulate async operation (for future API integration)
    await new Promise(resolve => setTimeout(resolve, 100));

    const time = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    const id = `c-${Math.random().toString(36).substring(2, 11)}`;

    const newCaddie: Caddie = {
      ...input,
      id,
      status: CaddieStatus.AVAILABLE,
      listId: null,
      historyCount: 0,
      absencesCount: 0,
      lateCount: 0,
      leaveCount: 0,
      lastActionTime: time,
      weekendPriority: input.weekendPriority || input.number,
      isActive: false
    };

    logger.info(`Caddie created successfully: ${id}`, 'CaddieService');
    return newCaddie;
  }

  /**
   * Update existing caddie
   */
  async updateCaddie(
    id: string,
    updates: Partial<Caddie>,
    existingCaddies: Caddie[]
  ): Promise<Caddie> {
    logger.action('updateCaddie', { id, updates }, 'CaddieService');

    // Find caddie
    const caddie = existingCaddies.find(c => c.id === id);
    if (!caddie) {
      throw new ServiceError(
        `Caddie not found: ${id}`,
        ERROR_CODES.NOT_FOUND
      );
    }

    // Validate number uniqueness if number is being updated
    if (updates.number !== undefined) {
      const numberValidation = this.validateCaddieNumberUniqueness(
        updates.number,
        id,
        existingCaddies
      );
      if (!numberValidation.valid) {
        throw new ServiceError(
          numberValidation.errors.join(', '),
          ERROR_CODES.CONFLICT
        );
      }
    }

    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 50));

    const time = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const updatedCaddie: Caddie = {
      ...caddie,
      ...updates,
      lastActionTime: time,
    };

    logger.info(`Caddie updated successfully: ${id}`, 'CaddieService');
    return updatedCaddie;
  }

  /**
   * Bulk update caddies (for dispatch operations)
   */
  async bulkUpdateCaddies(input: BulkUpdateInput): Promise<void> {
    logger.action('bulkUpdateCaddies', { count: input.updates.length }, 'CaddieService');

    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 50));

    logger.info(`Bulk update completed: ${input.updates.length} caddies`, 'CaddieService');
  }

  /**
   * Delete caddie (soft delete - deactivate)
   */
  async deleteCaddie(id: string, existingCaddies: Caddie[]): Promise<void> {
    logger.action('deleteCaddie', { id }, 'CaddieService');

    const caddie = existingCaddies.find(c => c.id === id);
    if (!caddie) {
      throw new ServiceError(`Caddie not found: ${id}`, ERROR_CODES.NOT_FOUND);
    }

    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 50));

    logger.info(`Caddie deactivated: ${id}`, 'CaddieService');
  }

  /**
   * Fetch caddies (in-memory for now, will be API call in future)
   */
  async fetchCaddies(): Promise<Caddie[]> {
    logger.info('Fetching caddies...', 'CaddieService');

    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 100));

    // For now, return empty array (store initializes data)
    const caddies: Caddie[] = [];

    logger.debug(`Fetched ${caddies.length} caddies`, 'CaddieService');
    return caddies;
  }

  /**
   * Get caddie by ID
   */
  getCaddieById(id: string, caddies: Caddie[]): Caddie | undefined {
    logger.debug(`Getting caddie by ID: ${id}`, 'CaddieService');

    return caddies.find(c => c.id === id);
  }

  /**
   * Get caddies by number
   */
  getCaddieByNumber(number: number, caddies: Caddie[]): Caddie | undefined {
    logger.debug(`Getting caddie by number: ${number}`, 'CaddieService');

    return caddies.find(c => c.number === number);
  }

  /**
   * Get caddie statistics
   */
  getCaddieStatistics(caddies: Caddie[]) {
    const totalCaddies = caddies.length;
    const activeCaddies = caddies.filter(c => c.isActive).length;
    const inactiveCaddies = totalCaddies - activeCaddies;

    const byStatus: Record<string, number> = {};
    Object.values(CaddieStatus).forEach(status => {
      byStatus[status] = caddies.filter(c => c.status === status).length;
    });

    const byCategory: Record<string, number> = {
      Primera: caddies.filter(c => c.category === 'Primera').length,
      Segunda: caddies.filter(c => c.category === 'Segunda').length,
      Tercera: caddies.filter(c => c.category === 'Tercera').length,
    };

    const byLocation: Record<string, number> = {
      Llanogrande: caddies.filter(c => c.location === 'Llanogrande').length,
      'Medellín': caddies.filter(c => c.location === 'Medellín').length,
    };

    const byRole: Record<string, number> = {
      Golf: caddies.filter(c => String(c.role) === 'Golf').length,
      Tennis: caddies.filter(c => String(c.role) === 'Tennis').length,
      Hybrid: caddies.filter(c => String(c.role) === 'Hybrid').length,
    };

    return {
      total: totalCaddies,
      active: activeCaddies,
      inactive: inactiveCaddies,
      byStatus,
      byCategory,
      byLocation,
      byRole,
    };
  }
}

// Export singleton instance
export const caddieService = new CaddieService();
