import { Play, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/hero-gaming.jpg";
import type { Game } from "@/data/games";

interface Props {
  featured: Game[];
  onPlay: (game: Game) => void;
}

export const HeroSection = ({ featured, onPlay }: Props) => {
  const hero = featured[0];
  return (
    <section className="relative overflow-hidden rounded-3xl border border-border/60">
      <img
        src={heroImg}
        alt="Neon arcade backdrop"
        width={1920}
        height={768}
        className="absolute inset-0 h-full w-full object-cover opacity-60"
      />
      <div className="absolute inset-0 bg-gradient-to-tr from-background via-background/60 to-transparent" />
      <div className="relative grid gap-8 p-6 sm:p-10 md:grid-cols-[1.2fr_1fr] md:p-14">
        <div className="flex flex-col justify-center">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-secondary/40 bg-secondary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-secondary">
            <Flame className="h-3 w-3" /> Trending now
          </span>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Play <span className="text-gradient">free games</span>
            <br /> instantly in your browser
          </h1>
          <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
            Hundreds of HTML5 hits — action, puzzle, racing, multiplayer .io games and more.
            No downloads, no installs, just press play.
          </p>
          {hero && (
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                onClick={() => onPlay(hero)}
                className="h-12 rounded-full bg-gradient-primary px-6 text-base font-bold text-primary-foreground shadow-glow hover:opacity-95"
              >
                <Play className="mr-2 h-5 w-5 fill-current" />
                Play {hero.title}
              </Button>
              <span className="text-sm text-muted-foreground">⭐ Featured pick of the day</span>
            </div>
          )}
        </div>

        {/* Featured stack */}
        <div className="relative hidden md:block">
          <div className="absolute right-0 top-1/2 flex -translate-y-1/2 gap-3">
            {featured.slice(0, 3).map((g, i) => (
              <button
                key={g.id}
                onClick={() => onPlay(g)}
                style={{ animationDelay: `${i * 200}ms` }}
                className={`group relative flex h-48 w-32 animate-float flex-col justify-end overflow-hidden rounded-2xl border border-border/40 shadow-card transition-smooth hover:scale-105 hover:shadow-glow lg:h-56 lg:w-40`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${g.thumbnailGradient}`} />
                <span className="absolute inset-0 flex items-center justify-center text-5xl">{g.emoji}</span>
                <div className="relative bg-gradient-to-t from-background/95 to-transparent p-3">
                  <p className="truncate text-sm font-bold">{g.title}</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{g.category}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};