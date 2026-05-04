import { Search, Gamepad2 } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Props {
  query: string;
  onQueryChange: (q: string) => void;
}

export const SiteHeader = ({ query, onQueryChange }: Props) => {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center gap-3 sm:gap-6">
        <a href="/" className="flex items-center gap-2 font-extrabold tracking-tight">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
            <Gamepad2 className="h-5 w-5 text-primary-foreground" />
          </span>
          <span className="text-lg sm:text-xl">
            Nova<span className="text-gradient"> Games</span>
          </span>
        </a>
        <div className="relative ml-auto w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search games, e.g. tetris, chess, racing…"
            className="h-10 rounded-full border-border/60 bg-muted/40 pl-10 focus-visible:ring-primary"
            aria-label="Search games"
          />
        </div>
      </div>
    </header>
  );
};