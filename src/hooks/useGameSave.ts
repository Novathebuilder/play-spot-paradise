import { useCallback, useEffect, useState } from "react";

/**
 * Per-game localStorage save data: high score, in-progress state, stats/achievements.
 * Key shape: novagames:save:<gameId>
 */
export interface GameStats {
  plays: number;
  totalScore: number;
  bestScore: number;
  lastPlayedAt: number;
  achievements: string[];
}

export interface GameSave<TState = unknown> {
  state?: TState | null;
  stats: GameStats;
}

const emptyStats = (): GameStats => ({
  plays: 0,
  totalScore: 0,
  bestScore: 0,
  lastPlayedAt: 0,
  achievements: [],
});

function read<T>(id: string): GameSave<T> {
  if (typeof window === "undefined") return { state: null, stats: emptyStats() };
  try {
    const raw = localStorage.getItem(`novagames:save:${id}`);
    if (!raw) return { state: null, stats: emptyStats() };
    const parsed = JSON.parse(raw) as GameSave<T>;
    return { state: parsed.state ?? null, stats: { ...emptyStats(), ...parsed.stats } };
  } catch {
    return { state: null, stats: emptyStats() };
  }
}

function write<T>(id: string, save: GameSave<T>) {
  try {
    localStorage.setItem(`novagames:save:${id}`, JSON.stringify(save));
  } catch {
    /* quota or disabled */
  }
}

export function useGameSave<TState = unknown>(gameId: string) {
  const [save, setSave] = useState<GameSave<TState>>(() => read<TState>(gameId));

  useEffect(() => {
    setSave(read<TState>(gameId));
  }, [gameId]);

  const saveState = useCallback(
    (state: TState | null) => {
      setSave((prev) => {
        const next = { ...prev, state };
        write(gameId, next);
        return next;
      });
    },
    [gameId],
  );

  const clearState = useCallback(() => saveState(null), [saveState]);

  const recordRun = useCallback(
    (score: number, achievements: string[] = []) => {
      setSave((prev) => {
        const merged = Array.from(new Set([...prev.stats.achievements, ...achievements]));
        const next: GameSave<TState> = {
          state: prev.state,
          stats: {
            plays: prev.stats.plays + 1,
            totalScore: prev.stats.totalScore + score,
            bestScore: Math.max(prev.stats.bestScore, score),
            lastPlayedAt: Date.now(),
            achievements: merged,
          },
        };
        write(gameId, next);
        return next;
      });
    },
    [gameId],
  );

  return { save, saveState, clearState, recordRun };
}