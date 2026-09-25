import { useAppState } from "../state/AppStateContext";
import { MainMenuScreen } from "./screens/MainMenuScreen";
import { PoolSelectionScreen } from "./screens/PoolSelectionScreen";
import { ModeSelectionScreen } from "./screens/ModeSelectionScreen";
import { ModeConfigurationScreen } from "./screens/ModeConfigurationScreen";
import { ReadyScreen } from "./screens/ReadyScreen";
import { GameplayScreen } from "./screens/GameplayScreen";
import { ResultsScreen } from "./screens/ResultsScreen";
import { HighScoresScreen } from "./screens/HighScoresScreen";
import { ShopScreen } from "./screens/ShopScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { HowToPlayScreen } from "./screens/HowToPlayScreen";

export function ScreenRouter() {
  const { state } = useAppState();
  switch (state.screen) {
    case "main-menu":
      return <MainMenuScreen />;
    case "pool-selection":
      return <PoolSelectionScreen />;
    case "mode-selection":
      return <ModeSelectionScreen />;
    case "mode-configuration":
      return <ModeConfigurationScreen />;
    case "ready":
      return <ReadyScreen />;
    case "gameplay":
      return <GameplayScreen />;
    case "results":
      return <ResultsScreen />;
    case "high-scores":
      return <HighScoresScreen />;
    case "shop":
      return <ShopScreen />;
    case "settings":
      return <SettingsScreen />;
    case "how-to-play":
      return <HowToPlayScreen />;
    default:
      return null;
  }
}
