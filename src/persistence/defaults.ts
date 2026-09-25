import type {
  SettingsFile,
  WalletFile,
  ShopFile,
  HighScoresFile,
  Configuration,
  Mode,
} from "../domain/types";

export const DEFAULT_SETTINGS: SettingsFile = {
  schemaVersion: 1,
  soundEffects: true,
  reduceMotion: false,
  colourBlindFriendly: false,
  highContrast: false,
  silentMode: false,
  answerKeyHints: true,
};

export const DEFAULT_WALLET: WalletFile = { schemaVersion: 1, coins: 0 };

export const DEFAULT_SHOP: ShopFile = {
  schemaVersion: 1,
  ownedItemIds: [
    "theme-light",
    "card-classic",
    "celebration-default",
    "sound-default",
  ],
  equipped: {
    theme: "theme-light",
    cardStyle: "card-classic",
    celebration: "celebration-default",
    soundPack: "sound-default",
    avatar: null,
  },
};

export const DEFAULT_HIGH_SCORES: HighScoresFile = {
  schemaVersion: 1,
  buckets: {},
};

export const DEFAULT_LAST_CONFIGURATIONS: Record<Mode, Configuration | null> = {
  "sudden-death": null,
  race: null,
  quickdraw: null,
};
