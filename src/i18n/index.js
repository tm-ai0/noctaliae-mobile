import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import fr from './locales/fr.json';
import en from './locales/en.json';
import es from './locales/es.json';

const LANG_KEY = '@noctaliae_language';

const getStoredLanguage = async () => {
  try {
    return await AsyncStorage.getItem(LANG_KEY);
  } catch { return null; }
};

export const changeLanguage = async (lang) => {
  await AsyncStorage.setItem(LANG_KEY, lang);
  await i18next.changeLanguage(lang);
};

export const initI18n = async () => {
  const stored = await getStoredLanguage();
  const deviceLang = getLocales()[0]?.languageCode || 'en';
  const supported = ['fr', 'en', 'es'];
  const resolved = stored || (supported.includes(deviceLang) ? deviceLang : 'en');

  await i18next
    .use(initReactI18next)
    .init({
      resources: { fr: { translation: fr }, en: { translation: en }, es: { translation: es } },
      lng: resolved,
      fallbackLng: 'fr',
      interpolation: { escapeValue: false },
      compatibilityJSON: 'v4',
    });
};
