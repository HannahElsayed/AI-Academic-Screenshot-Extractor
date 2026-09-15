import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { RawExtractionResult } from '@/types/academic';

/**
 * Persistence is intentionally behind an interface. This ships with a
 * simple JSON-file store so the feature works out of the box with no
 * database setup — swap in a real database (e.g. Postgres/Prisma) later by
 * writing a class that implements SaveService and returning it from
 * getSaveService(), matching the pattern used for the Gemini service.
 */
export interface SavedRecord {
  id: string;
  savedAt: string;
  data: RawExtractionResult;
}

export interface SaveService {
  save(data: RawExtractionResult): Promise<SavedRecord>;
  getById(id: string): Promise<SavedRecord | null>;
  listAll(): Promise<SavedRecord[]>;
}

const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'academic-records.json');

class FileSaveService implements SaveService {
  private async readAll(): Promise<SavedRecord[]> {
    try {
      const raw = await fs.readFile(DATA_FILE, 'utf-8');
      return JSON.parse(raw) as SavedRecord[];
    } catch {
      return [];
    }
  }

  private async writeAll(records: SavedRecord[]): Promise<void> {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(records, null, 2), 'utf-8');
  }

  async save(data: RawExtractionResult): Promise<SavedRecord> {
    const records = await this.readAll();
    const record: SavedRecord = {
      id: uuidv4(),
      savedAt: new Date().toISOString(),
      data,
    };
    records.push(record);
    await this.writeAll(records);
    return record;
  }

  async getById(id: string): Promise<SavedRecord | null> {
    const records = await this.readAll();
    return records.find((r) => r.id === id) ?? null;
  }

  async listAll(): Promise<SavedRecord[]> {
    return this.readAll();
  }
}

let cachedService: SaveService | null = null;

export function getSaveService(): SaveService {
  if (!cachedService) {
    cachedService = new FileSaveService();
  }
  return cachedService;
}
