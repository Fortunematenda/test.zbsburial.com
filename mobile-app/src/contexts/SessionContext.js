import React, { createContext, useContext } from 'react';
import { useSession } from '../hooks/useSession';

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const session = useSession();

  return (
    <SessionContext.Provider value={session}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSessionContext = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSessionContext must be used within a SessionProvider');
  }
  return context;
};
