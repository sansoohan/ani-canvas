export type UserIndex = {
  id: string;
  createdAt: number;
  name: string;
  email: string;
}

export class UserModel {
  id: string;
  ref: string;
  createdAt: number;
  name: string;
  email: string;
  constructor({id, ref, name, email}: {
    id: string,
    ref: string,
    name: string,
    email: string,
  }) {
    this.id = id;
    this.ref = ref;
    this.createdAt = Number(new Date());
    this.name = name;
    this.email = email;
  }

  static index (user?: UserModel): UserIndex {
    return {
      id: user?.id || '',
      createdAt: user?.createdAt || 0,
      name: user?.name || '',
      email: user?.email || '',
    }
  }
};
