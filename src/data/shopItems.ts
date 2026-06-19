export type ItemCategory = 'jersey';
export type ItemRarity = 'common' | 'rare' | 'epic';

export interface ShopItem {
  id: string;
  name: string;
  category: ItemCategory;
  price: number;
  rarity: ItemRarity;
  description: string;
  previewImage: string;          // thumbnail for shop grid (uses celebrate pose)
  gabiImage: string;             // Coach Gabi wave-right pose wearing the item
  gabiCelebrateImage: string;    // Coach Gabi celebrate pose wearing the item
}

export const RARITY_COLORS: Record<ItemRarity, { bg: string; text: string; border: string; label: string }> = {
  common: { bg: 'bg-stone-100', text: 'text-stone-600', border: 'border-stone-200', label: 'Common' },
  rare:   { bg: 'bg-sky-50',    text: 'text-sky-600',   border: 'border-sky-200',   label: 'Rare' },
  epic:   { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-200', label: 'Epic' },
};

export const shopItems: ShopItem[] = [
  // ═══════════════════════════════════════
  // JERSEYS (5)
  // ═══════════════════════════════════════
  {
    id: 'jersey_arsenal',
    name: 'Arsenal Vintage',
    category: 'jersey',
    price: 150,
    rarity: 'common',
    description: 'The classic Gunners red & white. A timeless look for a champion.',
    previewImage: '/coach-gabi-celebrate-arsenal-jersey.png',
    gabiImage: '/coach-gabi-wave-right-arsenal-jersey.png',
    gabiCelebrateImage: '/coach-gabi-celebrate-arsenal-jersey.png',
  },
  {
    id: 'jersey_mancity',
    name: 'Man City Vintage',
    category: 'jersey',
    price: 200,
    rarity: 'common',
    description: 'Sky blue brilliance. Gabi looks ready to conquer the league.',
    previewImage: '/coach-gabi-celebrate-mancity-jersey.png',
    gabiImage: '/coach-gabi-wave-right-mancity-jersey.png',
    gabiCelebrateImage: '/coach-gabi-celebrate-mancity-jersey.png',
  },
  {
    id: 'jersey_psg',
    name: 'PSG Classic',
    category: 'jersey',
    price: 200,
    rarity: 'common',
    description: 'Ici c\'est Paris! The iconic navy blue with a touch of red.',
    previewImage: '/coach-gabi-celebrate-psg-jersey.png',
    gabiImage: '/coach-gabi-wave-right-psg-jersey.png',
    gabiCelebrateImage: '/coach-gabi-celebrate-psg-jersey.png',
  },
  {
    id: 'jersey_warriors',
    name: 'Warriors Classic',
    category: 'jersey',
    price: 300,
    rarity: 'rare',
    description: 'Blue & gold dynasty. Strength in numbers.',
    previewImage: '/coach-gabi-celebrate-warriors-jersey.png',
    gabiImage: '/coach-gabi-wave-right-warriors-jersey.png',
    gabiCelebrateImage: '/coach-gabi-celebrate-warriors-jersey.png',
  },
  {
    id: 'jersey_bulls',
    name: "Chicago Bulls '96",
    category: 'jersey',
    price: 500,
    rarity: 'epic',
    description: 'The GOAT jersey. 72-10 energy. Gabi channels MJ.',
    previewImage: '/coach-gabi-celebrate-bulls-jersey.png',
    gabiImage: '/coach-gabi-wave-right-bulls-jersey.png',
    gabiCelebrateImage: '/coach-gabi-celebrate-bulls-jersey.png',
  },
];

// Helper to get items by category
export function getItemsByCategory(category: ItemCategory): ShopItem[] {
  return shopItems.filter(item => item.category === category);
}

// Helper to get item by ID
export function getItemById(id: string): ShopItem | undefined {
  return shopItems.find(item => item.id === id);
}
