import { useCallback, useEffect, useRef, useState } from "react";
import { GameShell, NativeGameProps } from "./shell";
import { useGameSave } from "@/hooks/useGameSave";

const W = 360, H = 480;
const GRAV = 0.5, JUMP = -7.5;
const PIPE_W = 56, GAP = 130, SPEED = 2;

interface Pipe { x: number; top: number; passed?: boolean }

export const FlappyGame = ({ onClose: _ }: NativeGameProps) => {
  const { save, recordRun } = useGameSave("nova-flappy");
  const [score, setScore] = useState(0);
  const [over, setOver] = useState(false);
  const [running, setRunning] = useState(false);
  const yRef = useRef(H / 2);
  const vRef = useRef(0);
  const pipesRef = useRef<Pipe[]>([]);
  const tickRef = useRef(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const reset = useCallback(() => {
    yRef.current = H / 2; vRef.current = 0; pipesRef.current = []; tickRef.current = 0;
    setScore(0); setOver(false); setRunning(false);
  }, []);

  const flap = useCallback(() => {
    if (over) { reset(); return; }
    if (!running) setRunning(true);
    vRef.current = JUMP;
  }, [over, running, reset]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === " " || e.key === "ArrowUp") { e.preventDefault(); flap(); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flap]);

  useEffect(() => {
    let raf = 0;
    const ctx = canvasRef.current!.getContext("2d")!;
    const loop = () => {
      // physics
      if (running && !over) {
        vRef.current += GRAV;
        yRef.current += vRef.current;
        tickRef.current++;
        if (tickRef.current % 90 === 0) {
          pipesRef.current.push({ x: W, top: 60 + Math.random() * (H - GAP - 120) });
        }
        pipesRef.current.forEach((p) => { p.x -= SPEED; });
        pipesRef.current = pipesRef.current.filter((p) => p.x + PIPE_W > -10);
        // collisions
        const bx = 70, by = yRef.current, br = 14;
        if (by < 0 || by > H - 10) setOver(true);
        for (const p of pipesRef.current) {
          if (bx + br > p.x && bx - br < p.x + PIPE_W) {
            if (by - br < p.top || by + br > p.top + GAP) setOver(true);
          }
          if (!p.passed && p.x + PIPE_W < bx - br) {
            p.passed = true;
            setScore((s) => s + 1);
          }
        }
      }
      // draw
      const grd = ctx.createLinearGradient(0, 0, 0, H);
      grd.addColorStop(0, "#38bdf8"); grd.addColorStop(1, "#0ea5e9");
      ctx.fillStyle = grd; ctx.fillRect(0, 0, W, H);
      // ground
      ctx.fillStyle = "#16a34a"; ctx.fillRect(0, H - 10, W, 10);
      // pipes
      ctx.fillStyle = "#15803d";
      pipesRef.current.forEach((p) => {
        ctx.fillRect(p.x, 0, PIPE_W, p.top);
        ctx.fillRect(p.x, p.top + GAP, PIPE_W, H - p.top - GAP - 10);
      });
      // bird
      ctx.fillStyle = "#fde047";
      ctx.beginPath(); ctx.arc(70, yRef.current, 14, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#111"; ctx.beginPath(); ctx.arc(75, yRef.current - 3, 2.5, 0, Math.PI * 2); ctx.fill();
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, [running, over]);

  // record on death
  const recordedRef = useRef(false);
  useEffect(() => {
    if (over && !recordedRef.current) {
      recordedRef.current = true;
      const ach: string[] = [];
      if (score >= 5) ach.push("First 5");
      if (score >= 20) ach.push("Skilled flapper");
      if (score >= 50) ach.push("Sky master");
      recordRun(score, ach);
    }
    if (!over) recordedRef.current = false;
  }, [over, score, recordRun]);

  return (
    <GameShell
      score={score}
      best={save.stats.bestScore}
      status={over ? "Game over — click to restart" : running ? "Space / Click to flap" : "Click to start"}
      onRestart={reset}
    >
      <canvas ref={canvasRef} width={W} height={H} onClick={flap} className="cursor-pointer rounded-lg" />
    </GameShell>
  );
};

export default FlappyGame;