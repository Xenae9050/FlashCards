import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type Dispatch,
} from "react";
import { appReducer, initialAppState, type AppState } from "./appReducer";
import type { Action } from "./actions";
import {
  saveSettings,
  saveWallet,
  saveShop,
  saveHighScores,
  saveLastConfigurations,
} from "../persistence/saveFiles";

interface AppStateContextValue {
  state: AppState;
  dispatch: Dispatch<Action>;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialAppState);

  // Immediate persistence on every relevant saveData change (Section 6.4: no debouncing).
  const saveData = state.saveData;
  useEffect(() => {
    if (saveData) void saveSettings(saveData.settings);
  }, [saveData?.settings]);
  useEffect(() => {
    if (saveData) void saveWallet(saveData.wallet);
  }, [saveData?.wallet]);
  useEffect(() => {
    if (saveData) void saveShop(saveData.shop);
  }, [saveData?.shop]);
  useEffect(() => {
    if (saveData) void saveHighScores(saveData.highScores);
  }, [saveData?.highScores]);
  useEffect(() => {
    if (saveData) void saveLastConfigurations(saveData.lastConfigurations);
  }, [saveData?.lastConfigurations]);

  return (
    <AppStateContext.Provider value={{ state, dispatch }}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}
