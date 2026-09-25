export type ShopCategory =
  | "theme"
  | "cardStyle"
  | "avatar"
  | "celebration"
  | "soundPack";

export interface ShopItem {
  id: string;
  category: ShopCategory;
  name: string;
  costCoins: number;
  isDefaultFree: boolean;
}

export const SHOP_CATALOGUE: ShopItem[] = [
  {
    id: "theme-light",
    category: "theme",
    name: "Light",
    costCoins: 0,
    isDefaultFree: true,
  },
  {
    id: "theme-dark",
    category: "theme",
    name: "Dark",
    costCoins: 1000,
    isDefaultFree: false,
  },
  {
    id: "theme-sunset",
    category: "theme",
    name: "Sunset",
    costCoins: 1500,
    isDefaultFree: false,
  },
  {
    id: "theme-ocean-breeze",
    category: "theme",
    name: "Ocean Breeze",
    costCoins: 1500,
    isDefaultFree: false,
  },
  {
    id: "theme-forest",
    category: "theme",
    name: "Forest",
    costCoins: 1500,
    isDefaultFree: false,
  },
  {
    id: "theme-neon-arcade",
    category: "theme",
    name: "Neon Arcade",
    costCoins: 2500,
    isDefaultFree: false,
  },

  {
    id: "card-classic",
    category: "cardStyle",
    name: "Classic",
    costCoins: 0,
    isDefaultFree: true,
  },
  {
    id: "card-rounded",
    category: "cardStyle",
    name: "Rounded",
    costCoins: 1000,
    isDefaultFree: false,
  },
  {
    id: "card-chalkboard",
    category: "cardStyle",
    name: "Chalkboard",
    costCoins: 1500,
    isDefaultFree: false,
  },
  {
    id: "card-notebook-paper",
    category: "cardStyle",
    name: "Notebook Paper",
    costCoins: 1500,
    isDefaultFree: false,
  },
  {
    id: "card-holographic",
    category: "cardStyle",
    name: "Holographic",
    costCoins: 3000,
    isDefaultFree: false,
  },

  {
    id: "avatar-star",
    category: "avatar",
    name: "Star",
    costCoins: 500,
    isDefaultFree: false,
  },
  {
    id: "avatar-comet",
    category: "avatar",
    name: "Comet",
    costCoins: 500,
    isDefaultFree: false,
  },
  {
    id: "avatar-owl",
    category: "avatar",
    name: "Owl",
    costCoins: 500,
    isDefaultFree: false,
  },
  {
    id: "avatar-fox",
    category: "avatar",
    name: "Fox",
    costCoins: 1500,
    isDefaultFree: false,
  },
  {
    id: "avatar-dragon",
    category: "avatar",
    name: "Dragon",
    costCoins: 1500,
    isDefaultFree: false,
  },
  {
    id: "avatar-phoenix",
    category: "avatar",
    name: "Phoenix (animated)",
    costCoins: 4000,
    isDefaultFree: false,
  },

  {
    id: "celebration-default",
    category: "celebration",
    name: "Default Check",
    costCoins: 0,
    isDefaultFree: true,
  },
  {
    id: "celebration-confetti",
    category: "celebration",
    name: "Confetti Burst",
    costCoins: 1500,
    isDefaultFree: false,
  },
  {
    id: "celebration-star-sparkle",
    category: "celebration",
    name: "Star Sparkle",
    costCoins: 1500,
    isDefaultFree: false,
  },
  {
    id: "celebration-fireworks",
    category: "celebration",
    name: "Fireworks",
    costCoins: 3000,
    isDefaultFree: false,
  },

  {
    id: "sound-default",
    category: "soundPack",
    name: "Default Chime",
    costCoins: 0,
    isDefaultFree: true,
  },
  {
    id: "sound-retro-8bit",
    category: "soundPack",
    name: "Retro 8-bit",
    costCoins: 1500,
    isDefaultFree: false,
  },
  {
    id: "sound-soft-calm",
    category: "soundPack",
    name: "Soft & Calm",
    costCoins: 1500,
    isDefaultFree: false,
  },
];
