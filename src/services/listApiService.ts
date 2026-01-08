/**
 * Real List API Service
 * Connects to backend API for list operations
 */

import { request } from './apiClient'
import type { ListConfig } from '../types'
import type { UpdateListInput } from '../types/store.types'

interface ListsResponse {
  lists: ListConfig[]
}

interface ListResponse {
  list: ListConfig
}

/**
 * Get all lists
 */
async function fetchLists(): Promise<ListConfig[]> {
  const response = await request<ListsResponse>('/lists')
  return response.lists
}

/**
 * Get list by category
 */
async function fetchListByCategory(
  category: 'Primera' | 'Segunda' | 'Tercera'
): Promise<ListConfig | undefined> {
  try {
    const response = await request<ListResponse>(`/lists/category/${category}`)
    return response.list
  } catch (error) {
    return undefined
  }
}

/**
 * Update list configuration
 */
async function updateList(input: UpdateListInput): Promise<ListConfig> {
  return await request<ListConfig>(`/lists/${input.id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}

/**
 * Randomize list order
 */
async function randomizeList(id: string): Promise<{ message: string }> {
  return await request<{ message: string }>(`/lists/${id}/randomize`, {
    method: 'POST',
  })
}

/**
 * Set list order
 */
async function setListOrder(
  id: string,
  order: 'ASC' | 'DESC' | 'RANDOM' | 'MANUAL'
): Promise<ListConfig> {
  return await updateList({ id, updates: { order } })
}

export const listApiService = {
  fetchLists,
  fetchListByCategory,
  updateList,
  randomizeList,
  setListOrder,
}
