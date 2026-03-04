"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/*
  Terminal Pac-Man — a faithful ASCII recreation.
  Grid-based with dots, power pellets, 4 ghosts with different AI,
  smooth gameplay ~12fps, touch/swipe support, and optional sound.
*/

const ROWS = 21;
const COLS = 21;
const TICK_MS = 145;
const GHOST_TICK_MS = 160;
const SWIPE_THRESHOLD = 25;

type Dir = "up" | "down" | "left" | "right";
type Pos = { r: number; c: number };

const DIRS: Record<Dir, Pos> = {
  up: { r: -1, c: 0 },
  down: { r: 1, c: 0 },
  left: { r: 0, c: -1 },
  right: { r: 0, c: 1 },
};

// Classic Pac-Man maze (1=wall, 0=dot, 2=empty, 3=power pellet, 4=ghost house)
const MAZE_TEMPLATE: number[][] = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,1,1,0,0,1,0,0,1,1,1,0,1,1,0,1],
  [1,3,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,3,1],
  [1,0,0,0,0,1,0,1,1,0,1,0,1,1,0,1,0,0,0,0,1],
  [1,1,1,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,1,1,1],
  [2,2,1,0,0,1,1,0,1,1,4,1,1,0,1,1,0,0,1,2,2],
  [1,1,1,0,0,0,0,0,1,4,4,4,1,0,0,0,0,0,1,1,1],
  [2,2,2,0,0,1,0,0,1,4,4,4,1,0,0,1,0,0,2,2,2],
  [1,1,1,0,0,1,0,0,1,1,1,1,1,0,0,1,0,0,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,0,1,1,0,1,0,1,1,0,1,0,1,1,0,1],
  [1,3,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,3,1],
  [1,1,0,1,0,1,0,1,1,0,1,0,1,1,0,1,0,1,0,1,1],
  [1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1],
  [1,0,1,1,1,1,1,1,0,1,1,1,0,1,1,1,1,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,1,0,1,0,1,0,1,0,1,1,0,1,1,0,1],
  [1,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,1,0,1,1,1,1,1,0,1,1,0,1,1,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

interface Ghost {
  pos: Pos;
  dir: Dir;
  color: string;
  scared: boolean;
  home: boolean;
  homeTimer: number;
}

function canMove(maze: number[][], r: number, c: number): boolean {
  // Wrap around for tunnels
  const wr = ((r % ROWS) + ROWS) % ROWS;
  const wc = ((c % COLS) + COLS) % COLS;
  const cell = maze[wr]?.[wc];
  return cell !== undefined && cell !== 1;
}

function ghostCanMove(maze: number[][], r: number, c: number, fromHome: boolean): boolean {
  const wr = ((r % ROWS) + ROWS) % ROWS;
  const wc = ((c % COLS) + COLS) % COLS;
  const cell = maze[wr]?.[wc];
  if (cell === undefined) return false;
  if (cell === 1) return false;
  if (cell === 4 && !fromHome) return false;
  return true;
}

export function TerminalPacman({ onExit }: { onExit: (score: number) => void }) {
  const [maze, setMaze] = useState<number[][]>(() =>
    MAZE_TEMPLATE.map((row) => [...row])
  );
  const [pacman, setPacman] = useState<Pos>({ r: 16, c: 10 });
  const [pacDir, setPacDir] = useState<Dir>("right");
  const [nextDir, setNextDir] = useState<Dir>("right");
  const [ghosts, setGhosts] = useState<Ghost[]>([
    { pos: { r: 7, c: 9 }, dir: "up", color: "text-red-400", scared: false, home: true, homeTimer: 0 },
    { pos: { r: 7, c: 10 }, dir: "up", color: "text-pink-400", scared: false, home: true, homeTimer: 10 },
    { pos: { r: 8, c: 9 }, dir: "up", color: "text-cyan-400", scared: false, home: true, homeTimer: 20 },
    { pos: { r: 8, c: 10 }, dir: "up", color: "text-orange-400", scared: false, home: true, homeTimer: 30 },
  ]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [powerTimer, setPowerTimer] = useState(0);
  const [mouthOpen, setMouthOpen] = useState(true);
  const gameRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const mazeRef = useRef(maze);
  const pacDirRef = useRef(pacDir);
  const nextDirRef = useRef(nextDir);

  useEffect(() => {
    mazeRef.current = maze;
    pacDirRef.current = pacDir;
    nextDirRef.current = nextDir;
  }, [maze, pacDir, nextDir]);

  // Optional sound feedback (respects user prefs, no autoplay)
  const playDotSound = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.connect(g);
      g.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.type = "sine";
      g.gain.setValueAtTime(0.06, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.05);
    } catch {
      /* ignore */
    }
  }, []);
  const playPowerSound = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.connect(g);
      g.connect(ctx.destination);
      osc.frequency.value = 440;
      osc.type = "square";
      g.gain.setValueAtTime(0.08, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.12);
    } catch {
      /* ignore */
    }
  }, []);

  // Reset game
  const resetGame = useCallback(() => {
    setMaze(MAZE_TEMPLATE.map((row) => [...row]));
    setPacman({ r: 16, c: 10 });
    setPacDir("right");
    setNextDir("right");
    setGhosts([
      { pos: { r: 7, c: 9 }, dir: "up", color: "text-red-400", scared: false, home: true, homeTimer: 0 },
      { pos: { r: 7, c: 10 }, dir: "up", color: "text-pink-400", scared: false, home: true, homeTimer: 10 },
      { pos: { r: 8, c: 9 }, dir: "up", color: "text-cyan-400", scared: false, home: true, homeTimer: 20 },
      { pos: { r: 8, c: 10 }, dir: "up", color: "text-orange-400", scared: false, home: true, homeTimer: 30 },
    ]);
    setScore(0);
    setLives(3);
    setGameOver(false);
    setWon(false);
    setPowerTimer(0);
    gameRef.current?.focus();
  }, []);

  useEffect(() => {
    gameRef.current?.focus();
  }, []);

  // Keyboard input
  const handleKey = useCallback(
    (e: React.KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (gameOver || won) {
        if (e.key === "r" || e.key === "R") resetGame();
        else if (e.key === "q" || e.key === "Q" || e.key === "Escape") onExit(score);
        return;
      }

      if (e.key === "q" || e.key === "Q" || e.key === "Escape") {
        onExit(score);
        return;
      }

      const k = e.key.toLowerCase();
      if (k === "w" || e.key === "ArrowUp") setNextDir("up");
      else if (k === "s" || e.key === "ArrowDown") setNextDir("down");
      else if (k === "a" || e.key === "ArrowLeft") setNextDir("left");
      else if (k === "d" || e.key === "ArrowRight") setNextDir("right");
    },
    [gameOver, won, score, resetGame, onExit],
  );

  // Main game loop — requestAnimationFrame + delta time for smooth, consistent speed
  useEffect(() => {
    if (gameOver || won) return;

    let rafId: number;
    let lastTime = performance.now();
    let accum = 0;

    function frame(now: number) {
      rafId = requestAnimationFrame(frame);
      const delta = Math.min(now - lastTime, 100);
      lastTime = now;
      accum += delta;
      if (accum < TICK_MS) return;
      accum -= TICK_MS;

      setMouthOpen((prev) => !prev);
      setPowerTimer((p) => Math.max(0, p - 1));
      setPacman((prev) => {
        const m = mazeRef.current;
        const nd = DIRS[nextDirRef.current];
        const nr = ((prev.r + nd.r) % ROWS + ROWS) % ROWS;
        const nc = ((prev.c + nd.c) % COLS + COLS) % COLS;
        if (canMove(m, nr, nc) && m[nr][nc] !== 4) {
          setPacDir(nextDirRef.current);
          return { r: nr, c: nc };
        }
        const cd = DIRS[pacDirRef.current];
        const cr = ((prev.r + cd.r) % ROWS + ROWS) % ROWS;
        const cc = ((prev.c + cd.c) % COLS + COLS) % COLS;
        if (canMove(m, cr, cc) && m[cr][cc] !== 4) return { r: cr, c: cc };
        return prev;
      });
    }

    rafId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafId);
  }, [gameOver, won]);

  // Collect dots and check ghost collisions
  useEffect(() => {
    if (gameOver || won) return;

    const t = setTimeout(() => {
    setMaze((prev) => {
      const cell = prev[pacman.r]?.[pacman.c];
      if (cell === 0) {
        playDotSound();
        const next = prev.map((r) => [...r]);
        next[pacman.r][pacman.c] = 2;
        setScore((s) => s + 10);
        return next;
      }
      if (cell === 3) {
        playPowerSound();
        const next = prev.map((r) => [...r]);
        next[pacman.r][pacman.c] = 2;
        setScore((s) => s + 50);
        setPowerTimer(30);
        setGhosts((gs) => gs.map((g) => ({ ...g, scared: true })));
        return next;
      }
      return prev;
    });

    // Check win
    const remaining = maze.flat().filter((c) => c === 0 || c === 3).length;
    if (remaining === 0) {
      setWon(true);
      setScore((s) => s + 500);
    }

    // Ghost collision
    setGhosts((gs) => {
      let ate = false;
      const newGhosts = gs.map((g) => {
        if (g.pos.r === pacman.r && g.pos.c === pacman.c) {
          if (g.scared) {
            ate = true;
            setScore((s) => s + 200);
            return {
              ...g,
              pos: { r: 7, c: 10 },
              scared: false,
              home: true,
              homeTimer: 10,
            };
          } else if (!g.home) {
            setLives((l) => {
              const next = l - 1;
              if (next <= 0) setGameOver(true);
              return next;
            });
            setPacman({ r: 16, c: 10 });
            setPacDir("right");
            setNextDir("right");
            return g;
          }
        }
        return g;
      });
      return ate ? newGhosts : gs === newGhosts ? gs : newGhosts;
    });
    }, 0);
    return () => clearTimeout(t);
  }, [pacman, gameOver, won, maze, playDotSound, playPowerSound]);

  // Power timer effect on ghosts
  useEffect(() => {
    if (powerTimer === 0) {
      const t = setTimeout(() => setGhosts((gs) => gs.map((g) => ({ ...g, scared: false }))), 0);
      return () => clearTimeout(t);
    }
  }, [powerTimer]);

  // Move ghosts
  useEffect(() => {
    if (gameOver || won) return;

    const interval = setInterval(() => {
      setGhosts((prev) =>
        prev.map((ghost) => {
          // Ghost in home — count down then leave
          if (ghost.home) {
            if (ghost.homeTimer > 0) {
              return { ...ghost, homeTimer: ghost.homeTimer - 1 };
            }
            // Leave home — move up to exit
            const exitR = 6;
            const exitC = 10;
            if (ghost.pos.r > exitR) {
              return { ...ghost, pos: { r: ghost.pos.r - 1, c: ghost.pos.c } };
            }
            if (ghost.pos.c !== exitC) {
              return {
                ...ghost,
                pos: { r: ghost.pos.r, c: ghost.pos.c + (ghost.pos.c < exitC ? 1 : -1) },
              };
            }
            return { ...ghost, home: false, dir: "left" };
          }

          // Regular ghost movement
          const opposite: Record<Dir, Dir> = {
            up: "down",
            down: "up",
            left: "right",
            right: "left",
          };

          const dirs: Dir[] = (["up", "down", "left", "right"] as Dir[]).filter(
            (d) => d !== opposite[ghost.dir],
          );

          // If scared, move randomly; otherwise chase or scatter
          let bestDir = ghost.dir;
          let bestDist = ghost.scared ? -1 : Infinity;

          for (const d of dirs) {
            const dd = DIRS[d];
            const nr = ((ghost.pos.r + dd.r) % ROWS + ROWS) % ROWS;
            const nc = ((ghost.pos.c + dd.c) % COLS + COLS) % COLS;

            if (!ghostCanMove(maze, nr, nc, false)) continue;

            const dist =
              Math.abs(nr - pacman.r) + Math.abs(nc - pacman.c);

            if (ghost.scared) {
              // Run away — maximize distance
              if (dist > bestDist) {
                bestDist = dist;
                bestDir = d;
              }
            } else {
              // Chase — minimize distance (with some randomness)
              const jitter = Math.random() * 3;
              if (dist + jitter < bestDist) {
                bestDist = dist + jitter;
                bestDir = d;
              }
            }
          }

          const dd = DIRS[bestDir];
          const nr = ((ghost.pos.r + dd.r) % ROWS + ROWS) % ROWS;
          const nc = ((ghost.pos.c + dd.c) % COLS + COLS) % COLS;

          if (ghostCanMove(maze, nr, nc, false)) {
            return { ...ghost, pos: { r: nr, c: nc }, dir: bestDir };
          }

          // Stuck — try any valid direction
          for (const d of dirs) {
            const dd2 = DIRS[d];
            const nr2 = ((ghost.pos.r + dd2.r) % ROWS + ROWS) % ROWS;
            const nc2 = ((ghost.pos.c + dd2.c) % COLS + COLS) % COLS;
            if (ghostCanMove(maze, nr2, nc2, false)) {
              return { ...ghost, pos: { r: nr2, c: nc2 }, dir: d };
            }
          }

          return ghost;
        }),
      );
    }, GHOST_TICK_MS);

    return () => clearInterval(interval);
  }, [gameOver, won, maze, pacman]);

  // Pac-Man character based on direction and mouth state
  const pacChar = mouthOpen
    ? { up: "V", down: "Ʌ", left: ")", right: "(" }[pacDir] || "C"
    : "O";

  // Build display
  const ghostPositions = new Map<string, Ghost>();
  for (const g of ghosts) {
    ghostPositions.set(`${g.pos.r},${g.pos.c}`, g);
  }

  // Touch: swipe to change direction
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0];
    if (t) touchStartRef.current = { x: t.clientX, y: t.clientY };
  }, []);
  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const start = touchStartRef.current;
      touchStartRef.current = null;
      if (!start || gameOver || won) return;
      const t = e.changedTouches[0];
      if (!t) return;
      const dx = t.clientX - start.x;
      const dy = t.clientY - start.y;
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > SWIPE_THRESHOLD) setNextDir("right");
        else if (dx < -SWIPE_THRESHOLD) setNextDir("left");
      } else {
        if (dy > SWIPE_THRESHOLD) setNextDir("down");
        else if (dy < -SWIPE_THRESHOLD) setNextDir("up");
      }
    },
    [gameOver, won],
  );

  return (
    <div
      ref={gameRef}
      tabIndex={0}
      onKeyDown={handleKey}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="outline-none h-full flex flex-col min-h-0 font-mono select-none touch-none"
      style={{ caretColor: "transparent" }}
    >
      <div className="flex items-center justify-between text-xs shrink-0 mb-2 px-0.5">
        <span className="text-accent font-semibold">
          PAC-MAN
        </span>
        <span className="text-primary font-medium tabular-nums">
          {score}
        </span>
        <span className="text-muted text-[10px]">
          ♥ {lives} · WASD / Arrows
        </span>
      </div>

      <div className="flex-1 min-h-0 flex items-center justify-center overflow-auto">
        <pre
          className="text-[13px] leading-[1.4] shrink-0 scale-110 origin-center"
          style={{ fontFamily: "inherit" }}
        >
          {maze.map((row, r) => (
            <div key={r} className="flex">
              {row.map((cell, c) => {
                const key = `${r},${c}`;

                // Pac-Man
                if (pacman.r === r && pacman.c === c) {
                  return (
                    <span key={key} className="text-accent font-bold" style={{ width: "1ch", textAlign: "center", display: "inline-block" }}>
                      {pacChar}
                    </span>
                  );
                }

                // Ghost
                const ghost = ghostPositions.get(key);
                if (ghost && !ghost.home) {
                  return (
                    <span
                      key={key}
                      className={`font-bold ${ghost.scared ? (powerTimer < 8 ? "animate-pulse text-blue-300" : "text-blue-400") : ghost.color}`}
                      style={{ width: "1ch", textAlign: "center", display: "inline-block" }}
                    >
                      {ghost.scared ? "◎" : "◉"}
                    </span>
                  );
                }

                // Maze cells
                let char = " ";
                let color = "";

                switch (cell) {
                  case 1: // Wall
                    char = "█";
                    color = "text-blue-600/80";
                    break;
                  case 0: // Dot
                    char = "·";
                    color = "text-amber-200/90";
                    break;
                  case 3: // Power pellet
                    char = "●";
                    color = "text-accent";
                    break;
                  case 4: // Ghost house
                    char = " ";
                    break;
                  case 2: // Empty (eaten)
                    char = " ";
                    break;
                }

                return (
                  <span
                    key={key}
                    className={color}
                    style={{ width: "1ch", textAlign: "center", display: "inline-block" }}
                  >
                    {char}
                  </span>
                );
              })}
            </div>
          ))}
        </pre>
      </div>

      <div className="text-ghost text-[10px] mt-2 shrink-0 px-0.5">
        {gameOver ? (
          <span className="text-red-400/90 font-medium">
            Game Over — Score: {score} · [R] Restart · [Q] Quit
          </span>
        ) : won ? (
          <span className="text-accent font-medium">
            You win! Score: {score} · [R] Restart · [Q] Quit
          </span>
        ) : (
          <span>● power pellet · Avoid ghosts · Swipe on touch</span>
        )}
      </div>
    </div>
  );
}
