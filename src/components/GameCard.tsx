import { Heart, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Game } from "@/data/games";

interface Props {
  game: Game;
  isFavorite: boolean;
  onPlay: (game: Game) => void;
  onToggleFavorite: (id: string) => void;
  size?: "sm" | "md" | "lg";
}

export const GameCard = ({ game, isFavorite, onPlay, onToggleFavorite, size = "md" }: Props) => {
  const sizeCls =
    size === "lg"
      ? "aspect-[4/5]"
      : size === "sm"
      ? "aspect-square"
      : "aspect-[4/5]";

  return (
    <button
      onClick={() => onPlay(game)}
      className={cn(
        "group relative overflow-hidden rounded-2xl text-left transition-smooth",
        "shadow-card hover:shadow-glow hover:-translate-y-1",
        "bg-gradient-card border border-border/60",
        sizeCls,
      )}
      aria-label={`Play ${game.title}`}
    >
      {/* Thumbnail */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-90 transition-smooth group-hover:opacity-100",
          game.thumbnailGradient,
        )}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_55%)]" />
      <div className="absolute inset-0 flex items-center justify-center text-6xl drop-shadow-lg transition-smooth group-hover:scale-110 sm:text-7xl">
        <span aria-hidden>{game.emoji}</span>
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 flex items-end bg-gradient-to-t from-background/95 via-background/40 to-transparent p-3 sm:p-4">
        <div className="w-full">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-bold text-foreground sm:text-base">{game.title}</h3>
              <p className="text-xs text-muted-foreground">{game.category}</p>
            </div>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground opacity-0 shadow-glow transition-smooth group-hover:opacity-100">
              <Play className="h-4 w-4 fill-current" />
            </span>
          </div>
        </div>
      </div>

      {/* Favorite */}
      <span
        role="button"
        tabIndex={0}
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(game.id);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            e.stopPropagation();
            onToggleFavorite(game.id);
          }
        }}
        className={cn(
          "absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-smooth",
          "bg-background/40 hover:bg-background/70",
          isFavorite && "text-accent",
        )}
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      >
        <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
      </span>

      {game.featured && (
        <span className="absolute left-2 top-2 rounded-full bg-background/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-secondary backdrop-blur-md">
          ✦ Hot
        </span>
      )}
    </button>
  );
};