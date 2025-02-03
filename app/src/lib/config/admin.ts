import { env } from '$env/dynamic/private';

export const ADMIN_EMAILS = (env.ADMIN_EMAILS || '').split(',').map(email => email.trim());

export const isAdmin = (email: string | undefined | null): boolean => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email);
};