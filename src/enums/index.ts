export const Action = {
  CREATE: 'CREATE',
  READ: 'READ',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  MANAGE: 'MANAGE',
} as const;

export const Resource = {
  USER: 'USER',
  ROLE: 'ROLE',
  PERMISSION: 'PERMISSION',
  SUBJECT: 'SUBJECT',
  QUESTION: 'QUESTION',
  EXAM: 'EXAM',
  STUDY_GROUP: 'STUDY_GROUP',
  YEAR_SEMESTER: 'YEAR_SEMESTER',
} as const;

export type Action = (typeof Action)[keyof typeof Action];
export type Resource = (typeof Resource)[keyof typeof Resource];
