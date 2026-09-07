import { useCallback, useEffect, useMemo, useState } from "react";
import { GameShell, NativeGameProps } from "./shell";
import { useGameSave } from "@/hooks/useGameSave";

type Cell = "X" | "O" | null;
type Player = "X" | "O";
type Mode = "play" | "academy";
type Level = "Easy" | "Medium" | "Perfect" | "2P";

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

const other = (p: Player): Player => (p === "X" ? "O" : "X");

const winnerOf = (b: Cell[]): { p: Player; line: number[] } | null => {
  for (const l of LINES) {
    const [a, c, d] = l;
    if (b[a] && b[a] === b[c] && b[a] === b[d]) return { p: b[a] as Player, line: l };
  }
  return null;
};

const emptyCells = (b: Cell[]) => b.reduce<number[]>((acc, c, i) => (c ? acc : [...acc, i]), []);

/** Negamax score from `turn`'s point of view. +win, -loss, 0 draw. Faster wins score higher. */
const solve = (b: Cell[], turn: Player, depth = 0): number => {
  const w = winnerOf(b);
  if (w) return w.p === turn ? 10 - depth : depth - 10;
  const open = emptyCells(b);
  if (!open.length) return 0;
  let best = -Infinity;
  for (const i of open) {
    const nb = b.slice();
    nb[i] = turn;
    const s = -solve(nb, other(turn), depth + 1);
    if (s > best) best = s;
  }
  return best;
};

/** Score every legal move for `turn`. */
const rankMoves = (b: Cell[], turn: Player): { idx: number; score: number }[] =>
  emptyCells(b)
    .map((idx) => {
      const nb = b.slice();
      nb[idx] = turn;
      return { idx, score: -solve(nb, other(turn)) };
    })
    .sort((a, z) => z.score - a.score);

const pickAI = (b: Cell[], turn: Player, level: Level): number => {
  const ranked = rankMoves(b, turn);
  if (!ranked.length) return -1;
  if (level === "Easy") {
    // 60% random, else best
    if (Math.random() < 0.6) return ranked[Math.floor(Math.random() * ranked.length)].idx;
    return ranked[0].idx;
  }
  if (level === "Medium") {
    if (Math.random() < 0.25 && ranked.length > 1) return ranked[1].idx;
    return ranked[0].idx;
  }
  const top = ranked.filter((m) => m.score === ranked[0].score);
  return top[Math.floor(Math.random() * top.length)].idx;
};

const quality = (b: Cell[], turn: Player, idx: number) => {
  const ranked = rankMoves(b, turn);
  const best = ranked[0]?.score ?? 0;
  const mine = ranked.find((m) => m.idx === idx)?.score ?? 0;
  const diff = best - mine;
  if (diff === 0) return { label: "Best move", tone: "text-secondary" };
  if (mine >= 0 && diff <= 3) return { label: "Good, but not the sharpest", tone: "text-accent" };
  return { label: "Mistake — this lets the opponent win", tone: "text-destructive" };
};

const parse = (s: string): Cell[] => s.split("").map((c) => (c === "X" || c === "O" ? c : null)) as Cell[];

interface Lesson {
  title: string;
  idea: string;
  board: string;
  you: Player;
  hint: string;
  /** Accepted squares when several moves are objectively equal but only some teach the point. */
  correct?: number[];
}

const LESSONS: Lesson[] = [
  {
    title: "1 · Take the win",
    idea: "Always scan your own lines first. If you can finish three in a row, nothing else matters.",
    board: "XX.OO....",
    you: "X",
    hint: "Look at the top row.",
  },
  {
    title: "2 · Block the loss",
    idea: "No win available? Check whether the opponent has two in a row and block it immediately.",
    board: "X..OO...X",
    you: "X",
    hint: "The middle row is one move from losing.",
  },
  {
    title: "3 · Own the centre",
    idea: "The centre sits on four lines — more than any other square. On an empty board it is the strongest opening.",
    board: ".........",
    you: "X",
    hint: "Four lines run through one square.",
    correct: [4],
  },
  {
    title: "4 · Answer a centre opening with a corner",
    idea: "If the opponent takes the centre, a corner keeps you safest. An edge reply loses to accurate play.",
    board: "....O....",
    you: "X",
    hint: "Pick any corner.",
    correct: [0, 2, 6, 8],
  },
  {
    title: "5 · Build a double threat (fork)",
    idea: "A fork creates two winning lines at once — the opponent can only block one.",
    board: "X...O...X",
    you: "X",
    hint: "You already hold two opposite corners; a move that makes two threats wins.",
  },
  {
    title: "6 · Defuse the corner trap",
    idea: "After centre-vs-corner exchanges, the only safe reply is the one that blocks and threatens at once.",
    board: "X...O..O.",
    you: "X",
    hint: "Block the O line while creating your own threat.",
  },
  {
    title: "7 · Edge defence",
    idea: "When the opponent has two corners, an edge move that creates a counter-threat forces them to defend.",
    board: "O.X.X..O.",
    you: "X",
    hint: "Make a threat they must answer.",
  },
];

export const TicTacToeGame = ({ onClose: _ }: NativeGameProps) => {
  const [mode, setMode] = useState<Mode>("play");
  const [level, setLevel] = useState<Level>("Medium");
  const [coach, setCoach] = useState(true);

  const { save, recordRun } = useGameSave(`nova-ttt-${mode === "academy" ? "academy" : level}`);

  const [board, setBoard] = useState<Cell[]>(() => Array(9).fill(null));
  const [turn, setTurn] = useState<Player>("X");
  const [feedback, setFeedback] = useState<{ label: string; tone: string } | null>(null);
  const [lessonIdx, setLessonIdx] = useState(0);
  const [solvedLessons, setSolvedLessons] = useState<number[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [lessonDone, setLessonDone] = useState(false);

  const lesson = LESSONS[lessonIdx];
  const win = winnerOf(board);
  const draw = !win && emptyCells(board).length === 0;
  const over = !!win || draw;

  const resetPlay = useCallback(() => {
    setBoard(Array(9).fill(null));
    setTurn("X");
    setFeedback(null);
  }, []);

  const loadLesson = useCallback((i: number) => {
    setLessonIdx(i);
    setBoard(parse(LESSONS[i].board));
    setTurn(LESSONS[i].you);
    setFeedback(null);
    setShowHint(false);
    setLessonDone(false);
  }, []);

  useEffect(() => {
    if (mode === "play") resetPlay();
    else loadLesson(0);
  }, [mode, level, resetPlay, loadLesson]);

  // AI turn
  useEffect(() => {
    if (mode !== "play" || level === "2P" || over || turn !== "O") return;
    const t = setTimeout(() => {
      const idx = pickAI(board, "O", level);
      if (idx < 0) return;
      setBoard((b) => {
        const nb = b.slice();
        nb[idx] = "O";
        return nb;
      });
      setTurn("X");
    }, 320);
    return () => clearTimeout(t);
  }, [board, turn, mode, level, over]);

  // Record results
  useEffect(() => {
    if (mode !== "play") return;
    if (win?.p === "X") recordRun(1, [`Beat ${level} AI`]);
    else if (win?.p === "O") recordRun(0);
    else if (draw) recordRun(0, level === "Perfect" ? ["Drew the perfect AI"] : []);
  }, [win, draw, mode, level, recordRun]);

  const bestMoveNow = useMemo(
    () => (over ? -1 : rankMoves(board, turn)[0]?.idx ?? -1),
    [board, turn, over],
  );

  const click = (i: number) => {
    if (board[i] || over) return;

    if (mode === "academy") {
      if (lessonDone) return;
      const q = quality(board, lesson.you, i);
      const isBest = lesson.correct ? lesson.correct.includes(i) : q.label === "Best move";
      setFeedback(
        isBest
          ? { label: "Correct! " + lesson.idea, tone: "text-secondary" }
          : lesson.correct
          ? { label: "Not the move this lesson is after — try again.", tone: "text-destructive" }
          : q,
      );
      if (isBest) {
        const nb = board.slice();
        nb[i] = lesson.you;
        setBoard(nb);
        setLessonDone(true);
        setSolvedLessons((s) => (s.includes(lessonIdx) ? s : [...s, lessonIdx]));
        recordRun(1, [`Lesson ${lessonIdx + 1} solved`]);
      }
      return;
    }

    if (level !== "2P" && turn !== "X") return;
    if (coach) setFeedback(quality(board, turn, i));
    const nb = board.slice();
    nb[i] = turn;
    setBoard(nb);
    setTurn(other(turn));
  };

  const status = win
    ? `${win.p} wins!`
    : draw
    ? "Draw"
    : mode === "academy"
    ? lesson.title
    : `${turn}'s turn`;

  const Mark = ({ c, big }: { c: Cell; big?: boolean }) => {
    if (!c) return null;
    const stroke = c === "X" ? "hsl(var(--primary))" : "hsl(var(--accent))";
    const size = big ? 60 : 52;
    return (
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className="animate-in zoom-in-50 duration-200"
        style={{ filter: `drop-shadow(0 0 10px ${stroke})` }}
      >
        {c === "X" ? (
          <g stroke={stroke} strokeWidth={14} strokeLinecap="round">
            <line x1="22" y1="22" x2="78" y2="78" />
            <line x1="78" y1="22" x2="22" y2="78" />
          </g>
        ) : (
          <circle cx="50" cy="50" r="28" fill="none" stroke={stroke} strokeWidth={14} strokeLinecap="round" />
        )}
      </svg>
    );
  };

  const pill = (activeCls: string, active: boolean) =>
    `rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
      active ? activeCls : "bg-muted/60 text-muted-foreground hover:bg-muted"
    }`;

  return (
    <GameShell
      score={save.stats.plays}
      best={mode === "academy" ? solvedLessons.length : save.stats.bestScore}
      status={status}
      onRestart={mode === "academy" ? () => loadLesson(lessonIdx) : resetPlay}
      controls={
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="flex rounded-full bg-muted/50 p-0.5">
            {(["play", "academy"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={pill("bg-gradient-primary text-primary-foreground shadow-lg", m === mode)}
              >
                {m === "play" ? "Play" : "Academy"}
              </button>
            ))}
          </div>
          {mode === "play" && (
            <>
              <div className="flex rounded-full bg-muted/50 p-0.5">
                {(["Easy", "Medium", "Perfect", "2P"] as Level[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLevel(l)}
                    className={pill("bg-secondary text-secondary-foreground", l === level)}
                  >
                    {l}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCoach((c) => !c)}
                className={pill("bg-accent text-accent-foreground", coach)}
              >
                Coach {coach ? "on" : "off"}
              </button>
            </>
          )}
        </div>
      }
    >
      <div className="flex w-full flex-col items-center gap-6 md:flex-row md:items-start md:justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-gradient-primary opacity-20 blur-2xl"
            />
            <div className="relative grid grid-cols-3 gap-2.5 rounded-3xl border border-border/60 bg-card/70 p-3 shadow-2xl backdrop-blur">
              {board.map((c, i) => {
                const highlight = win?.line.includes(i);
                const hinted =
                  (mode === "academy" && showHint && (lesson.correct ? lesson.correct.includes(i) : i === bestMoveNow)) ||
                  (mode === "play" && coach && !over && level !== "2P" && turn === "X" && i === bestMoveNow && !!feedback);
                return (
                  <button
                    key={i}
                    onClick={() => click(i)}
                    aria-label={`Square ${i + 1}`}
                    className={`group relative flex h-[5.5rem] w-[5.5rem] items-center justify-center rounded-2xl border transition-all duration-200 sm:h-24 sm:w-24 ${
                      highlight
                        ? "border-secondary bg-secondary/20 shadow-[0_0_25px_hsl(var(--secondary)/0.5)]"
                        : hinted
                        ? "border-accent bg-accent/10 shadow-[0_0_20px_hsl(var(--accent)/0.35)]"
                        : "border-border/70 bg-background/60 hover:-translate-y-0.5 hover:border-primary/60 hover:bg-muted/50 hover:shadow-[0_0_20px_hsl(var(--primary)/0.25)]"
                    }`}
                  >
                    <Mark c={c} big={highlight} />
                    {!c && !over && (
                      <span className="absolute text-3xl font-black text-muted-foreground/0 transition-colors group-hover:text-muted-foreground/25">
                        {level === "2P" || mode === "academy" ? turn : "X"}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          {feedback && (
            <p
              className={`max-w-[20rem] rounded-xl border border-border/60 bg-card/70 px-3 py-2 text-center text-xs font-semibold ${feedback.tone}`}
            >
              {feedback.label}
            </p>
          )}
        </div>

        <div className="w-full max-w-xs space-y-3 rounded-2xl border border-border/60 bg-card/70 p-4 shadow-xl backdrop-blur">
          {mode === "academy" ? (
            <>
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">Academy</span>
                <h3 className="mt-1 text-base font-extrabold text-foreground">{lesson.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{lesson.idea}</p>
              </div>
              <p className="rounded-lg bg-muted/50 px-3 py-2 text-xs font-semibold text-foreground">
                You are {lesson.you} — play the strongest move.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setShowHint(true)}
                  className="rounded-full bg-muted/60 px-3 py-1.5 text-xs font-bold text-muted-foreground hover:bg-muted"
                >
                  Hint
                </button>
                {lessonDone && lessonIdx < LESSONS.length - 1 && (
                  <button
                    onClick={() => loadLesson(lessonIdx + 1)}
                    className="rounded-full bg-gradient-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-lg"
                  >
                    Next lesson →
                  </button>
                )}
              </div>
              {showHint && <p className="text-xs italic text-accent">{lesson.hint}</p>}
              <div className="space-y-2 border-t border-border/60 pt-3">
                <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                  Course · {solvedLessons.length}/{LESSONS.length} solved
                </p>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
                  <div
                    className="h-full rounded-full bg-gradient-primary transition-all duration-500"
                    style={{ width: `${(solvedLessons.length / LESSONS.length) * 100}%` }}
                  />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {LESSONS.map((l, i) => (
                    <button
                      key={l.title}
                      onClick={() => loadLesson(i)}
                      className={`h-7 w-7 rounded-full text-[11px] font-bold transition-all ${
                        i === lessonIdx
                          ? "bg-gradient-primary text-primary-foreground shadow-lg"
                          : solvedLessons.includes(i)
                          ? "bg-secondary/25 text-secondary"
                          : "bg-muted/60 text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">Coach</span>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {coach
                    ? "Every move you make is graded instantly, and the strongest square glows after each grade."
                    : "Turn the coach on to have your moves graded as you play."}
                </p>
              </div>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li className="rounded-lg bg-muted/40 px-2.5 py-1.5">
                  <span className="font-bold text-foreground">Easy</span> blunders often — good for warming up.
                </li>
                <li className="rounded-lg bg-muted/40 px-2.5 py-1.5">
                  <span className="font-bold text-foreground">Medium</span> plays well but slips.
                </li>
                <li className="rounded-lg bg-muted/40 px-2.5 py-1.5">
                  <span className="font-bold text-foreground">Perfect</span> never loses; a draw is a win for you.
                </li>
                <li className="rounded-lg bg-muted/40 px-2.5 py-1.5">
                  <span className="font-bold text-foreground">2P</span> for two players on one device.
                </li>
              </ul>
              <div className="border-t border-border/60 pt-3 text-xs text-muted-foreground">
                Games played: <span className="font-bold text-foreground">{save.stats.plays}</span>
                {save.stats.achievements.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {save.stats.achievements.slice(-4).map((a) => (
                      <span key={a} className="rounded-full bg-secondary/20 px-2 py-0.5 text-[10px] font-bold text-secondary">
                        {a}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </GameShell>
  );
};

export default TicTacToeGame;
