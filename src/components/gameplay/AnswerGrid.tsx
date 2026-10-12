import { useEffect, useRef } from "react";
import { Check, X } from "lucide-react";
import { cn } from "cn";
import { Button } from "../ui/button";

interface Props {
  choices: string[];
  correctChoice: string;
  selectedChoice: string | null;
  revealVisible: boolean;
  disabled: boolean;
  onSelect: (choice: string) => void;
}

const LETTER_LABELS = ["A", "B", "C", "D"];

export function AnswerGrid({
  choices,
  correctChoice,
  selectedChoice,
  revealVisible,
  disabled,
  onSelect,
}: Props) {
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (disabled) return;
      const digit = "1234".indexOf(e.key);
      const letter = "abcdABCD".indexOf(e.key) % 4;
      const index =
        digit !== -1 ? digit : "abcdABCD".includes(e.key) ? letter : -1;
      if (index !== -1 && index < choices.length) {
        onSelect(choices[index]);
        return;
      }
      const focusedIndex = buttonRefs.current.findIndex(
        (b) => b === document.activeElement,
      );
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        const next = Math.min(choices.length - 1, focusedIndex + 1);
        buttonRefs.current[next]?.focus();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        const prev = Math.max(0, focusedIndex - 1);
        buttonRefs.current[prev]?.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [choices, disabled, onSelect]);

  const gridClass =
    choices.length === 2
      ? "grid grid-cols-1 gap-3 sm:grid-cols-2"
      : "grid grid-cols-1 gap-3 sm:grid-cols-2";

  return (
    <div
      className={cn("mt-4", gridClass)}
      role="group"
      aria-label="Answer choices"
    >
      {choices.map((choice, i) => {
        const isCorrect = revealVisible && choice === correctChoice;
        const isWrongPick =
          revealVisible &&
          choice === selectedChoice &&
          choice !== correctChoice;
        return (
          <Button
            key={choice}
            ref={(el) => (buttonRefs.current[i] = el)}
            variant="outline"
            disabled={disabled}
            onClick={() => onSelect(choice)}
            className={cn(
              "h-auto min-h-14 w-full justify-start gap-3 whitespace-normal px-4 py-3 text-left text-base font-normal",
              isCorrect &&
                "border-success bg-success/15 text-success-foreground hover:bg-success/15",
              isWrongPick &&
                "border-destructive bg-destructive/15 text-destructive hover:bg-destructive/15",
              !revealVisible &&
                choice === selectedChoice &&
                "border-primary bg-primary/10",
            )}
          >
            <span className="answer-badge flex size-7 shrink-0 items-center justify-center rounded-full border border-current text-sm font-bold">
              {LETTER_LABELS[i]}
            </span>
            <span className="answer-text flex-1">{choice}</span>
            {isCorrect && (
              <Check className="size-5 shrink-0" aria-hidden="true" />
            )}
            {isWrongPick && (
              <X className="size-5 shrink-0" aria-hidden="true" />
            )}
          </Button>
        );
      })}
    </div>
  );
}
