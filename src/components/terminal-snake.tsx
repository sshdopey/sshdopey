"use client";

import { useState, useEffect, useCallback, useRef } from "react";

const W = 28;
const H = 16;
const TICK = 130;

type Dir = "up" | "down" | "left" | "right";
type Pos = { x: number; y: number };

function randomFood(snake: Pos[]): Pos {
  let p: Pos;
  do {
    p = { x: 1 + Math.floor(Math.random() * (W - 2)), y: 1 + Math.floor(Math.random() * (H - 2)) };
  } while (snake.some((s) => s.x === p.x && s.y === p.y));
  return p;
}

export function TerminalSnake({ onExit }: { onExit: (score: number) => void }) {
  const [snake, setSnake] = useState<Pos[]>([
    { x: 5, y: 8 }, { x: 4, y: 8 }, { x: 3, y: 8 },
  ]);
  const [food, setFood] = useState<Pos>({ x: 15, y: 8 });
  const [dir, setDir] = useState<Dir>("right");
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const dirRef = useRef<Dir>("right");
  const gameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gameRef.current?.focus();
  }, []);

  const handleKey = useCallback(
    (e: React.KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (gameOver) {
        if (e.key === "r" || e.key === "R") {
          setSnake([{ x: 5, y: 8 }, { x: 4, y: 8 }, { x: 3, y: 8 }]);
          setFood({ x: 15, y: 8 });
          setDir("right");
          dirRef.current = "right";
          setScore(0);
          setGameOver(false);
          setPaused(false);
        } else if (e.key === "q" || e.key === "Q" || e.key === "Escape") {
          onExit(score);
        }
        return;
      }

      if (e.key === "p" || e.key === "P") {
        setPaused((p) => !p);
        return;
      }
      if (e.key === "q" || e.key === "Q" || e.key === "Escape") {
        onExit(score);
        return;
      }

      const k = e.key.toLowerCase();
      const d = dirRef.current;
      if ((k === "w" || e.key === "ArrowUp") && d !== "down") { setDir("up"); dirRef.current = "up"; }
      if ((k === "s" || e.key === "ArrowDown") && d !== "up") { setDir("down"); dirRef.current = "down"; }
      if ((k === "a" || e.key === "ArrowLeft") && d !== "right") { setDir("left"); dirRef.current = "left"; }
      if ((k === "d" || e.key === "ArrowRight") && d !== "left") { setDir("right"); dirRef.current = "right"; }
    },
    [gameOver, score, onExit],
  );

  useEffect(() => {
    if (gameOver || paused) return;

    const interval = setInterval(() => {
      setSnake((prev) => {
        const head = prev[0];
        const d = dirRef.current;
        const next: Pos = {
          x: head.x + (d === "right" ? 1 : d === "left" ? -1 : 0),
          y: head.y + (d === "down" ? 1 : d === "up" ? -1 : 0),
        };

        if (
          next.x <= 0 || next.x >= W - 1 ||
          next.y <= 0 || next.y >= H - 1 ||
          prev.some((s) => s.x === next.x && s.y === next.y)
        ) {
          setGameOver(true);
          return prev;
        }

        const newSnake = [next, ...prev];

        if (next.x === food.x && next.y === food.y) {
          setScore((s) => s + 10);
          setFood(randomFood(newSnake));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, TICK);

    return () => clearInterval(interval);
  }, [gameOver, paused, food]);

  const grid: string[][] = [];
  for (let y = 0; y < H; y++) {
    const row: string[] = [];
    for (let x = 0; x < W; x++) {
      if (y === 0 || y === H - 1) row.push("─");
      else if (x === 0 || x === W - 1) row.push("│");
      else row.push(" ");
    }
    grid.push(row);
  }
  grid[0][0] = "┌"; grid[0][W - 1] = "┐";
  grid[H - 1][0] = "└"; grid[H - 1][W - 1] = "┘";

  grid[food.y][food.x] = "●";

  snake.forEach((s, i) => {
    if (s.x > 0 && s.x < W - 1 && s.y > 0 && s.y < H - 1) {
      grid[s.y][s.x] = i === 0 ? "◆" : "█";
    }
  });

  return (
    <div
      ref={gameRef}
      tabIndex={0}
      onKeyDown={handleKey}
      className="outline-none font-mono text-[10px] leading-[1.3] select-none"
      style={{ caretColor: "transparent" }}
    >
      <div className="text-accent mb-1">
        🐍 SNAKE — Score: {score} {paused && "⏸ PAUSED"}
      </div>
      <div className="text-ghost">
        {grid.map((row, y) => (
          <div key={y}>
            {row.map((cell, x) => {
              let cls = "";
              if (cell === "◆") cls = "text-accent font-bold";
              else if (cell === "█") cls = "text-accent";
              else if (cell === "●") cls = "text-primary";
              else if ("┌┐└┘─│".includes(cell)) cls = "text-line";
              return (
                <span key={x} className={cls}>
                  {cell}
                </span>
              );
            })}
          </div>
        ))}
      </div>
      <div className="text-ghost mt-1 text-[9px]">
        {gameOver ? (
          <span className="text-accent">
            Game Over! Score: {score} — [R] Restart [Q] Quit
          </span>
        ) : (
          <span>WASD/Arrows: move · P: pause · Q: quit</span>
        )}
      </div>
    </div>
  );
}
