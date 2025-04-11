export const userSelect = {
    id: true,
    email: true,
    name: true,
    role: true,
};

export const projectSelect = {
    id: true,
    name: true,
};

export const taskSelect = {
    id: true,
    title: true,
    status: true,
    dueDate: true,
}

export const extendedProjectSelect = {
    id: true,
    name: true,
    description: true,
    ownerId: true
}

export const memberSelect = {
    userId: true,
    projectId: true,
    role: true,
};

export const userTasksSelect = {
    ...userSelect,
    tasks: {
      select: {
        ...taskSelect,
        project: { select: projectSelect },
      },
    },
};

export const userProjectsOwnedSelect = {
    ...userSelect,
    projectsOwned: {
      select: {
        ...extendedProjectSelect,
        members: { select: memberSelect },
      },
    },
};