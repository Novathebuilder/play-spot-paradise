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
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onPlay(game)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onPlay(game);
        }
      }}
      className={cn(
        "group relative flex cursor-pointer flex-col text-left transition-smooth focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl",
      )}
      aria-label={`Play ${game.title}`}
    >
      {/* Square thumbnail (Poki/Friv style) */}
      <div
        className={cn(
          "relative aspect-square w-full overflow-hidden rounded-2xl border border-border/60 shadow-card transition-smooth",
          "group-hover:-translate-y-1 group-hover:shadow-glow",
        )}
      >
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br transition-smooth",
            game.thumbnailGradient,
          )}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.3),transparent_55%)]" />
        {game.iconUrl ? (
          <img
            src={game.iconUrl}
            alt={`${game.title} cover`}
            loading="lazy"
            decoding="async"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-6xl drop-shadow-lg transition-transform duration-300 group-hover:scale-110 sm:text-7xl">
            <span aria-hidden>{game.emoji}</span>
          </div>
        )}

        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-background/40 opacity-0 backdrop-blur-[2px] transition-smooth group-hover:opacity-100">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground shadow-glow">
            <Play className="h-6 w-6 fill-current" />
          </span>
        </div>

        {/* Favorite */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(game.id);
          }}
          onKeyDown={(e) => e.stopPropagation()}
          className={cn(
            "absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition-smooth",
            "bg-background/50 hover:bg-background/80",
            isFavorite && "text-accent",
          )}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
        </button>

        {game.featured && (
          <span className="absolute left-2 top-2 rounded-full bg-background/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-secondary backdrop-blur-md">
            ✦ Hot
          </span>
        )}
      </div>

      {/* Caption below tile (Poki style) */}
      <div className="px-1 pt-2">
        <h3 className="truncate text-sm font-bold text-foreground">{game.title}</h3>
        <p className="truncate text-xs text-muted-foreground">{game.category}</p>
      </div>
    </div>
  );
};