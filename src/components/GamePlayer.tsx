import { useEffect } from "react";
import { ExternalLink, Maximize2, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Game } from "@/data/games";

interface Props {
  game: Game | null;
  onClose: () => void;
}

export const GamePlayer = ({ game, onClose }: Props) => {
  useEffect(() => {
    if (!game) return;
    document.title = `Playing ${game.title} · NeonPlay`;
    return () => {
      document.title = "NeonPlay — Free HTML5 Games Online";
    };
  }, [game]);

  return (
    <Dialog open={!!game} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-6xl border-border/60 bg-card p-0 sm:rounded-2xl">
        {game && (
          <div className="flex flex-col">
            <div className="flex items-center justify-between gap-3 border-b border-border/60 p-3 sm:p-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-2xl ${game.thumbnailGradient}`}>
                  <span aria-hidden>{game.emoji}</span>
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-base font-bold text-foreground sm:text-lg">{game.title}</h2>
                  <p className="truncate text-xs text-muted-foreground">{game.category} · {game.tags.join(" · ")}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button asChild variant="ghost" size="icon" aria-label="Open in new tab">
                  <a href={game.embedUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Fullscreen"
                  onClick={() => {
                    const el = document.getElementById("game-frame");
                    if (el?.requestFullscreen) el.requestFullscreen();
                  }}
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="relative aspect-video w-full bg-background">
              <iframe
                id="game-frame"
                key={game.id}
                src={game.embedUrl}
                title={game.title}
                className="absolute inset-0 h-full w-full"
                allow="autoplay; fullscreen; gamepad; microphone; camera"
                allowFullScreen
                referrerPolicy="no-referrer"
              />
            </div>
            <p className="border-t border-border/60 p-3 text-center text-xs text-muted-foreground">
              Some games may block embedding. If the screen is empty, click the ↗ icon to open in a new tab.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};