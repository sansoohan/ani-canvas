
import React, { useContext, ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

interface HomeValue {

}

const HomeContext = React.createContext<HomeValue | null>(null);

export function useHome(): HomeValue {
  const state = useContext(HomeContext);

  if (!state) {
    throw new Error('useHome must be used within HomeProvider');
  }

  return state;
}

export function HomeProvider({ children }: Props) {
  const providerValue = {

  };

  return (
    <HomeContext.Provider value={providerValue}>
      {children}
    </HomeContext.Provider>
  )
}
