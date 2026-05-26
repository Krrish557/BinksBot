import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, existsSync } from 'node:fs';
import { rm, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createStore } from '../src/utils/storage.js';

describe('JSON Store', () => {
  let tmpDir;
  let store;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'binks-test-'));
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it('creates store with defaults', async () => {
    store = createStore(join(tmpDir, 'test.json'), { items: [], nextId: 1 });
    await store.load();
    expect(store.get()).toEqual({ items: [], nextId: 1 });
  });

  it('persists data through save and reload', async () => {
    store = createStore(join(tmpDir, 'test.json'), { items: [], nextId: 1 });
    await store.load();
    const s = store.get();
    s.items.push({ id: 'track_0001', title: 'Test' });
    s.nextId = 2;
    await store.save();

    const store2 = createStore(join(tmpDir, 'test.json'), { items: [], nextId: 1 });
    await store2.load();
    expect(store2.get()).toEqual({
      items: [{ id: 'track_0001', title: 'Test' }],
      nextId: 2,
    });
  });

  it('serializes concurrent saves without data loss', async () => {
    store = createStore(join(tmpDir, 'concurrent.json'), { items: [], nextId: 1 });
    await store.load();

    const saves = Array.from({ length: 50 }, (_, i) => async () => {
      const s = store.get();
      s.items.push({ id: `track_${String(s.nextId).padStart(4, '0')}`, index: i });
      s.nextId++;
      await store.save();
    });

    await Promise.all(saves.map(fn => fn()));

    const raw = await readFile(join(tmpDir, 'concurrent.json'), 'utf-8');
    const data = JSON.parse(raw);
    expect(data.items).toHaveLength(50);

    const ids = data.items.map(i => i.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(50);
  });
});
