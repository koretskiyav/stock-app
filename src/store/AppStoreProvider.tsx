import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useStore } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { type StatementsData } from '../services/parser';
import { createAppStore, type AppStore } from './createAppStore';
import { initializeStore } from './initializeStore';

type AppStoreApi = ReturnType<typeof createAppStore>;
const AppStoreContext = createContext<AppStoreApi | undefined>(undefined);

export interface AppStoreProviderProps {
  initialData: StatementsData;
  children: ReactNode;
}

export const AppStoreProvider = ({ initialData, children }: AppStoreProviderProps) => {
  const [store, setStore] = useState<AppStoreApi | null>(null);

  useEffect(() => {
    const { store: newStore, cleanup } = initializeStore(initialData);
    setStore(newStore);

    return cleanup;
  }, [initialData]);

  if (!store) return null;

  return <AppStoreContext.Provider value={store}>{children}</AppStoreContext.Provider>;
};

export function useAppStore<T>(selector: (store: AppStore) => T): T {
  const context = useContext(AppStoreContext);
  if (!context) {
    throw new Error('useAppStore must be used within AppStoreProvider');
  }
  return useStore(context, useShallow(selector));
}
