import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useAnimate } from 'motion/react';
import { Bot, Send, X } from 'lucide-react';

interface ChatMessage {
  id: string;
  text: string;
}

interface SimpleRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Shared across both the collapsed trigger and the expanded panel so
// Framer Motion's layout-projection registry treats them as the same
// element mid-transition on CLOSE, where it works perfectly (the panel
// stays mounted and is continuously re-measured throughout its own tracked
// exit, so it smoothly shrinks toward the trigger's layoutId match).
const CHAT_ASSISTANT_LAYOUT_ID = 'chat-assistant-panel';

const SPRING_TRANSITION = { type: 'spring' as const, stiffness: 300, damping: 30 };

// An icon button that morphs into a centered, backdrop-blurred chat panel.
// UI shell only for now — sending a message appends it locally with no
// reply, since nothing is wired up to answer yet.
//
// Load-bearing details worth not re-deriving if this ever looks broken:
//
// 1. `AnimatePresence mode="popLayout"` on the TRIGGER's own wrapper — pops
//    it out of flow the instant it starts exiting, so the Columns button
//    beside it reflows immediately instead of waiting on the exit animation.
//
// 2. `layoutRoot` on the panel — required because it lives inside a
//    `position: fixed` portal (rendered into document.body, matching
//    ModalSharedComponent's own convention — needed since the header's own
//    `sm:backdrop-blur-md` creates a new containing block for `fixed`
//    descendants, which would otherwise confine an un-portaled modal to the
//    header's own small box instead of the full viewport).
//
// 3. The OPEN direction is a MANUAL flip (useAnimate + useLayoutEffect),
//    not automatic layoutId projection, even though layoutId is still
//    present on the panel (harmless; it just does nothing useful on
//    mount). Three separate structural attempts at making layoutId bridge
//    this automatically all failed, confirmed empirically each time, not
//    guessed:
//      a. Giving the trigger its own `exit` + matching `transition` (so
//         AnimatePresence would hold it in a tracked exit phase) — no
//         change; the panel still popped straight to full size.
//      b. Wrapping both sides in `LayoutGroup` to bridge the two separate
//         AnimatePresence instances (trigger's, in the normal tree; panel's,
//         in the portaled tree) — no change either.
//      c. Restructuring into ONE AnimatePresence with both states as
//         branches of a single ternary, matching Motion's own documented
//         canonical recipe exactly — this didn't just fail to animate, it
//         silently rendered NOTHING at all: AnimatePresence does not seem
//         to correctly track a `createPortal(...)` result as a direct
//         conditional child, even though createPortal is itself a valid
//         React node anywhere else in a tree.
//    This matches a known class of bugs (framer/motion GitHub issue #1524,
//    "Shared layout animations not working when rendered in React portal")
//    — portal + layoutId projection is documented as a fragile combination,
//    not something this component was misusing. The manual flip sidesteps
//    the whole question: it measures the trigger's real screen position
//    once (cached, since the toolbar slot never moves while closed) and
//    animates the panel's own transform from that measured rect to neutral
//    imperatively, using the exact same spring as the close direction — so
//    both directions are actually symmetric by construction, not by hoping
//    an automatic mechanism bridges a portal boundary it apparently can't.
//
// 4. The floating input bar lives back inside the panel's own clipped box
//    (a normal flex-col child, with its own padding/margin and shadow, no
//    border divider above it) rather than outside/overlapping it — an
//    earlier round tried detaching it entirely past the panel's bottom
//    edge, which read badly once seen live, so it moved back in.
export default function ChatAssistantSharedComponent(): React.JSX.Element {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [draftMessage, setDraftMessage] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const triggerButtonRef = useRef<HTMLButtonElement | null>(null);
  const triggerRectRef = useRef<SimpleRect | null>(null);
  const [panelScope, animatePanel] = useAnimate();

  // The trigger's slot in the toolbar is stable while the modal is closed,
  // so its rect only needs refreshing on resize — not on every open.
  useEffect(() => {
    const measureTriggerRect = (): void => {
      if (!triggerButtonRef.current) return;
      const rect = triggerButtonRef.current.getBoundingClientRect();
      triggerRectRef.current = { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    };
    measureTriggerRect();
    window.addEventListener('resize', measureTriggerRect);
    return () => window.removeEventListener('resize', measureTriggerRect);
  }, []);

  // Manual flip on mount: seed the panel's transform to visually match the
  // trigger's last measured rect, then animate to neutral — synchronously
  // before paint (useLayoutEffect, not useEffect) so there's no one-frame
  // flash at full size first.
  useLayoutEffect(() => {
    if (!isOpen) return;
    const panelEl = panelScope.current;
    const origin = triggerRectRef.current;
    if (!panelEl || !origin) return;

    const finalRect = panelEl.getBoundingClientRect();
    const scaleX = origin.width / finalRect.width;
    const scaleY = origin.height / finalRect.height;
    const originCenterX = origin.x + origin.width / 2;
    const originCenterY = origin.y + origin.height / 2;
    const finalCenterX = finalRect.x + finalRect.width / 2;
    const finalCenterY = finalRect.y + finalRect.height / 2;

    animatePanel(
      panelEl,
      {
        x: [originCenterX - finalCenterX, 0],
        y: [originCenterY - finalCenterY, 0],
        scaleX: [scaleX, 1],
        scaleY: [scaleY, 1],
      },
      SPRING_TRANSITION
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = 'hidden';
    const focusTimer = setTimeout(() => inputRef.current?.focus(), 200);

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        // Same focus-return convention as the X button and backdrop click.
        setTimeout(() => triggerButtonRef.current?.focus(), 0);
      }
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
            exit={{ opacity: 0 }}
            transition={SPRING_TRANSITION}
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

      {createPortal(
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
                  ref={panelScope}
                  layoutId={CHAT_ASSISTANT_LAYOUT_ID}
                  layoutRoot
                  role="dialog"
                  aria-modal="true"
                  aria-label="Assistant"
                  transition={SPRING_TRANSITION}
                  className="pointer-events-auto relative w-full max-w-4xl h-[min(800px,90dvh)] bg-white dark:bg-[#0c0c0e] hairline-border-strong rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                >
                  {/* Floating close button — overlaid on scrolling message content */}
                  <button
                    type="button"
                    onClick={handleClose}
                    aria-label="Close Assistant"
                    className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white dark:bg-[#0c0c0e] shadow-md text-slate-400 hover:text-slate-700 dark:text-zinc-500 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto px-6 pt-14 pb-2 space-y-3">
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

                  {/* Floating input bar — inset within the panel, margin on
                      all sides, no border divider above it (just the gap
                      plus its own shadow read as "floating over" the
                      messages, rather than a docked footer). */}
                  <div className="shrink-0 px-6 pb-6 pt-2">
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-full bg-white dark:bg-[#0c0c0e] hairline-border-strong shadow-lg">
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
                        className="flex-1 h-10 px-3.5 rounded-full bg-transparent text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0C2086] dark:focus-visible:ring-blue-400"
                      />
                      <button
                        type="button"
                        onClick={handleSend}
                        disabled={!draftMessage.trim()}
                        aria-label="Send message"
                        className="h-10 w-10 shrink-0 rounded-full bg-[#0C2086] text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:bg-[#081765] transition-colors"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
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
