/**
 * Queue API Service
 * Handles queue position API requests
 */

import { request } from './apiClient'
import type { QueuePosition } from '../stores/listStore'

interface QueuePositionsResponse {
  queuePositions: QueuePosition[]
}

/**
 * Get queue positions for a specific category
 */
async function fetchQueueByCategory(
  category: 'PRIMERA' | 'SEGUNDA' | 'TERCERA'
): Promise<QueuePosition[]> {
  const response = await request<QueuePositionsResponse>(`/queue/${category}`)
  return response.queuePositions
}

export const queueApiService = {
  fetchQueueByCategory,
}
