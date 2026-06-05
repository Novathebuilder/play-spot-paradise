import { useCallback, useEffect, useRef, useState } from "react";
import { GameShell, NativeGameProps } from "./shell";
import { useGameSave } from "@/hooks/useGameSave";

const PADS = [
  { id: 0, bg: "bg-green-600", lit: "bg-green-300", freq: 261.6 },
  { id: 1, bg: "bg-red-600", lit: "bg-red-300", freq: 329.6 },
  { id: 2, bg: "bg-yellow-500", lit: "bg-yellow-200", freq: 392 },
  { id: 3, bg: "bg-blue-600", lit: "bg-blue-300", freq: 523.2 },
];

let audioCtx: AudioContext | null = null;
const beep = (f: number) => {
  try {
    audioCtx = audioCtx ?? new (window.AudioContext || (window as any).webkitAudioContext)();
    const o = audioCtx.createOscillator(); const g = audioCtx.createGain();
    o.frequency.value = f; o.type = "sine";
    g.gain.value = 0.0001;
    o.connect(g); g.connect(audioCtx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.2, audioCtx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.35);
    o.stop(audioCtx.currentTime + 0.36);
  } catch { /* ignore */ }
};

export const SimonGame = ({ onClose: _ }: NativeGameProps) => {
  const { save, recordRun } = useGameSave("nova-simon");
  const [seq, setSeq] = useState<number[]>([]);
  const [input, setInput] = useState<number[]>([]);
  const [active, setActive] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [over, setOver] = useState(false);
  const seqRef = useRef(seq);
  seqRef.current = seq;

  const start = useCallback(() => {
    setSeq([Math.floor(Math.random() * 4)]); setInput([]); setOver(false);
  }, []);

  const playSeq = useCallback(async (s: number[]) => {
    setPlaying(true);
    for (const id of s) {
      await new Promise((r) => setTimeout(r, 400));
      setActive(id); beep(PADS[id].freq);
      await new Promise((r) => setTimeout(r, 350));
      setActive(null);
    }
    setPlaying(false);
  }, []);

  useEffect(() => { if (seq.length) playSeq(seq); }, [seq, playSeq]);

  const press = (id: number) => {
    if (playing || over || !seq.length) return;
    beep(PADS[id].freq);
    setActive(id); setTimeout(() => setActive(null), 150);
    const ni = [...input, id];
    if (seq[ni.length - 1] !== id) {
      setOver(true);
      const ach: string[] = [];
      if (seq.length - 1 >= 5) ach.push("Memory 5");
      if (seq.length - 1 >= 10) ach.push("Memory 10");
      if (seq.length - 1 >= 20) ach.push("Memory 20");
      recordRun(seq.length - 1, ach);
      return;
    }
    if (ni.length === seq.length) {
      setInput([]);
      setTimeout(() => setSeq((s) => [...s, Math.floor(Math.random() * 4)]), 600);
    } else {
      setInput(ni);
    }
  };

  return (
    <GameShell
      score={seq.length ? seq.length - 1 : 0}
      best={save.stats.bestScore}
      status={over ? "Game over" : !seq.length ? "Press Start" : playing ? "Watch…" : "Your turn"}
      onRestart={start}
      controls={
        !seq.length && <button onClick={start} className="rounded-md bg-primary px-3 py-1 text-sm font-bold text-primary-foreground">Start</button>
      }
    >
      <div className="grid grid-cols-2 gap-3">
        {PADS.map((p) => (
          <button
            key={p.id}
            onClick={() => press(p.id)}
            className={`h-32 w-32 rounded-2xl transition-all ${active === p.id ? p.lit : p.bg} active:scale-95`}
          />
        ))}
      </div>
    </GameShell>
  );
};

export default SimonGame;