import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';

export const initI18Instance = (resources = {}, defaultLang = 'en') => {
  i18n.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      ...resources,
    },
    lng: defaultLang,
    fallbackLng: defaultLang,
    interpolation: { escapeValue: false },
  });

  return i18n;
};
