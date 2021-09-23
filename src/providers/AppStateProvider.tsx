import React, { useContext, ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

// Add Global State
interface AppStateValue {

}

const AppStateContext = React.createContext<AppStateValue | null>(null);

export function useAppState(): AppStateValue {
  const state = useContext(AppStateContext);

  if (!state) {
    throw new Error('useAppState must be used within AppStateProvider');
  }

  return state;
}

export function AppStateProvider({ children }: Props) {
  const providerValue = {

  };

  // Add Global Functions

  return (
    <AppStateContext.Provider value={providerValue}>
      {children}
    </AppStateContext.Provider>
  );
}