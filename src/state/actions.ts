import type {
  Screen,
  Mode,
  Difficulty,
  Configuration,
  SettingsFile,
} from "../domain/types";

export type Action =
  | { type: "NAVIGATE"; screen: Screen }
  | { type: "TOGGLE_POOL_SELECTED"; poolId: string }
  | { type: "SET_DIFFICULTY_FILTER"; difficulty: Difficulty; enabled: boolean }
  | { type: "SELECT_ALL_POOLS" }
  | { type: "CLEAR_ALL_POOLS" }
  | { type: "CONFIRM_POOL_SELECTION" }
  | { type: "SELECT_MODE"; mode: Mode }
  | { type: "SET_MODE_SETTING"; seconds: number }
  | { type: "USE_LAST_SETTINGS" }
  | { type: "CONFIRM_MODE_CONFIGURATION" }
  | { type: "START_RUN" }
  | { type: "BEGIN_FIRST_QUESTION" }
  | { type: "SELECT_ANSWER"; choiceText: string | null }
  | { type: "QUESTION_TIMER_EXPIRED" }
  | { type: "OVERALL_TIMER_EXPIRED" }
  | { type: "MIN_VIEW_TIME_ELAPSED" }
  | { type: "CONTINUE" }
  | { type: "STOP_AND_SAVE" }
  | { type: "PAUSE" }
  | { type: "RESUME" }
  | { type: "RESTART_RUN" }
  | { type: "CHANGE_SETTINGS" }
  | { type: "QUIT_TO_MAIN_MENU" }
  | { type: "PROCESS_RESULTS" }
  | { type: "PLAY_AGAIN" }
  | { type: "ADJUST_AND_RETRY" }
  | { type: "SET_SETTING"; key: keyof SettingsFile; value: boolean }
  | { type: "RESET_HIGH_SCORES" }
  | { type: "RESET_COINS_AND_PURCHASES" }
  | { type: "RESET_EVERYTHING" }
  | { type: "SHOP_PURCHASE"; itemId: string }
  | { type: "SHOP_EQUIP"; itemId: string }
  | {
      type: "SAVE_DATA_LOADED";
      saveData: import("../persistence/saveFiles").SaveData;
    }
  | {
      type: "POOL_CATALOG_LOADED";
      poolCatalog: {
        pools: import("../domain/types").Pool[];
        errors: import("../domain/types").PoolValidationError[];
      };
    }
  | { type: "SET_CONFIGURATION"; configuration: Configuration };
