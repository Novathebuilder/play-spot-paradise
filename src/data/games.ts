export type GameCategory =
  | "Action"
  | "Puzzle"
  | "Arcade"
  | "Racing"
  | "Shooter"
  | "Strategy"
  | "Sports"
  | "Casual";

export interface Game {
  id: string;
  title: string;
  description: string;
  category: GameCategory;
  thumbnailGradient: string; // tailwind gradient classes
  emoji: string;
  embedUrl: string;
  tags: string[];
  featured?: boolean;
}

export const CATEGORIES: { name: GameCategory; emoji: string }[] = [
  { name: "Action", emoji: "⚔️" },
  { name: "Puzzle", emoji: "🧩" },
  { name: "Arcade", emoji: "👾" },
  { name: "Racing", emoji: "🏎️" },
  { name: "Shooter", emoji: "🎯" },
  { name: "Strategy", emoji: "♟️" },
  { name: "Sports", emoji: "⚽" },
  { name: "Casual", emoji: "🎲" },
];

// Curated free / open-source HTML5 games that allow iframe embedding.
export const GAMES: Game[] = [
  {
    id: "2048",
    title: "2048",
    description: "Slide tiles, combine numbers, reach 2048. The classic puzzle that still hooks millions.",
    category: "Puzzle",
    thumbnailGradient: "from-amber-500 via-orange-500 to-rose-500",
    emoji: "🔢",
    embedUrl: "https://play2048.co/",
    tags: ["puzzle", "numbers", "logic"],
    featured: true,
  },
  {
    id: "agar",
    title: "Agar.io",
    description: "Eat cells smaller than you, dodge the bigger ones. Multiplayer arena chaos.",
    category: "Action",
    thumbnailGradient: "from-cyan-500 via-blue-500 to-indigo-600",
    emoji: "🟢",
    embedUrl: "https://agar.io/",
    tags: ["multiplayer", "io", "arena"],
    featured: true,
  },
  {
    id: "slither",
    title: "Slither.io",
    description: "Grow the longest snake on the server. One wrong turn and it's over.",
    category: "Arcade",
    thumbnailGradient: "from-emerald-500 via-teal-500 to-cyan-600",
    emoji: "🐍",
    embedUrl: "https://slither.io/",
    tags: ["multiplayer", "snake", "io"],
    featured: true,
  },
  {
    id: "krunker",
    title: "Krunker.io",
    description: "Fast-paced pixel FPS. Drop in, frag out.",
    category: "Shooter",
    thumbnailGradient: "from-orange-500 via-red-500 to-pink-600",
    emoji: "🔫",
    embedUrl: "https://krunker.io/",
    tags: ["fps", "shooter", "multiplayer"],
    featured: true,
  },
  {
    id: "diep",
    title: "Diep.io",
    description: "Upgrade your tank, blast shapes, dominate the leaderboard.",
    category: "Shooter",
    thumbnailGradient: "from-sky-500 via-indigo-500 to-purple-600",
    emoji: "🛡️",
    embedUrl: "https://diep.io/",
    tags: ["tanks", "io", "shooter"],
  },
  {
    id: "chess",
    title: "Lichess",
    description: "Free chess against players around the world. Beautiful, fast, no ads.",
    category: "Strategy",
    thumbnailGradient: "from-stone-500 via-zinc-600 to-slate-700",
    emoji: "♛",
    embedUrl: "https://lichess.org/",
    tags: ["chess", "board", "strategy"],
  },
  {
    id: "wordle",
    title: "Word Master",
    description: "Guess the five-letter word in six tries. Simple, addictive, daily.",
    category: "Puzzle",
    thumbnailGradient: "from-lime-500 via-green-500 to-emerald-600",
    emoji: "🔤",
    embedUrl: "https://octokatherine.github.io/word-master/",
    tags: ["words", "daily", "puzzle"],
  },
  {
    id: "tetris",
    title: "Tetris Clone",
    description: "Stack blocks, clear lines. The arcade classic, reborn for the browser.",
    category: "Arcade",
    thumbnailGradient: "from-fuchsia-500 via-purple-500 to-indigo-600",
    emoji: "🟦",
    embedUrl: "https://chvin.github.io/react-tetris/",
    tags: ["blocks", "classic", "arcade"],
    featured: true,
  },
  {
    id: "flappy",
    title: "Flappy Bird",
    description: "Tap to flap. One pipe at a time. Don't rage-quit.",
    category: "Casual",
    thumbnailGradient: "from-yellow-400 via-amber-500 to-orange-600",
    emoji: "🐤",
    embedUrl: "https://flappybird.io/",
    tags: ["arcade", "casual", "classic"],
  },
  {
    id: "pacman",
    title: "Pac-Man",
    description: "Munch dots, dodge ghosts. The arcade legend lives on.",
    category: "Arcade",
    thumbnailGradient: "from-yellow-400 via-orange-500 to-red-500",
    emoji: "🟡",
    embedUrl: "https://www.google.com/logos/2010/pacman10-i.html",
    tags: ["classic", "arcade", "retro"],
  },
  {
    id: "minesweeper",
    title: "Minesweeper",
    description: "Click. Flag. Don't blow up. The Windows classic in your browser.",
    category: "Puzzle",
    thumbnailGradient: "from-slate-500 via-gray-600 to-zinc-700",
    emoji: "💣",
    embedUrl: "https://minesweeper.online/",
    tags: ["puzzle", "classic", "logic"],
  },
  {
    id: "sudoku",
    title: "Sudoku",
    description: "Fill the grid. One through nine. Pure logic, zero luck.",
    category: "Puzzle",
    thumbnailGradient: "from-blue-500 via-indigo-500 to-violet-600",
    emoji: "🔲",
    embedUrl: "https://sudoku.com/",
    tags: ["numbers", "logic", "daily"],
  },
  {
    id: "trackmania",
    title: "Trackmania Web",
    description: "Drift, boost, perfect every corner of insane stunt tracks.",
    category: "Racing",
    thumbnailGradient: "from-red-500 via-rose-500 to-pink-600",
    emoji: "🏁",
    embedUrl: "https://hexgl.bkcore.com/play/",
    tags: ["racing", "speed", "3d"],
    featured: true,
  },
  {
    id: "pinball",
    title: "Neon Pinball",
    description: "Flip, bump, multiball. Score chasing at its purest.",
    category: "Arcade",
    thumbnailGradient: "from-pink-500 via-fuchsia-500 to-purple-600",
    emoji: "🎰",
    embedUrl: "https://alexa-games.github.io/neon-pinball/",
    tags: ["pinball", "arcade", "retro"],
  },
  {
    id: "kart",
    title: "SuperTuxKart",
    description: "Open-source kart racing with power-ups, drifts and chaos.",
    category: "Racing",
    thumbnailGradient: "from-orange-500 via-amber-500 to-yellow-500",
    emoji: "🏎️",
    embedUrl: "https://supertuxkart.net/",
    tags: ["kart", "racing", "multiplayer"],
  },
  {
    id: "pong",
    title: "Cyber Pong",
    description: "The original arcade duel, dressed up in neon.",
    category: "Sports",
    thumbnailGradient: "from-cyan-400 via-sky-500 to-blue-600",
    emoji: "🏓",
    embedUrl: "https://www.ponggame.org/",
    tags: ["pong", "arcade", "classic"],
  },
  {
    id: "basket",
    title: "Basketball Stars",
    description: "Shoot hoops in quickfire challenges. Nothing but net.",
    category: "Sports",
    thumbnailGradient: "from-orange-500 via-amber-600 to-yellow-700",
    emoji: "🏀",
    embedUrl: "https://basketball-fr-vm.com/",
    tags: ["sports", "arcade", "casual"],
  },
  {
    id: "bombparty",
    title: "BombParty",
    description: "Type a word containing the syllable before the bomb explodes.",
    category: "Casual",
    thumbnailGradient: "from-rose-500 via-red-500 to-orange-600",
    emoji: "💥",
    embedUrl: "https://jklm.fun/",
    tags: ["party", "words", "multiplayer"],
  },
];