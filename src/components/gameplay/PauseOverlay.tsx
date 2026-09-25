import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface Props {
  onResume: () => void;
  onRestart: () => void;
  onChangeSettings: () => void;
  onQuit: () => void;
}

export function PauseOverlay({
  onResume,
  onRestart,
  onChangeSettings,
  onQuit,
}: Props) {
  return (
    <div
      className="flex min-h-[50vh] items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Paused"
    >
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Paused</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Button onClick={onResume}>Resume</Button>
          <Button variant="outline" onClick={onRestart}>
            Restart This Run
          </Button>
          <Button variant="outline" onClick={onChangeSettings}>
            Change Settings
          </Button>
          <Button variant="destructive" onClick={onQuit}>
            Quit to Main Menu
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
