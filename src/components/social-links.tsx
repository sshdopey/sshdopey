"use client";

import { motion } from "framer-motion";
import { Github, Linkedin, Mail, Send, Youtube } from "lucide-react";

const socials = [
  {
    name: "GitHub",
    href: "https://github.com/sshdopey",
    icon: <Github size={16} />,
  },
  {
    name: "X",
    href: "https://x.com/sshdopey",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    name: "YouTube",
    href: "https://youtube.com/@sshdopey",
    icon: <Youtube size={16} />,
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com/in/sshdopey",
    icon: <Linkedin size={16} />,
  },
  { name: "Telegram", href: "https://t.me/sshdopey", icon: <Send size={16} /> },
  {
    name: "Email",
    href: "mailto:hello@sshdopey.com",
    icon: <Mail size={16} />,
  },
];

export function SocialLinks({
  className = "",
  variant = "default",
}: {
  className?: string;
  variant?: "default" | "hero" | "inline";
}) {
  if (variant === "hero") {
    return (
      <div className={`flex flex-wrap gap-2.5 ${className}`}>
        {socials.map((s, i) => (
          <motion.a
            key={s.name}
            href={s.href}
            target={s.href.startsWith("mailto:") ? undefined : "_blank"}
            rel={
              s.href.startsWith("mailto:") ? undefined : "noopener noreferrer"
            }
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: i * 0.05,
              type: "spring",
              stiffness: 200,
              damping: 18,
            }}
            whileHover={{ y: -2, scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="group flex items-center gap-2 sm:gap-2.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-line hover:border-accent/40 bg-surface/60 hover:bg-surface-hover text-xs sm:text-sm text-secondary hover:text-accent transition-all"
          >
            <span className="transition-colors group-hover:text-accent">
              {s.icon}
            </span>
            <span>{s.name}</span>
          </motion.a>
        ))}
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div
        className={`flex flex-wrap items-center justify-center gap-3 sm:gap-4 ${className}`}
      >
        {socials.map((s) => (
          <motion.a
            key={s.name}
            href={s.href}
            target={s.href.startsWith("mailto:") ? undefined : "_blank"}
            rel={
              s.href.startsWith("mailto:") ? undefined : "noopener noreferrer"
            }
            whileHover={{ y: -1 }}
            className="text-xs sm:text-sm text-secondary hover:text-accent transition-colors"
          >
            {s.name}
          </motion.a>
        ))}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-5 ${className}`}>
      {socials.map((s) => (
        <motion.a
          key={s.name}
          href={s.href}
          target={s.href.startsWith("mailto:") ? undefined : "_blank"}
          rel={s.href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
          whileHover={{ y: -2, scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="text-secondary hover:text-accent transition-colors"
          aria-label={s.name}
        >
          {s.icon}
        </motion.a>
      ))}
    </div>
  );
}
