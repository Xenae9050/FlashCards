import { loadFile, saveFile, deleteFile } from "./db";
import {
  DEFAULT_SETTINGS,
  DEFAULT_WALLET,
  DEFAULT_SHOP,
  DEFAULT_HIGH_SCORES,
  DEFAULT_LAST_CONFIGURATIONS,
} from "./defaults";
import type {
  SettingsFile,
  WalletFile,
  ShopFile,
  HighScoresFile,
  Configuration,
  Mode,
} from "../domain/types";

export interface SaveData {
  settings: SettingsFile;
  wallet: WalletFile;
  shop: ShopFile;
  highScores: HighScoresFile;
  lastConfigurations: Record<Mode, Configuration | null>;
}

export async function loadAllSaveData(): Promise<SaveData> {
  const [settings, wallet, shop, highScores, lastConfigurations] =
    await Promise.all([
      loadFile("settings", DEFAULT_SETTINGS),
      loadFile("wallet", DEFAULT_WALLET),
      loadFile("shop", DEFAULT_SHOP),
      loadFile("highscores", DEFAULT_HIGH_SCORES),
      loadFile("lastConfigurations", DEFAULT_LAST_CONFIGURATIONS),
    ]);
  return { settings, wallet, shop, highScores, lastConfigurations };
}

export function saveSettings(settings: SettingsFile) {
  return saveFile("settings", settings);
}
export function saveWallet(wallet: WalletFile) {
  return saveFile("wallet", wallet);
}
export function saveShop(shop: ShopFile) {
  return saveFile("shop", shop);
}
export function saveHighScores(highScores: HighScoresFile) {
  return saveFile("highscores", highScores);
}
export function saveLastConfigurations(
  lastConfigurations: Record<Mode, Configuration | null>,
) {
  return saveFile("lastConfigurations", lastConfigurations);
}

export async function resetHighScores() {
  await saveFile("highscores", DEFAULT_HIGH_SCORES);
}
export async function resetCoinsAndPurchases() {
  await saveFile("wallet", DEFAULT_WALLET);
  await saveFile("shop", DEFAULT_SHOP);
}
export async function resetEverything() {
  await saveFile("settings", DEFAULT_SETTINGS);
  await saveFile("wallet", DEFAULT_WALLET);
  await saveFile("shop", DEFAULT_SHOP);
  await saveFile("highscores", DEFAULT_HIGH_SCORES);
  await saveFile("lastConfigurations", DEFAULT_LAST_CONFIGURATIONS);
}

export { deleteFile };
