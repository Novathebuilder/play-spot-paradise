import { lazy, type LazyExoticComponent, type ComponentType } from "react";
import type { NativeGameProps } from "./shell";

export const NATIVE_GAMES: Record<string, LazyExoticComponent<ComponentType<NativeGameProps>>> = {
  snake: lazy(() => import("./Snake")),
  tetris: lazy(() => import("./Tetris")),
  g2048: lazy(() => import("./Game2048")),
  flappy: lazy(() => import("./Flappy")),
  breakout: lazy(() => import("./Breakout")),
  memory: lazy(() => import("./Memory")),
  minesweeper: lazy(() => import("./Minesweeper")),
  ttt: lazy(() => import("./TicTacToe")),
  connect4: lazy(() => import("./Connect4")),
  pong: lazy(() => import("./Pong")),
  whack: lazy(() => import("./Whack")),
  simon: lazy(() => import("./Simon")),
};