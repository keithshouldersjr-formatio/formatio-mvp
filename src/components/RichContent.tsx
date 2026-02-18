// src/components/RichContent.tsx
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function RichContent({ markdown }: { markdown: string }) {
  return (
    <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-p:text-white/75">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="mb-6 text-3xl font-semibold tracking-tight text-[#C6A75E]">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <div className="mt-10 mb-4 flex items-center gap-3">
              <span className="h-5 w-1.5 rounded-full bg-[#C6A75E]" />
              <h2 className="text-xl font-semibold tracking-tight text-white">
                {children}
              </h2>
            </div>
          ),
          h3: ({ children }) => (
            <h3 className="mt-6 mb-2 inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-sm font-semibold text-white/85">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="text-sm text-white/75 leading-relaxed">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="my-3 space-y-2 text-sm text-white/75">{children}</ul>
          ),
          li: ({ children }) => (
            <li className="flex gap-2">
              <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-[#C6A75E]" />
              <span className="leading-relaxed">{children}</span>
            </li>
          ),
          table: ({ children }) => (
            <div className="my-6 overflow-x-auto rounded-2xl border border-white/10 bg-black/30">
              <table className="w-full border-collapse text-sm">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-white/[0.04] text-white/80">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="border-b border-white/10 px-4 py-3 text-left font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-b border-white/10 px-4 py-3 text-white/75 align-top">
              {children}
            </td>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-[#C6A75E] underline underline-offset-4 hover:opacity-90"
              target="_blank"
              rel="noreferrer"
            >
              {children}
            </a>
          ),
          hr: () => <div className="my-8 h-px w-full bg-white/10" />,
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
