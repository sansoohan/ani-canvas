import React from 'react';
import { GalleryProvider } from './Provider';
import GalleryRenderer from './Renderer';

export const Gallery = () => {
  return (
    <GalleryProvider>
      <GalleryRenderer />
    </GalleryProvider>
  );
};
