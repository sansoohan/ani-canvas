import React from 'react';
import { HomeProvider } from './Provider';
import HomeRenderer from './Renderer';

export const Home = () => {
  return (
    <HomeProvider>
      <HomeRenderer />
    </HomeProvider>
  );
};
