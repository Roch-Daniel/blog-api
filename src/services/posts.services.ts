import { isValidObjectId, PopulateOptions } from "mongoose";
import DisciplineModel from "../models/disciplines.model";
import PostModel from "../models/posts.model";
import StatusModel from "../models/status.model";
import UserModel from "../models/users.model";
import IAppError from "../interfaces/IAppError";
import {
  createMemoryPost,
  deleteMemoryPost,
  findMemoryDisciplineById,
  findMemoryPostById,
  findMemoryStatusById,
  findMemoryUserById,
  getMemoryPosts,
  searchMemoryPosts,
  updateMemoryPost,
} from "./memory-data.service";
import { IPostPayload } from "../interfaces/IPosts";

export type PostUpdatePayload = Partial<IPostPayload>;

// ─────────────────────────────────── Helpers ──────────────────────────────────
const PROFESSOR_DOMAIN = "@professor.com";
const isMemoryMode = (): boolean => process.env.USE_IN_MEMORY_DB === "true";

const createAppError = (message: string, status: number): IAppError => {
  const error = new Error(message) as IAppError;
  error.status = status;
  return error;
};

const validateObjectId = (value: string, fieldName: string): void => {
  if (!isValidObjectId(value)) {
    throw createAppError(`${fieldName} inválido`, 400);
  }
};

const ensureProfessorAuthor = async (authorId: string) => {
  validateObjectId(authorId, "authorId");

  const author = await UserModel.findById(authorId);

  if (!author) {
    throw createAppError("Autor não encontrado", 404);
  }

  if (!author.isActive) {
    throw createAppError("Autor inativo", 404);
  }

  if (!author.email.endsWith(PROFESSOR_DOMAIN)) {
    throw createAppError(
      "Apenas usuários com email @professor.com podem criar, atualizar ou excluir posts",
      403,
    );
  }

  return author;
};

const ensureActiveDiscipline = async (disciplineId: string) => {
  validateObjectId(disciplineId, "disciplineId");

  const discipline = await DisciplineModel.findById(disciplineId);

  if (!discipline) {
    throw createAppError("Disciplina não encontrada", 404);
  }

  if (!discipline.isActive) {
    throw createAppError("Disciplina inativa", 404);
  }

  return discipline;
};

const ensureActiveStatus = async (statusId: string) => {
  validateObjectId(statusId, "statusId");

  const status = await StatusModel.findById(statusId);

  if (!status) {
    throw createAppError("Status não encontrado", 404);
  }

  if (!status.isActive) {
    throw createAppError("Status inativo", 404);
  }

  return status;
};

// ─────────────────────────────────── Populate ──────────────────────────────────
const postPopulate: PopulateOptions[] = [
  { path: "author", select: "name username email" },
  { path: "discipline", select: "label order" },
  { path: "status", select: "label order" },
];

// ─────────────────────────────────── Serviços ──────────────────────────────────
export const getAllPosts = async () => {
  if (isMemoryMode()) {
    const allPosts = getMemoryPosts();
    const activePosts = [];

    for (const post of allPosts) {
      const status = findMemoryStatusById(post.status._id);
      if (status && status.isActive) {
        activePosts.push(post);
      }
    }

    return activePosts;
  }


  const activeStatuses = await StatusModel.find({ isActive: true }).select(
    "_id",
  );
  const activeStatusIds = [];

  for (const s of activeStatuses) {
    activeStatusIds.push(s._id);
  }

  return PostModel.find({ status: { $in: activeStatusIds } })
    .populate(postPopulate)
    .sort({ createDate: -1 });
};

export const searchPosts = async (term: string) => {
  if (!term || term.trim() === "") {
    return [];
  }

  if (isMemoryMode()) {
    return searchMemoryPosts(term);
  }

  const activeStatuses = await StatusModel.find({
    isActive: true,
  }).select("_id");

  const activeStatusIds = activeStatuses.map((status) => status._id);

  return PostModel.find({
    status: {
      $in: activeStatusIds,
    },
    $or: [
      {
        title: {
          $regex: term,
          $options: "i",
        },
      },
      {
        summary: {
          $regex: term,
          $options: "i",
        },
      },
      {
        content: {
          $regex: term,
          $options: "i",
        },
      },
    ],
  })
    .populate(postPopulate)
    .sort({ createDate: -1 });
};

export const getPostById = async (id: string) => {
  validateObjectId(id, "id");

  if (isMemoryMode()) {
    const post = findMemoryPostById(id);

    if (!post) {
      throw createAppError("Post não encontrado", 404);
    }

    return post;
  }

  const post = await PostModel.findById(id).populate(postPopulate);

  if (!post) {
    throw createAppError("Post não encontrado", 404);
  }

  return post;
};

export const createPost = async (payload?: IPostPayload) => {
  if (!payload || Object.keys(payload).length === 0) {
    throw createAppError("Body da requisição não informado", 400);
  }

  const {
    title,
    content,
    summary,
    imageUrl,
    series,
    semester,
    disciplineId,
    authorId,
    statusId,
  } = payload;

  if (
    !title ||
    !content ||
    !summary ||
    !disciplineId ||
    !authorId ||
    !statusId
  ) {
    throw createAppError("Campos obrigatórios não informados", 400);
  }

  if (isMemoryMode()) {
    validateObjectId(authorId, "authorId");
    validateObjectId(disciplineId, "disciplineId");
    validateObjectId(statusId, "statusId");

    const author = findMemoryUserById(authorId);
    const discipline = findMemoryDisciplineById(disciplineId);
    const status = findMemoryStatusById(statusId);

    if (!author) {
      throw createAppError("Autor não encontrado", 404);
    }

    if (!author.isActive) {
      throw createAppError("Autor inativo", 404);
    }

    if (!author.email.endsWith(PROFESSOR_DOMAIN)) {
      throw createAppError(
        "Apenas usuários com email @professor.com podem criar, atualizar ou excluir posts",
        403,
      );
    }

    if (!discipline) {
      throw createAppError("Disciplina não encontrada", 404);
    }

    if (!discipline.isActive) {
      throw createAppError("Disciplina inativa", 404);
    }

    if (!status) {
      throw createAppError("Status não encontrado", 404);
    }

    if (!status.isActive) {
      throw createAppError("Status inativo", 404);
    }

    return createMemoryPost({
      title,
      content,
      summary,
      imageUrl,
      series,
      semester,
      discipline,
      author: {
        _id: author._id,
        name: author.name,
        username: author.username,
        email: author.email,
      },
      status: {
        _id: status._id,
        label: status.label,
        order: status.order,
      },
    });
  }

  await ensureProfessorAuthor(authorId);
  await ensureActiveDiscipline(disciplineId);
  await ensureActiveStatus(statusId);

  const post = await PostModel.create({
    title,
    content,
    summary,
    imageUrl,
    series,
    semester,
    discipline: disciplineId,
    author: authorId,
    status: statusId,
  });

  return PostModel.findById(post._id).populate(postPopulate);
};

export const updatePost = async (id: string, payload: PostUpdatePayload) => {
  validateObjectId(id, "id");

  if (isMemoryMode()) {
    const currentPost = findMemoryPostById(id);

    if (!currentPost) {
      throw createAppError("Post não encontrado", 404);
    }

    const author = payload.authorId
      ? findMemoryUserById(payload.authorId)
      : findMemoryUserById(currentPost.author._id);
    const discipline = payload.disciplineId
      ? findMemoryDisciplineById(payload.disciplineId)
      : currentPost.discipline;
    const status = payload.statusId
      ? findMemoryStatusById(payload.statusId)
      : findMemoryStatusById(currentPost.status._id);

    if (!author) {
      throw createAppError("Autor não encontrado", 404);
    }

    if (!author.isActive) {
      throw createAppError("Autor inativo", 404);
    }

    if (!author.email.endsWith(PROFESSOR_DOMAIN)) {
      throw createAppError(
        "Apenas usuários com email @professor.com podem criar, atualizar ou excluir posts",
        403,
      );
    }

    if (!discipline) {
      throw createAppError("Disciplina não encontrada", 404);
    }

    if (!discipline.isActive) {
      throw createAppError("Disciplina inativa", 404);
    }

    if (!status) {
      throw createAppError("Status não encontrado", 404);
    }

    if (!status.isActive) {
      throw createAppError("Status inativo", 404);
    }

    const post = updateMemoryPost(id, (storedPost) => ({
      ...storedPost,
      title: payload.title ?? storedPost.title,
      content: payload.content ?? storedPost.content,
      summary: payload.summary ?? storedPost.summary,
      imageUrl: payload.imageUrl ?? storedPost.imageUrl,
      series: payload.series ?? storedPost.series,
      semester: payload.semester ?? storedPost.semester,
      discipline,
      author: {
        _id: author._id,
        name: author.name,
        username: author.username,
        email: author.email,
      },
      status: {
        _id: status._id,
        label: status.label,
        order: status.order,
      },
    }));

    if (!post) {
      throw createAppError("Post não encontrado", 404);
    }

    return post;
  }

  const post = await PostModel.findById(id);

  if (!post) {
    throw createAppError("Post não encontrado", 404);
  }

  const authorIdToValidate = payload.authorId ?? post.author.toString();
  await ensureProfessorAuthor(authorIdToValidate);

  if (payload.authorId) {
    post.set("author", payload.authorId);
  }

  if (payload.disciplineId) {
    await ensureActiveDiscipline(payload.disciplineId);
    post.set("discipline", payload.disciplineId);
  }

  if (payload.statusId) {
    await ensureActiveStatus(payload.statusId);
    post.set("status", payload.statusId);
  }

  if (payload.title !== undefined) post.title = payload.title;
  if (payload.content !== undefined) post.content = payload.content;
  if (payload.summary !== undefined) post.summary = payload.summary;
  if (payload.imageUrl !== undefined) post.imageUrl = payload.imageUrl;
  if (payload.series !== undefined) post.series = payload.series;
  if (payload.semester !== undefined) post.semester = payload.semester;

  await post.save();

  return PostModel.findById(post._id).populate(postPopulate);
};

export const deletePost = async (id: string) => {
  validateObjectId(id, "id");

  if (isMemoryMode()) {
    const post = findMemoryPostById(id);

    if (!post) {
      throw createAppError("Post não encontrado", 404);
    }

    const author = findMemoryUserById(post.author._id);

    if (!author) {
      throw createAppError("Autor não encontrado", 404);
    }

    if (!author.isActive) {
      throw createAppError("Autor inativo", 404);
    }

    if (!author.email.endsWith(PROFESSOR_DOMAIN)) {
      throw createAppError(
        "Apenas usuários com email @professor.com podem criar, atualizar ou excluir posts",
        403,
      );
    }

    deleteMemoryPost(id);
    return;
  }

  const post = await PostModel.findById(id);

  if (!post) {
    throw createAppError("Post não encontrado", 404);
  }

  await ensureProfessorAuthor(post.author.toString());
  await PostModel.findByIdAndDelete(id);
};
