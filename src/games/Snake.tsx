import { useCallback, useEffect, useRef, useState } from "react";
import { GameShell, NativeGameProps } from "./shell";
import { useGameSave } from "@/hooks/useGameSave";

const SIZE = 20; // 20x20 grid
const CELL = 18; // px
const SPEED = 110; // ms per tick

type Dir = { x: number; y: number };
interface SaveState {
  snake: { x: number; y: number }[];
  food: { x: number; y: number };
  dir: Dir;
  score: number;
}

const start = (): SaveState => ({
  snake: [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }],
  food: { x: 15, y: 10 },
  dir: { x: 1, y: 0 },
  score: 0,
});

const randFood = (snake: { x: number; y: number }[]) => {
  while (true) {
    const f = { x: Math.floor(Math.random() * SIZE), y: Math.floor(Math.random() * SIZE) };
    if (!snake.some((s) => s.x === f.x && s.y === f.y)) return f;
  }
};

export const SnakeGame = ({ onClose: _onClose }: NativeGameProps) => {
  const { save, saveState, clearState, recordRun } = useGameSave<SaveState>("nova-snake");
  const [state, setState] = useState<SaveState>(() => save.state ?? start());
  const [dead, setDead] = useState(false);
  const [paused, setPaused] = useState(!!save.state);
  const dirRef = useRef<Dir>(state.dir);
  const nextDirRef = useRef<Dir>(state.dir);
  const stateRef = useRef(state);
  stateRef.current = state;

  const restart = useCallback(() => {
    const s = start();
    setState(s);
    dirRef.current = s.dir;
    nextDirRef.current = s.dir;
    setDead(false);
    setPaused(false);
    clearState();
  }, [clearState]);

  // input
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key;
      const set = (x: number, y: number) => {
        const d = dirRef.current;
        if (d.x === -x && d.y === -y) return;
        nextDirRef.current = { x, y };
      };
      if (k === "ArrowUp" || k === "w") set(0, -1);
      else if (k === "ArrowDown" || k === "s") set(0, 1);
      else if (k === "ArrowLeft" || k === "a") set(-1, 0);
      else if (k === "ArrowRight" || k === "d") set(1, 0);
      else if (k === " ") setPaused((p) => !p);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // loop
  useEffect(() => {
    if (dead || paused) return;
    const t = setInterval(() => {
      setState((prev) => {
        dirRef.current = nextDirRef.current;
        const head = prev.snake[0];
        const nh = { x: head.x + dirRef.current.x, y: head.y + dirRef.current.y };
        if (nh.x < 0 || nh.y < 0 || nh.x >= SIZE || nh.y >= SIZE || prev.snake.some((s) => s.x === nh.x && s.y === nh.y)) {
          setDead(true);
          const ach: string[] = [];
          if (prev.score >= 10) ach.push("First 10");
          if (prev.score >= 50) ach.push("Half ton");
          if (prev.score >= 100) ach.push("Centurion");
          recordRun(prev.score, ach);
          // clear resume on death
          setTimeout(() => clearState(), 0);
          return prev;
        }
        const ate = nh.x === prev.food.x && nh.y === prev.food.y;
        const snake = [nh, ...prev.snake];
        if (!ate) snake.pop();
        const food = ate ? randFood(snake) : prev.food;
        const next = { snake, food, dir: dirRef.current, score: prev.score + (ate ? 1 : 0) };
        return next;
      });
    }, SPEED);
    return () => clearInterval(t);
  }, [dead, paused, recordRun, clearState]);

  // auto-save state for resume (when paused or after stops)
  useEffect(() => {
    if (!dead) saveState(stateRef.current);
  }, [state, dead, saveState]);

  // draw
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "hsl(220 25% 8%)";
    ctx.fillRect(0, 0, c.width, c.height);
    // grid
    ctx.strokeStyle = "hsl(220 20% 14%)";
    for (let i = 0; i <= SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, SIZE * CELL); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * CELL); ctx.lineTo(SIZE * CELL, i * CELL); ctx.stroke();
    }
    // food
    ctx.fillStyle = "hsl(0 80% 60%)";
    ctx.beginPath();
    ctx.arc(state.food.x * CELL + CELL / 2, state.food.y * CELL + CELL / 2, CELL / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
    // snake
    state.snake.forEach((s, i) => {
      ctx.fillStyle = i === 0 ? "hsl(150 80% 55%)" : `hsl(150 70% ${50 - Math.min(i, 20)}%)`;
      ctx.fillRect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2);
    });
  }, [state]);

  return (
    <GameShell
      score={state.score}
      best={save.stats.bestScore}
      status={dead ? "Game over" : paused ? "Paused (Space)" : "Arrows / WASD"}
      onRestart={restart}
      controls={
        !dead && (
          <button
            onClick={() => setPaused((p) => !p)}
            className="rounded-md bg-secondary/20 px-3 py-1 text-sm font-bold text-secondary hover:bg-secondary/30"
          >
            {paused ? "Resume" : "Pause"}
          </button>
        )
      }
    >
      <canvas ref={canvasRef} width={SIZE * CELL} height={SIZE * CELL} className="rounded-lg" />
    </GameShell>
  );
};

export default SnakeGame;