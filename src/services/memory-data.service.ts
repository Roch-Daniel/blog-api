import { Types } from "mongoose";
import {
  IMemoryDiscipline,
  IMemoryPost,
  IMemoryStatus,
  IMemoryStore,
  IMemoryUser,
} from "../interfaces/IMemory";

const createId = (): string => new Types.ObjectId().toString();

const createInitialStore = (): IMemoryStore => {
  const professorId = createId();
  const studentId = createId();
  const mathId = createId();
  const physicsId = createId();
  const publishedId = createId();
  const draftId = createId();
  const now = new Date().toISOString();

  const users: IMemoryUser[] = [
    {
      _id: professorId,
      name: "Ana Professora",
      username: "ana.prof",
      email: "ana@professor.com",
      isActive: true,
    },
    {
      _id: studentId,
      name: "Carlos Aluno",
      username: "carlos.aluno",
      email: "carlos@aluno.com",
      isActive: true,
    },
  ];

  const disciplines: IMemoryDiscipline[] = [
    { _id: mathId, label: "Matemática", order: 1, isActive: true },
    { _id: physicsId, label: "Física", order: 2, isActive: true },
  ];

  const statuses: IMemoryStatus[] = [
    { _id: publishedId, label: "Publicado", order: 1, isActive: true },
    { _id: draftId, label: "Rascunho", order: 2, isActive: true },
  ];

  const posts: IMemoryPost[] = [
    {
      _id: createId(),
      title: "Introdução a Funções",
      content: "Conteúdo completo sobre funções do primeiro grau.",
      summary: "Resumo sobre funções do primeiro grau.",
      imageUrl: "https://images.example.com/posts/funcoes.png",
      series: "1º ano",
      semester: "1",
      discipline: disciplines[0],
      author: {
        _id: users[0]._id,
        name: users[0].name,
        username: users[0].username,
        email: users[0].email,
      },
      status: {
        _id: statuses[0]._id,
        label: statuses[0].label,
        order: statuses[0].order,
      },
      createDate: now,
      updateDate: now,
    },
  ];

  return { users, disciplines, statuses, posts };
};

let memoryStore: IMemoryStore = createInitialStore();

export const resetMemoryStore = (): void => {
  memoryStore = createInitialStore();
};

export const getMemoryUsers = (): IMemoryUser[] => memoryStore.users;

export const getMemoryDisciplines = (): IMemoryDiscipline[] =>
  memoryStore.disciplines;

export const getMemoryStatuses = (): IMemoryStatus[] => memoryStore.statuses;

export const getMemoryPosts = (): IMemoryPost[] => memoryStore.posts;

export const findMemoryUserById = (id: string): IMemoryUser | undefined =>
  memoryStore.users.find((user) => user._id === id);

export const findMemoryDisciplineById = (
  id: string,
): IMemoryDiscipline | undefined =>
  memoryStore.disciplines.find((discipline) => discipline._id === id);

export const findMemoryStatusById = (id: string): IMemoryStatus | undefined =>
  memoryStore.statuses.find((status) => status._id === id);

export const findMemoryPostById = (id: string): IMemoryPost | undefined =>
  memoryStore.posts.find((post) => post._id === id);

export const createMemoryPost = (
  post: Omit<IMemoryPost, "_id" | "createDate" | "updateDate">,
): IMemoryPost => {
  const now = new Date().toISOString();
  const createdPost: IMemoryPost = {
    ...post,
    _id: createId(),
    createDate: now,
    updateDate: now,
  };

  memoryStore.posts = [createdPost, ...memoryStore.posts];

  return createdPost;
};

export const updateMemoryPost = (
  id: string,
  updater: (post: IMemoryPost) => IMemoryPost,
): IMemoryPost | undefined => {
  const index = memoryStore.posts.findIndex((post) => post._id === id);

  if (index === -1) {
    return undefined;
  }

  const updatedPost = updater(memoryStore.posts[index]);
  memoryStore.posts[index] = {
    ...updatedPost,
    updateDate: new Date().toISOString(),
  };

  return memoryStore.posts[index];
};

export const deleteMemoryPost = (id: string): boolean => {
  const initialLength = memoryStore.posts.length;
  memoryStore.posts = memoryStore.posts.filter((post) => post._id !== id);
  return memoryStore.posts.length < initialLength;
};

export const searchMemoryPosts = (term: string) => {
  const search = term.toLowerCase();

  return getMemoryPosts().filter((post) => {
    return (
      post.title.toLowerCase().includes(search) ||
      post.summary.toLowerCase().includes(search) ||
      post.content.toLowerCase().includes(search)
    );
  });
};
