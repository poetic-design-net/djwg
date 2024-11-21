import { client } from '$lib/sanity/client';
import { knowledgeBaseItemsQuery } from '$lib/sanity/queries';
import type { KnowledgeBaseItem } from '$lib/sanity/queries';

export async function load() {
  const items = await client.fetch<KnowledgeBaseItem[]>(knowledgeBaseItemsQuery);

  // Group items by category
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, KnowledgeBaseItem[]>);

  return {
    items: groupedItems
  };
}
