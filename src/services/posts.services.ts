const posts = [
  { id: 1, title: "Post 1", descript: "Teste de post 1" },
  { id: 2, title: "Post 2", descript: "Teste de post 2" },
];

export const getAllPosts = () => {
  return posts;
};

export const getPostById = (id: number) => {
  return posts.find((post) => post.id === id);
};
