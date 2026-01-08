import { dataStore } from '../config/dataStore'
import { ListConfig } from '../types'
import { v4 as uuidv4 } from 'uuid'

class ListService {
  private readonly filename = 'lists.json'

  async getAllLists(): Promise<ListConfig[]> {
    const lists = await dataStore.read<ListConfig[]>(this.filename)
    return lists || this.generateInitialLists()
  }

  async getListById(id: string): Promise<ListConfig | null> {
    const lists = await this.getAllLists()
    return lists.find((l) => l.id === id) || null
  }

  async createList(
    data: Omit<ListConfig, 'id'>
  ): Promise<ListConfig> {
    const lists = await this.getAllLists()
    const newList: ListConfig = {
      ...data,
      id: uuidv4(),
    }
    lists.push(newList)
    await dataStore.write(this.filename, lists)
    return newList
  }

  async updateList(id: string, updates: Partial<ListConfig>): Promise<ListConfig | null> {
    const lists = await this.getAllLists()
    const index = lists.findIndex((l) => l.id === id)
    
    if (index === -1) {
      return null
    }

    lists[index] = { ...lists[index], ...updates, id }
    await dataStore.write(this.filename, lists)
    return lists[index]
  }

  async deleteList(id: string): Promise<boolean> {
    const lists = await this.getAllLists()
    const filtered = lists.filter((l) => l.id !== id)
    
    if (filtered.length === lists.length) {
      return false
    }

    await dataStore.write(this.filename, filtered)
    return true
  }

  private generateInitialLists(): ListConfig[] {
    return [
      {
        id: 'list-1',
        name: 'Primera',
        order: 'ASC',
        rangeStart: 1,
        rangeEnd: 40,
        category: 'Primera',
      },
      {
        id: 'list-2',
        name: 'Segunda',
        order: 'ASC',
        rangeStart: 41,
        rangeEnd: 80,
        category: 'Segunda',
      },
      {
        id: 'list-3',
        name: 'Tercera',
        order: 'ASC',
        rangeStart: 81,
        rangeEnd: 100,
        category: 'Tercera',
      },
    ]
  }

  async initializeData(): Promise<void> {
    const exists = await dataStore.exists(this.filename)
    if (!exists) {
      const initialLists = this.generateInitialLists()
      await dataStore.write(this.filename, initialLists)
    }
  }
}

export const listService = new ListService()
