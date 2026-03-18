const TIER_3_CATEGORIES = ["sexual", "coercive"];
const TIER_2_CATEGORIES = ["physical", "psychological", "online"];

function parseCategories(category: string): string[] {
  return category.split(",").map(c => c.trim()).filter(Boolean);
}

export function determineEscalationTier(category: string): number {
  const cats = parseCategories(category);
  if (cats.some(c => TIER_3_CATEGORIES.includes(c))) return 3;
  if (cats.some(c => TIER_2_CATEGORIES.includes(c))) return 2;
  return 1;
}

export function isSafeguardingTrigger(category: string): boolean {
  const cats = parseCategories(category);
  return cats.some(c => TIER_3_CATEGORIES.includes(c));
}
