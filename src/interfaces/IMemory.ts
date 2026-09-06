export interface IMemoryUser {
  _id: string;
  name: string;
  username: string;
  email: string;
  isActive: boolean;
}

export interface IMemoryDiscipline {
  _id: string;
  label: string;
  order: number;
  isActive: boolean;
}

export interface IMemoryStatus {
  _id: string;
  label: string;
  order: number;
  isActive: boolean;
}

export interface IMemoryPost {
  _id: string;
  title: string;
  content: string;
  summary: string;
  imageUrl?: string;
  series?: string;
  semester?: string;
  discipline: IMemoryDiscipline;
  isFeatured?: boolean;
  author: Pick<IMemoryUser, "_id" | "name" | "username" | "email">;
  status: Pick<IMemoryStatus, "_id" | "label" | "order">;
  createDate: string;
  updateDate: string;
}

export interface IMemoryStore {
  users: IMemoryUser[];
  disciplines: IMemoryDiscipline[];
  statuses: IMemoryStatus[];
  posts: IMemoryPost[];
}
