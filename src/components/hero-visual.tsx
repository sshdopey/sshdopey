"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, useDragControls, AnimatePresence } from "framer-motion";
import { Terminal, Grip } from "lucide-react";
import { TerminalPacman } from "./terminal-pacman";

type WindowState = "normal" | "minimized" | "maximized" | "closed";

type Color = "accent" | "muted" | "ghost" | "secondary" | "dim" | "primary";

const colorMap: Record<Color, string> = {
  accent: "text-accent",
  muted: "text-muted",
  ghost: "text-ghost",
  secondary: "text-secondary",
  dim: "text-dim",
  primary: "text-primary",
};

interface FSNode {
  type: "file" | "dir";
  content?: string;
  children?: Record<string, FSNode>;
}

function buildFS(): FSNode {
  return {
    type: "dir",
    children: {
      home: {
        type: "dir",
        children: {
          dopey: {
            type: "dir",
            children: {
              projects: {
                type: "dir",
                children: {
                  fairmeld: {
                    type: "dir",
                    children: {
                      "README.md": {
                        type: "file",
                        content:
                          "# Fairmeld\n\nAn AI system everyone would trust.\nBuilt with Rust + Python.\nStatus: shipping fast 🚀",
                      },
                      "Cargo.toml": {
                        type: "file",
                        content:
                          '[package]\nname = "fairmeld"\nversion = "0.8.0"\nedition = "2024"\n\n[dependencies]\ntokio = { version = "1", features = ["full"] }\nserde = { version = "1", features = ["derive"] }',
                      },
                      src: {
                        type: "dir",
                        children: {
                          "main.rs": {
                            type: "file",
                            content:
                              'use fairmeld::Engine;\n\n#[tokio::main]\nasync fn main() -> Result<()> {\n    let engine = Engine::new()\n        .with_trust_layer()\n        .with_inference()\n        .build()\n        .await?;\n\n    engine.serve("0.0.0.0:8080").await\n}',
                          },
                        },
                      },
                    },
                  },
                  "neural-engine": {
                    type: "dir",
                    children: {
                      "train.py": {
                        type: "file",
                        content:
                          "import torch\nfrom engine import NeuralCore\n\nmodel = NeuralCore(\n    layers=12,\n    heads=8,\n    d_model=768\n)\n\ntrainer = Trainer(model, lr=3e-4)\ntrainer.fit(epochs=100)\nprint(f\"✓ accuracy: {trainer.best_acc:.1%}\")",
                      },
                      "requirements.txt": {
                        type: "file",
                        content:
                          "torch>=2.1.0\ntransformers>=4.35.0\nonnxruntime>=1.16.0\nnumpy>=1.24.0",
                      },
                    },
                  },
                  sshdopey: {
                    type: "dir",
                    children: {
                      "package.json": {
                        type: "file",
                        content:
                          '{\n  "name": "sshdopey",\n  "version": "1.0.0",\n  "framework": "Next.js 16",\n  "description": "Personal website & blog"\n}',
                      },
                    },
                  },
                },
              },
              notes: {
                type: "dir",
                children: {
                  "ideas.txt": {
                    type: "file",
                    content:
                      "- Zero-copy parser for streaming inference\n- Distributed trust verification protocol\n- Rust WASM runtime for edge AI\n- Blog post: why SQLite is enough\n- Make terminal on website interactive ✓",
                  },
                  "stack.md": {
                    type: "file",
                    content:
                      "# Stack\n\nLanguages: Python, Rust, TypeScript\nAI/ML: PyTorch, Transformers, ONNX\nInfra: Docker, SQLite, Cloudflare\nFrontend: Next.js, Tailwind, Framer Motion\nEditor: Neovim + tmux (obviously)",
                  },
                },
              },
              ".zshrc": {
                type: "file",
                content:
                  'export PATH="$HOME/.cargo/bin:$PATH"\nexport EDITOR=nvim\nalias ll="ls -la"\nalias gs="git status"\nalias gp="git push"\neval "$(starship init zsh)"\n\n# life motto\necho "ship it or quit it"',
              },
              ".ssh": {
                type: "dir",
                children: {
                  config: {
                    type: "file",
                    content:
                      "Host fairmeld\n  HostName fairmeld.com\n  User dopey\n  IdentityFile ~/.ssh/id_ed25519",
                  },
                },
              },
            },
          },
        },
      },
    },
  };
}

function resolvePath(
  fs: FSNode,
  cwd: string,
  target: string,
): { node: FSNode; path: string } | null {
  let abs: string;
  if (target.startsWith("/")) abs = target;
  else if (target.startsWith("~")) abs = "/home/dopey" + target.slice(1);
  else abs = cwd === "/" ? "/" + target : cwd + "/" + target;

  const parts = abs.split("/").filter(Boolean);
  const resolved: string[] = [];
  for (const p of parts) {
    if (p === "..") resolved.pop();
    else if (p !== ".") resolved.push(p);
  }

  let node = fs;
  for (const part of resolved) {
    if (node.type !== "dir" || !node.children?.[part]) return null;
    node = node.children[part];
  }
  return { node, path: "/" + resolved.join("/") };
}

function listDir(node: FSNode): string[] {
  if (node.type !== "dir" || !node.children) return [];
  return Object.entries(node.children).map(([name, n]) =>
    n.type === "dir" ? name + "/" : name,
  );
}

function treeStr(node: FSNode, prefix = "", isLast = true, name = ""): string {
  let result = "";
  if (name) {
    const connector = isLast ? "└── " : "├── ";
    const display = node.type === "dir" ? name + "/" : name;
    result += prefix + connector + display + "\n";
  }
  if (node.type === "dir" && node.children) {
    const entries = Object.entries(node.children);
    entries.forEach(([childName, childNode], i) => {
      const last = i === entries.length - 1;
      const newPrefix = name ? prefix + (isLast ? "    " : "│   ") : prefix;
      result += treeStr(childNode, newPrefix, last, childName);
    });
  }
  return result;
}

export function HeroVisual() {
  const [fs] = useState(buildFS);
  const [cwd, setCwd] = useState("/home/dopey");
  const [lines, setLines] = useState<{ text: string; color: Color }[]>(() => []);
  const [inputValue, setInputValue] = useState("");
  const [ready, setReady] = useState(false);
  const [bootDone, setBoot] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [gameMode, setGameMode] = useState<"none" | "game">("none");
  const [windowState, setWindowState] = useState<WindowState>("normal");
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();

  useEffect(() => {
    const t1 = setTimeout(() => setReady(true), 600);
    const t2 = setTimeout(() => setBoot(true), 1400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    if (bootDone) inputRef.current?.focus();
  }, [bootDone]);

  const prompt = useCallback(
    () => `dopey ${cwd === "/home/dopey" ? "~" : cwd.replace("/home/dopey", "~")}>`,
    [cwd],
  );

  const addLines = useCallback((newLines: { text: string; color: Color }[]) => {
    setLines((prev) => [...prev, ...newLines]);
    setTimeout(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }, 30);
  }, []);

  const execute = useCallback(
    (raw: string) => {
      const out: { text: string; color: Color }[] = [
        { text: `${prompt()} ${raw}`, color: "secondary" },
      ];

      const parts = raw.trim().split(/\s+/);
      const cmd = parts[0]?.toLowerCase();
      const args = parts.slice(1);

      switch (cmd) {
        case "help": {
          out.push(
            { text: "Commands:", color: "muted" },
            { text: "  whoami        who is dopey?", color: "ghost" },
            { text: "  stack         tech stack", color: "ghost" },
            { text: "  projects      what i'm building", color: "ghost" },
            { text: "  neofetch      system info", color: "ghost" },
            { text: "  social        find me online", color: "ghost" },
            { text: "  pacman        🕹️ play pac-man", color: "ghost" },
            { text: "  cowsay <msg>  🐄", color: "ghost" },
            { text: "  ls · cd · cat file explorer", color: "ghost" },
            { text: "  clear         clear terminal", color: "ghost" },
          );
          break;
        }
        case "ls": {
          const showHidden = args.includes("-a") || args.includes("-la") || args.includes("-al");
          const pathArg = args.find((a) => !a.startsWith("-")) || ".";
          const resolved = resolvePath(fs, cwd, pathArg);
          if (!resolved || resolved.node.type !== "dir") {
            out.push({ text: `ls: no such directory: ${pathArg}`, color: "ghost" });
          } else {
            const items = listDir(resolved.node);
            const filtered = showHidden ? items : items.filter((i) => !i.startsWith("."));
            if (filtered.length === 0) {
              out.push({ text: "(empty)", color: "ghost" });
            } else {
              out.push({ text: `  ${filtered.join("  ")}`, color: "primary" });
            }
          }
          break;
        }
        case "cd": {
          const target = args[0] || "~";
          const resolved = resolvePath(fs, cwd, target);
          if (!resolved || resolved.node.type !== "dir") {
            out.push({ text: `cd: no such directory: ${target}`, color: "ghost" });
          } else {
            setCwd(resolved.path);
          }
          break;
        }
        case "cat": {
          const target = args[0];
          if (!target) {
            out.push({ text: "cat: missing operand", color: "ghost" });
          } else {
            const resolved = resolvePath(fs, cwd, target);
            if (!resolved || resolved.node.type !== "file") {
              out.push({ text: `cat: ${target}: No such file`, color: "ghost" });
            } else {
              for (const line of (resolved.node.content || "").split("\n")) {
                out.push({ text: `  ${line}`, color: "muted" });
              }
            }
          }
          break;
        }
        case "pwd":
          out.push({ text: `  ${cwd}`, color: "primary" });
          break;
        case "tree": {
          const target = args[0] || ".";
          const resolved = resolvePath(fs, cwd, target);
          if (!resolved || resolved.node.type !== "dir") {
            out.push({ text: `tree: not a directory: ${target}`, color: "ghost" });
          } else {
            const name = resolved.path.split("/").pop() || "/";
            out.push({ text: `  ${name}/`, color: "accent" });
            for (const line of treeStr(resolved.node).split("\n").filter(Boolean)) {
              out.push({ text: `  ${line}`, color: "muted" });
            }
          }
          break;
        }
        case "echo":
          out.push({ text: `  ${args.join(" ")}`, color: "primary" });
          break;
        case "whoami":
          out.push(
            { text: "  ╭─────────────────────────────╮", color: "dim" },
            { text: "  │  Dopey — Software Engineer  │", color: "accent" },
            { text: "  ├─────────────────────────────┤", color: "dim" },
            { text: "  │  Building AI systems &      │", color: "muted" },
            { text: "  │  high-performance tools.    │", color: "muted" },
            { text: "  │                             │", color: "dim" },
            { text: "  │  Python for the models.     │", color: "muted" },
            { text: "  │  Rust for everything else.  │", color: "muted" },
            { text: "  ╰─────────────────────────────╯", color: "dim" },
          );
          break;
        case "stack":
          out.push(
            { text: "  Languages", color: "accent" },
            { text: "    Python · Rust · TypeScript", color: "primary" },
            { text: "  AI/ML", color: "accent" },
            { text: "    PyTorch · Transformers · ONNX", color: "primary" },
            { text: "  Infra", color: "accent" },
            { text: "    Docker · SQLite · Cloudflare", color: "primary" },
            { text: "  Frontend", color: "accent" },
            { text: "    Next.js · Tailwind · Motion", color: "primary" },
            { text: "  Editor", color: "accent" },
            { text: "    Neovim + tmux (obviously)", color: "primary" },
          );
          break;
        case "projects":
          out.push(
            { text: "  🚀 Fairmeld", color: "accent" },
            { text: "     An AI system everyone would trust", color: "muted" },
            { text: "     Rust + Python | shipping fast", color: "ghost" },
            { text: "", color: "ghost" },
            { text: "  🧠 Neural Engine", color: "accent" },
            { text: "     Custom ML inference runtime", color: "muted" },
            { text: "     PyTorch + ONNX | 12 layers", color: "ghost" },
            { text: "", color: "ghost" },
            { text: "  🌐 sshdopey.com", color: "accent" },
            { text: "     This website — you're in it", color: "muted" },
            { text: "     Next.js 16 + SQLite + Tailwind", color: "ghost" },
          );
          break;
        case "social":
          out.push(
            { text: "  GitHub    github.com/sshdopey", color: "primary" },
            { text: "  Twitter   twitter.com/sshdopey", color: "primary" },
            { text: "  LinkedIn  linkedin.com/in/sshdopey", color: "primary" },
            { text: "  Email     hi@sshdopey.com", color: "primary" },
          );
          break;
        case "date":
          out.push({ text: `  ${new Date().toString()}`, color: "muted" });
          break;
        case "uptime":
          out.push({ text: `  up ${Math.floor(Math.random() * 90 + 10)} days, shipping non-stop`, color: "muted" });
          break;
        case "neofetch":
          out.push(
            { text: "   ▄▀▀▀▀▀▀▀▄   dopey@sshdopey", color: "accent" },
            { text: "   █ ◉   ◉ █   ────────────────", color: "accent" },
            { text: "   █   ▽   █   OS: macOS Sequoia", color: "primary" },
            { text: "   ▀▄▄▄▄▄▄▄▀   Shell: zsh 5.9", color: "primary" },
            { text: "    ╱╱  ╲╲     Editor: neovim", color: "primary" },
            { text: "   ╱╱    ╲╲    Terminal: ghostty", color: "primary" },
            { text: "               WM: yabai + skhd", color: "primary" },
            { text: "               Coffee: ∞ cups", color: "muted" },
            { text: "               Uptime: shipping", color: "muted" },
            { text: "   ● ● ● ● ●   █ █ █ █ █", color: "accent" },
          );
          break;
        case "history":
          if (history.length === 0) {
            out.push({ text: "  (empty)", color: "ghost" });
          } else {
            history.forEach((h, i) => out.push({ text: `  ${i + 1}  ${h}`, color: "muted" }));
          }
          break;
        case "pacman":
        case "game":
        case "play": {
          addLines(out);
          setGameMode("game");
          return;
        }
        case "clear":
          setLines([]);
          return;
        case "exit":
          out.push({ text: "  nice try — you're stuck here forever 😏", color: "accent" });
          break;
        case "sudo":
          out.push({ text: "  dopey is not in the sudoers file.", color: "ghost" });
          break;
        case "rm":
          if (args.join(" ").includes("-rf")) {
            out.push({ text: "  absolutely not.", color: "accent" });
          } else {
            out.push({ text: "  rm: read-only filesystem", color: "ghost" });
          }
          break;
        case "vim": case "nvim": case "nano":
          out.push({ text: "  nice taste. use cat for now :)", color: "ghost" });
          break;
        case "git":
          out.push({ text: "  everything is committed. always shipping.", color: "accent" });
          break;
        case "npm": case "pnpm": case "yarn":
          out.push({ text: "  node_modules: 847MB. classic.", color: "ghost" });
          break;
        case "python": case "python3":
          out.push({ text: "  Python 3.12 — try cat on a .py file", color: "muted" });
          break;
        case "cargo": case "rustc":
          out.push({ text: "  🦀 Rust 1.82 — zero-cost abstractions", color: "accent" });
          break;
        case "cowsay": {
          const msg = args.join(" ") || "moo";
          const b = "─".repeat(msg.length + 2);
          out.push(
            { text: `  ┌${b}┐`, color: "muted" },
            { text: `  │ ${msg} │`, color: "primary" },
            { text: `  └${b}┘`, color: "muted" },
            { text: "       \\   ^__^", color: "ghost" },
            { text: "        \\  (oo)\\_______", color: "ghost" },
            { text: "           (__)\\       )", color: "ghost" },
            { text: "               ||----w |", color: "ghost" },
            { text: "               ||     ||", color: "ghost" },
          );
          break;
        }
        case "ping": {
          const host = args[0] || "fairmeld.com";
          out.push(
            { text: `  PING ${host}: 56 bytes`, color: "muted" },
            { text: "  64 bytes: ttl=64 time=0.042ms", color: "muted" },
            { text: "  1 transmitted, 1 received, 0% loss", color: "accent" },
          );
          break;
        }
        case "curl":
          out.push({ text: '  {"status":"ok","vibe":"immaculate"}', color: "accent" });
          break;
        case "": break;
        default:
          out.push(
            { text: `  zsh: command not found: ${cmd}`, color: "ghost" },
            { text: "  try 'help' — I promise it's worth it", color: "dim" },
          );
      }

      addLines(out);
    },
    [fs, cwd, prompt, addLines, history],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        const val = inputValue.trim();
        if (val) {
          setHistory((prev) => [...prev, val]);
          setHistoryIdx(-1);
        }
        execute(inputValue);
        setInputValue("");
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (history.length > 0) {
          const idx = historyIdx === -1 ? history.length - 1 : Math.max(0, historyIdx - 1);
          setHistoryIdx(idx);
          setInputValue(history[idx]);
        }
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (historyIdx >= 0) {
          const idx = historyIdx + 1;
          if (idx >= history.length) {
            setHistoryIdx(-1);
            setInputValue("");
          } else {
            setHistoryIdx(idx);
            setInputValue(history[idx]);
          }
        }
      } else if (e.key === "Tab") {
        e.preventDefault();
        const tokens = inputValue.split(/\s+/);
        const partial = tokens[tokens.length - 1];
        if (partial) {
          const dir = partial.includes("/") ? partial.substring(0, partial.lastIndexOf("/") + 1) : ".";
          const prefix = partial.includes("/") ? partial.substring(partial.lastIndexOf("/") + 1) : partial;
          const resolved = resolvePath(fs, cwd, dir);
          if (resolved?.node.type === "dir" && resolved.node.children) {
            const matches = Object.keys(resolved.node.children).filter((k) => k.startsWith(prefix));
            if (matches.length === 1) {
              const completion = dir === "." ? matches[0] : dir + matches[0];
              const isDir = resolved.node.children[matches[0]].type === "dir";
              tokens[tokens.length - 1] = completion + (isDir ? "/" : "");
              setInputValue(tokens.join(" "));
            }
          }
        }
      } else if (e.key === "l" && e.ctrlKey) {
        e.preventDefault();
        setLines([]);
      }
    },
    [inputValue, execute, history, historyIdx, fs, cwd],
  );

  const isMinimized = windowState === "minimized";
  const isMaximized = windowState === "maximized";
  const isClosed = windowState === "closed";

  const handleCloseClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowCloseConfirm(true);
  }, []);

  const handleCloseConfirm = useCallback(() => {
    setShowCloseConfirm(false);
    setWindowState("closed");
  }, []);

  const handleMinimizeClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setWindowState("minimized");
  }, []);

  const handleMaximizeClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setWindowState((s) => (s === "maximized" ? "normal" : "maximized"));
  }, []);

  const terminalContent = (
    <>
      <div
        data-cursor-grab={windowState === "normal" ? "" : undefined}
        className={`flex items-center justify-between px-4 py-2.5 border-b border-line-faint bg-surface/60 shrink-0 ${windowState === "normal" ? "cursor-grab active:cursor-grabbing" : "cursor-default"}`}
        onPointerDown={(e) => windowState === "normal" && dragControls.start(e)}
      >
        <div className="flex items-center gap-2 [&_button]:cursor-pointer">
          <button
            type="button"
            onClick={handleCloseClick}
            className="w-3 h-3 rounded-full bg-[#ff5f57] hover:bg-[#ff4a42] transition-colors cursor-pointer shrink-0"
            aria-label="Close terminal"
          />
          <button
            type="button"
            onClick={handleMinimizeClick}
            className="w-3 h-3 rounded-full bg-[#febc2e] hover:bg-[#f5b320] transition-colors cursor-pointer shrink-0"
            aria-label="Minimize"
          />
          <button
            type="button"
            onClick={handleMaximizeClick}
            className="w-3 h-3 rounded-full bg-[#28c840] hover:bg-[#20b836] transition-colors cursor-pointer shrink-0"
            aria-label={isMaximized ? "Restore" : "Maximize"}
          />
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-ghost font-mono pointer-events-none">
          <Terminal size={10} />
          dopey — zsh
        </div>
        {windowState === "normal" && (
          <Grip size={11} className="text-ghost/40 shrink-0" aria-hidden />
        )}
      </div>

      <div
        ref={scrollRef}
        data-cursor-grab={windowState === "normal" ? "" : undefined}
        className={`px-3.5 py-2.5 font-mono text-[13px] leading-[1.85] terminal-scroll flex-1 min-h-0 flex flex-col ${gameMode === "game" ? "overflow-hidden" : "overflow-y-auto"} ${windowState === "normal" ? "cursor-grab active:cursor-grabbing" : ""}`}
        style={
          isMaximized ? { height: "calc(100vh - 5rem)" } : undefined
        }
        onClick={() => gameMode === "none" && inputRef.current?.focus()}
      >
        {gameMode === "game" ? (
          <TerminalPacman
            onExit={(finalScore) => {
              setGameMode("none");
              addLines([
                { text: `  🕹️ Final score: ${finalScore}`, color: "accent" },
              ]);
              setTimeout(() => inputRef.current?.focus(), 50);
            }}
          />
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.85 }}
              transition={{ delay: 0.5 }}
              className="text-accent"
            >
              $ ssh dopey@sshdopey.com
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: ready ? 0.7 : 0 }}
              className="text-ghost"
            >
              Welcome. Type &apos;help&apos; to get started.
            </motion.div>
            <div className="h-2" />

            {lines.map((line, i) => (
              <div
                key={`l-${i}`}
                className={`${colorMap[line.color]} wrap-break-word ${!line.text ? "h-2" : ""}`}
              >
                {line.text}
              </div>
            ))}

            {bootDone && (
              <div className="relative flex items-center min-h-[1.85em]">
                <div className="flex items-center min-w-0 flex-1 pointer-events-none">
                  <span className="text-secondary shrink-0">{prompt()}&nbsp;</span>
                  <span className="text-primary truncate">{inputValue || "\u00a0"}</span>
                  <span className="terminal-cursor-block shrink-0" aria-hidden />
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="absolute inset-0 w-full bg-transparent border-none outline-none font-mono text-[13px] p-0 opacity-0 cursor-text caret-transparent placeholder:text-ghost"
                  style={{ caretColor: "transparent" }}
                  spellCheck={false}
                  autoComplete="off"
                  aria-label="Terminal input"
                />
              </div>
            )}
          </>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Close confirmation dialog */}
      <AnimatePresence>
        {showCloseConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowCloseConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="rounded-2xl border border-line bg-surface shadow-2xl p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-primary font-medium mb-4">Close terminal?</p>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCloseConfirm(false)}
                  className="px-4 py-2 rounded-lg text-muted hover:text-primary border border-line-faint cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCloseConfirm}
                  className="px-4 py-2 rounded-lg bg-accent text-inverse font-medium cursor-pointer hover:opacity-90"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dock: show when minimized or closed — click to restore / open */}
      <AnimatePresence>
        {(isMinimized || isClosed) && (
          <motion.button
            type="button"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            onClick={() => setWindowState("normal")}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl border border-line bg-surface/95 backdrop-blur-md shadow-xl shadow-black/30 hover:bg-surface-hover transition-colors cursor-pointer"
            aria-label={isClosed ? "Open terminal" : "Restore terminal"}
          >
            <Terminal size={18} className="text-accent" />
            <span className="text-sm font-medium text-primary">
              {isClosed ? "Terminal" : "dopey — zsh"}
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Terminal window: normal (inline, draggable, resizable) or maximized (fixed overlay) */}
      <AnimatePresence mode="wait">
        {!isClosed && !isMinimized && (
          <motion.div
            key={windowState}
            drag={!isMaximized}
            dragControls={dragControls}
            dragMomentum={false}
            dragElastic={0.08}
            initial={isMaximized ? false : { opacity: 0, x: 40, y: 10 }}
            animate={isMaximized ? {} : { opacity: 1, x: 0, y: 0 }}
            transition={
              isMaximized
                ? undefined
                : { delay: 0.3, duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }
            }
            whileDrag={
              !isMaximized
                ? { scale: 1.02, boxShadow: "0 30px 60px -12px rgba(0,0,0,0.4)" }
                : undefined
            }
            className={
              isMaximized
                ? "fixed inset-6 z-[90] flex flex-col select-none overflow-hidden rounded-2xl border border-line bg-surface/95 backdrop-blur-md shadow-2xl shadow-black/40 cursor-default"
                : "hidden lg:flex flex-col select-none overflow-hidden rounded-xl border border-line bg-surface/90 backdrop-blur-md shadow-2xl shadow-black/30 absolute -right-2 xl:-right-6 top-1/2 -translate-y-[48%] z-10 w-[420px] xl:w-[460px] h-[460px] xl:h-[500px]"
            }
          >
            <div
              className="flex flex-col h-full min-h-0 rounded-inherit overflow-hidden"
              style={{ borderRadius: "inherit" }}
              onClick={() => inputRef.current?.focus()}
            >
              {terminalContent}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </>
  );
}
