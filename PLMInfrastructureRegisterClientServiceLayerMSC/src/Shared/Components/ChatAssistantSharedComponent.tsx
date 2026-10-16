import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useAnimate } from 'motion/react';
import { Bot, Send, X, Trash2, RotateCcw, Loader2, Maximize2, Minimize2, Plus } from 'lucide-react';
import TanstackQueryClientService from '../../Services/TanstackQueryClientService';
import AnonymousClientIdentityUtility from '../../Utilities/AnonymousClientIdentityUtility';
import MarkdownMessageSharedComponent from './MarkdownMessageSharedComponent';
import { containsMarkdownTable } from '../../Utilities/MarkdownTableDetectionUtility';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'error';
  text: string;
  timestamp?: string;
  originalQuestion?: string;
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

// The iMessage send morph's own spring - a touch snappier than the panel's
// own open/close feel, matching the real thing's quick "flick" rather than
// a slow glide.
const SEND_MORPH_SPRING = { type: 'spring' as const, stiffness: 380, damping: 32 };

const MAX_TEXTAREA_HEIGHT_PX = 120;

export default function ChatAssistantSharedComponent(): React.JSX.Element {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  // Deliberately NOT reset on close - only ever reset back to false at the
  // moment the trigger button opens a fresh panel (see its own onClick).
  // That's what lets the close/exit animation shrink smoothly from
  // whatever size the panel actually was (fullscreen included) toward the
  // trigger, via the exact same layoutId mechanism already handling the
  // normal-size close - nothing has to special-case "closing from
  // fullscreen" when isFullscreen simply never changes mid-exit.
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [draftMessage, setDraftMessage] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  // Null until either the first message in a fresh chat gets one back from
  // the backend, or a past conversation is resumed from the sidebar -
  // deliberately NOT reset on close, same reasoning as isFullscreen/messages
  // themselves (see their own comments): closing and reopening the panel
  // picks back up exactly where it left off within the same page load.
  const [conversationId, setConversationId] = useState<string | null>(null);
  // Stable per browser tab, same per-browser placeholder identity Status
  // change attribution already uses elsewhere in this app (no real auth
  // system exists yet) - computed once via useState's lazy initializer, not
  // on every render.
  const [clientId] = useState<string>(() => AnonymousClientIdentityUtility.current.getOrCreateClientId());
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const triggerButtonRef = useRef<HTMLButtonElement | null>(null);
  const triggerRectRef = useRef<SimpleRect | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [panelScope, animatePanel] = useAnimate();

  // The one user message currently mid-morph, if any - everything about the
  // "iMessage send" effect hangs off this single piece of state:
  // - 'at-input': a ghost clone is overlaid on the now-emptied input, still
  //   shaped/colored like the input itself (not yet in `messages`).
  // - 'in-list': the real entry now exists in `messages`, and THIS message's
  //   row (found by id, in the map below) renders the same layoutId'd
  //   element instead of the normal static bubble, so Framer bridges the
  //   jump from the input's position/shape to the list's with one smooth
  //   FLIP - including backgroundColor/borderRadius, since those are plain
  //   inline style values on the SAME motion.div across both phases, not
  //   Tailwind classes swapped out from under it.
  // Clearing this (onLayoutAnimationComplete) hands the row back to the
  // normal map-rendered static bubble, which is what actually owns the
  // tail-nub `rounded-br-sm` corner - an imperceptible last-frame swap.
  const [flyingMessage, setFlyingMessage] = useState<{ id: string; text: string } | null>(null);
  const [ghostPhase, setGhostPhase] = useState<'at-input' | 'in-list'>('at-input');

  // The input bar now floats (position: absolute) over the message list
  // rather than sitting in it as a normal flex-column footer - so messages
  // can be seen scrolling underneath its transparent surrounding padding,
  // not just stopping at a solid edge. That means the message list's own
  // bottom padding has to be kept in sync with however tall the floating
  // bar currently is (it grows with the textarea), or the newest message
  // would end up hidden behind it - a ResizeObserver, same pattern already
  // used elsewhere in this app for syncing dynamic measurements (see
  // DataTableContainerSharedComponent's column-width sync).
  const inputBarRef = useRef<HTMLDivElement | null>(null);
  const [inputBarHeight, setInputBarHeight] = useState<number>(0);

  useEffect(() => {
    if (!isOpen) return;
    const el = inputBarRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setInputBarHeight(entry.contentRect.height);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [isOpen]);

  const askQuestionMutation = TanstackQueryClientService.current.chatAssistant.useAskQuestionMutation();

  // Only fetched while the sidebar could actually be showing it - no point
  // asking the backend for this list every time the assistant is just open
  // in its normal (non-Fullscreen) size.
  const conversationsQuery = TanstackQueryClientService.current.chatAssistant.useConversationsQuery(
    clientId,
    isFullscreen
  );

  const loadConversationMessagesMutation =
    TanstackQueryClientService.current.chatAssistant.useLoadConversationMessagesMutation();

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth'): void => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom('smooth');
    }
  }, [messages, askQuestionMutation.isPending, isOpen]);

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

  // Deliberately NOT a Framer animation. This node carries `layoutId` +
  // `layoutRoot` for the open/close shared-element swap with the trigger
  // button, and - confirmed by direct testing - that setup silently
  // swallows every imperative `animate()` call aimed at this same node
  // (tried both a transform/position FLIP and a trivial opacity tween;
  // neither ever interpolated, snapping straight to the end value). Rather
  // than fight whatever is suppressing those, the resize itself is handled
  // by a plain CSS transition on the panel's own width/height/border-radius
  // (see its className below) - fully browser-native, and orthogonal to
  // Framer's own transform-based FLIP (which only ever touches `transform`,
  // never box width/height), so the two can never collide.
  const handleToggleFullscreen = (): void => {
    setIsFullscreen((previous) => !previous);
  };

  const resetTextareaHeight = (): void => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
  };

  const handleDraftChange = (value: string): void => {
    setDraftMessage(value);
    // Auto-grow, capped - the raw DOM textarea already reflects this
    // keystroke's new value by the time this handler runs (the native
    // input event fires before React's own re-render), so measuring
    // scrollHeight here needs no extra frame to be accurate.
    const textarea = inputRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, MAX_TEXTAREA_HEIGHT_PX)}px`;
  };

  const sendMessage = (questionText: string): void => {
    const trimmed = questionText.trim();
    if (!trimmed || askQuestionMutation.isPending) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // The real input clears and is immediately usable for the next message
    // - nothing about typing again waits on the ghost's own flight below,
    // which is a purely visual clone with no bearing on input state.
    setDraftMessage('');
    resetTextareaHeight();

    setGhostPhase('at-input');
    setFlyingMessage({ id: userMessage.id, text: trimmed });

    // One rAF guarantees the ghost's "at-input" shape/position is actually
    // painted and measured by Framer's layout-projection system before it
    // flips to the list - without this gap, React would likely batch both
    // state updates into a single commit and Framer would never see an
    // "at-input" frame to FLIP from, so the bubble would just appear with
    // no animation at all.
    requestAnimationFrame(() => {
      setMessages((previous) => [...previous, userMessage]);
      setGhostPhase('in-list');
    });

    askQuestionMutation.mutate(
      { question: trimmed, conversationId: conversationId ?? undefined, clientId },
      {
        onSuccess: (data) => {
          // Always set, whether this was the conversation we were already
          // in (no-op - same id back) or a brand new one the backend just
          // created because conversationId was omitted on a fresh chat's
          // first message.
          setConversationId(data.conversationId);
          setMessages((previous) => [
            ...previous,
            {
              id: crypto.randomUUID(),
              sender: 'assistant',
              text: data.answer,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
        },
        onError: (error: Error) => {
          setMessages((previous) => [
            ...previous,
            {
              id: crypto.randomUUID(),
              sender: 'error',
              text: error.message || 'Failed to get an answer. Please try again.',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              originalQuestion: trimmed,
            },
          ]);
        },
      }
    );
  };

  const handleSend = (): void => {
    sendMessage(draftMessage);
  };

  const handleRetry = (question: string): void => {
    sendMessage(question);
  };

  // "Clear chat history" now also forgets which conversation was open -
  // the conversation itself isn't deleted (no delete endpoint exists, by
  // design - see the chat memory design doc), it just stops being the
  // active one locally, identical to starting a brand new conversation.
  const handleClearChat = (): void => {
    setMessages([]);
    setConversationId(null);
  };

  const handleSelectConversation = (id: string): void => {
    if (id === conversationId || loadConversationMessagesMutation.isPending) return;

    loadConversationMessagesMutation.mutate(id, {
      onSuccess: (loadedMessages) => {
        setConversationId(id);
        setMessages(
          loadedMessages.map((message) => ({
            id: message.id,
            sender: message.role,
            text: message.text,
            timestamp: new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }))
        );
      },
    });
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
            onClick={() => {
              setIsFullscreen(false);
              setIsOpen(true);
            }}
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

              <div
                className={`fixed inset-0 z-[61] flex items-center justify-center pointer-events-none transition-[padding] duration-300 ease-in-out ${
                  isFullscreen ? 'p-0' : 'p-4'
                }`}
              >
                <motion.div
                  key="chat-assistant-panel"
                  ref={panelScope}
                  layoutId={CHAT_ASSISTANT_LAYOUT_ID}
                  layoutRoot
                  role="dialog"
                  aria-modal="true"
                  aria-label="Assistant"
                  transition={SPRING_TRANSITION}
                  className={`pointer-events-auto relative bg-white dark:bg-[#0c0c0e] hairline-border-strong shadow-2xl overflow-hidden flex flex-col w-full transition-[max-width,height,border-radius] duration-300 ease-in-out ${
                    isFullscreen ? 'max-w-[100vw] h-full rounded-none' : 'max-w-4xl h-[min(800px,90dvh)] rounded-2xl'
                  }`}
                >
                  {/* Conversation history sidebar - shows automatically
                      whenever Fullscreen is active, no separate toggle
                      (mirrors isFullscreen directly). Spans the panel's
                      full height; the floating input bar below is given a
                      higher z-index specifically so it keeps rendering on
                      top of this in the bottom-left corner where they'd
                      otherwise overlap, rather than this stopping short to
                      make room for it. */}
                  <AnimatePresence>
                    {isFullscreen && (
                      <motion.div
                        key="chat-assistant-sidebar"
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={SPRING_TRANSITION}
                        className="absolute inset-y-0 left-0 w-80 z-[5] bg-slate-50 dark:bg-zinc-950/60 border-r border-slate-200 dark:border-zinc-800 flex flex-col"
                      >
                        <div className="p-3 border-b border-slate-200 dark:border-zinc-800 shrink-0">
                          <button
                            type="button"
                            onClick={handleClearChat}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#0C2086] text-white text-xs font-semibold hover:bg-[#081765] transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            New Conversation
                          </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
                          {conversationsQuery.data && conversationsQuery.data.length === 0 ? (
                            <p className="text-xs text-slate-400 dark:text-zinc-500 text-center py-6 px-3">
                              No past conversations yet.
                            </p>
                          ) : (
                            conversationsQuery.data?.map((conversation) => (
                              <button
                                key={conversation.id}
                                type="button"
                                onClick={() => handleSelectConversation(conversation.id)}
                                disabled={loadConversationMessagesMutation.isPending}
                                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs truncate transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                                  conversation.id === conversationId
                                    ? 'bg-slate-200 dark:bg-zinc-800 text-slate-900 dark:text-white font-semibold'
                                    : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900'
                                }`}
                              >
                                {conversation.title}
                              </button>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Header actions: Clear chat + Fullscreen toggle + Close
                      button - Close stays last/rightmost either way, the
                      most predictable spot for it regardless of what sits
                      beside it. */}
                  <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
                    {messages.length > 0 && (
                      <button
                        type="button"
                        onClick={handleClearChat}
                        title="Clear chat history"
                        aria-label="Clear chat history"
                        className="p-2 rounded-full bg-white dark:bg-[#0c0c0e] shadow-md text-slate-400 hover:text-rose-600 dark:text-zinc-500 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleToggleFullscreen}
                      title={isFullscreen ? 'Exit full screen' : 'Full screen'}
                      aria-label={isFullscreen ? 'Exit full screen' : 'Full screen'}
                      className="p-2 rounded-full bg-white dark:bg-[#0c0c0e] shadow-md text-slate-400 hover:text-slate-700 dark:text-zinc-500 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={handleClose}
                      aria-label="Close Assistant"
                      className="p-2 rounded-full bg-white dark:bg-[#0c0c0e] shadow-md text-slate-400 hover:text-slate-700 dark:text-zinc-500 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Messages */}
                  <div
                    style={{ paddingBottom: inputBarHeight + 16 }}
                    className={`flex-1 overflow-y-auto pr-6 pt-14 transition-[padding] duration-300 ease-in-out ${
                      isFullscreen ? 'pl-80' : 'pl-6'
                    }`}
                  >
                    {/* Capped and centered so lines don't stretch edge-to-
                        edge once the panel itself goes full-width in
                        Fullscreen mode - a no-op in normal mode, since the
                        panel there is already narrower than this cap. */}
                    <div className="max-w-4xl mx-auto w-full space-y-4">
                    {messages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center gap-3 text-slate-400 dark:text-zinc-500">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-zinc-800/80 flex items-center justify-center text-[#0C2086] dark:text-blue-400 hairline-border">
                          <Bot className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-slate-700 dark:text-zinc-300">
                            How can I help you today?
                          </p>
                          <p className="text-xs max-w-[260px] text-slate-400 dark:text-zinc-500">
                            Ask any questions about infrastructure, environments, resource configurations, or general queries.
                          </p>
                        </div>
                      </div>
                    ) : (
                      messages.map((message) => {
                        if (message.sender === 'user') {
                          // Mid-morph: the layoutId'd element Framer bridges
                          // from the input-area ghost's last measured
                          // position/shape to this one. backgroundColor and
                          // borderRadius are plain inline style values (not
                          // Tailwind classes) specifically so Framer can
                          // interpolate them smoothly as part of the same
                          // layout transition, alongside the position/size
                          // FLIP it already does automatically.
                          if (flyingMessage?.id === message.id && ghostPhase === 'in-list') {
                            return (
                              <div key={message.id} className="flex flex-col items-end gap-1">
                                <motion.div
                                  layoutId={`chat-send-morph-${message.id}`}
                                  onLayoutAnimationComplete={() => setFlyingMessage(null)}
                                  transition={SEND_MORPH_SPRING}
                                  style={{ backgroundColor: '#0C2086', color: '#ffffff', borderRadius: 16 }}
                                  className="max-w-[80%] text-xs px-4 py-2.5 break-words shadow-sm leading-relaxed whitespace-pre-wrap"
                                >
                                  {message.text}
                                </motion.div>
                                {message.timestamp && (
                                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 px-1">
                                    {message.timestamp}
                                  </span>
                                )}
                              </div>
                            );
                          }

                          return (
                            <div key={message.id} className="flex flex-col items-end gap-1">
                              <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-[#0C2086] text-white text-xs px-4 py-2.5 break-words shadow-sm leading-relaxed whitespace-pre-wrap">
                                {message.text}
                              </div>
                              {message.timestamp && (
                                <span className="text-[10px] text-slate-400 dark:text-zinc-500 px-1">
                                  {message.timestamp}
                                </span>
                              )}
                            </div>
                          );
                        }

                        if (message.sender === 'error') {
                          return (
                            <div key={message.id} className="flex items-start gap-2.5 max-w-[85%]">
                              <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0 mt-0.5">
                                <Bot className="w-3.5 h-3.5" />
                              </div>
                              <div className="flex flex-col items-start gap-1.5">
                                <div className="rounded-2xl rounded-tl-sm bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs px-4 py-2.5 break-words shadow-sm leading-relaxed">
                                  <p>{message.text}</p>
                                  {message.originalQuestion && (
                                    <button
                                      type="button"
                                      onClick={() => handleRetry(message.originalQuestion!)}
                                      disabled={askQuestionMutation.isPending}
                                      className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-medium text-rose-700 dark:text-rose-300 hover:text-rose-900 dark:hover:text-rose-100 underline underline-offset-2 cursor-pointer disabled:opacity-50"
                                    >
                                      <RotateCcw className="w-3 h-3" />
                                      Retry
                                    </button>
                                  )}
                                </div>
                                {message.timestamp && (
                                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 px-1">
                                    {message.timestamp}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        }

                        // Assistant message - Markdown-rendered (the
                        // assistant is instructed to answer in Markdown, and
                        // previously this just dumped the raw "**bold**"/
                        // "| table |" syntax as plain text). A message
                        // containing a table widens past the usual 85% cap
                        // so the table isn't forced to scroll for a normal
                        // column count - plain-text answers keep the
                        // original narrower width.
                        const isWideMessage = containsMarkdownTable(message.text);
                        return (
                          <div
                            key={message.id}
                            className={`flex items-start gap-2.5 ${isWideMessage ? 'w-full max-w-full' : 'max-w-[85%]'}`}
                          >
                            <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-zinc-800 hairline-border flex items-center justify-center text-[#0C2086] dark:text-blue-400 shrink-0 mt-0.5">
                              <Bot className="w-3.5 h-3.5" />
                            </div>
                            <div className={`flex flex-col items-start gap-1 ${isWideMessage ? 'min-w-0 flex-1' : ''}`}>
                              <div className="rounded-2xl rounded-tl-sm bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 text-xs px-4 py-2.5 break-words shadow-sm leading-relaxed">
                                <MarkdownMessageSharedComponent text={message.text} />
                              </div>
                              {message.timestamp && (
                                <span className="text-[10px] text-slate-400 dark:text-zinc-500 px-1">
                                  {message.timestamp}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}

                    {/* Animated 3-dot typing indicator */}
                    {askQuestionMutation.isPending && (
                      <div className="flex items-start gap-2.5 max-w-[85%]">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-zinc-800 hairline-border flex items-center justify-center text-[#0C2086] dark:text-blue-400 shrink-0 mt-0.5">
                          <Bot className="w-3.5 h-3.5" />
                        </div>
                        <div className="rounded-2xl rounded-tl-sm bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 text-xs px-4 py-3 shadow-sm flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-500 dark:bg-zinc-400 animate-bounce [animation-delay:-0.3s]" />
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-500 dark:bg-zinc-400 animate-bounce [animation-delay:-0.15s]" />
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-500 dark:bg-zinc-400 animate-bounce" />
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} className="h-1" />
                    </div>
                  </div>

                  {/* Floating input bar - absolutely positioned (not a
                      normal flex-column footer) so the message list behind
                      it stays visible through this wrapper's own transparent
                      padding as it scrolls, rather than disappearing behind
                      a solid footer strip. pointer-events-none on the
                      wrapper lets clicks in that transparent gutter reach
                      the messages underneath; the pill itself opts back
                      in so it's still fully interactive.

                      In Fullscreen, the wrapper's left edge shifts past the
                      sidebar's own width (left-80, matching the sidebar's
                      w-80 exactly) rather than spanning the whole panel -
                      otherwise the max-w-4xl centering below would center
                      across the sidebar+chat combined instead of just the
                      chat column, which is also why this now lines up with
                      the pl-80 the messages list gets in Fullscreen just
                      above. The transition keeps this in sync with that
                      same padding animation rather than snapping. */}
                  <div
                    ref={inputBarRef}
                    className={`absolute bottom-0 right-0 px-6 pb-6 pt-2 pointer-events-none z-[6] transition-[left] duration-300 ease-in-out ${
                      isFullscreen ? 'left-80' : 'left-0'
                    }`}
                  >
                    {/* Same max-w-4xl cap as the messages above - stays the
                        same width it already had in normal mode instead of
                        stretching to the panel's own full width once that
                        goes edge-to-edge in Fullscreen. */}
                    <div className="max-w-4xl mx-auto relative flex items-end gap-2 px-3 py-2 rounded-3xl bg-white dark:bg-[#0c0c0e] hairline-border-strong shadow-lg pointer-events-auto">
                      {/* The morph's starting frame - an invisible (same
                          color as the input's own text) clone of what was
                          just typed, filling this exact pill's current
                          bounding box. Framer bridges FROM this shape/
                          position/color TO the real bubble's once the
                          sibling render above mounts with the same
                          layoutId, one rAF later. */}
                      {flyingMessage && ghostPhase === 'at-input' && (
                        <motion.div
                          layoutId={`chat-send-morph-${flyingMessage.id}`}
                          transition={SEND_MORPH_SPRING}
                          style={{ backgroundColor: 'rgba(12, 32, 134, 0)', color: 'inherit', borderRadius: 24 }}
                          className="absolute inset-0 px-3.5 py-2.5 text-sm text-slate-900 dark:text-zinc-100 whitespace-pre-wrap break-words overflow-hidden pointer-events-none"
                        >
                          {flyingMessage.text}
                        </motion.div>
                      )}
                      <textarea
                        ref={inputRef}
                        name="chatAssistantMessage"
                        rows={1}
                        value={draftMessage}
                        disabled={askQuestionMutation.isPending}
                        onChange={(event) => handleDraftChange(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' && !event.shiftKey) {
                            event.preventDefault();
                            handleSend();
                          }
                        }}
                        placeholder={
                          askQuestionMutation.isPending
                            ? 'Assistant is thinking…'
                            : 'Message the assistant…'
                        }
                        style={{ maxHeight: MAX_TEXTAREA_HEIGHT_PX }}
                        className="flex-1 min-h-10 py-2 px-3.5 rounded-3xl bg-transparent text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0C2086] dark:focus-visible:ring-blue-400 disabled:opacity-60 resize-none overflow-y-auto"
                      />
                      <button
                        type="button"
                        onClick={handleSend}
                        disabled={!draftMessage.trim() || askQuestionMutation.isPending}
                        aria-label="Send message"
                        className="h-10 w-10 shrink-0 rounded-full bg-[#0C2086] text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:bg-[#081765] transition-colors"
                      >
                        {askQuestionMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
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
