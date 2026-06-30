export const MIN_PASSWORD_LENGTH = 8;

export function validateLength(password: string): boolean {
  return password.length >= MIN_PASSWORD_LENGTH;
}

export function containsNumber(password: string): boolean {
  return /\d/.test(password);
}

export function validatePassword(password: string): boolean {
  return validateLength(password) && containsNumber(password);
}
