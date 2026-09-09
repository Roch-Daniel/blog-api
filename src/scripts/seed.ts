import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { connectDB, disconnectDB } from "../config/database";
import DisciplineModel from "../models/disciplines.model";
import PostModel from "../models/posts.model";
import StatusModel from "../models/status.model";
import UserModel from "../models/users.model";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "";

// Bloco: carga inicial para popular usuários, catálogos e posts de exemplo no MongoDB.
const seed = async (): Promise<void> => {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI não definida para executar o seed");
  }

  await connectDB(MONGODB_URI);

  await Promise.all([
    PostModel.deleteMany({}),
    UserModel.deleteMany({}),
    DisciplineModel.deleteMany({}),
    StatusModel.deleteMany({}),
  ]);

  // Bloco: usuários de referência para validar criação permitida e bloqueada.
  const hashedPassword = await bcrypt.hash("123456", 10);

  const [professor, student] = await UserModel.create([
    {
      name: "Ana Professora",
      username: "ana.prof",
      password: hashedPassword,
      email: "ana@professor.com",
      mobilePhone: "11999999999",
      externalId: "ext-prof-1",
      role: "PROFESSOR",
      lastLogin: new Date(),
      isActive: true,
    },
    {
      name: "Carlos Aluno",
      username: "carlos.aluno",
      password: hashedPassword,
      email: "carlos@aluno.com",
      mobilePhone: "11888888888",
      externalId: "ext-student-1",
      role: "ALUNO",
      lastLogin: new Date(),
      isActive: true,
    },
  ]);

  // Bloco: disciplinas disponíveis para vincular os posts de teste.
  const [disciplineMath, disciplinePhysics] = await DisciplineModel.create([
    { label: "Matemática", order: 1, isActive: true },
    { label: "Física", order: 2, isActive: true },
  ]);

  // Bloco: status editoriais usados na publicação inicial.
  const [publishedStatus, draftStatus] = await StatusModel.create([
    { label: "Publicado", order: 1, isActive: true },
    { label: "Rascunho", order: 2, isActive: true },
  ]);

  // Bloco: posts de exemplo já ligados a autor, disciplina e status.
  await PostModel.create([
    {
      title: "Introdução a Funções",
      content: "Conteúdo completo sobre funções do primeiro grau.",
      summary: "Resumo sobre funções do primeiro grau.",
      imageUrl: "https://images.example.com/posts/funcoes.png",
      series: "1º ano",
      semester: "1",
      discipline: disciplineMath._id,
      author: professor._id,
      status: publishedStatus._id,
    },
    {
      title: "Leis de Newton",
      content: "Explicação introdutória das três leis de Newton.",
      summary: "Resumo das leis de Newton.",
      imageUrl: "https://images.example.com/posts/newton.png",
      series: "2º ano",
      semester: "2",
      discipline: disciplinePhysics._id,
      author: professor._id,
      status: draftStatus._id,
    },
  ]);

  console.log("Seed executado com sucesso.");
  console.log(`Professor autorizado: ${professor.email}`);
  console.log(`Usuário sem permissão de criação: ${student.email}`);
};

// Bloco: execução protegida do seed com fechamento da conexão ao final.
seed()
  .catch((error: Error) => {
    console.error(`Erro ao executar seed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDB();
  });
