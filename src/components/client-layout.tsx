"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

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
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2z" />
                <path d="M18 14l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z" />
              </svg>
              <span className="text-sm font-semibold text-primary">Ask AI</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-muted hover:text-primary transition-colors p-1 cursor-pointer"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center mb-4">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-dim"
              >
                <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2z" />
                <path d="M18 14l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z" />
              </svg>
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
                className="px-3 py-2.5 bg-primary text-inverse rounded-lg text-sm opacity-40 cursor-not-allowed"
                disabled
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4z" />
                </svg>
              </button>
            </div>
          </div>
        </aside>
      </div>
    </SidebarContext.Provider>
  );
}
