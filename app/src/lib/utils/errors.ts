import type { Badge } from './badge-utils';

export class AccessDeniedError extends Error {
  status = 403;
  requiredBadges: Badge[];

  constructor(message: string, requiredBadges: Badge[]) {
    super(message);
    this.name = 'AccessDeniedError';
    this.requiredBadges = requiredBadges;
  }
}