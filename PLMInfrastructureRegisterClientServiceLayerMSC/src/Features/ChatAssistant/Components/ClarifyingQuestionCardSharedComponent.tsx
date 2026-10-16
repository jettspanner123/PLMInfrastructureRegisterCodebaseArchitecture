import React, { useState } from 'react';
import { Check, SkipForward, Send } from 'lucide-react';
import type ClarifyingQuestionInterfaceModel from '../../../Models/ClarifyingQuestionInterfaceModel';

// What gets sent back regardless of HOW the user answered - exactly one of
// selectedOptions/freeTextAnswer is populated, or isSkipped is true and
// neither is. Mirrors AnswerQuestionRequestInterfaceModel's own shape minus
// the conversationId/messageId routing fields the caller already has.
export interface ClarifyingQuestionAnswerPayload {
  selectedOptions: string[] | null;
  freeTextAnswer: string | null;
  isSkipped: boolean;
}

export interface ClarifyingQuestionCardSharedComponentProps {
  question: ClarifyingQuestionInterfaceModel;
  // Present once answered/skipped (live, right after answering, or
  // reconstructed from a reloaded conversation) - drives the card's frozen,
  // read-only state instead of the live interactive controls.
  answeredState?: ClarifyingQuestionAnswerPayload;
  onAnswer: (answer: ClarifyingQuestionAnswerPayload) => void;
  isSubmitting: boolean;
}

export default function ClarifyingQuestionCardSharedComponent({
  question,
  answeredState,
  onAnswer,
  isSubmitting,
}: ClarifyingQuestionCardSharedComponentProps): React.JSX.Element {
  // Only used while live and multi-select - accumulates picks until the
  // user hits Submit. Single-select never touches this; it submits
  // immediately on click instead (see handleOptionClick).
  const [multiSelected, setMultiSelected] = useState<string[]>([]);
  const [freeTextValue, setFreeTextValue] = useState<string>('');

  const isFrozen = answeredState !== undefined;
  const isDisabled = isFrozen || isSubmitting;

  const handleOptionClick = (option: string): void => {
    if (isDisabled) return;

    if (question.allowMultiple) {
      setMultiSelected((previous) =>
        previous.includes(option) ? previous.filter((entry) => entry !== option) : [...previous, option]
      );
      return;
    }

    onAnswer({ selectedOptions: [option], freeTextAnswer: null, isSkipped: false });
  };

  const handleMultiSubmit = (): void => {
    if (isDisabled || multiSelected.length === 0) return;
    onAnswer({ selectedOptions: multiSelected, freeTextAnswer: null, isSkipped: false });
  };

  const handleFreeTextSubmit = (): void => {
    const trimmed = freeTextValue.trim();
    if (isDisabled || !trimmed) return;
    onAnswer({ selectedOptions: null, freeTextAnswer: trimmed, isSkipped: false });
  };

  const handleSkip = (): void => {
    if (isDisabled) return;
    onAnswer({ selectedOptions: null, freeTextAnswer: null, isSkipped: true });
  };

  const hasOptions = !!question.options && question.options.length > 0;

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-900/40 p-4 space-y-3">
      <p className="text-sm font-medium text-slate-800 dark:text-zinc-200">{question.questionText}</p>

      {hasOptions && (
        <div className="flex flex-wrap gap-2">
          {question.options!.map((option) => {
            const isChosen = isFrozen
              ? !!answeredState?.selectedOptions?.includes(option)
              : multiSelected.includes(option);
            const isDimmed = isFrozen && !!answeredState?.selectedOptions && !isChosen;

            return (
              <button
                key={option}
                type="button"
                disabled={isDisabled}
                onClick={() => handleOptionClick(option)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  isChosen
                    ? 'bg-[#0C2086] border-[#0C2086] text-white'
                    : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300'
                } ${isDimmed ? 'opacity-40' : ''} ${
                  isDisabled
                    ? 'cursor-not-allowed'
                    : 'cursor-pointer hover:border-[#0C2086] dark:hover:border-blue-400'
                }`}
              >
                {question.allowMultiple && isChosen && <Check className="inline w-3 h-3 mr-1 -mt-0.5" />}
                {option}
              </button>
            );
          })}
        </div>
      )}

      {hasOptions && question.allowMultiple && !isFrozen && (
        <button
          type="button"
          disabled={isDisabled || multiSelected.length === 0}
          onClick={handleMultiSubmit}
          className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#0C2086] text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:bg-[#081765] transition-colors"
        >
          Submit
        </button>
      )}

      {isFrozen && answeredState?.freeTextAnswer && (
        <p className="text-xs text-slate-500 dark:text-zinc-400 italic">
          You answered: &quot;{answeredState.freeTextAnswer}&quot;
        </p>
      )}

      {isFrozen && answeredState?.isSkipped && (
        <p className="text-xs text-slate-400 dark:text-zinc-500 italic">Skipped</p>
      )}

      {!isFrozen && (
        <div className="flex items-center gap-2 pt-1">
          <input
            type="text"
            value={freeTextValue}
            disabled={isDisabled}
            onChange={(event) => setFreeTextValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                handleFreeTextSubmit();
              }
            }}
            placeholder="Or type your own answer…"
            className="flex-1 h-9 px-3 text-xs rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#0C2086] disabled:opacity-60"
          />
          <button
            type="button"
            disabled={isDisabled || !freeTextValue.trim()}
            onClick={handleFreeTextSubmit}
            aria-label="Send"
            className="h-9 w-9 shrink-0 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            disabled={isDisabled}
            onClick={handleSkip}
            className="shrink-0 text-xs font-medium text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
          >
            <SkipForward className="w-3 h-3" />
            Skip
          </button>
        </div>
      )}
    </div>
  );
}
