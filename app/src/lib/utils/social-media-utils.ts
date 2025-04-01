/**
 * Generiert die korrekten Social Media URLs basierend auf den Benutzernamen
 */
export function generateSocialMediaLinks(username: string | undefined, platform: 'instagram' | 'facebook' | 'soundcloud'): string {
  if (!username) return '';

  const cleanUsername = username.replace('@', '').trim();

  switch (platform) {
    case 'instagram':
      return `https://instagram.com/${cleanUsername}`;
    case 'facebook':
      return `https://facebook.com/${cleanUsername}`;
    case 'soundcloud':
      return `https://soundcloud.com/${cleanUsername}`;
    default:
      return '';
  }
}