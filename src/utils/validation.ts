import {
  VALIDATION,
  ERROR_CODES,
  ERROR_MESSAGES,
} from '../constants/app.constants'
import type { ValidationResult, CreateCaddieInput, UpdateListInput } from '../types/store.types'
import type { Caddie } from '../types'

/**
 * Validate caddie number
 * @param number - Caddie number to validate
 * @returns Validation result
 */
export const validateCaddieNumber = (number: number): ValidationResult => {
  const errors: string[] = [];

  if (number < VALIDATION.MIN_CADDIE_NUMBER || number > VALIDATION.MAX_CADDIE_NUMBER) {
    errors.push(ERROR_MESSAGES.INVALID_CADDIE_NUMBER);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validate caddie name
 * @param name - Caddie name to validate
 * @returns Validation result
 */
export const validateCaddieName = (name: string): ValidationResult => {
  const errors: string[] = [];

  if (!name || name.trim().length < VALIDATION.MIN_CADDIE_NAME_LENGTH) {
    errors.push(ERROR_MESSAGES.REQUIRED_FIELD);
  }

  if (name.length > VALIDATION.MAX_CADDIE_NAME_LENGTH) {
    errors.push('Name must be less than 100 characters');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validate category range
 * @param rangeStart - Start of category range
 * @param rangeEnd - End of category range
 * @returns Validation result
 */
export const validateCategoryRange = (
  rangeStart: number,
  rangeEnd: number
): ValidationResult => {
  const errors: string[] = [];

  if (rangeStart < VALIDATION.MIN_CATEGORY_START) {
    errors.push('Range start must be at least 1');
  }

  if (rangeEnd > VALIDATION.MAX_CATEGORY_END) {
    errors.push('Range end must be less than 1000');
  }

  if (rangeStart >= rangeEnd) {
    errors.push(ERROR_MESSAGES.INVALID_RANGE);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validate list configuration
 * @param input - List configuration to validate
 * @returns Validation result
 */
export const validateListInput = (input: UpdateListInput): ValidationResult => {
  const errors: string[] = [];

  if (input.updates.rangeStart !== undefined || input.updates.rangeEnd !== undefined) {
    const rangeStart = input.updates.rangeStart ?? 1;
    const rangeEnd = input.updates.rangeEnd ?? 100;

    const rangeValidation = validateCategoryRange(rangeStart, rangeEnd);
    errors.push(...rangeValidation.errors);
  }

  if (input.updates.name !== undefined && !input.updates.name.trim()) {
    errors.push('List name is required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validate create caddie input
 * @param input - Caddie creation input
 * @returns Validation result
 */
export const validateCreateCaddieInput = (
  input: CreateCaddieInput,
  existingCaddies: Caddie[]
): ValidationResult => {
  const errors: string[] = [];

  // Validate name
  const nameValidation = validateCaddieName(input.name);
  errors.push(...nameValidation.errors);

  // Validate number
  const numberValidation = validateCaddieNumber(input.number);
  errors.push(...numberValidation.errors);

  // Check for duplicate number
  const duplicateNumber = existingCaddies.some(c => c.number === input.number);
  if (duplicateNumber) {
    errors.push(ERROR_MESSAGES.DUPLICATE_CADDIE_NUMBER);
  }

  // Validate category
  const validCategories = ['Primera', 'Segunda', 'Tercera'];
  if (!input.category) {
    errors.push('Category is required');
  } else if (!validCategories.includes(input.category)) {
    errors.push('Category must be Primera, Segunda, or Tercera');
  }

  // Validate location
  if (!input.location) {
    errors.push('Location is required');
  }

  // Validate role
  if (!input.role) {
    errors.push('Role is required');
  }

  // Validate availability
  if (!input.availability || input.availability.length === 0) {
    errors.push('At least one day of availability is required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validate search term
 * @param searchTerm - Search term to validate
 * @returns True if search term is valid
 */
export const validateSearchTerm = (searchTerm: string): boolean => {
  return searchTerm.trim().length >= 1;
};

/**
 * Sanitize search term
 * @param searchTerm - Search term to sanitize
 * @returns Sanitized search term
 */
export const sanitizeSearchTerm = (searchTerm: string): string => {
  return searchTerm.trim().toLowerCase();
};

/**
 * Validate time string format
 * @param timeStr - Time string to validate
 * @returns True if time format is valid
 */
export const isValidTimeFormat = (timeStr: string): boolean => {
  if (!timeStr) return false;

  // Check 24h format (HH:mm)
  const time24hRegex = /^([01]?[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
  if (time24hRegex.test(timeStr)) return true;

  // Check 12h format (h:mm AM/PM)
  const time12hRegex = /^([1-9]|1[0-2]):[0-5][0-9]\s(AM|PM)$/i;
  return time12hRegex.test(timeStr);
};
