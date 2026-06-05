import { useCallback, useEffect, useState } from "react";
import { GameShell, NativeGameProps } from "./shell";
import { useGameSave } from "@/hooks/useGameSave";

type Cell = { mine: boolean; revealed: boolean; flagged: boolean; n: number };
const CONFIGS = { Easy: { w: 9, h: 9, m: 10 }, Medium: { w: 12, h: 12, m: 25 }, Hard: { w: 16, h: 16, m: 50 } } as const;
type Diff = keyof typeof CONFIGS;

const make = (d: Diff): Cell[][] => {
  const { w, h, m } = CONFIGS[d];
  const board: Cell[][] = Array.from({ length: h }, () =>
    Array.from({ length: w }, () => ({ mine: false, revealed: false, flagged: false, n: 0 })),
  );
  let placed = 0;
  while (placed < m) {
    const x = Math.floor(Math.random() * w), y = Math.floor(Math.random() * h);
    if (!board[y][x].mine) { board[y][x].mine = true; placed++; }
  }
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (board[y][x].mine) continue;
    let n = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const nx = x + dx, ny = y + dy;
      if (nx >= 0 && ny >= 0 && nx < w && ny < h && board[ny][nx].mine) n++;
    }
    board[y][x].n = n;
  }
  return board;
};

const flood = (b: Cell[][], x: number, y: number) => {
  const h = b.length, w = b[0].length;
  const stack: [number, number][] = [[x, y]];
  while (stack.length) {
    const [cx, cy] = stack.pop()!;
    if (cx < 0 || cy < 0 || cx >= w || cy >= h) continue;
    const c = b[cy][cx];
    if (c.revealed || c.flagged || c.mine) continue;
    c.revealed = true;
    if (c.n === 0) {
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) stack.push([cx + dx, cy + dy]);
    }
  }
};

const NUM_COLOR = ["", "text-blue-500", "text-green-500", "text-red-500", "text-purple-500", "text-orange-500", "text-cyan-500", "text-pink-500", "text-yellow-500"];

export const MinesweeperGame = ({ onClose: _ }: NativeGameProps) => {
  const [diff, setDiff] = useState<Diff>("Easy");
  const { save, recordRun } = useGameSave(`nova-mine-${diff}`);
  const [board, setBoard] = useState<Cell[][]>(() => make(diff));
  const [over, setOver] = useState<"none" | "won" | "lost">("none");
  const [start, setStart] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);

  const reset = useCallback(() => {
    setBoard(make(diff)); setOver("none"); setStart(null); setElapsed(0);
  }, [diff]);

  useEffect(() => { reset(); }, [diff, reset]);
  useEffect(() => {
    if (!start || over !== "none") return;
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 250);
    return () => clearInterval(t);
  }, [start, over]);

  const check = (b: Cell[][]) => {
    const total = b.length * b[0].length;
    const revealed = b.flat().filter((c) => c.revealed).length;
    if (revealed === total - CONFIGS[diff].m) {
      setOver("won");
      recordRun(Math.max(0, 1000 - elapsed * 2), [`Cleared ${diff}`]);
    }
  };

  const reveal = (x: number, y: number) => {
    if (over !== "none") return;
    setStart((s) => s ?? Date.now());
    const b = board.map((r) => r.map((c) => ({ ...c })));
    const cell = b[y][x];
    if (cell.flagged) return;
    if (cell.mine) {
      b.forEach((r) => r.forEach((c) => { if (c.mine) c.revealed = true; }));
      setBoard(b); setOver("lost"); recordRun(0); return;
    }
    flood(b, x, y);
    setBoard(b);
    check(b);
  };
  const flag = (e: React.MouseEvent, x: number, y: number) => {
    e.preventDefault();
    if (over !== "none") return;
    setBoard((prev) => prev.map((r, ry) => r.map((c, cx) => (cx === x && ry === y && !c.revealed ? { ...c, flagged: !c.flagged } : c))));
  };

  const { w, h, m } = CONFIGS[diff];
  const flagged = board.flat().filter((c) => c.flagged).length;

  return (
    <GameShell
      best={save.stats.bestScore}
      status={over === "won" ? `Won in ${elapsed}s` : over === "lost" ? "Boom! Game over" : `💣 ${m - flagged} · ${elapsed}s`}
      onRestart={reset}
      controls={
        <div className="flex gap-1">
          {(Object.keys(CONFIGS) as Diff[]).map((d) => (
            <button key={d} onClick={() => setDiff(d)} className={`rounded-md px-2 py-1 text-xs font-bold ${d === diff ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}>{d}</button>
          ))}
        </div>
      }
    >
      <div className="grid gap-px bg-border/40 p-px rounded-lg" style={{ gridTemplateColumns: `repeat(${w}, 28px)` }}>
        {board.flatMap((row, y) =>
          row.map((c, x) => (
            <button
              key={`${x}-${y}`}
              onClick={() => reveal(x, y)}
              onContextMenu={(e) => flag(e, x, y)}
              className={`flex h-7 w-7 items-center justify-center text-xs font-bold ${c.revealed ? (c.mine ? "bg-red-500 text-white" : "bg-card") : "bg-muted hover:bg-muted/70"} ${c.revealed && !c.mine ? NUM_COLOR[c.n] : ""}`}
            >
              {c.revealed ? (c.mine ? "💣" : c.n || "") : c.flagged ? "🚩" : ""}
            </button>
          )),
        )}
      </div>
      <p className="mt-2 text-center text-xs text-muted-foreground">Left-click reveal · Right-click flag</p>
    </GameShell>
  );
};

export default MinesweeperGame;