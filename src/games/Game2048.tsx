import { useCallback, useEffect, useRef, useState } from "react";
import { GameShell, NativeGameProps } from "./shell";
import { useGameSave } from "@/hooks/useGameSave";

type Grid = number[][];
interface SaveState { grid: Grid; score: number }

const N = 4;
const empty = (): Grid => Array.from({ length: N }, () => Array(N).fill(0));

const addTile = (g: Grid): Grid => {
  const empties: [number, number][] = [];
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (!g[r][c]) empties.push([r, c]);
  if (!empties.length) return g;
  const [r, c] = empties[Math.floor(Math.random() * empties.length)];
  const ng = g.map((row) => row.slice());
  ng[r][c] = Math.random() < 0.9 ? 2 : 4;
  return ng;
};

const initial = (): SaveState => ({ grid: addTile(addTile(empty())), score: 0 });

const slideRow = (row: number[]): { row: number[]; gained: number } => {
  const nz = row.filter((v) => v);
  const out: number[] = [];
  let gained = 0;
  for (let i = 0; i < nz.length; i++) {
    if (nz[i] === nz[i + 1]) { out.push(nz[i] * 2); gained += nz[i] * 2; i++; }
    else out.push(nz[i]);
  }
  while (out.length < N) out.push(0);
  return { row: out, gained };
};

const move = (g: Grid, dir: "L" | "R" | "U" | "D"): { grid: Grid; gained: number; changed: boolean } => {
  let grid: Grid = g.map((r) => r.slice());
  let gained = 0;
  const rotateCW = (m: Grid): Grid => m[0].map((_, i) => m.map((r) => r[i]).reverse());
  const rotateCCW = (m: Grid): Grid => m[0].map((_, i) => m.map((r) => r[r.length - 1 - i]));
  if (dir === "U") grid = rotateCCW(grid);
  if (dir === "D") grid = rotateCW(grid);
  if (dir === "R") grid = grid.map((r) => r.slice().reverse());
  for (let r = 0; r < N; r++) {
    const { row, gained: gn } = slideRow(grid[r]);
    grid[r] = row;
    gained += gn;
  }
  if (dir === "R") grid = grid.map((r) => r.slice().reverse());
  if (dir === "U") grid = rotateCW(grid);
  if (dir === "D") grid = rotateCCW(grid);
  const changed = JSON.stringify(grid) !== JSON.stringify(g);
  return { grid, gained, changed };
};

const isOver = (g: Grid) => {
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    if (!g[r][c]) return false;
    if (c + 1 < N && g[r][c] === g[r][c + 1]) return false;
    if (r + 1 < N && g[r][c] === g[r + 1][c]) return false;
  }
  return true;
};

const TILE_BG: Record<number, string> = {
  0: "bg-muted/20",
  2: "bg-amber-100 text-amber-900",
  4: "bg-amber-200 text-amber-900",
  8: "bg-orange-400 text-white",
  16: "bg-orange-500 text-white",
  32: "bg-orange-600 text-white",
  64: "bg-red-500 text-white",
  128: "bg-yellow-400 text-white",
  256: "bg-yellow-500 text-white",
  512: "bg-yellow-600 text-white",
  1024: "bg-indigo-500 text-white",
  2048: "bg-emerald-500 text-white",
  4096: "bg-fuchsia-600 text-white",
};

export const Game2048 = ({ onClose: _ }: NativeGameProps) => {
  const { save, saveState, clearState, recordRun } = useGameSave<SaveState>("nova-2048");
  const [state, setState] = useState<SaveState>(() => save.state ?? initial());
  const [over, setOver] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  const restart = useCallback(() => { setState(initial()); setOver(false); clearState(); }, [clearState]);

  const tryMove = useCallback((dir: "L" | "R" | "U" | "D") => {
    if (over) return;
    setState((prev) => {
      const { grid, gained, changed } = move(prev.grid, dir);
      if (!changed) return prev;
      const next = { grid: addTile(grid), score: prev.score + gained };
      if (isOver(next.grid)) {
        setOver(true);
        const ach: string[] = [];
        const max = Math.max(...next.grid.flat());
        if (max >= 512) ach.push("512 club");
        if (max >= 1024) ach.push("1024 club");
        if (max >= 2048) ach.push("Won 2048");
        recordRun(next.score, ach);
        setTimeout(() => clearState(), 0);
      }
      return next;
    });
  }, [over, recordRun, clearState]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key;
      if (k === "ArrowLeft" || k === "a") tryMove("L");
      else if (k === "ArrowRight" || k === "d") tryMove("R");
      else if (k === "ArrowUp" || k === "w") tryMove("U");
      else if (k === "ArrowDown" || k === "s") tryMove("D");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tryMove]);

  useEffect(() => { if (!over) saveState(stateRef.current); }, [state, over, saveState]);

  // touch
  const touch = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touch.current) return;
    const dx = e.changedTouches[0].clientX - touch.current.x;
    const dy = e.changedTouches[0].clientY - touch.current.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return;
    if (Math.abs(dx) > Math.abs(dy)) tryMove(dx > 0 ? "R" : "L");
    else tryMove(dy > 0 ? "D" : "U");
  };

  return (
    <GameShell
      score={state.score}
      best={save.stats.bestScore}
      status={over ? "Game over" : "Arrows / WASD / Swipe"}
      onRestart={restart}
    >
      <div
        className="grid select-none gap-2 rounded-xl bg-muted/30 p-2"
        style={{ gridTemplateColumns: `repeat(${N}, 70px)` }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {state.grid.flat().map((v, i) => (
          <div
            key={i}
            className={`flex h-[70px] w-[70px] items-center justify-center rounded-lg text-xl font-extrabold transition-all ${TILE_BG[v] ?? "bg-fuchsia-700 text-white"}`}
          >
            {v || ""}
          </div>
        ))}
      </div>
    </GameShell>
  );
};

export default Game2048;