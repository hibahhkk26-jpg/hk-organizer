import React, { createContext, useContext, ReactNode } from 'react';
import { useDB } from '../hooks/useDB';
import { Item } from '../types';

interface AppContextType {
  items: Item[];
  loading: boolean;
  refresh: () => Promise<void>;
  addItem: (item: Omit<Item, 'id'>) => Promise<string>;
  updateItem: (item: Item) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  toggleItem: (id: string, completed: boolean) => Promise<void>;
  clearAll: () => Promise<void>;
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

