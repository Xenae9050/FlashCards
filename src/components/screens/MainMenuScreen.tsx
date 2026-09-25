import { Coins, Play, Trophy, ShoppingBag, Settings, HelpCircle } from "lucide-react";
import { useFocusOnMount } from "../../hooks/useFocusOnMount";
import { useAppState } from "../../state/AppStateContext";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

export function MainMenuScreen() {
  const { state, dispatch } = useAppState();
  const headingRef = useFocusOnMount<HTMLHeadingElement>();
  const coins = state.saveData?.wallet.coins ?? 0;

  return (
    <main className="screen main-menu-screen relative mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center gap-8 p-6 text-center">
      <Badge
        variant="secondary"
        className="absolute top-4 right-4 gap-1 px-3 py-1.5 text-sm"
        aria-label={`${coins} coins`}
      >
        <Coins className="size-4" /> {coins}
      </Badge>
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="text-4xl font-bold tracking-tight"
      >
        FlashCards
      </h1>
      <nav className="menu-buttons flex w-full flex-col gap-3">
        <Button
          size="lg"
          className="h-12 gap-2 text-base"
          onClick={() =>
            dispatch({ type: "NAVIGATE", screen: "pool-selection" })
          }
        >
          <Play className="size-5" /> Play
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="h-12 gap-2 text-base"
          onClick={() => dispatch({ type: "NAVIGATE", screen: "high-scores" })}
        >
          <Trophy className="size-5" /> High Scores
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="h-12 gap-2 text-base"
          onClick={() => dispatch({ type: "NAVIGATE", screen: "shop" })}
        >
          <ShoppingBag className="size-5" /> Shop
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="h-12 gap-2 text-base"
          onClick={() => dispatch({ type: "NAVIGATE", screen: "settings" })}
        >
          <Settings className="size-5" /> Settings
        </Button>
        <Button
          variant="ghost"
          size="lg"
          className="h-12 gap-2 text-base"
          onClick={() => dispatch({ type: "NAVIGATE", screen: "how-to-play" })}
        >
          <HelpCircle className="size-5" /> How To Play
        </Button>
      </nav>
    </main>
  );
}
