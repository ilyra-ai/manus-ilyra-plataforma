import React, { createContext, useContext, useState, useEffect } from 'react';
import { getLanguageTranslations } from "../services/languageService";

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [currentLang, setCurrentLang] = useState(localStorage.getItem('ilyra_lang') || 'en');
  const [translations, setTranslations] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTranslations = async () => {
      setLoading(true);
      try {
        const data = await getLanguageTranslations(currentLang);
        setTranslations(data);
        localStorage.setItem('ilyra_lang', currentLang);
      } catch (error) {
        console.error('Failed to fetch translations:', error);
        // Fallback to English or show an error message
        const defaultTranslations = await getLanguageTranslations('en');
        setTranslations(defaultTranslations);
        localStorage.setItem('ilyra_lang', 'en');
      } finally {
        setLoading(false);
      }
    };

    fetchTranslations();
  }, [currentLang]);

  const setLanguage = (langCode) => {
    setCurrentLang(langCode);
  };

  const t = (key) => {
    return translations[key] || key; // Return key if translation not found
  };

  return (
    <LanguageContext.Provider value={{ currentLang, setLanguage, t, loading }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

