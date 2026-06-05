import { useCallback, useEffect, useRef, useState } from "react";
import { GameShell, NativeGameProps } from "./shell";
import { useGameSave } from "@/hooks/useGameSave";

const W = 480, H = 320, PADDLE_H = 60, PADDLE_W = 8;

export const PongGame = ({ onClose: _ }: NativeGameProps) => {
  const { save, recordRun } = useGameSave("nova-pong");
  const [scores, setScores] = useState({ p: 0, ai: 0 });
  const playerY = useRef(H / 2 - PADDLE_H / 2);
  const aiY = useRef(H / 2 - PADDLE_H / 2);
  const ball = useRef({ x: W / 2, y: H / 2, vx: 4, vy: 3 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overRef = useRef(false);
  const [over, setOver] = useState(false);

  const reset = useCallback(() => {
    setScores({ p: 0, ai: 0 }); setOver(false); overRef.current = false;
    ball.current = { x: W / 2, y: H / 2, vx: 4, vy: 3 };
  }, []);

  useEffect(() => {
    const c = canvasRef.current!;
    const onMove = (e: MouseEvent) => {
      const r = c.getBoundingClientRect();
      playerY.current = Math.max(0, Math.min(H - PADDLE_H, ((e.clientY - r.top) * H) / r.height - PADDLE_H / 2));
    };
    c.addEventListener("mousemove", onMove);
    return () => c.removeEventListener("mousemove", onMove);
  }, []);

  useEffect(() => {
    let raf = 0;
    const ctx = canvasRef.current!.getContext("2d")!;
    const loop = () => {
      if (!overRef.current) {
        const b = ball.current;
        b.x += b.vx; b.y += b.vy;
        if (b.y < 6 || b.y > H - 6) b.vy *= -1;
        // ai
        const target = b.y - PADDLE_H / 2;
        aiY.current += Math.max(-3.5, Math.min(3.5, target - aiY.current));
        aiY.current = Math.max(0, Math.min(H - PADDLE_H, aiY.current));
        // player paddle
        if (b.x < PADDLE_W + 6 && b.y > playerY.current && b.y < playerY.current + PADDLE_H && b.vx < 0) {
          b.vx = Math.abs(b.vx) * 1.05;
          b.vy += (b.y - (playerY.current + PADDLE_H / 2)) * 0.08;
        }
        if (b.x > W - PADDLE_W - 6 && b.y > aiY.current && b.y < aiY.current + PADDLE_H && b.vx > 0) {
          b.vx = -Math.abs(b.vx) * 1.05;
        }
        if (b.x < 0) {
          setScores((s) => {
            const ns = { p: s.p, ai: s.ai + 1 };
            if (ns.ai >= 7) { overRef.current = true; setOver(true); recordRun(ns.p); }
            return ns;
          });
          ball.current = { x: W / 2, y: H / 2, vx: 4, vy: 3 };
        }
        if (b.x > W) {
          setScores((s) => {
            const ns = { p: s.p + 1, ai: s.ai };
            if (ns.p >= 7) { overRef.current = true; setOver(true); recordRun(ns.p, ["Match win"]); }
            return ns;
          });
          ball.current = { x: W / 2, y: H / 2, vx: -4, vy: 3 };
        }
      }
      ctx.fillStyle = "hsl(220 25% 8%)"; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "#374151"; ctx.setLineDash([6, 6]);
      ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, playerY.current, PADDLE_W, PADDLE_H);
      ctx.fillRect(W - PADDLE_W, aiY.current, PADDLE_W, PADDLE_H);
      ctx.beginPath(); ctx.arc(ball.current.x, ball.current.y, 6, 0, Math.PI * 2); ctx.fill();
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, [recordRun]);

  return (
    <GameShell
      score={scores.p}
      best={save.stats.bestScore}
      status={over ? (scores.p > scores.ai ? "You win!" : "AI wins") : `You ${scores.p} – ${scores.ai} AI`}
      onRestart={reset}
    >
      <canvas ref={canvasRef} width={W} height={H} className="rounded-lg" />
    </GameShell>
  );
};

export default PongGame;