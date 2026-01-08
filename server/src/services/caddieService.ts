import { dataStore } from '../config/dataStore'
import { Caddie, CaddieStatus } from '../types'
import { v4 as uuidv4 } from 'uuid'

class CaddieService {
  private readonly filename = 'caddies.json'

  async getAllCaddies(): Promise<Caddie[]> {
    const caddies = await dataStore.read<Caddie[]>(this.filename)
    return caddies || this.generateInitialCaddies()
  }

  async getCaddieById(id: string): Promise<Caddie | null> {
    const caddies = await this.getAllCaddies()
    return caddies.find((c) => c.id === id) || null
  }

  async createCaddie(data: Omit<Caddie, 'id'>): Promise<Caddie> {
    const caddies = await this.getAllCaddies()
    const newCaddie: Caddie = {
      ...data,
      id: uuidv4(),
    }
    caddies.push(newCaddie)
    await dataStore.write(this.filename, caddies)
    return newCaddie
  }

  async updateCaddie(id: string, updates: Partial<Caddie>): Promise<Caddie | null> {
    const caddies = await this.getAllCaddies()
    const index = caddies.findIndex((c) => c.id === id)
    
    if (index === -1) {
      return null
    }

    caddies[index] = { ...caddies[index], ...updates }
    await dataStore.write(this.filename, caddies)
    return caddies[index]
  }

  async deleteCaddie(id: string): Promise<boolean> {
    const caddies = await this.getAllCaddies()
    const filtered = caddies.filter((c) => c.id !== id)
    
    if (filtered.length === caddies.length) {
      return false
    }

    await dataStore.write(this.filename, filtered)
    return true
  }

  async bulkUpdateStatus(
    ids: string[],
    status: CaddieStatus
  ): Promise<Caddie[]> {
    const caddies = await this.getAllCaddies()
    const updated: Caddie[] = []

    caddies.forEach((caddie) => {
      if (ids.includes(caddie.id)) {
        caddie.status = status
        updated.push(caddie)
      }
    })

    await dataStore.write(this.filename, caddies)
    return updated
  }

  private generateInitialCaddies(): Caddie[] {
    const caddies: Caddie[] = []
    const count = 100

    for (let i = 1; i <= count; i++) {
      let category: 'Primera' | 'Segunda' | 'Tercera' = 'Primera'
      if (i > 40 && i <= 80) category = 'Segunda'
      if (i > 80) category = 'Tercera'

      caddies.push({
        id: uuidv4(),
        name: `Caddie ${i}`,
        number: i,
        status: CaddieStatus.AVAILABLE,
        isActive: true,
        listId: i <= 40 ? 'list-1' : i <= 80 ? 'list-2' : 'list-3',
        historyCount: 0,
        absencesCount: 0,
        lateCount: 0,
        leaveCount: 0,
        lastActionTime: '08:00 AM',
        category,
        location: 'Llanogrande',
        role: i % 5 === 0 ? 'Hybrid' : 'Golf',
        weekendPriority: i,
        availability: [
          {
            day: 'Friday',
            isAvailable: true,
            range: { type: 'after', time: '09:30 AM' },
          },
          {
            day: 'Saturday',
            isAvailable: true,
            range: { type: 'full' },
          },
          {
            day: 'Sunday',
            isAvailable: true,
            range: { type: 'full' },
          },
        ],
      })
    }

    return caddies
  }

  async initializeData(): Promise<void> {
    const exists = await dataStore.exists(this.filename)
    if (!exists) {
      const initialCaddies = this.generateInitialCaddies()
      await dataStore.write(this.filename, initialCaddies)
    }
  }
}

export const caddieService = new CaddieService()
