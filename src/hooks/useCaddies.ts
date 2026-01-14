import React from 'react'
import type { Caddie } from '../types'
import { useCaddieStore } from '../stores'
import {
  filterBySearchTerm,
  filterByCategory,
  filterByActiveStatus,
  filterByLocation,
  filterByRole,
  filterByAvailability,
  filterForQueue,
  filterForReturns,
} from '../utils'
import { logger } from '../utils'

/**
 * useCaddies - Custom hook for caddie data operations
 * Provides filtering, sorting, and CRUD operations
 */
interface UseCaddiesProps {
  includeInactive?: boolean
}

export const useCaddies = (props: UseCaddiesProps = {}) => {
  const { caddies, loading, error, createCaddie, updateCaddie, deleteCaddie } = useCaddieStore()

  const [searchTerm, setSearchTerm] = React.useState('')

  const [filters, setFilters] = React.useState({
    category: undefined as 'All' | 'Primera' | 'Segunda' | 'Tercera' | undefined,
    activeStatus: undefined as 'All' | 'Active' | 'Inactive' | undefined,
    location: undefined as 'Llanogrande' | 'Medellín' | undefined,
    role: undefined as 'Golf' | 'Tennis' | 'Hybrid' | undefined,
  })

  /**
   * Filter caddies based on current filters
   */
  const filteredCaddies = React.useMemo(() => {
    let result = caddies

    // Apply all filters
    if (searchTerm) {
      result = filterBySearchTerm(result, searchTerm)
    }

    if (filters.category) {
      result = filterByCategory(result, filters.category)
    }

    if (filters.activeStatus) {
      result = filterByActiveStatus(result, filters.activeStatus)
    }

    if (filters.location) {
      result = filterByLocation(result, filters.location)
    }

    if (filters.role) {
      result = filterByRole(result, filters.role)
    }

    logger.debug(`Filtered ${result.length} caddies from ${caddies.length} total`, 'useCaddies')
    return result
  }, [caddies, searchTerm, filters])

  /**
   * Get caddies for queue (active and available/late)
   */
  const queueCaddies = React.useMemo(() => {
    return filterForQueue(caddies)
  }, [caddies])

  /**
   * Get caddies that need to return
   */
  const returnCaddies = React.useMemo(() => {
    return filterForReturns(caddies)
  }, [caddies])

  /**
   * Get caddies by availability on specific day
   */
  const getCaddiesByAvailability = React.useCallback(
    (day: string, includeInactive = false): Caddie[] => {
      logger.debug(`Getting caddies by availability: ${day}`, 'useCaddies')

      if (includeInactive) {
        return caddies.filter((c) => {
          const availability = c.availability.find((a) => a.day === day)
          return availability && availability.isAvailable
        })
      }

      return filterByAvailability(caddies, day)
    },
    [caddies]
  )

  /**
   * Get caddie statistics
   */
  const statistics = React.useMemo(() => {
    const total = caddies.length
    const active = caddies.filter((c) => c.isActive).length
    const inactive = total - active

    const byStatus: Record<string, number> = {}
    const statusValues = ['AVAILABLE', 'IN_PREP', 'IN_FIELD', 'LATE', 'ABSENT', 'ON_LEAVE']
    statusValues.forEach((status) => {
      byStatus[status] = caddies.filter((c) => c.status === status).length
    })

    const byCategory: Record<string, number> = {
      Primera: caddies.filter((c) => c.category === 'Primera').length,
      Segunda: caddies.filter((c) => c.category === 'Segunda').length,
      Tercera: caddies.filter((c) => c.category === 'Tercera').length,
    }

    return {
      total,
      active,
      inactive,
      byStatus,
      byCategory,
    }
  }, [caddies])

  /**
   * Clear all filters
   */
  const clearFilters = React.useCallback(() => {
    setFilters({
      category: undefined,
      activeStatus: undefined,
      location: undefined,
      role: undefined,
    })
    logger.debug('Filters cleared', 'useCaddies')
  }, [])

  /**
   * Clear search term
   */
  const clearSearch = React.useCallback(() => {
    setSearchTerm('')
    logger.debug('Search cleared', 'useCaddies')
  }, [])

  return {
    // Data
    caddies,
    filteredCaddies,
    queueCaddies,
    returnCaddies,
    loading,
    error,

    // Search & filters
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    clearFilters,
    clearSearch,

    // Operations
    createCaddie,
    updateCaddie,
    deleteCaddie,

    // Specialized getters
    getCaddiesByAvailability,
    statistics,
  }
}
