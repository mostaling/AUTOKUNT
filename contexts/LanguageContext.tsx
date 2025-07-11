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
    (localStorage.getItem('language') as Language) || 'fr'
  );
  const [translations, setTranslations] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTranslations = async () => {
      // Don't set loading to true when just switching languages, only on initial load.
      // setIsLoading(true); 
      try {
        const response = await fetch(`/locales/${language}.json`);
        if (!response.ok) {
          throw new Error(`Failed to fetch translations for ${language}: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        setTranslations(data);
      } catch (error) {
        console.error(error);
        setTranslations({}); // Fallback to empty to show keys on error
      } finally {
        setIsLoading(false);
      }
    };
    loadTranslations();

    // Set document direction
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => {
    localStorage.setItem('language', lang);
    setLanguageState(lang);
  };

  const t = useCallback((key: string, options: any = {}) => {
    const keys = key.split('.');
    let result: any = translations;
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        return key; // Return the key if not found
      }
    }

    if (typeof result === 'string') {
       // Replace placeholders like {name}
      return result.replace(/\{(\w+)\}/g, (placeholder, placeholderKey) => {
        return options[placeholderKey] !== undefined ? options[placeholderKey] : placeholder;
      });
    }
    
    return key;
  }, [translations]);
  
  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-screen bg-gray-900 text-white font-sans">
            <div>Loading application...</div>
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
