
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AppSettings } from '../types';
import { api } from '../services/mockApi';

interface SettingsContextType {
  settings: AppSettings | null;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings | null>>;
  isLoading: boolean;
  saveSettings: (newSettings: AppSettings) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.getSettings()
      .then(data => setSettings(data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const saveSettings = async (newSettings: AppSettings) => {
    const saved = await api.saveSettings(newSettings);
    setSettings(saved);
  };

  return (
    <SettingsContext.Provider value={{ settings, setSettings, isLoading, saveSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
