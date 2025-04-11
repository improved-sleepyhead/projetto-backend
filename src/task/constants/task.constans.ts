export const projectSelect = {
    id: true,
    name: true,
    description: true,
    ownerId: true,
};

export const assigneeSelect = {
    id: true,
    email: true,
    name: true,
};

export const taskInclude = {
    project: { select: projectSelect },
    assignee: { select: assigneeSelect },
    comments: true,
};