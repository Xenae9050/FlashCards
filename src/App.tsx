import { useEffect, useState } from "react";
import { AppStateProvider, useAppState } from "./state/AppStateContext";
import { loadAllSaveData } from "./persistence/saveFiles";
import { loadPools } from "./pools/loadPools";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ScreenRouter } from "./components/ScreenRouter";

function Boot({ children }: { children: React.ReactNode }) {
  const { dispatch } = useAppState();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const [saveData, poolCatalog] = await Promise.all([
        loadAllSaveData(),
        loadPools(),
      ]);
      dispatch({ type: "SAVE_DATA_LOADED", saveData });
      dispatch({ type: "POOL_CATALOG_LOADED", poolCatalog });
      setReady(true);
    })();
  }, [dispatch]);

  if (!ready) {
    return (
      <div
        className="app-loading flex min-h-screen items-center justify-center text-muted-foreground"
        role="status"
      >
        Loading…
      </div>
    );
  }
  return <>{children}</>;
}

function ThemeSync() {
  const { state } = useAppState();
  useEffect(() => {
    const equipped = state.saveData?.shop.equipped;
    if (!equipped) return;
    document.documentElement.setAttribute("data-theme", equipped.theme);
    document.documentElement.setAttribute(
      "data-card-style",
      equipped.cardStyle,
    );
  }, [state.saveData?.shop.equipped]);

  useEffect(() => {
    const settings = state.saveData?.settings;
    if (!settings) return;
    document.documentElement.classList.toggle(
      "reduce-motion",
      settings.reduceMotion,
    );
    document.documentElement.classList.toggle(
      "high-contrast",
      settings.highContrast,
    );
    document.documentElement.classList.toggle(
      "colour-blind-friendly",
      settings.colourBlindFriendly,
    );
  }, [state.saveData?.settings]);

  return null;
}

function EscapeKeyHandler() {
  const { state, dispatch } = useAppState();
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      if (state.screen === "gameplay" && state.run) {
        if (state.run.preCountdownActive) return;
        dispatch({ type: state.run.isPaused ? "RESUME" : "PAUSE" });
        return;
      }
      if (["high-scores", "shop", "settings", "how-to-play"].includes(state.screen)) {
        dispatch({ type: "NAVIGATE", screen: "main-menu" });
      } else if (state.screen === "pool-selection") {
        dispatch({ type: "NAVIGATE", screen: "main-menu" });
      } else if (state.screen === "mode-selection") {
        dispatch({ type: "NAVIGATE", screen: "pool-selection" });
      } else if (state.screen === "mode-configuration") {
        dispatch({ type: "NAVIGATE", screen: "mode-selection" });
      } else if (state.screen === "ready") {
        dispatch({ type: "NAVIGATE", screen: "mode-configuration" });
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [state.screen, state.run, dispatch]);
  return null;
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppStateProvider>
        <Boot>
          <ThemeSync />
          <EscapeKeyHandler />
          <ScreenRouter />
        </Boot>
      </AppStateProvider>
    </ErrorBoundary>
  );
}
