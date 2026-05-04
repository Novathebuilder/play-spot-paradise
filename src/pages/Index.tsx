import { useEffect, useMemo, useState } from "react";
import { Clock, Heart } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { HeroSection } from "@/components/HeroSection";
import { CategoryBar } from "@/components/CategoryBar";
import { GameGrid } from "@/components/GameGrid";
import { GamePlayer } from "@/components/GamePlayer";
import { GAMES, type Game, type GameCategory } from "@/data/games";
import { useGameLibrary } from "@/hooks/useGameLibrary";

const Index = () => {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<GameCategory | "All">("All");
  const [active, setActive] = useState<Game | null>(null);
  const { favorites, recents, toggleFavorite, addRecent, isFavorite } = useGameLibrary();

  useEffect(() => {
    document.title = "Nova Games — Free HTML5 Games Online";
    const desc = "Play hundreds of free online HTML5 games instantly. Action, puzzle, racing, multiplayer .io games — no downloads, no installs.";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", desc);
  }, []);

  const handlePlay = (g: Game) => {
    setActive(g);
    addRecent(g.id);
  };

  const featured = useMemo(() => GAMES.filter((g) => g.featured), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GAMES.filter((g) => {
      const matchesCat = category === "All" || g.category === category;
      if (!matchesCat) return false;
      if (!q) return true;
      return (
        g.title.toLowerCase().includes(q) ||
        g.category.toLowerCase().includes(q) ||
        g.tags.some((t) => t.includes(q))
      );
    });
  }, [query, category]);

  const recentGames = useMemo(
    () => recents.map((id) => GAMES.find((g) => g.id === id)).filter(Boolean) as Game[],
    [recents],
  );
  const favoriteGames = useMemo(
    () => favorites.map((id) => GAMES.find((g) => g.id === id)).filter(Boolean) as Game[],
    [favorites],
  );

  const showLibrary = !query && category === "All";

  return (
    <div className="min-h-screen bg-background">
      {/* Ambient background glow */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute top-1/2 right-0 h-96 w-96 rounded-full bg-secondary/20 blur-[140px]" />
        <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-accent/15 blur-[140px]" />
      </div>

      <SiteHeader query={query} onQueryChange={setQuery} />

      <main className="container space-y-10 py-6 sm:py-10">
        {showLibrary && <HeroSection featured={featured} onPlay={handlePlay} />}

        <CategoryBar active={category} onChange={setCategory} />

        {showLibrary && recentGames.length > 0 && (
          <Section title="Recently played" icon={<Clock className="h-5 w-5 text-secondary" />}>
            <GameGrid
              games={recentGames}
              favorites={favorites}
              onPlay={handlePlay}
              onToggleFavorite={toggleFavorite}
            />
          </Section>
        )}

        {showLibrary && favoriteGames.length > 0 && (
          <Section title="Your favorites" icon={<Heart className="h-5 w-5 fill-current text-accent" />}>
            <GameGrid
              games={favoriteGames}
              favorites={favorites}
              onPlay={handlePlay}
              onToggleFavorite={toggleFavorite}
            />
          </Section>
        )}

        <Section
          title={
            query
              ? `Search results for "${query}"`
              : category === "All"
              ? "All games"
              : `${category} games`
          }
          subtitle={`${filtered.length} game${filtered.length === 1 ? "" : "s"}`}
        >
          <GameGrid
            games={filtered}
            favorites={favorites}
            onPlay={handlePlay}
            onToggleFavorite={toggleFavorite}
          />
        </Section>
      </main>

      <footer className="border-t border-border/60 py-8 text-center text-xs text-muted-foreground">
        <p>
          Nova Games © {new Date().getFullYear()} · Built for fun. Games embedded from their original publishers.
        </p>
      </footer>

      <GamePlayer game={active} onClose={() => setActive(null)} />
    </div>
  );
};

function Section({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <h2 className="flex items-center gap-2 text-xl font-extrabold tracking-tight sm:text-2xl">
          {icon}
          {title}
        </h2>
        {subtitle && <span className="text-xs text-muted-foreground sm:text-sm">{subtitle}</span>}
      </div>
      {children}
    </section>
  );
}

export default Index;
