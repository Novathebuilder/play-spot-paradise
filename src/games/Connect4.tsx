import { useCallback, useEffect, useState } from "react";
import { GameShell, NativeGameProps } from "./shell";
import { useGameSave } from "@/hooks/useGameSave";

const COLS = 7, ROWS = 6;
type P = 0 | 1 | 2; // 0 empty, 1 red (player), 2 yellow

const winner = (b: P[][]): P => {
  const dirs = [[1, 0], [0, 1], [1, 1], [1, -1]];
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const v = b[r][c]; if (!v) continue;
    for (const [dx, dy] of dirs) {
      let ok = true;
      for (let k = 1; k < 4; k++) {
        const nr = r + dy * k, nc = c + dx * k;
        if (nr < 0 || nc < 0 || nr >= ROWS || nc >= COLS || b[nr][nc] !== v) { ok = false; break; }
      }
      if (ok) return v;
    }
  }
  return 0;
};

const drop = (b: P[][], col: number, p: P): P[][] | null => {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (!b[r][col]) {
      const nb = b.map((row) => row.slice() as P[]);
      nb[r][col] = p;
      return nb;
    }
  }
  return null;
};

// Simple AI: take winning move; block opponent; else center bias
const aiMove = (b: P[][]): number => {
  for (const p of [2, 1] as P[]) {
    for (let c = 0; c < COLS; c++) {
      const nb = drop(b, c, p);
      if (nb && winner(nb) === p) return c;
    }
  }
  const order = [3, 2, 4, 1, 5, 0, 6];
  for (const c of order) if (b[0][c] === 0) return c;
  return 0;
};

type Mode = "AI" | "2P";

export const Connect4Game = ({ onClose: _ }: NativeGameProps) => {
  const [mode, setMode] = useState<Mode>("AI");
  const { save, recordRun } = useGameSave(`nova-c4-${mode}`);
  const empty = (): P[][] => Array.from({ length: ROWS }, () => Array(COLS).fill(0) as P[]);
  const [board, setBoard] = useState<P[][]>(empty);
  const [turn, setTurn] = useState<P>(1);
  const w = winner(board);
  const full = board[0].every((c) => c);

  const reset = useCallback(() => { setBoard(empty()); setTurn(1); }, []);
  useEffect(reset, [mode, reset]);

  useEffect(() => {
    if (mode !== "AI" || w || full || turn !== 2) return;
    const t = setTimeout(() => {
      const c = aiMove(board);
      const nb = drop(board, c, 2);
      if (nb) { setBoard(nb); setTurn(1); }
    }, 350);
    return () => clearTimeout(t);
  }, [board, turn, mode, w, full]);

  useEffect(() => {
    if (w === 1) recordRun(1, ["Win"]);
    else if (w === 2 && mode === "AI") recordRun(0);
    else if (full && !w) recordRun(0);
  }, [w, full, recordRun, mode]);

  const click = (c: number) => {
    if (w || full) return;
    if (mode === "AI" && turn !== 1) return;
    const nb = drop(board, c, turn);
    if (!nb) return;
    setBoard(nb);
    setTurn((t) => (t === 1 ? 2 : 1));
  };

  return (
    <GameShell
      score={save.stats.plays}
      best={save.stats.bestScore}
      status={w ? `${w === 1 ? "Red" : "Yellow"} wins!` : full ? "Draw" : `${turn === 1 ? "Red" : "Yellow"}'s turn`}
      onRestart={reset}
      controls={
        <div className="flex gap-1">
          {(["AI", "2P"] as Mode[]).map((m) => (
            <button key={m} onClick={() => setMode(m)} className={`rounded-md px-2 py-1 text-xs font-bold ${m === mode ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}>{m}</button>
          ))}
        </div>
      }
    >
      <div className="rounded-xl bg-blue-700 p-2">
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${COLS}, 40px)` }}>
          {board.flatMap((row, r) => row.map((v, c) => (
            <button key={`${r}-${c}`} onClick={() => click(c)} className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-900 hover:bg-blue-800">
              <span className={`block h-8 w-8 rounded-full ${v === 1 ? "bg-red-500" : v === 2 ? "bg-yellow-400" : "bg-blue-950"}`} />
            </button>
          )))}
        </div>
      </div>
    </GameShell>
  );
};

export default Connect4Game;