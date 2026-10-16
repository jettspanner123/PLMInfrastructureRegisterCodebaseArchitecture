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
  // Live-only staged state - nothing submits until Send is pressed.
  // Selecting an option clears the free-text draft and vice versa, so
  // there's never ambiguity about which path Send would actually submit.
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [freeTextValue, setFreeTextValue] = useState<string>('');

  const isFrozen = answeredState !== undefined;
  const isDisabled = isFrozen || isSubmitting;
  const hasOptions = !!question.options && question.options.length > 0;

  const handleOptionClick = (option: string): void => {
    if (isDisabled) return;

    setFreeTextValue('');
    if (question.allowMultiple) {
      setSelectedOptions((previous) =>
        previous.includes(option) ? previous.filter((entry) => entry !== option) : [...previous, option]
      );
      return;
    }
    setSelectedOptions((previous) => (previous[0] === option ? [] : [option]));
  };

  const handleFreeTextChange = (value: string): void => {
    if (value.trim().length > 0) setSelectedOptions([]);
    setFreeTextValue(value);
  };

  const canSend = selectedOptions.length > 0 || freeTextValue.trim().length > 0;

  const handleSend = (): void => {
    if (isDisabled || !canSend) return;
    onAnswer({
      selectedOptions: selectedOptions.length > 0 ? selectedOptions : null,
      freeTextAnswer: selectedOptions.length === 0 ? freeTextValue.trim() : null,
      isSkipped: false,
    });
  };

  const handleSkip = (): void => {
    if (isDisabled) return;
    onAnswer({ selectedOptions: null, freeTextAnswer: null, isSkipped: true });
  };

  return (
    <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-900/40 p-4 space-y-4">
      <div>
        <p className="text-base font-semibold text-slate-900 dark:text-zinc-100">{question.heading}</p>
        {question.description && (
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">{question.description}</p>
        )}
      </div>

      {hasOptions && (
        <div>
          <label className="block text-xs font-medium text-slate-500 dark:text-zinc-400 mb-2">
            {question.allowMultiple ? 'Choose all that apply' : 'Choose one'}
          </label>
          <div className="space-y-1.5">
            {question.options!.map((option) => {
              const isChosen = isFrozen
                ? !!answeredState?.selectedOptions?.includes(option)
                : selectedOptions.includes(option);
              const isDimmed = isFrozen && !!answeredState?.selectedOptions && !isChosen;

              return (
                <button
                  key={option}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleOptionClick(option)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-sm text-left transition-colors ${
                    isChosen
                      ? 'bg-[#0C2086]/5 dark:bg-blue-400/10 border-[#0C2086] dark:border-blue-400 text-slate-900 dark:text-zinc-100'
                      : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300'
                  } ${isDimmed ? 'opacity-40' : ''} ${
                    isDisabled
                      ? 'cursor-not-allowed'
                      : 'cursor-pointer hover:border-[#0C2086] dark:hover:border-blue-400'
                  }`}
                >
                  <span
                    className={`shrink-0 w-4 h-4 flex items-center justify-center border-2 ${
                      question.allowMultiple ? 'rounded' : 'rounded-full'
                    } ${
                      isChosen
                        ? 'bg-[#0C2086] border-[#0C2086] dark:bg-blue-400 dark:border-blue-400'
                        : 'border-slate-300 dark:border-zinc-600'
                    }`}
                  >
                    {isChosen && question.allowMultiple && <Check className="w-3 h-3 text-white" />}
                    {isChosen && !question.allowMultiple && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </span>
                  {option}
                </button>
              );
            })}
          </div>
        </div>
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
        <div>
          <label className="block text-xs font-medium text-slate-500 dark:text-zinc-400 mb-2">
            Or write your own answer
          </label>
          <input
            type="text"
            value={freeTextValue}
            disabled={isDisabled}
            onChange={(event) => handleFreeTextChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type an answer…"
            className="w-full h-10 px-3 text-sm rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#0C2086] disabled:opacity-60"
          />
        </div>
      )}

      {!isFrozen && (
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            disabled={isDisabled}
            onClick={handleSkip}
            className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors"
          >
            <SkipForward className="w-3.5 h-3.5" />
            Skip question
          </button>
          <button
            type="button"
            disabled={isDisabled || !canSend}
            onClick={handleSend}
            className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl bg-[#0C2086] text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:bg-[#081765] transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            Send
          </button>
        </div>
      )}
    </div>
  );
}
