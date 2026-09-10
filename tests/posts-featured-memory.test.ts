import { createPost, getPostById } from "../src/services/posts.services";
import { getMemoryPosts, resetMemoryStore } from "../src/services/memory-data.service";

const previousMemoryMode = process.env.USE_IN_MEMORY_DB;

beforeEach(() => {
  process.env.USE_IN_MEMORY_DB = "true";
  resetMemoryStore();
});

afterEach(() => {
  if (previousMemoryMode === undefined) delete process.env.USE_IN_MEMORY_DB;
  else process.env.USE_IN_MEMORY_DB = previousMemoryMode;
  resetMemoryStore();
});

it.each([true, false, undefined])(
  "deve persistir o destaque na criação em memória com isFeatured=%s",
  async (isFeatured) => {
    const reference = getMemoryPosts()[0];
    const post = await createPost({
      title: "Post com destaque",
      content: "Conteúdo completo do post",
      summary: "Resumo completo do post",
      disciplineId: reference.discipline._id,
      statusId: reference.status._id,
      authorId: reference.author._id,
      semester: "1",
      ...(isFeatured === undefined ? {} : { isFeatured }),
    });

    expect(post).not.toBeNull();
    expect(post?.isFeatured).toBe(isFeatured ?? false);
    const storedPost = await getPostById(String(post!._id));
    expect(storedPost.isFeatured).toBe(isFeatured ?? false);
  },
);
