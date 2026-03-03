"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { Sparkles, ChevronsRight, ChevronsDown, Send } from "lucide-react";

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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (isOpen && isMobile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen, isMobile]);

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
          style={{ marginRight: isOpen && !isMobile ? "380px" : "0" }}
        >
          {children}
        </div>

        {isOpen && isMobile && (
          <div
            className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
        )}

        <aside
          className={`fixed z-50 bg-page border-line flex flex-col transition-transform duration-300 ease-in-out ${
            isMobile
              ? `inset-x-0 bottom-0 h-[75vh] rounded-t-2xl border-t ${
                  isOpen ? "translate-y-0" : "translate-y-full"
                }`
              : `top-0 right-0 h-screen w-[380px] border-l ${
                  isOpen ? "translate-x-0" : "translate-x-full"
                }`
          }`}
        >
          {isMobile && (
            <div className="flex justify-center py-2">
              <div className="w-10 h-1 rounded-full bg-line" />
            </div>
          )}

          <div className={`flex items-center justify-between px-5 h-14 border-b border-line-faint shrink-0 ${isMobile ? "h-12" : ""}`}>
            <div className="flex items-center gap-2">
              <Sparkles size={15} className="text-accent" />
              <span className="text-sm font-semibold text-primary">Ask AI</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-muted hover:text-primary transition-colors p-1 cursor-pointer"
            >
              {isMobile ? <ChevronsDown size={18} /> : <ChevronsRight size={18} />}
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
