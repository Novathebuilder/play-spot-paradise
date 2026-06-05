import { useCallback, useEffect, useRef, useState } from "react";
import { GameShell, NativeGameProps } from "./shell";
import { useGameSave } from "@/hooks/useGameSave";

const HOLES = 9;
const DURATION = 30;

export const WhackGame = ({ onClose: _ }: NativeGameProps) => {
  const { save, recordRun } = useGameSave("nova-whack");
  const [active, setActive] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(DURATION);
  const [running, setRunning] = useState(false);
  const timeRef = useRef(time);
  timeRef.current = time;

  const start = useCallback(() => { setScore(0); setTime(DURATION); setRunning(true); }, []);

  useEffect(() => {
    if (!running) return;
    const tick = setInterval(() => {
      setTime((t) => {
        if (t <= 1) {
          setRunning(false);
          setActive(null);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    const mole = setInterval(() => {
      setActive(Math.floor(Math.random() * HOLES));
    }, 700);
    return () => { clearInterval(tick); clearInterval(mole); };
  }, [running]);

  const recordedRef = useRef(false);
  useEffect(() => {
    if (!running && time === 0 && !recordedRef.current) {
      recordedRef.current = true;
      const ach: string[] = [];
      if (score >= 10) ach.push("Whacker");
      if (score >= 25) ach.push("Mole hunter");
      if (score >= 50) ach.push("Mole god");
      recordRun(score, ach);
    }
    if (running) recordedRef.current = false;
  }, [running, time, score, recordRun]);

  const whack = (i: number) => {
    if (!running) return;
    if (i === active) { setScore((s) => s + 1); setActive(null); }
  };

  return (
    <GameShell
      score={score}
      best={save.stats.bestScore}
      status={running ? `Time: ${time}s` : time === 0 ? "Time up!" : "Press Start"}
      onRestart={start}
      controls={
        !running && <button onClick={start} className="rounded-md bg-primary px-3 py-1 text-sm font-bold text-primary-foreground">Start</button>
      }
    >
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: HOLES }).map((_, i) => (
          <button
            key={i}
            onMouseDown={() => whack(i)}
            onTouchStart={() => whack(i)}
            className="relative flex h-20 w-20 items-end justify-center overflow-hidden rounded-full bg-amber-950"
          >
            <span className={`text-4xl transition-transform duration-150 ${active === i ? "translate-y-0" : "translate-y-full"}`}>🐹</span>
          </button>
        ))}
      </div>
    </GameShell>
  );
};

export default WhackGame;