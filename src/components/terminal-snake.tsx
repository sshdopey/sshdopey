"use client";

import { useState, useEffect, useCallback, useRef } from "react";

const ROWS = 18;
const COLS = 32;
const TICK_MS = 180;
const ENEMY_TICK = 2;

type Cell = " " | "#" | "@" | "$" | "%" | "E" | "·";
type Dir = "up" | "down" | "left" | "right";
type Pos = { r: number; c: number };

function posKey(p: Pos) {
  return `${p.r},${p.c}`;
}

function randomEmpty(grid: Cell[][]): Pos {
  let r: number, c: number;
  let attempts = 0;
  do {
    r = 1 + Math.floor(Math.random() * (ROWS - 2));
    c = 1 + Math.floor(Math.random() * (COLS - 2));
    attempts++;
  } while (grid[r][c] !== " " && attempts < 200);
  return { r, c };
}

function buildMaze(): Cell[][] {
  const g: Cell[][] = Array(ROWS)
    .fill(null)
    .map(() => Array(COLS).fill(" "));

  for (let i = 0; i < ROWS; i++) {
    g[i][0] = "#";
    g[i][COLS - 1] = "#";
  }
  for (let j = 0; j < COLS; j++) {
    g[0][j] = "#";
    g[ROWS - 1][j] = "#";
  }

  const walls: Pos[] = [];
  for (let r = 2; r < ROWS - 2; r += 2) {
    for (let c = 2; c < COLS - 2; c += 2) {
      walls.push({ r, c });
    }
  }
  walls.sort(() => Math.random() - 0.5);
  const take = Math.min(walls.length, 28 + Math.floor(Math.random() * 20));
  for (let i = 0; i < take; i++) {
    const { r, c } = walls[i];
    g[r][c] = "#";
    const dirs: Pos[] = [
      { r: r - 1, c },
      { r: r + 1, c },
      { r, c: c - 1 },
      { r, c: c + 1 },
    ].filter((d) => d.r > 0 && d.r < ROWS - 1 && d.c > 0 && d.c < COLS - 1);
    if (dirs.length) {
      const d = dirs[Math.floor(Math.random() * dirs.length)];
      if (g[d.r][d.c] === " ") g[d.r][d.c] = "#";
    }
  }

  return g;
}

export function TerminalSnake({ onExit }: { onExit: (score: number) => void }) {
  const [grid, setGrid] = useState<Cell[][]>(() => buildMaze());
  const [player, setPlayer] = useState<Pos>({ r: 1, c: 1 });
  const [enemy, setEnemy] = useState<Pos>({ r: ROWS - 2, c: COLS - 2 });
  const [coins, setCoins] = useState<Set<string>>(() => new Set());
  const [exitPos, setExitPos] = useState<Pos | null>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [message, setMessage] = useState("");
  const enemyTickRef = useRef(0);
  const gameRef = useRef<HTMLDivElement>(null);

  const totalCoins = 5;
  const coinsCollected = totalCoins - coins.size;

  useEffect(() => {
    const g = buildMaze();
    setGrid(g);
    setPlayer({ r: 1, c: 1 });
    const exit = { r: ROWS - 2, c: COLS - 2 };
    setExitPos(exit);
    const coinSet = new Set<string>();
    for (let i = 0; i < totalCoins; i++) {
      const p = randomEmpty(g);
      g[p.r][p.c] = "$";
      coinSet.add(posKey(p));
    }
    setCoins(coinSet);
    setEnemy(randomEmpty(g));
    setScore(0);
    setGameOver(false);
    setWon(false);
    setMessage("");
    gameRef.current?.focus();
  }, []);

  useEffect(() => {
    gameRef.current?.focus();
  }, [gameOver, won]);

  const movePlayer = useCallback(
    (dr: number, dc: number) => {
      if (gameOver || won) return;
      setPlayer((prev) => {
        const nr = prev.r + dr;
        const nc = prev.c + dc;
        if (nr < 1 || nr >= ROWS - 1 || nc < 1 || nc >= COLS - 1) return prev;
        if (grid[nr][nc] === "#") return prev;
        if (grid[nr][nc] === "E") {
          setGameOver(true);
          setMessage("The shadow got you!");
          return prev;
        }
        if (grid[nr][nc] === "$") {
          setCoins((c) => {
            const next = new Set(c);
            next.delete(`${nr},${nc}`);
            return next;
          });
          setScore((s) => s + 50);
        }
        if (exitPos && nr === exitPos.r && nc === exitPos.c && coins.size === 0) {
          setWon(true);
          setMessage("You escaped with the treasure!");
          setScore((s) => s + 200);
        }
        return { r: nr, c: nc };
      });
    },
    [gameOver, won, grid, exitPos, coins.size],
  );

  const handleKey = useCallback(
    (e: React.KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (gameOver || won) {
        if (e.key === "r" || e.key === "R") {
          const g = buildMaze();
          setGrid(g);
          setPlayer({ r: 1, c: 1 });
          const exit = { r: ROWS - 2, c: COLS - 2 };
          setExitPos(exit);
          const coinSet = new Set<string>();
          for (let i = 0; i < totalCoins; i++) {
            const p = randomEmpty(g);
            g[p.r][p.c] = "$";
            coinSet.add(posKey(p));
          }
          setCoins(coinSet);
          setEnemy(randomEmpty(g));
          setScore(0);
          setGameOver(false);
          setWon(false);
          setMessage("");
        } else if (e.key === "q" || e.key === "Q" || e.key === "Escape") {
          onExit(score);
        }
        return;
      }

      if (e.key === "q" || e.key === "Q" || e.key === "Escape") {
        onExit(score);
        return;
      }

      const k = e.key.toLowerCase();
      if (k === "w" || e.key === "ArrowUp") movePlayer(-1, 0);
      if (k === "s" || e.key === "ArrowDown") movePlayer(1, 0);
      if (k === "a" || e.key === "ArrowLeft") movePlayer(0, -1);
      if (k === "d" || e.key === "ArrowRight") movePlayer(0, 1);
    },
    [gameOver, won, score, movePlayer, onExit],
  );

  useEffect(() => {
    if (gameOver || won) return;
    if (player.r === enemy.r && player.c === enemy.c) {
      setGameOver(true);
      setMessage("The shadow got you!");
      return;
    }
  }, [gameOver, won, player, enemy]);

  useEffect(() => {
    if (gameOver || won) return;

    const interval = setInterval(() => {
      enemyTickRef.current++;

      setEnemy((prev) => {
        if (enemyTickRef.current % ENEMY_TICK !== 0) return prev;
        const dirs: Pos[] = [
          { r: prev.r - 1, c: prev.c },
          { r: prev.r + 1, c: prev.c },
          { r: prev.r, c: prev.c - 1 },
          { r: prev.r, c: prev.c + 1 },
        ].filter(
          (d) =>
            d.r >= 1 &&
            d.r < ROWS - 1 &&
            d.c >= 1 &&
            d.c < COLS - 1 &&
            grid[d.r][d.c] !== "#" &&
            grid[d.r][d.c] !== "$" &&
            grid[d.r][d.c] !== "%",
        );
        if (dirs.length === 0) return prev;
        return dirs[Math.floor(Math.random() * dirs.length)];
      });
    }, TICK_MS);

    return () => clearInterval(interval);
  }, [gameOver, won, grid]);

  const displayGrid = grid.map((row, r) =>
    row.map((cell, c) => {
      if (player.r === r && player.c === c) return "@";
      if (enemy.r === r && enemy.c === c) return "E";
      if (exitPos?.r === r && exitPos?.c === c) return coins.size === 0 ? "%" : "·";
      if (coins.has(`${r},${c}`)) return "$";
      return cell;
    }),
  );

  return (
    <div
      ref={gameRef}
      tabIndex={0}
      onKeyDown={handleKey}
      className="outline-none h-full flex flex-col min-h-0 font-mono select-none"
      style={{ caretColor: "transparent" }}
    >
      <div className="flex items-center justify-between text-[10px] text-accent shrink-0 mb-1">
        <span>🏰 DUNGEON — Score: {score} | $: {coinsCollected}/{totalCoins}</span>
        <span className="text-ghost">WASD · Q quit</span>
      </div>

      <div
        className="flex-1 min-h-0 grid gap-px rounded border border-line p-px bg-line"
        style={{
          gridTemplateRows: `repeat(${ROWS}, 1fr)`,
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          aspectRatio: `${COLS}/${ROWS}`,
          maxHeight: "100%",
        }}
      >
        {displayGrid.flatMap((row, r) =>
          row.map((cell, c) => {
            let bg = "bg-surface";
            let color = "text-ghost";
            if (cell === "#") {
              bg = "bg-line";
              color = "text-dim";
            } else if (cell === "@") {
              color = "text-accent";
            } else if (cell === "E") {
              color = "text-red-500";
            } else if (cell === "$") {
              color = "text-accent";
            } else if (cell === "%") {
              color = "text-accent";
            }
            return (
              <div
                key={`${r}-${c}`}
                className={`flex items-center justify-center text-[8px] xl:text-[9px] ${bg} ${color}`}
              >
                {cell}
              </div>
            );
          }),
        )}
      </div>

      <div className="text-ghost text-[9px] mt-1 shrink-0">
        {gameOver || won ? (
          <span className={won ? "text-accent" : "text-red-500/90"}>
            {message} [R] Restart · [Q] Quit
          </span>
        ) : (
          <span>Collect all $ to open exit % · Avoid E</span>
        )}
      </div>
    </div>
  );
}
