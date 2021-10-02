import { nanoid } from "nanoid";

export type GalleryAnimationFilter = {
  name: string;
  createdAt: string;
}

export type AnimationIndex = {
  id: string;
  createdAt: number;
  name: string;
}

export class AnimationModel {
  id: string;
  createdAt: number;
  name: string;
  gifName: string;
  gifUrl: string;
  flaName: string;
  flaUrl: string;
  jsName: string;
  jsUrl: string;
  pngName: string;
  pngUrl: string;
  constructor({id, name}: {
    id: string,
    name: string,
  }) {
    this.id = nanoid();
    this.createdAt = Number(new Date());
    this.name = name;
    this.gifName = '';
    this.gifUrl = '';
    this.flaName = '';
    this.flaUrl = '';
    this.jsName = '';
    this.jsUrl = '';
    this.pngName = '';
    this.pngUrl = '';
  }

  static index (user?: AnimationModel): AnimationIndex {
    return {
      id: user?.id || '',
      createdAt: user?.createdAt || 0,
      name: user?.name || '',
    }
  }
};
