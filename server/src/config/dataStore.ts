import fs from 'fs'
import path from 'path'
import config from './env'

class DataStore {
  private dataDir: string

  constructor() {
    this.dataDir = config.data.dir
    this.ensureDataDir()
  }

  private ensureDataDir(): void {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true })
    }
  }

  private getFilePath(filename: string): string {
    return path.join(this.dataDir, filename)
  }

  async read<T>(filename: string): Promise<T | null> {
    try {
      const filePath = this.getFilePath(filename)
      if (!fs.existsSync(filePath)) {
        return null
      }
      const data = fs.readFileSync(filePath, 'utf-8')
      return JSON.parse(data) as T
    } catch (error) {
      console.error(`Error reading ${filename}:`, error)
      return null
    }
  }

  async write<T>(filename: string, data: T): Promise<boolean> {
    try {
      const filePath = this.getFilePath(filename)
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
      return true
    } catch (error) {
      console.error(`Error writing ${filename}:`, error)
      return false
    }
  }

  async exists(filename: string): Promise<boolean> {
    const filePath = this.getFilePath(filename)
    return fs.existsSync(filePath)
  }

  async delete(filename: string): Promise<boolean> {
    try {
      const filePath = this.getFilePath(filename)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
      return true
    } catch (error) {
      console.error(`Error deleting ${filename}:`, error)
      return false
    }
  }
}

export const dataStore = new DataStore()
