import { AnimationModel } from "./animation/model";

export class GalleryModel {
  id: string;
  ref: string;
  createdAt: number;
  name: string;
  animations: Array<AnimationModel>;
  constructor({id, ref, name}: {
    id: string,
    ref: string,
    name: string,
  }) {
    this.id = id;
    this.ref = ref;
    this.createdAt = Number(new Date());
    this.name = name;
    this.animations = [];
  }
};
