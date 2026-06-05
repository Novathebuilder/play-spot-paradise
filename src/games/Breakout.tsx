import { useCallback, useEffect, useRef, useState } from "react";
import { GameShell, NativeGameProps } from "./shell";
import { useGameSave } from "@/hooks/useGameSave";

const W = 480, H = 360;
const PADDLE_W = 80, PADDLE_H = 10;
const BALL_R = 6;
const BRICK_ROWS = 5, BRICK_COLS = 10;
const BRICK_W = (W - 40) / BRICK_COLS, BRICK_H = 16;

const COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6"];

export const BreakoutGame = ({ onClose: _ }: NativeGameProps) => {
  const { save, recordRun } = useGameSave("nova-breakout");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [over, setOver] = useState(false);
  const [won, setWon] = useState(false);
  const paddleX = useRef(W / 2 - PADDLE_W / 2);
  const ball = useRef({ x: W / 2, y: H - 30, vx: 3, vy: -3 });
  const bricks = useRef<boolean[][]>(Array.from({ length: BRICK_ROWS }, () => Array(BRICK_COLS).fill(true)));
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const reset = useCallback(() => {
    paddleX.current = W / 2 - PADDLE_W / 2;
    ball.current = { x: W / 2, y: H - 30, vx: 3, vy: -3 };
    bricks.current = Array.from({ length: BRICK_ROWS }, () => Array(BRICK_COLS).fill(true));
    setScore(0); setLives(3); setOver(false); setWon(false);
  }, []);

  useEffect(() => {
    const c = canvasRef.current!;
    const onMove = (e: MouseEvent) => {
      const rect = c.getBoundingClientRect();
      paddleX.current = Math.max(0, Math.min(W - PADDLE_W, ((e.clientX - rect.left) * W) / rect.width - PADDLE_W / 2));
    };
    const onTouch = (e: TouchEvent) => {
      const rect = c.getBoundingClientRect();
      paddleX.current = Math.max(0, Math.min(W - PADDLE_W, ((e.touches[0].clientX - rect.left) * W) / rect.width - PADDLE_W / 2));
    };
    c.addEventListener("mousemove", onMove);
    c.addEventListener("touchmove", onTouch);
    return () => { c.removeEventListener("mousemove", onMove); c.removeEventListener("touchmove", onTouch); };
  }, []);

  useEffect(() => {
    let raf = 0;
    const ctx = canvasRef.current!.getContext("2d")!;
    const loop = () => {
      if (!over && !won) {
        const b = ball.current;
        b.x += b.vx; b.y += b.vy;
        if (b.x < BALL_R || b.x > W - BALL_R) b.vx *= -1;
        if (b.y < BALL_R) b.vy *= -1;
        // paddle
        if (b.y > H - 20 - BALL_R && b.x > paddleX.current && b.x < paddleX.current + PADDLE_W && b.vy > 0) {
          b.vy *= -1;
          b.vx += (b.x - (paddleX.current + PADDLE_W / 2)) * 0.05;
        }
        // bottom
        if (b.y > H) {
          setLives((l) => {
            const nl = l - 1;
            if (nl <= 0) setOver(true);
            else { ball.current = { x: W / 2, y: H - 30, vx: 3, vy: -3 }; }
            return nl;
          });
        }
        // bricks
        for (let r = 0; r < BRICK_ROWS; r++) {
          for (let col = 0; col < BRICK_COLS; col++) {
            if (!bricks.current[r][col]) continue;
            const bx = 20 + col * BRICK_W, by = 30 + r * BRICK_H;
            if (b.x > bx && b.x < bx + BRICK_W && b.y > by && b.y < by + BRICK_H) {
              bricks.current[r][col] = false;
              b.vy *= -1;
              setScore((s) => s + (BRICK_ROWS - r) * 10);
            }
          }
        }
        if (bricks.current.every((row) => row.every((b) => !b))) setWon(true);
      }
      // draw
      ctx.fillStyle = "hsl(220 25% 8%)"; ctx.fillRect(0, 0, W, H);
      for (let r = 0; r < BRICK_ROWS; r++) {
        for (let col = 0; col < BRICK_COLS; col++) {
          if (!bricks.current[r][col]) continue;
          ctx.fillStyle = COLORS[r];
          ctx.fillRect(20 + col * BRICK_W + 2, 30 + r * BRICK_H + 2, BRICK_W - 4, BRICK_H - 4);
        }
      }
      ctx.fillStyle = "#e5e7eb";
      ctx.fillRect(paddleX.current, H - 20, PADDLE_W, PADDLE_H);
      ctx.beginPath();
      ctx.arc(ball.current.x, ball.current.y, BALL_R, 0, Math.PI * 2);
      ctx.fill();
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, [over, won]);

  const recordedRef = useRef(false);
  useEffect(() => {
    if ((over || won) && !recordedRef.current) {
      recordedRef.current = true;
      const ach: string[] = [];
      if (won) ach.push("Cleared!");
      if (score >= 500) ach.push("500 club");
      recordRun(score, ach);
    }
    if (!over && !won) recordedRef.current = false;
  }, [over, won, score, recordRun]);

  return (
    <GameShell
      score={score}
      best={save.stats.bestScore}
      status={won ? "You won!" : over ? "Game over" : `Lives: ${lives} · Move mouse`}
      onRestart={reset}
    >
      <canvas ref={canvasRef} width={W} height={H} className="rounded-lg" />
    </GameShell>
  );
};

export default BreakoutGame;