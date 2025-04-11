export const authorSelect = {
    id: true,
    email: true,
    name: true,
};

export const commentSelect = {
    id: true,
    content: true,
    authorId: true,
    taskId: true,
    createdAt: true,
    author: {
      select: authorSelect,
    },
};