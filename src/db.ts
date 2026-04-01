import * as SQLite from 'expo-sqlite';
import { Item, NotificationConfig } from './types';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DB_NAME = 'hkorganizer.db';
const DB = SQLite.openDatabaseSync(DB_NAME);

// Init DB and create table
export const initDB = async () => {
  try {
    await DB.execAsync(`CREATE TABLE IF NOT EXISTS items (
      id TEXT PRIMARY KEY,
      parentId TEXT,
      type TEXT CHECK(type IN ('checklist', 'static')),
      name TEXT,
      description TEXT,
      color TEXT,
      completed INTEGER DEFAULT 0,
      createdAt INTEGER,
      notifications TEXT DEFAULT '[]'
    );`);
  } catch (error) {
    throw error;
  }
};

// Migrate old AsyncStorage data
export const migrateData = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem('hk_organizer_data');
    if (jsonValue) {
      const oldItems: Item[] = JSON.parse(jsonValue);
      await importJSON(oldItems);
      await AsyncStorage.removeItem('hk_organizer_data');
      console.log('Migration complete');
    }
  } catch (e) {
    console.error('Migration failed:', e);
  }
};

// Get hierarchical tree (top-level + recursive children)
export const getTree = async (): Promise<Item[]> => {
  try {
    const result = await DB.getAllAsync('SELECT * FROM items ORDER BY createdAt ASC;');
    return result as Item[];
  } catch (error) {
    throw error;
  }
};

// Add new item
export const addItem = async (item: Omit<Item, 'id'>): Promise<string> => {
  try {
    const id = Math.random().toString(36).substr(2, 9);
    await DB.runAsync(
      'INSERT INTO items (id, parentId, type, name, description, color, completed, createdAt, notifications) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);',
      [id, item.parentId || null, item.type, item.name, item.description || null, item.color || null, item.completed ? 1 : 0, item.createdAt, JSON.stringify(item.notifications || [])]
    );
    return id;
  } catch (error) {
    throw error;
  }
};

// Update item
export const updateItem = async (item: Item) => {
  try {
    await DB.runAsync(
      'UPDATE items SET parentId=?, type=?, name=?, description=?, color=?, completed=?, notifications=? WHERE id=?;',
      [item.parentId || null, item.type, item.name, item.description || null, item.color || null, item.completed ? 1 : 0, JSON.stringify(item.notifications || []), item.id]
    );
    return true;
  } catch (error) {
    throw error;
  }
};

// Delete item + recursive children (children first)
export const deleteItemRecursive = async (id: string): Promise<void> => {
  const deleteChildren = async (parentId: string) => {
    try {
      const rows = await DB.getAllAsync('SELECT id FROM items WHERE parentId = ?;', [parentId]);
      for (const row of rows) {
        await deleteChildren((row as any).id);
      }
      // Delete self after children
      await DB.runAsync('DELETE FROM items WHERE id = ?;', [parentId]);
    } catch (error) {
      throw error;
    }
  };
  await deleteChildren(id);
};

// Toggle complete
export const toggleItem = async (id: string, completed: boolean) => {
  try {
    await DB.runAsync(
      'UPDATE items SET completed = ? WHERE id = ?;',
      [completed ? 1 : 0, id]
    );
    return true;
  } catch (error) {
    throw error;
  }
};

// Export all to JSON
export const exportJSON = (): Promise<Item[]> => {
  return getTree();
};

// Import JSON array
export const importJSON = async (items: Item[]): Promise<void> => {
  try {
    for (const item of items) {
      await DB.runAsync(
        'INSERT OR REPLACE INTO items (id, parentId, type, name, description, color, completed, createdAt, notifications) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);',
        [item.id, item.parentId || null, item.type, item.name, item.description || null, item.color || null, item.completed ? 1 : 0, item.createdAt, JSON.stringify(item.notifications || [])]
      );
    }
  } catch (error) {
    throw error;
  }
};

// Clear all data
export const clearAll = async (): Promise<void> => {
  try {
    await DB.runAsync('DELETE FROM items;');
  } catch (error) {
    throw error;
  }
};

