import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import logger from '../utils/logger';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedSettings = await SecureStore.getItemAsync('app_settings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setIsDarkMode(settings.darkMode || false);
      }
    } catch (error) {
      logger.error('Error loading theme preference:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDarkMode = async (value) => {
    try {
      setIsDarkMode(value);
      
      // Save to secure store
      const savedSettings = await SecureStore.getItemAsync('app_settings');
      const settings = savedSettings ? JSON.parse(savedSettings) : {};
      settings.darkMode = value;
      await SecureStore.setItemAsync('app_settings', JSON.stringify(settings));
    } catch (error) {
      logger.error('Error saving theme preference:', error);
    }
  };

  const colors = {
    light: {
      background: '#ffffff',
      surface: '#ffffff',
      primary: '#8B5CF6',
      text: '#333333',
      textSecondary: '#666666',
      border: '#e0e0e0',
      card: '#ffffff',
      header: '#ffffff',
    },
    dark: {
      background: '#121212',
      surface: '#1e1e1e',
      primary: '#8B5CF6',
      text: '#ffffff',
      textSecondary: '#b0b0b0',
      border: '#333333',
      card: '#1e1e1e',
      header: '#1e1e1e',
    },
  };

  const theme = {
    isDarkMode,
    colors: isDarkMode ? colors.dark : colors.light,
    toggleDarkMode,
  };

  if (isLoading) {
    return null; // or a loading spinner
  }

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

