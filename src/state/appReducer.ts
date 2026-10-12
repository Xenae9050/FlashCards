import type {
  Screen,
  Mode,
  Configuration,
  RunEndReason,
  DeckQuestion,
  HighScoreEntry,
  Pool,
  PoolValidationError,
  TestAnswer,
} from "../domain/types";
import type { SaveData } from "../persistence/saveFiles";
import type { Action } from "./actions";
import { buildDeck, fisherYatesShuffle } from "../domain/deck";
import { computePoints, computeCoinsForAnswer } from "../domain/scoring";
import { computeBucketKey, insertHighScoreEntry } from "../domain/bucketKey";
import { buildTestReport } from "../domain/testReport";
import {
  MODE_SETTING_RANGES,
  QUICKDRAW_LIVES,
  RACE_FAST_ANSWER_THRESHOLD_MS,
  COINS_BONUS_NEW_TOP_10,
  COINS_BONUS_NEW_NUMBER_ONE_ADDITIONAL,
  COINS_BONUS_POOL_EXHAUSTED,
} from "../domain/constants";
import { SHOP_CATALOGUE } from "../shop/catalogue";

export interface RunState {
  runId: number; // remount key for the overall-clock timer across RESTART_RUN/PLAY_AGAIN
  config: Configuration;
  deck: DeckQuestion[];
  deckPointer: number;
  currentDeckQuestion: DeckQuestion | null;
  shuffledChoices: string[];
  isPaused: boolean;
  pausedAt: number | null;
  preCountdownActive: boolean;
  questionShownAt: number | null;
  revealVisible: boolean;
  revealShownAt: number | null;
  canContinue: boolean;
  selectedAnswerText: string | null;
  wasCorrect: boolean | null;
  isFastAnswer: boolean | null;
  streak: number;
  pointsTotal: number;
  coinsEarnedThisRun: number;
  livesRemaining: number;
  correctCount: number;
  attemptedCount: number;
  runEndReason: RunEndReason | null;
  resultsProcessed: boolean;
  testAnswers: TestAnswer[]; // Test mode only: answers recorded so far
}

export interface AppState {
  screen: Screen;
  poolCatalog: { pools: Pool[]; errors: PoolValidationError[] } | null;
  saveData: SaveData | null;
  poolSelection: {
    selectedPoolIds: string[];
    difficultyFilter: ("Easy" | "Medium" | "Hard")[];
  };
  pendingConfiguration: Partial<Configuration>;
  run: RunState | null;
  lastResultSummary: import("../domain/types").ResultSummary | null;
  saveBanner: string | null;
}

export const initialAppState: AppState = {
  screen: "main-menu",
  poolCatalog: null,
  saveData: null,
  poolSelection: {
    selectedPoolIds: [],
    difficultyFilter: ["Easy", "Medium", "Hard"],
  },
  pendingConfiguration: {},
  run: null,
  lastResultSummary: null,
  saveBanner: null,
};

function buildFreshRun(config: Configuration, pools: Pool[]): RunState {
  const selectedPools = pools.filter((p) =>
    config.selectedPoolIds.includes(p.id),
  );
  const fullDeck = buildDeck(selectedPools, config.difficultyFilter);
  const deck =
    config.mode === "test"
      ? fullDeck.slice(0, config.modeSettingSeconds)
      : fullDeck;
  return {
    runId: Date.now() + Math.random(),
    config,
    deck,
    deckPointer: 0,
    currentDeckQuestion: null,
    shuffledChoices: [],
    isPaused: false,
    pausedAt: null,
    preCountdownActive: true,
    questionShownAt: null,
    revealVisible: false,
    revealShownAt: null,
    canContinue: false,
    selectedAnswerText: null,
    wasCorrect: null,
    isFastAnswer: null,
    streak: 0,
    pointsTotal: 0,
    coinsEarnedThisRun: 0,
    livesRemaining: config.mode === "quickdraw" ? QUICKDRAW_LIVES : 0,
    correctCount: 0,
    attemptedCount: 0,
    runEndReason: null,
    resultsProcessed: false,
    testAnswers: [],
  };
}

function drawNextQuestion(run: RunState): RunState {
  const dq = run.deck[run.deckPointer];
  return {
    ...run,
    currentDeckQuestion: dq,
    shuffledChoices: orderChoicesForDisplay(dq.question.choices),
    deckPointer: run.deckPointer + 1,
    questionShownAt: performance.now(),
    revealVisible: false,
    revealShownAt: null,
    canContinue: false,
    selectedAnswerText: null,
    wasCorrect: null,
    isFastAnswer: null,
  };
}

/**
 * Determines the on-screen order of a question's choices. Binary True/False and Yes/No
 * questions always show the affirmative ("True"/"Yes") as option A (left) and the negative
 * ("False"/"No") as option B, never reversed, so players can rely on a fixed convention for
 * these question shapes. Every other question (any other 2-choice pairing, and all 4-choice
 * questions) is shuffled per Section 9.3/12.7.
 */
function orderChoicesForDisplay(choices: string[]): string[] {
  const normalized = choices.map((c) => c.trim().toLowerCase());
  const fixedPairs: Array<[string, string]> = [
    ["true", "false"],
    ["yes", "no"],
  ];
  for (const [affirmative, negative] of fixedPairs) {
    if (
      choices.length === 2 &&
      normalized.includes(affirmative) &&
      normalized.includes(negative)
    ) {
      const affirmativeChoice = choices[normalized.indexOf(affirmative)];
      const negativeChoice = choices[normalized.indexOf(negative)];
      return [affirmativeChoice, negativeChoice];
    }
  }
  return fisherYatesShuffle(choices);
}

/** Shared by CHANGE_SETTINGS and QUIT_TO_MAIN_MENU: persist partial coins, discard run. */
function persistPartialCoinsAndAbandonRun(
  state: AppState,
  destination: Screen,
): AppState {
  if (!state.run || !state.saveData)
    return { ...state, screen: destination, run: null };
  const wallet = {
    ...state.saveData.wallet,
    coins: state.saveData.wallet.coins + state.run.coinsEarnedThisRun,
  };
  return {
    ...state,
    saveData: { ...state.saveData, wallet },
    run: null,
    screen: destination,
    pendingConfiguration:
      destination === "mode-configuration"
        ? state.run.config
        : state.pendingConfiguration,
  };
}

function handleAnswer(state: AppState, choiceText: string | null): AppState {
  const run = state.run;
  if (!run || run.revealVisible || !run.currentDeckQuestion) return state;

  if (run.config.mode === "test") {
    // No feedback during a test: just remember the (changeable) selection until TEST_NEXT.
    return { ...state, run: { ...run, selectedAnswerText: choiceText } };
  }

  const question = run.currentDeckQuestion.question;
  const wasCorrect =
    choiceText !== null && choiceText === question.correctChoice;
  const elapsedMs =
    run.questionShownAt !== null
      ? performance.now() - run.questionShownAt
      : Infinity;

  let isFastAnswer: boolean | null = null;
  if (wasCorrect) {
    if (run.config.mode === "race") {
      isFastAnswer = elapsedMs <= RACE_FAST_ANSWER_THRESHOLD_MS;
    } else {
      isFastAnswer = elapsedMs <= (run.config.modeSettingSeconds * 1000) / 2;
    }
  }

  let streak = run.streak;
  let pointsTotal = run.pointsTotal;
  let coinsEarnedThisRun = run.coinsEarnedThisRun;
  let correctCount = run.correctCount;
  let livesRemaining = run.livesRemaining;

  if (wasCorrect) {
    const streakAfter = run.streak + 1;
    const pointsEarned = computePoints(
      question.difficulty,
      streakAfter,
      !!isFastAnswer,
    );
    const coinsEarned = computeCoinsForAnswer(pointsEarned);
    streak = streakAfter;
    pointsTotal += pointsEarned;
    coinsEarnedThisRun += coinsEarned;
    correctCount += 1;
  } else {
    streak = 0;
    if (run.config.mode === "quickdraw") {
      livesRemaining = Math.max(0, run.livesRemaining - 1);
    }
  }

  return {
    ...state,
    run: {
      ...run,
      streak,
      pointsTotal,
      coinsEarnedThisRun,
      correctCount,
      livesRemaining,
      attemptedCount: run.attemptedCount + 1,
      revealVisible: true,
      revealShownAt: performance.now(),
      canContinue: false,
      selectedAnswerText: choiceText,
      wasCorrect,
      isFastAnswer,
    },
  };
}

function processResults(state: AppState): AppState {
  if (!state.run || !state.saveData || state.run.resultsProcessed) return state;
  const run = state.run;
  if (run.config.mode === "test") {
    const report = buildTestReport(run.testAnswers);
    return {
      ...state,
      run: { ...run, resultsProcessed: true },
      lastResultSummary: {
        config: run.config,
        runEndReason: run.runEndReason ?? "test-complete",
        correctCount: report.correct,
        attemptedCount: report.total,
        pointsTotal: 0,
        coinsEarnedThisRun: 0,
        milestoneBonus: 0,
        totalCoinsThisRun: 0,
        rank: null,
        bucketKey: computeBucketKey(run.config),
        testReport: report,
      },
    };
  }
  const bucketKey = computeBucketKey(run.config);
  const candidate: HighScoreEntry = {
    points: run.pointsTotal,
    achievedAt: new Date().toISOString(),
    configuration: run.config,
  };
  const existing = state.saveData.highScores.buckets[bucketKey] ?? [];
  const { updated, rank } = insertHighScoreEntry(existing, candidate);

  const milestoneBonus =
    rank === 1
      ? COINS_BONUS_NEW_TOP_10 + COINS_BONUS_NEW_NUMBER_ONE_ADDITIONAL
      : rank !== null
      ? COINS_BONUS_NEW_TOP_10
      : 0;
  const poolExhaustedBonus =
    run.runEndReason === "pool-exhausted" ? COINS_BONUS_POOL_EXHAUSTED : 0;
  const totalCoinsThisRun =
    run.coinsEarnedThisRun + milestoneBonus + poolExhaustedBonus;

  const buckets = { ...state.saveData.highScores.buckets };
  if (rank !== null) buckets[bucketKey] = updated;

  const wallet = {
    ...state.saveData.wallet,
    coins: state.saveData.wallet.coins + milestoneBonus + poolExhaustedBonus,
  };

  return {
    ...state,
    saveData: {
      ...state.saveData,
      wallet,
      highScores: { ...state.saveData.highScores, buckets },
    },
    run: { ...run, resultsProcessed: true },
    lastResultSummary: {
      config: run.config,
      runEndReason: run.runEndReason ?? "pool-exhausted",
      correctCount: run.correctCount,
      attemptedCount: run.attemptedCount,
      pointsTotal: run.pointsTotal,
      coinsEarnedThisRun: run.coinsEarnedThisRun,
      milestoneBonus: milestoneBonus + poolExhaustedBonus,
      totalCoinsThisRun,
      rank,
      bucketKey,
    },
  };
}

/** Determines whether the answer just revealed ends the run, and if so with which reason. */
function endReasonForCurrentAnswer(run: RunState): RunEndReason | null {
  if (run.config.mode === "sudden-death" && run.wasCorrect === false)
    return "mistake";
  if (
    run.config.mode === "quickdraw" &&
    run.wasCorrect === false &&
    run.livesRemaining <= 0
  ) {
    return "lives-depleted";
  }
  return null;
}

function handleContinue(state: AppState): AppState {
  const run = state.run;
  if (!run || !run.canContinue) return state;

  const endReason = endReasonForCurrentAnswer(run);
  if (endReason) {
    return processResults({
      ...state,
      run: { ...run, runEndReason: endReason },
      screen: "results",
    });
  }
  if (run.deckPointer >= run.deck.length) {
    return processResults({
      ...state,
      run: { ...run, runEndReason: "pool-exhausted" },
      screen: "results",
    });
  }
  return { ...state, run: drawNextQuestion(run) };
}

export function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SAVE_DATA_LOADED":
      return { ...state, saveData: action.saveData };
    case "POOL_CATALOG_LOADED":
      return { ...state, poolCatalog: action.poolCatalog };

    case "NAVIGATE":
      return { ...state, screen: action.screen };

    case "TOGGLE_POOL_SELECTED": {
      const selected = state.poolSelection.selectedPoolIds;
      const selectedPoolIds = selected.includes(action.poolId)
        ? selected.filter((id) => id !== action.poolId)
        : [...selected, action.poolId];
      return {
        ...state,
        poolSelection: { ...state.poolSelection, selectedPoolIds },
      };
    }
    case "SET_DIFFICULTY_FILTER": {
      const current = state.poolSelection.difficultyFilter;
      const difficultyFilter = action.enabled
        ? Array.from(new Set([...current, action.difficulty]))
        : current.filter((d) => d !== action.difficulty);
      return {
        ...state,
        poolSelection: { ...state.poolSelection, difficultyFilter },
      };
    }
    case "SELECT_ALL_POOLS":
      return {
        ...state,
        poolSelection: {
          ...state.poolSelection,
          selectedPoolIds: (state.poolCatalog?.pools ?? []).map((p) => p.id),
        },
      };
    case "CLEAR_ALL_POOLS":
      return {
        ...state,
        poolSelection: { ...state.poolSelection, selectedPoolIds: [] },
      };

    case "CONFIRM_POOL_SELECTION":
      return {
        ...state,
        pendingConfiguration: {
          ...state.pendingConfiguration,
          selectedPoolIds: state.poolSelection.selectedPoolIds,
          difficultyFilter: state.poolSelection.difficultyFilter,
        },
        screen: "mode-selection",
      };

    case "SELECT_MODE":
      return {
        ...state,
        pendingConfiguration: {
          ...state.pendingConfiguration,
          mode: action.mode,
          modeSettingSeconds: MODE_SETTING_RANGES[action.mode].defaultSeconds,
        },
        screen: "mode-configuration",
      };

    case "SET_MODE_SETTING":
      return {
        ...state,
        pendingConfiguration: {
          ...state.pendingConfiguration,
          modeSettingSeconds: action.seconds,
        },
      };

    case "USE_LAST_SETTINGS": {
      const mode = state.pendingConfiguration.mode as Mode | undefined;
      if (!mode || !state.saveData) return state;
      const last = state.saveData.lastConfigurations[mode];
      if (!last) return state;
      return { ...state, pendingConfiguration: { ...last } };
    }

    case "CONFIRM_MODE_CONFIGURATION":
      return { ...state, screen: "ready" };

    case "START_RUN": {
      if (!state.saveData || !state.poolCatalog) return state;
      const config = state.pendingConfiguration as Configuration;
      const run = buildFreshRun(config, state.poolCatalog.pools);
      const lastConfigurations = {
        ...state.saveData.lastConfigurations,
        [config.mode]: config,
      };
      return {
        ...state,
        run,
        saveData: { ...state.saveData, lastConfigurations },
        screen: "gameplay",
      };
    }

    case "BEGIN_FIRST_QUESTION": {
      if (!state.run) return state;
      const run = { ...state.run, preCountdownActive: false };
      return { ...state, run: drawNextQuestion(run) };
    }

    case "SELECT_ANSWER":
      return handleAnswer(state, action.choiceText);
    case "QUESTION_TIMER_EXPIRED":
      return handleAnswer(state, null);

    case "OVERALL_TIMER_EXPIRED": {
      if (!state.run) return state;
      return processResults({
        ...state,
        run: { ...state.run, runEndReason: "clock-expired" },
        screen: "results",
      });
    }

    case "MIN_VIEW_TIME_ELAPSED":
      if (!state.run) return state;
      return { ...state, run: { ...state.run, canContinue: true } };

    case "CONTINUE":
      return handleContinue(state);

    case "TEST_NEXT": {
      const run = state.run;
      if (!run || run.config.mode !== "test" || !run.currentDeckQuestion)
        return state;
      const testAnswers = [
        ...run.testAnswers,
        {
          poolId: run.currentDeckQuestion.poolId,
          question: run.currentDeckQuestion.question,
          selected: run.selectedAnswerText,
        },
      ];
      const updated = { ...run, testAnswers };
      if (run.deckPointer >= run.deck.length) {
        return processResults({
          ...state,
          run: { ...updated, runEndReason: "test-complete" },
          screen: "results",
        });
      }
      return { ...state, run: drawNextQuestion(updated) };
    }

    case "STOP_AND_SAVE": {
      if (!state.run || state.run.correctCount < 1) return state;
      return processResults({
        ...state,
        run: { ...state.run, runEndReason: "stop-and-save" },
        screen: "results",
      });
    }

    case "PAUSE":
      if (!state.run || state.run.preCountdownActive) return state;
      return {
        ...state,
        run: { ...state.run, isPaused: true, pausedAt: performance.now() },
      };
    case "RESUME": {
      if (!state.run) return state;
      const run = state.run;
      const pauseDurationMs =
        run.pausedAt !== null ? performance.now() - run.pausedAt : 0;
      return {
        ...state,
        run: {
          ...run,
          isPaused: false,
          pausedAt: null,
          questionShownAt:
            run.questionShownAt !== null
              ? run.questionShownAt + pauseDurationMs
              : null,
          revealShownAt:
            run.revealShownAt !== null
              ? run.revealShownAt + pauseDurationMs
              : null,
        },
      };
    }

    case "RESTART_RUN": {
      if (!state.run || !state.poolCatalog) return state;
      return {
        ...state,
        run: buildFreshRun(state.run.config, state.poolCatalog.pools),
      };
    }

    case "CHANGE_SETTINGS":
      return persistPartialCoinsAndAbandonRun(state, "mode-configuration");
    case "QUIT_TO_MAIN_MENU":
      return persistPartialCoinsAndAbandonRun(state, "main-menu");

    case "PROCESS_RESULTS":
      return processResults(state);

    case "PLAY_AGAIN": {
      if (!state.run || !state.poolCatalog) return state;
      return {
        ...state,
        run: buildFreshRun(state.run.config, state.poolCatalog.pools),
        screen: "gameplay",
      };
    }
    case "ADJUST_AND_RETRY": {
      if (!state.run) return state;
      return {
        ...state,
        pendingConfiguration: state.run.config,
        screen: "mode-configuration",
      };
    }

    case "SET_SETTING": {
      if (!state.saveData) return state;
      return {
        ...state,
        saveData: {
          ...state.saveData,
          settings: { ...state.saveData.settings, [action.key]: action.value },
        },
      };
    }

    case "RESET_HIGH_SCORES": {
      if (!state.saveData) return state;
      return {
        ...state,
        saveData: {
          ...state.saveData,
          highScores: { schemaVersion: 1, buckets: {} },
        },
      };
    }
    case "RESET_COINS_AND_PURCHASES": {
      if (!state.saveData) return state;
      return {
        ...state,
        saveData: {
          ...state.saveData,
          wallet: { schemaVersion: 1, coins: 0 },
          shop: {
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
          },
        },
      };
    }
    case "RESET_EVERYTHING": {
      if (!state.saveData) return state;
      return {
        ...state,
        saveData: {
          settings: {
            schemaVersion: 1,
            soundEffects: true,
            reduceMotion: false,
            colourBlindFriendly: false,
            highContrast: false,
            silentMode: false,
            answerKeyHints: true,
          },
          wallet: { schemaVersion: 1, coins: 0 },
          shop: {
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
          },
          highScores: { schemaVersion: 1, buckets: {} },
          lastConfigurations: {
            "sudden-death": null,
            race: null,
            quickdraw: null,
            test: null,
          },
        },
      };
    }

    case "SHOP_PURCHASE": {
      if (!state.saveData) return state;
      const catalogueItem = SHOP_CATALOGUE.find((i) => i.id === action.itemId);
      if (!catalogueItem) return state;
      const alreadyOwned = state.saveData.shop.ownedItemIds.includes(
        action.itemId,
      );
      if (alreadyOwned || state.saveData.wallet.coins < catalogueItem.costCoins)
        return state;
      return {
        ...state,
        saveData: {
          ...state.saveData,
          wallet: {
            ...state.saveData.wallet,
            coins: state.saveData.wallet.coins - catalogueItem.costCoins,
          },
          shop: {
            ...state.saveData.shop,
            ownedItemIds: [...state.saveData.shop.ownedItemIds, action.itemId],
          },
        },
      };
    }
    case "SHOP_EQUIP": {
      if (!state.saveData) return state;
      const catalogueItem = SHOP_CATALOGUE.find((i) => i.id === action.itemId);
      if (
        !catalogueItem ||
        !state.saveData.shop.ownedItemIds.includes(action.itemId)
      )
        return state;
      return {
        ...state,
        saveData: {
          ...state.saveData,
          shop: {
            ...state.saveData.shop,
            equipped: {
              ...state.saveData.shop.equipped,
              [catalogueItem.category]: action.itemId,
            },
          },
        },
      };
    }

    default:
      return state;
  }
}
