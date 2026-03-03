"use client";

import { useState, useRef, useCallback } from "react";
import { motion, useDragControls } from "framer-motion";
import { Terminal, Grip } from "lucide-react";

type Color = "accent" | "muted" | "ghost" | "secondary" | "dim" | "primary";

interface Line {
  text: string;
  delay: number;
  color: Color;
  typing?: boolean;
}

const colorMap: Record<Color, string> = {
  accent: "text-accent",
  muted: "text-muted",
  ghost: "text-ghost",
  secondary: "text-secondary",
  dim: "text-dim",
  primary: "text-primary",
};

const initialLines: Line[] = [
  { text: "$ ssh dopey@fairmeld.ai", delay: 0.5, color: "accent" },
  { text: "Connected to fairmeld.ai", delay: 0.9, color: "ghost" },
  { text: "", delay: 1.0, color: "ghost" },
  { text: "dopey ~> python models.train(data)", delay: 1.2, color: "secondary" },
  { text: "  ✓ loss: 0.0012  accuracy: 99.2%", delay: 1.6, color: "accent" },
  { text: "  ✓ model saved → /weights/v3.2.bin", delay: 1.9, color: "accent" },
  { text: "", delay: 2.0, color: "ghost" },
  { text: "dopey ~> cargo build --release", delay: 2.2, color: "secondary" },
  { text: "   Compiling fairmeld v0.8.0", delay: 2.5, color: "muted" },
  { text: "   Compiling engine v3.2.0", delay: 2.7, color: "muted" },
  { text: "    Finished release [optimized] in 0.8s", delay: 3.0, color: "accent" },
  { text: "", delay: 3.1, color: "ghost" },
  { text: "dopey ~> ./deploy --prod", delay: 3.3, color: "secondary" },
  { text: "  → deploying to 3 regions...", delay: 3.6, color: "muted" },
  { text: "  ✓ us-east: healthy", delay: 3.9, color: "accent" },
  { text: "  ✓ eu-west: healthy", delay: 4.1, color: "accent" },
  { text: "  ✓ ap-south: healthy", delay: 4.3, color: "accent" },
  { text: "", delay: 4.4, color: "ghost" },
  { text: "dopey ~> status", delay: 4.6, color: "secondary" },
  { text: "  shipping something dope ▮", delay: 4.9, color: "dim" },
];

const commands: Record<string, string[]> = {
  help: [
    "Available commands:",
    "  help     — show this message",
    "  whoami   — about Dopey",
    "  stack    — current tech stack",
    "  clear    — clear terminal",
    "  ping     — check status",
  ],
  whoami: [
    "Dopey — Software Engineer",
    "Building AI systems & high-performance tools",
    "Python for the models. Rust for everything else.",
    'Currently shipping Fairmeld — "an AI system everyone would trust"',
  ],
  stack: [
    "Languages:  Python, Rust, TypeScript",
    "AI/ML:      PyTorch, Transformers, ONNX",
    "Infra:      Docker, SQLite, Cloudflare",
    "Frontend:   Next.js, Tailwind, Framer Motion",
    "Editor:     Neovim + tmux (obviously)",
  ],
  ping: [
    "PING dopey.dev (127.0.0.1): 56 data bytes",
    "64 bytes: icmp_seq=0 ttl=64 time=0.042ms",
    "--- dopey.dev ping statistics ---",
    "1 packet transmitted, 1 received, 0% loss",
    "status: extremely online ✓",
  ],
};

export function HeroVisual() {
  const [userLines, setUserLines] = useState<{ text: string; color: Color }[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [showInput, setShowInput] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();

  const handleCommand = useCallback((cmd: string) => {
    const trimmed = cmd.trim().toLowerCase();
    const newLines: { text: string; color: Color }[] = [
      { text: `dopey ~> ${cmd}`, color: "secondary" },
    ];

    if (trimmed === "clear") {
      setUserLines([]);
      return;
    }

    const output = commands[trimmed];
    if (output) {
      for (const line of output) {
        newLines.push({ text: `  ${line}`, color: trimmed === "ping" && line.includes("✓") ? "accent" : "muted" });
      }
    } else if (trimmed) {
      newLines.push({ text: `  command not found: ${trimmed}`, color: "ghost" });
      newLines.push({ text: "  type 'help' for available commands", color: "ghost" });
    }

    setUserLines((prev) => [...prev, ...newLines]);
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, 50);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && inputValue.trim()) {
        handleCommand(inputValue);
        setInputValue("");
      }
    },
    [inputValue, handleCommand],
  );

  return (
    <div className="hidden lg:block absolute right-0 xl:-right-4 top-1/2 -translate-y-[45%] w-[400px] xl:w-[440px] select-none z-10">
      <motion.div
        drag
        dragControls={dragControls}
        dragMomentum={false}
        dragElastic={0.1}
        initial={{ opacity: 0, x: 30, y: 10 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        className="rounded-xl border border-line bg-surface/70 backdrop-blur-md overflow-hidden shadow-2xl shadow-black/20 cursor-grab active:cursor-grabbing"
        whileDrag={{ scale: 1.02, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.35)" }}
        onClick={() => {
          if (!showInput) setShowInput(true);
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
      >
        <div
          className="flex items-center justify-between px-4 py-2 border-b border-line-faint"
          onPointerDown={(e) => dragControls.start(e)}
        >
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-ghost font-mono">
            <Terminal size={11} />
            dopey — zsh
          </div>
          <Grip size={12} className="text-ghost/50" />
        </div>

        <div
          ref={scrollRef}
          className="px-4 py-3 font-mono text-[11px] leading-[1.9] h-[340px] xl:h-[380px] overflow-y-auto"
        >
          {initialLines.map((line, i) => (
            <motion.div
              key={`init-${i}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: line.text ? 0.85 : 0 }}
              transition={{ delay: line.delay, duration: 0.3 }}
              className={`${colorMap[line.color]} ${!line.text ? "h-2.5" : ""}`}
            >
              {line.text}
            </motion.div>
          ))}

          {userLines.map((line, i) => (
            <div
              key={`user-${i}`}
              className={`${colorMap[line.color]} ${!line.text ? "h-2.5" : ""}`}
            >
              {line.text}
            </div>
          ))}

          {showInput && (
            <div className="flex items-center gap-0">
              <span className="text-secondary shrink-0">dopey ~&gt;&nbsp;</span>
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
              animate={{ opacity: 0.5 }}
              transition={{ delay: 5.2 }}
              className="text-ghost mt-1 text-[10px]"
            >
              click to interact · drag to move
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
