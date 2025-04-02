/**
 * Konvertiert URLs im Text in klickbare Links mit target="_blank"
 */
export function formatTextWithLinks(text: string): string {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-green-400 hover:text-green-300 underline">$1</a>');
}

/**
 * Überprüft, ob ein Text URLs enthält
 */
export function containsUrls(text: string): boolean {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return urlRegex.test(text);
}