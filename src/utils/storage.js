import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname } from 'node:path';
import { randomUUID } from 'node:crypto';
import { logger } from './logger.js';

export function createStore(filePath, defaults) {
  let store = { ...defaults };
  let loaded = false;

  async function ensureDir() {
    await mkdir(dirname(filePath), { recursive: true });
  }

  async function load() {
    if (loaded) return;
    await ensureDir();
    try {
      if (existsSync(filePath)) {
        const raw = await readFile(filePath, 'utf-8');
        store = { ...defaults, ...JSON.parse(raw) };
      }
    } catch (err) {
      logger.error({ err, filePath }, 'Failed to load store, starting fresh');
      store = { ...defaults };
    }
    loaded = true;
  }

  async function save() {
    await ensureDir();
    const tmpPath = filePath + '.' + randomUUID() + '.tmp';
    await writeFile(tmpPath, JSON.stringify(store, null, 2), 'utf-8');
    await rename(tmpPath, filePath);
  }

  function get() {
    return store;
  }

  return { load, save, get };
}
