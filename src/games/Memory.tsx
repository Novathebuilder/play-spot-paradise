import { useCallback, useEffect, useState } from "react";
import { GameShell, NativeGameProps } from "./shell";
import { useGameSave } from "@/hooks/useGameSave";

const EMOJIS = ["🍎", "🚀", "🐱", "⚡", "🌈", "🎲", "🎸", "🦄", "🍕", "👑", "🐙", "🔥", "💎", "🌙", "🎨", "🍩"];
const SIZES = { Easy: 6, Medium: 10, Hard: 16 } as const;
type Difficulty = keyof typeof SIZES;

interface Card { id: number; emoji: string; flipped: boolean; matched: boolean }

const makeDeck = (diff: Difficulty): Card[] => {
  const n = SIZES[diff];
  const set = EMOJIS.slice(0, n);
  const deck = [...set, ...set].map((e, i) => ({ id: i, emoji: e, flipped: false, matched: false }));
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};

export const MemoryGame = ({ onClose: _ }: NativeGameProps) => {
  const [diff, setDiff] = useState<Difficulty>("Medium");
  const { save, recordRun } = useGameSave(`nova-memory-${diff}`);
  const [cards, setCards] = useState<Card[]>(() => makeDeck(diff));
  const [moves, setMoves] = useState(0);
  const [start, setStart] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [won, setWon] = useState(false);

  const reset = useCallback(() => {
    setCards(makeDeck(diff)); setMoves(0); setStart(null); setElapsed(0); setWon(false);
  }, [diff]);

  useEffect(() => { reset(); }, [diff, reset]);

  useEffect(() => {
    if (!start || won) return;
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 250);
    return () => clearInterval(t);
  }, [start, won]);

  const flip = (idx: number) => {
    if (won) return;
    setStart((s) => s ?? Date.now());
    setCards((prev) => {
      const flipped = prev.filter((c) => c.flipped && !c.matched);
      if (flipped.length === 2) return prev;
      if (prev[idx].flipped || prev[idx].matched) return prev;
      const next = prev.map((c, i) => (i === idx ? { ...c, flipped: true } : c));
      const pair = next.filter((c) => c.flipped && !c.matched);
      if (pair.length === 2) {
        setMoves((m) => m + 1);
        if (pair[0].emoji === pair[1].emoji) {
          setTimeout(() => {
            setCards((p) => p.map((c) => (c.emoji === pair[0].emoji ? { ...c, matched: true } : c)));
          }, 350);
        } else {
          setTimeout(() => {
            setCards((p) => p.map((c) => (c.flipped && !c.matched ? { ...c, flipped: false } : c)));
          }, 800);
        }
      }
      return next;
    });
  };

  useEffect(() => {
    if (!won && cards.length && cards.every((c) => c.matched)) {
      setWon(true);
      const score = Math.max(0, 1000 - moves * 5 - elapsed * 2);
      const ach: string[] = [`Cleared ${diff}`];
      if (moves <= SIZES[diff]) ach.push("Perfect run");
      recordRun(score, ach);
    }
  }, [cards, won, moves, elapsed, diff, recordRun]);

  const cols = diff === "Easy" ? 4 : diff === "Medium" ? 5 : 8;

  return (
    <GameShell
      score={moves}
      best={save.stats.bestScore}
      status={won ? `Solved in ${elapsed}s` : `${elapsed}s · Moves`}
      onRestart={reset}
      controls={
        <div className="flex gap-1">
          {(["Easy", "Medium", "Hard"] as Difficulty[]).map((d) => (
            <button
              key={d}
              onClick={() => setDiff(d)}
              className={`rounded-md px-2 py-1 text-xs font-bold ${d === diff ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}
            >{d}</button>
          ))}
        </div>
      }
    >
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, 56px)` }}>
        {cards.map((c, i) => (
          <button
            key={c.id}
            onClick={() => flip(i)}
            className={`flex h-14 w-14 items-center justify-center rounded-lg border border-border/40 text-2xl transition-all ${c.flipped || c.matched ? "bg-card" : "bg-gradient-primary"} ${c.matched ? "opacity-60" : ""}`}
          >
            {c.flipped || c.matched ? c.emoji : ""}
          </button>
        ))}
      </div>
    </GameShell>
  );
};

export default MemoryGame;