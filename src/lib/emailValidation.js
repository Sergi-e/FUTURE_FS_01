/** Shared with backend contact handler (keep patterns aligned). */
export const EMAIL_FORMAT_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmailFormat(value) {
  return typeof value === 'string' && EMAIL_FORMAT_REGEX.test(value.trim());
}
