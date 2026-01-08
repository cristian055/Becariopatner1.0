import { describe, it, expect, beforeEach, vi } from 'vitest'
import { caddieService } from '../../src/services/caddieService'
import { CaddieStatus } from '../../src/types'
import { dataStore } from '../../src/config/dataStore'

// Mock dataStore
vi.mock('../../src/config/dataStore', () => ({
  dataStore: {
    read: vi.fn(),
    write: vi.fn(),
    exists: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('Caddie Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAllCaddies', () => {
    it('should return caddies from data store', async () => {
      const mockCaddies = [
        {
          id: '1',
          name: 'Test Caddie',
          number: 1,
          status: CaddieStatus.AVAILABLE,
          category: 'Primera' as const,
          location: 'Llanogrande' as const,
          role: 'Golf' as const,
        },
      ]

      vi.mocked(dataStore.read).mockResolvedValue(mockCaddies)

      const result = await caddieService.getAllCaddies()
      expect(result).toEqual(mockCaddies)
      expect(dataStore.read).toHaveBeenCalledWith('caddies.json')
    })

    it('should generate initial caddies if none exist', async () => {
      vi.mocked(dataStore.read).mockResolvedValue(null)

      const result = await caddieService.getAllCaddies()
      expect(result).toHaveLength(100)
      expect(result[0]).toHaveProperty('name')
      expect(result[0]).toHaveProperty('number')
    })
  })

  describe('getCaddieById', () => {
    it('should return caddie by id', async () => {
      const mockCaddies = [
        {
          id: '1',
          name: 'Test Caddie',
          number: 1,
          status: CaddieStatus.AVAILABLE,
          category: 'Primera' as const,
          location: 'Llanogrande' as const,
          role: 'Golf' as const,
        },
      ]

      vi.mocked(dataStore.read).mockResolvedValue(mockCaddies)

      const result = await caddieService.getCaddieById('1')
      expect(result).toEqual(mockCaddies[0])
    })

    it('should return null if caddie not found', async () => {
      vi.mocked(dataStore.read).mockResolvedValue([])

      const result = await caddieService.getCaddieById('999')
      expect(result).toBeNull()
    })
  })

  describe('bulkUpdateStatus', () => {
    it('should update status for multiple caddies', async () => {
      const mockCaddies = [
        {
          id: '1',
          name: 'Caddie 1',
          status: CaddieStatus.AVAILABLE,
        },
        {
          id: '2',
          name: 'Caddie 2',
          status: CaddieStatus.AVAILABLE,
        },
      ]

      vi.mocked(dataStore.read).mockResolvedValue(mockCaddies)
      vi.mocked(dataStore.write).mockResolvedValue(true)

      const result = await caddieService.bulkUpdateStatus(
        ['1', '2'],
        CaddieStatus.IN_FIELD
      )

      expect(result).toHaveLength(2)
      expect(result[0].status).toBe(CaddieStatus.IN_FIELD)
      expect(result[1].status).toBe(CaddieStatus.IN_FIELD)
      expect(dataStore.write).toHaveBeenCalled()
    })
  })
})
