"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, useDragControls } from "framer-motion";
import { Terminal, Grip } from "lucide-react";

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
                          "# Fairmeld\n\nAn AI system everyone would trust.\n\nBuilt with Rust + Python.\nStatus: shipping fast 🚀",
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
                          "torch>=2.1.0\ntransformers>=4.35.0\nonnxruntime>=1.16.0\nnumpy>=1.24.0\nscikit-learn>=1.3.0",
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
                      "Host fairmeld\n  HostName fairmeld.com\n  User dopey\n  IdentityFile ~/.ssh/id_ed25519\n\nHost *\n  AddKeysToAgent yes\n  UseKeychain yes",
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
  if (target.startsWith("/")) {
    abs = target;
  } else if (target.startsWith("~")) {
    abs = "/home/dopey" + target.slice(1);
  } else {
    abs = cwd === "/" ? "/" + target : cwd + "/" + target;
  }

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

const bootLines: { text: string; delay: number; color: Color }[] = [
  { text: "$ ssh dopey@fairmeld.ai", delay: 0.4, color: "accent" },
  { text: "Connected.", delay: 0.7, color: "ghost" },
  { text: "", delay: 0.8, color: "ghost" },
  { text: "dopey ~> cargo build --release", delay: 1.0, color: "secondary" },
  { text: "   Compiling fairmeld v0.8.0", delay: 1.3, color: "muted" },
  { text: "    Finished release [optimized] in 0.8s", delay: 1.6, color: "accent" },
  { text: "", delay: 1.7, color: "ghost" },
  { text: "dopey ~> python train.py", delay: 1.9, color: "secondary" },
  { text: "  ✓ accuracy: 99.2%", delay: 2.2, color: "accent" },
  { text: "", delay: 2.3, color: "ghost" },
  { text: "dopey ~> status", delay: 2.5, color: "secondary" },
  { text: "  shipping something dope ▮", delay: 2.8, color: "dim" },
];

const HISTORY_KEY = "dopey-terminal-history";

export function HeroVisual() {
  const [fs] = useState(buildFS);
  const [cwd, setCwd] = useState("/home/dopey");
  const [lines, setLines] = useState<{ text: string; color: Color }[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();

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
            { text: "Available commands:", color: "muted" },
            { text: "  ls [path]       list directory", color: "ghost" },
            { text: "  cd <path>       change directory", color: "ghost" },
            { text: "  cat <file>      read file", color: "ghost" },
            { text: "  pwd             print working directory", color: "ghost" },
            { text: "  tree [path]     show directory tree", color: "ghost" },
            { text: "  echo <text>     print text", color: "ghost" },
            { text: "  whoami          who are you", color: "ghost" },
            { text: "  date            current date", color: "ghost" },
            { text: "  uptime          how long we've been up", color: "ghost" },
            { text: "  neofetch        system info", color: "ghost" },
            { text: "  history         command history", color: "ghost" },
            { text: "  clear           clear terminal", color: "ghost" },
          );
          break;
        }
        case "ls": {
          const target = args[0] || ".";
          const showHidden = args.includes("-a") || args.includes("-la") || args.includes("-al");
          const pathArg = args.find((a) => !a.startsWith("-")) || ".";
          const resolved = resolvePath(fs, cwd, pathArg);
          if (!resolved || resolved.node.type !== "dir") {
            out.push({ text: `ls: cannot access '${target}': No such directory`, color: "ghost" });
          } else {
            const items = listDir(resolved.node);
            const filtered = showHidden ? items : items.filter((i) => !i.startsWith("."));
            if (filtered.length === 0) {
              out.push({ text: "(empty)", color: "ghost" });
            } else {
              const line = filtered.join("  ");
              out.push({ text: `  ${line}`, color: "primary" });
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
            // no output on success
          }
          break;
        }
        case "cat": {
          const target = args[0];
          if (!target) {
            out.push({ text: "cat: missing file operand", color: "ghost" });
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
        case "pwd": {
          out.push({ text: `  ${cwd}`, color: "primary" });
          break;
        }
        case "tree": {
          const target = args[0] || ".";
          const resolved = resolvePath(fs, cwd, target);
          if (!resolved || resolved.node.type !== "dir") {
            out.push({ text: `tree: '${target}' not a directory`, color: "ghost" });
          } else {
            const name = resolved.path.split("/").pop() || "/";
            out.push({ text: `  ${name}/`, color: "accent" });
            const str = treeStr(resolved.node);
            for (const line of str.split("\n").filter(Boolean)) {
              out.push({ text: `  ${line}`, color: "muted" });
            }
          }
          break;
        }
        case "echo": {
          out.push({ text: `  ${args.join(" ")}`, color: "primary" });
          break;
        }
        case "whoami": {
          out.push(
            { text: "  Dopey — Software Engineer", color: "accent" },
            { text: "  Building AI systems & high-performance tools", color: "muted" },
            { text: '  Python for the models. Rust for everything else.', color: "muted" },
            { text: "  Currently shipping Fairmeld", color: "muted" },
          );
          break;
        }
        case "date": {
          out.push({ text: `  ${new Date().toString()}`, color: "muted" });
          break;
        }
        case "uptime": {
          out.push({
            text: `  up ${Math.floor(Math.random() * 90 + 10)} days, shipping non-stop`,
            color: "muted",
          });
          break;
        }
        case "neofetch": {
          out.push(
            { text: "           ▄▄▄       dopey@fairmeld", color: "accent" },
            { text: "          █████      ─────────────────", color: "accent" },
            { text: "         ███████     OS: macOS Sequoia", color: "primary" },
            { text: "        █████████    Shell: zsh 5.9", color: "primary" },
            { text: "       ███████████   Editor: neovim", color: "primary" },
            { text: "        █████████    Terminal: kitty", color: "primary" },
            { text: "         ███████     Languages: 🐍 🦀 📜", color: "primary" },
            { text: "          █████      Coffee: ∞ cups", color: "primary" },
            { text: "           ▀▀▀", color: "accent" },
          );
          break;
        }
        case "history": {
          history.forEach((h, i) => {
            out.push({ text: `  ${i + 1}  ${h}`, color: "muted" });
          });
          if (history.length === 0) out.push({ text: "  (no history yet)", color: "ghost" });
          break;
        }
        case "clear": {
          setLines([]);
          return;
        }
        case "exit": {
          out.push({ text: "  nice try — you're stuck here forever 😏", color: "accent" });
          break;
        }
        case "sudo": {
          out.push({ text: "  dopey is not in the sudoers file. nice try though.", color: "ghost" });
          break;
        }
        case "rm": {
          if (args.includes("-rf") && args.includes("/")) {
            out.push({ text: "  absolutely not. this is a family terminal.", color: "accent" });
          } else {
            out.push({ text: "  rm: operation not permitted (read-only fs)", color: "ghost" });
          }
          break;
        }
        case "vim":
        case "nvim":
        case "nano": {
          out.push({ text: "  opening editor... just kidding, use cat instead :)", color: "ghost" });
          break;
        }
        case "git": {
          out.push({ text: "  everything is committed. always shipping.", color: "accent" });
          break;
        }
        case "npm":
        case "pnpm":
        case "yarn": {
          out.push({ text: "  node_modules: 847MB. some things never change.", color: "ghost" });
          break;
        }
        case "python":
        case "python3": {
          out.push({ text: "  Python 3.12.0 — use cat to read .py files", color: "muted" });
          break;
        }
        case "cargo":
        case "rustc": {
          out.push({ text: "  🦀 Rust 1.82.0 — zero-cost abstractions loaded", color: "accent" });
          break;
        }
        case "cowsay": {
          const msg = args.join(" ") || "moo";
          const border = "─".repeat(msg.length + 2);
          out.push(
            { text: `  ┌${border}┐`, color: "muted" },
            { text: `  │ ${msg} │`, color: "primary" },
            { text: `  └${border}┘`, color: "muted" },
            { text: "         \\   ^__^", color: "ghost" },
            { text: "          \\  (oo)\\_______", color: "ghost" },
            { text: "             (__)\\       )", color: "ghost" },
            { text: "                 ||----w |", color: "ghost" },
            { text: "                 ||     ||", color: "ghost" },
          );
          break;
        }
        case "ping": {
          const host = args[0] || "fairmeld.com";
          out.push(
            { text: `  PING ${host}: 56 data bytes`, color: "muted" },
            { text: `  64 bytes: icmp_seq=0 ttl=64 time=0.042ms`, color: "muted" },
            { text: `  --- ${host} ping statistics ---`, color: "muted" },
            { text: `  1 packet transmitted, 1 received, 0% loss`, color: "accent" },
          );
          break;
        }
        case "curl": {
          out.push(
            { text: '  {"status":"ok","engineer":"dopey","vibe":"immaculate"}', color: "accent" },
          );
          break;
        }
        case "": break;
        default: {
          out.push({ text: `  zsh: command not found: ${cmd}`, color: "ghost" });
          out.push({ text: "  type 'help' for available commands", color: "ghost" });
        }
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
        const parts = inputValue.split(/\s+/);
        const partial = parts[parts.length - 1];
        if (partial) {
          const dir = partial.includes("/")
            ? partial.substring(0, partial.lastIndexOf("/") + 1)
            : ".";
          const prefix = partial.includes("/")
            ? partial.substring(partial.lastIndexOf("/") + 1)
            : partial;
          const resolved = resolvePath(fs, cwd, dir);
          if (resolved?.node.type === "dir" && resolved.node.children) {
            const matches = Object.keys(resolved.node.children).filter((k) =>
              k.startsWith(prefix),
            );
            if (matches.length === 1) {
              const completion = dir === "." ? matches[0] : dir + matches[0];
              const isDir = resolved.node.children[matches[0]].type === "dir";
              parts[parts.length - 1] = completion + (isDir ? "/" : "");
              setInputValue(parts.join(" "));
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

  const activate = useCallback(() => {
    if (!showInput) setShowInput(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [showInput]);

  return (
    <div className="hidden lg:block absolute -right-2 xl:-right-6 top-1/2 -translate-y-[48%] w-[420px] xl:w-[460px] select-none z-10">
      <motion.div
        drag
        dragControls={dragControls}
        dragMomentum={false}
        dragElastic={0.08}
        initial={{ opacity: 0, x: 40, y: 10 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        className="rounded-xl border border-line bg-surface/80 backdrop-blur-md overflow-hidden shadow-2xl shadow-black/25 cursor-grab active:cursor-grabbing"
        whileDrag={{
          scale: 1.02,
          boxShadow: "0 30px 60px -12px rgba(0,0,0,0.4)",
        }}
        onClick={activate}
      >
        <div
          className="flex items-center justify-between px-4 py-2 border-b border-line-faint bg-surface/50"
          onPointerDown={(e) => dragControls.start(e)}
        >
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-ghost font-mono">
            <Terminal size={10} />
            dopey — zsh
          </div>
          <Grip size={11} className="text-ghost/40" />
        </div>

        <div
          ref={scrollRef}
          className="px-3.5 py-2.5 font-mono text-[11px] leading-[1.85] h-[400px] xl:h-[440px] overflow-y-auto terminal-scroll"
          onClick={() => inputRef.current?.focus()}
        >
          {bootLines.map((line, i) => (
            <motion.div
              key={`boot-${i}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: line.text ? 0.85 : 0 }}
              transition={{ delay: line.delay, duration: 0.3 }}
              className={`${colorMap[line.color]} ${!line.text ? "h-2" : ""}`}
            >
              {line.text}
            </motion.div>
          ))}

          {lines.map((line, i) => (
            <div
              key={`line-${i}`}
              className={`${colorMap[line.color]} ${!line.text ? "h-2" : ""}`}
            >
              {line.text}
            </div>
          ))}

          {showInput && (
            <div className="flex items-center">
              <span className="text-secondary shrink-0">{prompt()}&nbsp;</span>
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent border-none outline-none text-primary font-mono text-[11px] p-0 caret-accent"
                spellCheck={false}
                autoComplete="off"
              />
            </div>
          )}

          {!showInput && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{ delay: 3.2 }}
              className="text-ghost mt-2 text-[10px]"
            >
              click anywhere to start · drag to move
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
