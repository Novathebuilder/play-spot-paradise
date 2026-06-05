import { useCallback, useEffect, useState } from "react";
import { GameShell, NativeGameProps } from "./shell";
import { useGameSave } from "@/hooks/useGameSave";

type P = "X" | "O" | null;
type Mode = "AI" | "2P";

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

const winner = (b: P[]): P => {
  for (const [a, b1, c] of LINES) if (b[a] && b[a] === b[b1] && b[a] === b[c]) return b[a];
  return null;
};

const minimax = (b: P[], me: P, turn: P): { score: number; idx?: number } => {
  const w = winner(b);
  if (w === me) return { score: 10 };
  if (w && w !== me) return { score: -10 };
  if (b.every((c) => c)) return { score: 0 };
  let best: { score: number; idx?: number } = { score: turn === me ? -Infinity : Infinity };
  for (let i = 0; i < 9; i++) {
    if (!b[i]) {
      const nb = b.slice(); nb[i] = turn;
      const { score } = minimax(nb, me, turn === "X" ? "O" : "X");
      if (turn === me ? score > best.score : score < best.score) best = { score, idx: i };
    }
  }
  return best;
};

export const TicTacToeGame = ({ onClose: _ }: NativeGameProps) => {
  const [mode, setMode] = useState<Mode>("AI");
  const { save, recordRun } = useGameSave(`nova-ttt-${mode}`);
  const [board, setBoard] = useState<P[]>(() => Array(9).fill(null));
  const [turn, setTurn] = useState<P>("X");

  const reset = useCallback(() => { setBoard(Array(9).fill(null)); setTurn("X"); }, []);
  useEffect(reset, [mode, reset]);

  const w = winner(board);
  const draw = !w && board.every((c) => c);

  useEffect(() => {
    if (mode !== "AI" || w || draw || turn !== "O") return;
    const { idx } = minimax(board, "O", "O");
    if (idx == null) return;
    const t = setTimeout(() => {
      setBoard((b) => { const nb = b.slice(); nb[idx] = "O"; return nb; });
      setTurn("X");
    }, 300);
    return () => clearTimeout(t);
  }, [board, turn, mode, w, draw]);

  useEffect(() => {
    if (w === "X") recordRun(1, ["Win"]);
    else if (w === "O" && mode === "AI") recordRun(0);
    else if (draw) recordRun(0);
  }, [w, draw, recordRun, mode]);

  const click = (i: number) => {
    if (board[i] || w || draw) return;
    if (mode === "AI" && turn !== "X") return;
    setBoard((b) => { const nb = b.slice(); nb[i] = turn; return nb; });
    setTurn((t) => (t === "X" ? "O" : "X"));
  };

  return (
    <GameShell
      score={save.stats.plays}
      best={save.stats.bestScore}
      status={w ? `${w} wins!` : draw ? "Draw" : `${turn}'s turn`}
      onRestart={reset}
      controls={
        <div className="flex gap-1">
          {(["AI", "2P"] as Mode[]).map((m) => (
            <button key={m} onClick={() => setMode(m)} className={`rounded-md px-2 py-1 text-xs font-bold ${m === mode ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}>{m}</button>
          ))}
        </div>
      }
    >
      <div className="grid grid-cols-3 gap-2">
        {board.map((c, i) => (
          <button key={i} onClick={() => click(i)} className="flex h-20 w-20 items-center justify-center rounded-lg border border-border bg-card text-4xl font-extrabold hover:bg-muted">
            <span className={c === "X" ? "text-primary" : "text-accent"}>{c}</span>
          </button>
        ))}
      </div>
    </GameShell>
  );
};

export default TicTacToeGame;