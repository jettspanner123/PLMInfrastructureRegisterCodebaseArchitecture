import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, Send, X } from 'lucide-react';

interface ChatMessage {
  id: string;
  text: string;
}

// Shared across both the collapsed trigger and the expanded panel below so
// Framer Motion's layout-projection registry treats them as the same
// element mid-transition (its "shared element transition" recipe) — never
// both rendered at once, so there's nothing to crossfade, only morph.
const CHAT_ASSISTANT_LAYOUT_ID = 'chat-assistant-panel';

// An icon button that morphs (via Framer Motion's layoutId shared-layout
// animation, not a plain fade/scale) into a centered, backdrop-blurred chat
// panel. UI shell only for now — sending a message appends it locally with
// no reply, since nothing is wired up to answer yet.
//
// Two load-bearing details worth not re-deriving if this ever looks broken:
// 1. `AnimatePresence mode="popLayout"` on the TRIGGER's own wrapper — pops
//    it out of flow the instant it starts exiting, so the Columns button
//    beside it reflows immediately instead of waiting on the exit animation
//    (the default `mode="sync"` reserves that space and visibly jumps).
// 2. `layoutRoot` on the panel — required because it lives inside a
//    `position: fixed` portal (rendered into document.body, matching
//    ModalSharedComponent's own portal convention): without it, Motion's
//    projection math gets confused by page scroll offset and the morph
//    jitters instead of landing cleanly.
export default function ChatAssistantSharedComponent(): React.JSX.Element {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [draftMessage, setDraftMessage] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const triggerButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = 'hidden';
    // Focused after the morph has had a moment to start settling, rather
    // than the instant it mounts, so the panel doesn't visually "snap" from
    // an autofocus-triggered scroll-into-view mid-animation.
    const focusTimer = setTimeout(() => inputRef.current?.focus(), 200);

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleClose = (): void => {
    setIsOpen(false);
    // Return focus to the trigger — same disclosure-pattern convention used
    // elsewhere in this app (e.g. the Columns dropdown).
    setTimeout(() => triggerButtonRef.current?.focus(), 0);
  };

  const handleSend = (): void => {
    const trimmed = draftMessage.trim();
    if (!trimmed) return;
    setMessages((previous) => [...previous, { id: crypto.randomUUID(), text: trimmed }]);
    setDraftMessage('');
  };

  return (
    <React.Fragment>
      <AnimatePresence mode="popLayout">
        {!isOpen && (
          <motion.button
            key="chat-assistant-trigger"
            ref={triggerButtonRef}
            layoutId={CHAT_ASSISTANT_LAYOUT_ID}
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label="Open Assistant"
            aria-haspopup="dialog"
            className="relative h-9 w-9 rounded-lg bg-slate-100 dark:bg-zinc-800/80 hairline-border flex items-center justify-center text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700/80 transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0C2086] dark:focus-visible:ring-blue-400"
          >
            <Bot className="w-3.5 h-3.5" />
          </motion.button>
        )}
      </AnimatePresence>

      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <React.Fragment>
                <motion.div
                  key="chat-assistant-backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  onClick={handleClose}
                  className="fixed inset-0 z-[60] bg-slate-900/60 dark:bg-black/60 backdrop-blur-sm cursor-pointer"
                />

                <div className="fixed inset-0 z-[61] flex items-center justify-center p-4 pointer-events-none">
                  <motion.div
                    key="chat-assistant-panel"
                    layoutId={CHAT_ASSISTANT_LAYOUT_ID}
                    layoutRoot
                    role="dialog"
                    aria-modal="true"
                    aria-label="Assistant"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="pointer-events-auto w-full max-w-lg h-[min(640px,85dvh)] bg-white dark:bg-[#0c0c0e] hairline-border-strong rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-200 dark:border-zinc-800/80 shrink-0">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-[#0C2086] text-white flex items-center justify-center shrink-0">
                          <Bot className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h2 className="text-sm font-bold text-slate-900 dark:text-white font-serif-headline leading-tight truncate">
                            Assistant
                          </h2>
                          <p className="text-[11px] text-slate-400 dark:text-zinc-500 leading-tight">Not connected yet</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleClose}
                        aria-label="Close Assistant"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:text-zinc-500 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                      {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center gap-2 text-slate-400 dark:text-zinc-500">
                          <Bot className="w-8 h-8" />
                          <p className="text-xs max-w-[220px]">
                            Ask me anything — I'm just a UI shell for now, not wired up to anything yet.
                          </p>
                        </div>
                      ) : (
                        messages.map((message) => (
                          <div key={message.id} className="flex justify-end">
                            <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-[#0C2086] text-white text-xs px-3.5 py-2.5 break-words">
                              {message.text}
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Input */}
                    <div className="flex items-center gap-2 px-4 py-3 border-t border-slate-200 dark:border-zinc-800/80 shrink-0">
                      <input
                        ref={inputRef}
                        type="text"
                        name="chatAssistantMessage"
                        value={draftMessage}
                        onChange={(event) => setDraftMessage(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') handleSend();
                        }}
                        placeholder="Message the assistant…"
                        className="flex-1 h-10 px-3.5 rounded-xl bg-slate-100 dark:bg-zinc-800/80 text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#0C2086] dark:focus:ring-blue-400"
                      />
                      <button
                        type="button"
                        onClick={handleSend}
                        disabled={!draftMessage.trim()}
                        aria-label="Send message"
                        className="h-10 w-10 shrink-0 rounded-xl bg-[#0C2086] text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:bg-[#081765] transition-colors"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                </div>
              </React.Fragment>
            )}
          </AnimatePresence>,
          document.body
        )}
    </React.Fragment>
  );
}
