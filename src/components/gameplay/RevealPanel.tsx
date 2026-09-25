import { CheckCircle2, XCircle } from "lucide-react";
import type { Question } from "../../domain/types";
import { Button } from "../ui/button";
import { cn } from "cn";

interface Props {
  question: Question;
  selectedChoice: string | null;
  wasCorrect: boolean | null;
  canContinue: boolean;
  onContinue: () => void;
}

export function RevealPanel({
  question,
  selectedChoice,
  wasCorrect,
  canContinue,
  onContinue,
}: Props) {
  const statusText =
    selectedChoice === null
      ? "Time's up!"
      : wasCorrect
      ? "Correct!"
      : "Not quite.";

  return (
    <div className="mt-4 rounded-lg border border-border bg-card p-4 text-card-foreground">
      <p
        aria-live="polite"
        className={cn(
          "flex items-center gap-2 text-lg font-bold",
          wasCorrect ? "text-success" : "text-destructive",
        )}
      >
        {wasCorrect ? (
          <CheckCircle2 className="size-5" aria-hidden="true" />
        ) : (
          <XCircle className="size-5" aria-hidden="true" />
        )}
        {statusText}
      </p>
      {question.explanation && (
        <p className="mt-2 text-sm text-muted-foreground">
          {question.explanation}
        </p>
      )}
      <Button className="mt-4" disabled={!canContinue} onClick={onContinue}>
        Continue
      </Button>
    </div>
  );
}
