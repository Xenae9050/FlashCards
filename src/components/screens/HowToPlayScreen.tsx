import { useFocusOnMount } from "../../hooks/useFocusOnMount";
import { useAppState } from "../../state/AppStateContext";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export function HowToPlayScreen() {
  const { dispatch } = useAppState();
  const headingRef = useFocusOnMount<HTMLHeadingElement>();

  return (
    <main className="screen how-to-play-screen mx-auto max-w-2xl p-6">
      <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-bold">
        How To Play
      </h1>
      <div className="mt-4 flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>The Basics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Pick one or more question pools and a difficulty filter, choose
              a game mode, then answer multiple-choice questions. The correct
              answer is always shown after you answer, whether you got it
              right or wrong.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Game Modes</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              <li>
                <strong className="text-card-foreground">Sudden Death</strong>{" "}
                — answer as many questions in a row as you can. One wrong
                answer (or a timeout) ends the run.
              </li>
              <li>
                <strong className="text-card-foreground">Race</strong> —
                answer as many questions correctly as possible before the
                overall clock runs out.
              </li>
              <li>
                <strong className="text-card-foreground">Quickdraw</strong> —
                you have 3 lives and a short timer per question.
              </li>
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Points &amp; Coins</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Correct answers earn Points based on difficulty, your current
              streak, and how fast you answered. Points convert into
              persistent Coins you can spend in the Shop on cosmetic themes,
              card styles, avatars, celebrations and sound packs.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Use your mouse to click any button, or your keyboard: number
              keys 1–4 or letter keys A–D select an answer, arrow keys move
              focus, Enter/Space activates, and Escape opens or closes Pause.
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="screen-actions mt-6">
        <Button
          variant="outline"
          onClick={() => dispatch({ type: "NAVIGATE", screen: "main-menu" })}
        >
          Back
        </Button>
      </div>
    </main>
  );
}
