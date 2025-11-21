import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEMES, THEME_LIST } from './theme';

const ThemeContext = createContext();

const THEME_STORAGE_KEY = '@noctaliae_theme';

export function ThemeProvider({ children }) {
  const [currentThemeId, setCurrentThemeId] = useState('original');
  const [isLoading, setIsLoading] = useState(true);

  // Charger le thème sauvegardé au démarrage
  useEffect(() => {
    loadTheme();
  }, []);

  async function loadTheme() {
    try {
      const savedThemeId = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedThemeId && THEMES[savedThemeId]) {
        setCurrentThemeId(savedThemeId);
      }
    } catch (error) {
      console.error('❌ Erreur chargement thème:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function changeTheme(themeId) {
    if (!THEMES[themeId]) {
      console.error('❌ Thème invalide:', themeId);
      return;
    }

    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, themeId);
      setCurrentThemeId(themeId);
    } catch (error) {
      console.error('❌ Erreur sauvegarde thème:', error);
    }
  }

  const theme = THEMES[currentThemeId];

  return (
    <ThemeContext.Provider
      value={{
        theme,
        currentThemeId,
        changeTheme,
        isLoading,
        availableThemes: THEME_LIST,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme doit être utilisé dans un ThemeProvider');
  }
  return context;
}
