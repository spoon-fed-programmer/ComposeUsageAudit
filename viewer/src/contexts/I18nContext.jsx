import { createContext, useContext, useState } from 'react';
import { TRANSLATIONS } from '../utils/i18n';

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('i18n_lang') || 'ko');

  const t = (key, variables = {}) => {
    const dict = TRANSLATIONS[lang] || TRANSLATIONS['ko'];
    let text = dict[key] !== undefined ? dict[key] : (TRANSLATIONS['ko'][key] !== undefined ? TRANSLATIONS['ko'][key] : key);
    
    // Replace variables (e.g. {count})
    Object.keys(variables).forEach((vKey) => {
      text = text.replace(`{${vKey}}`, variables[vKey]);
    });
    return text;
  };

  const changeLang = (newLang) => {
    setLang(newLang);
    localStorage.setItem('i18n_lang', newLang);
  };

  return (
    <I18nContext.Provider value={{ lang, t, changeLang }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
