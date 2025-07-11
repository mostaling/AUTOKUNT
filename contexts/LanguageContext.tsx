import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Language } from '../types';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, options?: any) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(
    () => (localStorage.getItem('language') as Language) || 'fr'
  );
  const [translations, setTranslations] = useState<Record<string, any> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTranslations = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/locales/${language}.json`);
        if (!response.ok) {
          throw new Error(`Failed to load translation file for '${language}'. Status: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        setTranslations(data);
      } catch (e: any) {
        console.error("Translation loading error:", e);
        setError(e.message || 'An unknown error occurred while loading translations.');
        setTranslations({}); // Set to empty on error, but the error screen will be shown.
      } finally {
        setIsLoading(false);
      }
    };

    loadTranslations();
  }, [language]);

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => {
    localStorage.setItem('language', lang);
    setLanguageState(lang);
  };

  const t = useCallback((key: string, options: any = {}) => {
    if (!translations) {
      return key;
    }
    const keys = key.split('.');
    let result: any = translations;
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        return key;
      }
    }

    if (typeof result === 'string') {
      return result.replace(/\{(\w+)\}/g, (placeholder, placeholderKey) => {
        return options[placeholderKey] !== undefined ? options[placeholderKey] : placeholder;
      });
    }
    
    return key;
  }, [translations]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900 text-white font-sans text-lg">
        <div>Loading application...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-red-900 text-white font-sans p-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Application Error</h2>
        <p className="text-lg mb-2">Could not load required language files.</p>
        <p className="font-mono bg-red-800 p-2 rounded text-sm">{error}</p>
        <p className="mt-4 text-gray-300">Please check the browser's console (F12) for more details and verify that the language files exist in the `public/locales` directory in your project.</p>
      </div>
    );
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
