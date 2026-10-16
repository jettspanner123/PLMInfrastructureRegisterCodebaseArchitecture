import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';

export interface MarkdownMessageSharedComponentProps {
  text: string;
}

// Every element is styled by hand here rather than via a Tailwind "prose"
// plugin - this app has no typography plugin installed, and a chat bubble
// needs tighter, more compact spacing than a prose/article layout would
// give by default anyway. Deliberately no text-color utility on most
// elements so they inherit the bubble's own light/dark text color instead
// of fighting it.
const markdownComponents: Components = {
  p: ({ children }) => <p className="my-1.5 first:mt-0 last:mb-0">{children}</p>,

  // Toned down: bold and a touch larger than body text, not a document
  // heading - this is a section label inside a chat bubble, not a report.
  h1: ({ children }) => <p className="font-semibold text-[13px] mt-3 mb-1 first:mt-0">{children}</p>,
  h2: ({ children }) => <p className="font-semibold text-[13px] mt-3 mb-1 first:mt-0">{children}</p>,
  h3: ({ children }) => <p className="font-semibold text-xs mt-2.5 mb-1 first:mt-0">{children}</p>,

  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,

  ul: ({ children }) => <ul className="list-disc pl-4 my-1.5 space-y-1 marker:text-slate-400 dark:marker:text-zinc-500">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-4 my-1.5 space-y-1 marker:text-slate-400 dark:marker:text-zinc-500">{children}</ol>,
  li: ({ children }) => <li className="pl-0.5">{children}</li>,

  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[#0C2086] dark:text-blue-400 underline underline-offset-2 hover:opacity-80"
    >
      {children}
    </a>
  ),

  hr: () => <hr className="my-3 border-t border-slate-200 dark:border-zinc-700" />,

  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-slate-300 dark:border-zinc-600 pl-3 my-1.5 italic text-slate-600 dark:text-zinc-400">
      {children}
    </blockquote>
  ),

  // Simple/neutral table - a light tinted header, bold header text, thin
  // hairline borders reusing this app's own --color-hairline token (via the
  // existing .hairline-border utility) rather than the brand-blue header
  // the app's main data tables use elsewhere - this is a table inside a
  // chat message, not a shrunk-down copy of the main grid.
  table: ({ children }) => (
    <div className="my-2 overflow-x-auto rounded-lg hairline-border">
      <table className="w-full text-[11px] border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-slate-50 dark:bg-zinc-800/60">{children}</thead>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => <tr>{children}</tr>,
  th: ({ children }) => (
    <th className="text-left font-semibold px-2.5 py-1.5 hairline-border whitespace-nowrap">{children}</th>
  ),
  td: ({ children }) => <td className="px-2.5 py-1.5 hairline-border align-top">{children}</td>,

  // Fenced code blocks (regardless of whether a language was given) render
  // as a plain monospace block, no syntax highlighting - this assistant
  // answers in prose/tables, fenced code is an edge case here, not worth a
  // highlighting dependency for. Inline `code` spans get a small pill
  // matching this app's existing JetBrains Mono data-value convention (the
  // same .font-mono class BadgeSharedComponent already uses).
  pre: ({ children }) => (
    <pre className="my-2 rounded-lg bg-slate-100 dark:bg-zinc-900/60 hairline-border px-3 py-2 overflow-x-auto">
      {children}
    </pre>
  ),
  code: ({ className, children }) => {
    const text = String(children).replace(/\n$/, '');
    const isFencedBlock = /language-(\w+)/.test(className ?? '') || text.includes('\n');

    if (isFencedBlock) {
      return <code className="font-mono text-[11px] leading-relaxed">{text}</code>;
    }

    return (
      <code className="font-mono text-[11px] px-1.5 py-0.5 rounded-md bg-slate-200/70 dark:bg-zinc-700/70">
        {text}
      </code>
    );
  },
};

export default function MarkdownMessageSharedComponent({
  text,
}: MarkdownMessageSharedComponentProps): React.JSX.Element {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
      {text}
    </ReactMarkdown>
  );
}
