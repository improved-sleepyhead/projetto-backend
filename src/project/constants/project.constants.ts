export const ownerSelect = {
    id: true,
    email: true,
    name: true,
};

export const taskSelect = {
    id: true,
    title: true,
    description: true,
    status: true,
    priority: true,
    dueDate: true,
    projectId: true,
    assigneeId: true,
};

export const projectSelect = {
    id: true,
    name: true,
    description: true,
    ownerId: true,
    owner: { select: ownerSelect },
    members: true,
    tasks: { select: taskSelect },
};