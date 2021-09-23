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
  gifUrl: string;
  flaUrl: string;
  constructor({id, name}: {
    id: string,
    name: string,
  }) {
    this.id = nanoid();
    this.createdAt = Number(new Date());
    this.name = name;
    this.gifUrl = '';
    this.flaUrl = '';
  }

  static index (user?: AnimationModel): AnimationIndex {
    return {
      id: user?.id || '',
      createdAt: user?.createdAt || 0,
      name: user?.name || '',
    }
  }
};
