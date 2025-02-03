import { env } from '$env/dynamic/private';

export const getAdminEmails = () => (env.ADMIN_EMAILS || '').split(',').map(email => email.trim());

export const isAdmin = (email: string | undefined | null): boolean => {
  if (!email) return false;
  return getAdminEmails().includes(email);
};