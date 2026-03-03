"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { Sparkles, ChevronsRight, Send } from "lucide-react";

interface SidebarContextType {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
}

const SidebarContext = createContext<SidebarContextType>({
  isOpen: false,
  toggle: () => {},
  close: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

export function ClientLayout({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <SidebarContext.Provider
      value={{
        isOpen,
        toggle: () => setIsOpen((v) => !v),
        close: () => setIsOpen(false),
      }}
    >
      <div className="relative">
        <div
          className="transition-[margin] duration-300 ease-in-out"
          style={{ marginRight: isOpen ? "380px" : "0" }}
        >
          {children}
        </div>

        <aside
          className={`fixed top-0 right-0 h-screen w-[380px] bg-page border-l border-line z-50 flex flex-col transition-transform duration-300 ease-in-out ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between px-5 h-14 border-b border-line-faint shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles size={15} className="text-accent" />
              <span className="text-sm font-semibold text-primary">Ask AI</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-muted hover:text-primary transition-colors p-1 cursor-pointer"
            >
              <ChevronsRight size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center mb-4">
              <Sparkles size={22} className="text-dim" />
            </div>
            <p className="text-sm text-secondary font-medium mb-1">
              Ask anything about Dopey&apos;s writing
            </p>
            <p className="text-xs text-muted mt-1">
              AI-powered search &amp; answers coming soon.
            </p>
          </div>

          <div className="px-5 py-4 border-t border-line-faint shrink-0">
            <div className="flex gap-2">
              <input
                placeholder="Ask a question..."
                className="flex-1 bg-surface border border-line-faint rounded-lg px-3 py-2.5 text-sm text-primary placeholder:text-ghost focus:outline-none focus:border-line"
                disabled
              />
              <button
                className="px-3 py-2.5 bg-accent text-inverse rounded-lg text-sm opacity-40 cursor-not-allowed"
                disabled
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </aside>
      </div>
    </SidebarContext.Provider>
  );
}
