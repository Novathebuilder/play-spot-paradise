import type { Game } from "@/data/games";
import { GameCard } from "./GameCard";

interface Props {
  games: Game[];
  favorites: string[];
  onPlay: (game: Game) => void;
  onToggleFavorite: (id: string) => void;
}

export const GameGrid = ({ games, favorites, onPlay, onToggleFavorite }: Props) => {
  if (games.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/60 bg-card/40 p-12 text-center">
        <p className="text-4xl">🎮</p>
        <p className="mt-3 text-sm text-muted-foreground">No games found. Try a different search or category.</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {games.map((g, i) => (
        <div key={g.id} className="animate-fade-in-up" style={{ animationDelay: `${Math.min(i * 30, 400)}ms` }}>
          <GameCard
            game={g}
            isFavorite={favorites.includes(g.id)}
            onPlay={onPlay}
            onToggleFavorite={onToggleFavorite}
          />
        </div>
      ))}
    </div>
  );
};