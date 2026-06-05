import { ReactNode } from "react";
import { RotateCcw, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface NativeGameProps {
  /** Called when player closes the modal. */
  onClose: () => void;
}

interface ShellProps {
  title?: string;
  score?: number;
  best?: number;
  status?: string;
  onRestart?: () => void;
  controls?: ReactNode;
  children: ReactNode;
}

export const GameShell = ({ score, best, status, onRestart, controls, children }: ShellProps) => (
  <div className="flex w-full flex-col items-center gap-3 p-3 sm:p-4">
    <div className="flex w-full flex-wrap items-center justify-between gap-2 text-sm">
      <div className="flex items-center gap-3">
        {typeof score === "number" && (
          <span className="rounded-md bg-secondary/20 px-2 py-1 font-bold text-secondary">Score: {score}</span>
        )}
        {typeof best === "number" && (
          <span className="flex items-center gap-1 rounded-md bg-accent/20 px-2 py-1 font-bold text-accent">
            <Trophy className="h-3.5 w-3.5" /> {best}
          </span>
        )}
        {status && <span className="text-muted-foreground">{status}</span>}
      </div>
      <div className="flex items-center gap-2">
        {controls}
        {onRestart && (
          <Button size="sm" variant="secondary" onClick={onRestart}>
            <RotateCcw className="h-3.5 w-3.5" /> Restart
          </Button>
        )}
      </div>
    </div>
    <div className="flex w-full justify-center">{children}</div>
  </div>
);

/** Made-by-Nova badge for the player chrome. */
export const NovaBadge = () => (
  <span className="rounded-full bg-gradient-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
    Made by Nova
  </span>
);