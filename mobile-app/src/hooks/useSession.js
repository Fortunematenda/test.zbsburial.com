import { useState, useEffect, useCallback } from 'react';
import { AppState } from 'react-native';
import SessionService from '../services/SessionService';
import logger from '../utils/logger';

export const useSession = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionError, setSessionError] = useState(null);

  // Initialize session on app start
  const initializeSession = useCallback(async () => {
    try {
      setIsLoading(true);
      setSessionError(null);

      const isValid = await SessionService.initializeSessionMonitoring();
      if (isValid) {
        const session = await SessionService.getSession();
        setUser(session);
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    } catch (error) {
      logger.error('Session initialization error:', error);
      setSessionError('Failed to initialize session');
      setIsLoggedIn(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Login function
  const login = useCallback(async (sessionData) => {
    try {
      const success = await SessionService.storeSession(sessionData);
      if (success) {
        setUser(sessionData);
        setIsLoggedIn(true);
        setSessionError(null);
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Login error:', error);
      setSessionError('Login failed');
      return false;
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await SessionService.clearSession();
      setUser(null);
      setIsLoggedIn(false);
      setSessionError(null);
      return true;
    } catch (error) {
      logger.error('Logout error:', error);
      setSessionError('Logout failed');
      return false;
    }
  }, []);

  // Validate session
  const validateSession = useCallback(async () => {
    try {
      const validation = await SessionService.validateSession();
      if (validation.valid) {
        setUser(validation.user);
        setIsLoggedIn(true);
        setSessionError(null);
        return true;
      } else {
        await logout();
        setSessionError(validation.reason);
        return false;
      }
    } catch (error) {
      logger.error('Session validation error:', error);
      setSessionError('Session validation failed');
      await logout();
      return false;
    }
  }, [logout]);

  // Update last activity
  const updateLastActivity = useCallback(async () => {
    try {
      await SessionService.updateLastActivity();
    } catch (error) {
      logger.error('Error updating last activity:', error);
    }
  }, []);

  // Handle app state changes
  const handleAppStateChange = useCallback((nextAppState) => {
    SessionService.handleAppStateChange(nextAppState);
  }, []);

  // Set up app state listener
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [handleAppStateChange]);

  // Initialize session on mount
  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  // Periodic session validation (every 5 minutes)
  useEffect(() => {
    if (isLoggedIn) {
      const interval = setInterval(async () => {
        await validateSession();
      }, 5 * 60 * 1000); // 5 minutes

      return () => clearInterval(interval);
    }
  }, [isLoggedIn, validateSession]);

  return {
    isLoggedIn,
    user,
    isLoading,
    sessionError,
    login,
    logout,
    validateSession,
    updateLastActivity,
    initializeSession
  };
};
