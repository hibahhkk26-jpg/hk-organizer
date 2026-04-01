import { useState, useEffect } from 'react';
import { initDB, migrateData, getTree, addItem, updateItem, deleteItemRecursive, toggleItem, clearAll } from '../db';
import { Item } from '../types';

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

  return {
    items,
    loading,
    refresh,
    add,
    update,
    del,
    toggle,
    clear
  };
};

