/** Shared utility for generating unique IDs. Replace with crypto.randomUUID() when targeting modern browsers only. */
export const generateId = (): string => Math.random().toString(36).substring(2, 9);
