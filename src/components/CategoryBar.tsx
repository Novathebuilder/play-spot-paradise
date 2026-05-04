import { cn } from "@/lib/utils";
import { CATEGORIES, type GameCategory } from "@/data/games";
import { Sparkles } from "lucide-react";

interface Props {
  active: GameCategory | "All";
  onChange: (c: GameCategory | "All") => void;
}

export const CategoryBar = ({ active, onChange }: Props) => {
  const items: ({ name: GameCategory | "All"; emoji: string })[] = [
    { name: "All", emoji: "✨" },
    ...CATEGORIES,
  ];
  return (
    <div className="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
      {items.map((c) => {
        const isActive = c.name === active;
        return (
          <button
            key={c.name}
            onClick={() => onChange(c.name)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition-smooth",
              isActive
                ? "border-transparent bg-gradient-primary text-primary-foreground shadow-glow"
                : "border-border/60 bg-card/60 text-foreground hover:border-primary/40 hover:bg-card",
            )}
          >
            <span aria-hidden>{c.emoji}</span>
            {c.name}
          </button>
        );
      })}
      <span className="ml-1 hidden items-center gap-1 self-center text-xs text-muted-foreground sm:flex">
        <Sparkles className="h-3 w-3" /> {CATEGORIES.length} categories
      </span>
    </div>
  );
};