import { Github, Linkedin, Mail, Send } from "lucide-react";

const socials = [
  { name: "GitHub", href: "https://github.com/sshdopey", icon: <Github size={16} /> },
  {
    name: "X",
    href: "https://x.com/sshdopey",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  { name: "LinkedIn", href: "https://linkedin.com/in/sshdopey", icon: <Linkedin size={16} /> },
  { name: "Telegram", href: "https://t.me/sshdopey", icon: <Send size={16} /> },
  { name: "Email", href: "mailto:hello@sshdopey.com", icon: <Mail size={16} /> },
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
        {socials.map((s) => (
          <a
            key={s.name}
            href={s.href}
            target={s.href.startsWith("mailto:") ? undefined : "_blank"}
            rel={s.href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
            className="group flex items-center gap-2.5 px-4 py-2.5 rounded-lg border border-line hover:border-accent/40 bg-surface/60 hover:bg-surface-hover text-sm text-secondary hover:text-primary transition-all"
          >
            <span className="text-muted group-hover:text-accent transition-colors">
              {s.icon}
            </span>
            <span>{s.name}</span>
          </a>
        ))}
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className={`flex items-center gap-4 ${className}`}>
        {socials.map((s) => (
          <a
            key={s.name}
            href={s.href}
            target={s.href.startsWith("mailto:") ? undefined : "_blank"}
            rel={s.href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
            className="text-sm text-secondary hover:text-accent transition-colors"
          >
            {s.name}
          </a>
        ))}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-5 ${className}`}>
      {socials.map((s) => (
        <a
          key={s.name}
          href={s.href}
          target={s.href.startsWith("mailto:") ? undefined : "_blank"}
          rel={s.href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
          className="text-secondary hover:text-accent transition-colors"
          title={s.name}
        >
          {s.icon}
        </a>
      ))}
    </div>
  );
}
