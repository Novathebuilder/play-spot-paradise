import { useCallback, useEffect, useRef, useState } from "react";
import { GameShell, NativeGameProps } from "./shell";
import { useGameSave } from "@/hooks/useGameSave";

const COLS = 10;
const ROWS = 20;
const CELL = 22;

type Cell = number; // 0 empty, 1..7 color id
type Board = Cell[][];

const COLORS = ["", "#06b6d4", "#3b82f6", "#f97316", "#eab308", "#22c55e", "#a855f7", "#ef4444"];

const SHAPES: number[][][][] = [
  [], // 0 unused
  // I
  [
    [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
    [[0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0]],
    [[0, 0, 0, 0], [0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0]],
    [[0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0]],
  ],
  // J
  [
    [[2, 0, 0], [2, 2, 2], [0, 0, 0]],
    [[0, 2, 2], [0, 2, 0], [0, 2, 0]],
    [[0, 0, 0], [2, 2, 2], [0, 0, 2]],
    [[0, 2, 0], [0, 2, 0], [2, 2, 0]],
  ],
  // L
  [
    [[0, 0, 3], [3, 3, 3], [0, 0, 0]],
    [[0, 3, 0], [0, 3, 0], [0, 3, 3]],
    [[0, 0, 0], [3, 3, 3], [3, 0, 0]],
    [[3, 3, 0], [0, 3, 0], [0, 3, 0]],
  ],
  // O
  [
    [[4, 4], [4, 4]],
    [[4, 4], [4, 4]],
    [[4, 4], [4, 4]],
    [[4, 4], [4, 4]],
  ],
  // S
  [
    [[0, 5, 5], [5, 5, 0], [0, 0, 0]],
    [[0, 5, 0], [0, 5, 5], [0, 0, 5]],
    [[0, 0, 0], [0, 5, 5], [5, 5, 0]],
    [[5, 0, 0], [5, 5, 0], [0, 5, 0]],
  ],
  // T
  [
    [[0, 6, 0], [6, 6, 6], [0, 0, 0]],
    [[0, 6, 0], [0, 6, 6], [0, 6, 0]],
    [[0, 0, 0], [6, 6, 6], [0, 6, 0]],
    [[0, 6, 0], [6, 6, 0], [0, 6, 0]],
  ],
  // Z
  [
    [[7, 7, 0], [0, 7, 7], [0, 0, 0]],
    [[0, 0, 7], [0, 7, 7], [0, 7, 0]],
    [[0, 0, 0], [7, 7, 0], [0, 7, 7]],
    [[0, 7, 0], [7, 7, 0], [7, 0, 0]],
  ],
];

interface Piece { id: number; rot: number; x: number; y: number }
interface SaveState { board: Board; piece: Piece; score: number; lines: number; level: number }

const newBoard = (): Board => Array.from({ length: ROWS }, () => Array(COLS).fill(0));
const spawn = (): Piece => ({ id: 1 + Math.floor(Math.random() * 7), rot: 0, x: 3, y: 0 });
const shape = (p: Piece) => SHAPES[p.id][p.rot % SHAPES[p.id].length];

const collides = (board: Board, p: Piece) => {
  const s = shape(p);
  for (let r = 0; r < s.length; r++)
    for (let c = 0; c < s[r].length; c++)
      if (s[r][c]) {
        const x = p.x + c, y = p.y + r;
        if (x < 0 || x >= COLS || y >= ROWS) return true;
        if (y >= 0 && board[y][x]) return true;
      }
  return false;
};

const merge = (board: Board, p: Piece): Board => {
  const b = board.map((r) => r.slice());
  const s = shape(p);
  for (let r = 0; r < s.length; r++)
    for (let c = 0; c < s[r].length; c++)
      if (s[r][c] && p.y + r >= 0) b[p.y + r][p.x + c] = s[r][c];
  return b;
};

const clearLines = (board: Board): { board: Board; cleared: number } => {
  const kept = board.filter((row) => row.some((v) => !v));
  const cleared = ROWS - kept.length;
  const empty = Array.from({ length: cleared }, () => Array(COLS).fill(0));
  return { board: [...empty, ...kept], cleared };
};

const initial = (): SaveState => ({ board: newBoard(), piece: spawn(), score: 0, lines: 0, level: 1 });

export const TetrisGame = ({ onClose: _ }: NativeGameProps) => {
  const { save, saveState, clearState, recordRun } = useGameSave<SaveState>("nova-tetris");
  const [state, setState] = useState<SaveState>(() => save.state ?? initial());
  const [over, setOver] = useState(false);
  const [paused, setPaused] = useState(!!save.state);
  const stateRef = useRef(state);
  stateRef.current = state;

  const tick = useCallback(() => {
    setState((prev) => {
      const moved = { ...prev.piece, y: prev.piece.y + 1 };
      if (!collides(prev.board, moved)) return { ...prev, piece: moved };
      const merged = merge(prev.board, prev.piece);
      const { board: cleared, cleared: n } = clearLines(merged);
      const score = prev.score + [0, 40, 100, 300, 1200][n] * prev.level;
      const lines = prev.lines + n;
      const level = 1 + Math.floor(lines / 10);
      const piece = spawn();
      if (collides(cleared, piece)) {
        setOver(true);
        const ach: string[] = [];
        if (lines >= 10) ach.push("Line cleaner");
        if (lines >= 40) ach.push("Tetris master");
        if (score >= 5000) ach.push("High roller");
        recordRun(score, ach);
        setTimeout(() => clearState(), 0);
        return { board: cleared, piece, score, lines, level };
      }
      return { board: cleared, piece, score, lines, level };
    });
  }, [recordRun, clearState]);

  const restart = useCallback(() => { setState(initial()); setOver(false); setPaused(false); clearState(); }, [clearState]);

  useEffect(() => {
    if (over || paused) return;
    const speed = Math.max(80, 500 - (state.level - 1) * 40);
    const t = setInterval(tick, speed);
    return () => clearInterval(t);
  }, [over, paused, tick, state.level]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (over) return;
      setState((prev) => {
        if (e.key === "ArrowLeft" || e.key === "a") {
          const np = { ...prev.piece, x: prev.piece.x - 1 };
          return collides(prev.board, np) ? prev : { ...prev, piece: np };
        }
        if (e.key === "ArrowRight" || e.key === "d") {
          const np = { ...prev.piece, x: prev.piece.x + 1 };
          return collides(prev.board, np) ? prev : { ...prev, piece: np };
        }
        if (e.key === "ArrowDown" || e.key === "s") {
          const np = { ...prev.piece, y: prev.piece.y + 1 };
          return collides(prev.board, np) ? prev : { ...prev, piece: np };
        }
        if (e.key === "ArrowUp" || e.key === "w") {
          const np = { ...prev.piece, rot: prev.piece.rot + 1 };
          return collides(prev.board, np) ? prev : { ...prev, piece: np };
        }
        if (e.key === " ") {
          let p = prev.piece;
          while (!collides(prev.board, { ...p, y: p.y + 1 })) p = { ...p, y: p.y + 1 };
          return { ...prev, piece: p };
        }
        return prev;
      });
      if (e.key === "p") setPaused((p) => !p);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [over]);

  useEffect(() => { if (!over) saveState(stateRef.current); }, [state, over, saveState]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "hsl(220 25% 8%)"; ctx.fillRect(0, 0, c.width, c.height);
    const draw = (x: number, y: number, id: number) => {
      ctx.fillStyle = COLORS[id];
      ctx.fillRect(x * CELL + 1, y * CELL + 1, CELL - 2, CELL - 2);
    };
    for (let r = 0; r < ROWS; r++)
      for (let col = 0; col < COLS; col++)
        if (state.board[r][col]) draw(col, r, state.board[r][col]);
    const s = shape(state.piece);
    for (let r = 0; r < s.length; r++)
      for (let col = 0; col < s[r].length; col++)
        if (s[r][col]) draw(state.piece.x + col, state.piece.y + r, s[r][col]);
  }, [state]);

  return (
    <GameShell
      score={state.score}
      best={save.stats.bestScore}
      status={over ? "Game over" : `Lvl ${state.level} · Lines ${state.lines}${paused ? " · Paused" : ""}`}
      onRestart={restart}
      controls={
        !over && (
          <button onClick={() => setPaused((p) => !p)} className="rounded-md bg-secondary/20 px-3 py-1 text-sm font-bold text-secondary hover:bg-secondary/30">
            {paused ? "Resume" : "Pause"}
          </button>
        )
      }
    >
      <canvas ref={canvasRef} width={COLS * CELL} height={ROWS * CELL} className="rounded-lg" />
    </GameShell>
  );
};

export default TetrisGame;