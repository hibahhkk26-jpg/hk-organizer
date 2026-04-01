import React, { createContext, useContext, ReactNode } from 'react';
import { useDB } from '../hooks/useDB';
import { Item } from '../types';

interface AppContextType {
  items: Item[];
  loading: boolean;
  refresh: () => Promise<void>;
  add: (item: Omit<Item, 'id'>) => Promise<string>;
  update: (item: Item) => Promise<void>;
  del: (id: string) => Promise<void>;
  toggle: (id: string, completed: boolean) => Promise<void>;
  clear: () => Promise<void>;
  scheduleItemNotification: (itemId: string, config: any) => Promise<void>;
  importBackup: (fileUri: string) => Promise<void>;
  exportData: () => Promise<Item[]>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const db = useDB();

  return (
    <AppContext.Provider value={{
      ...db
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

