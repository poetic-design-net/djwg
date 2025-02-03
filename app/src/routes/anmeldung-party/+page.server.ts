// Leere Serverkomponente, da keine serverseitige Funktionalität mehr benötigt wird
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  return {};
};