import { useState, useEffect } from 'react';
import { initDB, migrateData, getTree, addItem, updateItem, deleteItemRecursive, toggleItem, clearAll, importJSON, exportJSON } from '../db';
import { Item } from '../types';
import { scheduleNotification } from './useNotifications';
import * as FileSystem from 'expo-file-system';

export const useDB = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        await initDB();
        await migrateData();
        const data = await getTree();
        setItems(data);
      } catch (e) {
        console.error('DB init failed', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const refresh = async () => {
    const data = await getTree();
    setItems(data);
  };

  const add = async (item: Omit<Item, 'id'>) => {
    const id = await addItem(item);
    await refresh();
    return id;
  };

  const update = async (item: Item) => {
    await updateItem(item);
    await refresh();
  };

  const del = async (id: string) => {
    await deleteItemRecursive(id);
    await refresh();
  };

  const toggle = async (id: string, completed: boolean) => {
    await toggleItem(id, completed);
    await refresh();
  };

  const clear = async () => {
    await clearAll();
    setItems([]);
  };

  const scheduleItemNotification = async (itemId: string, config: any) => {
    const item = items.find(i => i.id === itemId);
    if (item) {
      await scheduleNotification(item, config);
      // Update item with config in DB
      const updatedItem = items.map(i => i.id === itemId 
        ? {...i, notifications: [...i.notifications || [], config]}
        : i
      );
      setItems(updatedItem);
      await updateItem(updatedItem.find(i => i.id === itemId)!);
    }
  };

  const importBackup = async (fileUri: string) => {
    try {
      const jsonStr = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.UTF8 });
      const data = JSON.parse(jsonStr);
      await importJSON(data);
      await refresh();
    } catch (e) {
      console.error('Import failed', e);
    }
  };

  return {
    items,
    loading,
    refresh,
    add,
    update,
    del,
    toggle,
    clear,
    scheduleItemNotification,
    importBackup,
    exportData: exportJSON
  };
};

