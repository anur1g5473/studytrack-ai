import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import type { ChatMessage } from "@/types/chat.types";
import { User, Sparkles } from "lucide-react";

// Basic sanitization function (can be improved with a dedicated library like DOMPurify)
function sanitizeHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  // Remove script tags
  doc.querySelectorAll('script').forEach(script => script.remove());
  // Remove event handlers from all elements
  doc.querySelectorAll('*').forEach(el => {
    Array.from(el.attributes).forEach(attr => {
      if (attr.name.startsWith('on')) {
        el.removeAttribute(attr.name);
      }
    });
  });
  return doc.body.innerHTML;
}

// Reusing the sanitizeInput for Markdown specific prompt injection defense
function sanitizeMarkdownInput(input: string): string {
  let sanitized = input.replace(/\`\`\`/g, ""); // Remove triple backticks
  sanitized = sanitized.replace(/\`\`/g, "");   // Remove double backticks
  sanitized = sanitized.replace(/\`/g, "");     // Remove single backticks
  sanitized = sanitized.replace(/[<>&]/g, (match) => {
    if (match === ">") return "&gt;";
    if (match === "<") return "&lt;";
    if (match === "&") return "&amp;";
    return match; 
  });
  return sanitized.trim();
}

type ChatMessageProps = {
  message: ChatMessage;
};

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  // Process content to fix common math formatting issues AND sanitize
  const processContent = (content: string): string => {
    let processed = sanitizeMarkdownInput(content); // First sanitize markdown injection attempts

    // Convert $...$ to proper KaTeX delimiters
    // Single $ for inline math
    processed = processed.replace(/\$([^$\n]+)\$/g, "$$$$1$$");

    // Fix common formula patterns
    processed = processed.replace(/V_0/g, "V₀");
    processed = processed.replace(/\^2/g, "²");
    processed = processed.replace(/\^3/g, "³");
    processed = processed.replace(/\\sin/g, "sin");
    processed = processed.replace(/\\cos/g, "cos");
    processed = processed.replace(/\\tan/g, "tan");
    processed = processed.replace(/\\theta/g, "θ");
    processed = processed.replace(/\\alpha/g, "α");
    processed = processed.replace(/\\beta/g, "β");
    processed = processed.replace(/\\gamma/g, "γ");
    processed = processed.replace(/\\delta/g, "δ");
    processed = processed.replace(/\\pi/g, "π");
    processed = processed.replace(/\\omega/g, "ω");
    processed = processed.replace(/\\mu/g, "μ");
    processed = processed.replace(/\\lambda/g, "λ");
    processed = processed.replace(/\\sigma/g, "σ");
    processed = processed.replace(/\\rho/g, "ρ");
    processed = processed.replace(/\\epsilon/g, "ε");
    processed = processed.replace(/\\Delta/g, "Δ");
    processed = processed.replace(/\\Sigma/g, "Σ");
    processed = processed.replace(/\\Omega/g, "Ω");
    processed = processed.replace(/\\sqrt/g, "√");
    processed = processed.replace(/\\infty/g, "∞");
    processed = processed.replace(/\\pm/g, "±");
    processed = processed.replace(/\\times/g, "×");
    processed = processed.replace(/\\div/g, "÷");
    processed = processed.replace(/\\neq/g, "≠");
    processed = processed.replace(/\\leq/g, "≤");
    processed = processed.replace(/\\geq/g, "≥");
    processed = processed.replace(/\\approx/g, "≈");
    processed = processed.replace(/\\rightarrow/g, "→");
    processed = processed.replace(/\\leftarrow/g, "←");
    processed = processed.replace(/\\degree/g, "°");

    return processed;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-4 mb-6 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
          isUser
            ? "bg-gradient-to-br from-indigo-500 to-purple-600"
            : "bg-gradient-to-br from-cyan-500 to-blue-600"
        }`}
      >
        {isUser ? (
          <User className="w-5 h-5 text-white" />
        ) : (
          <Sparkles className="w-5 h-5 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div className={`max-w-[85%] lg:max-w-[75%] ${isUser ? "items-end" : "items-start"}`}>
        {/* Sender Label */}
        <p
          className={`text-xs font-semibold mb-2 ${
            isUser ? "text-right text-indigo-400" : "text-left text-cyan-400"
          }`}
        >
          {isUser ? "You" : "🤖 AI Advisor"}
        </p>

        {/* Message Bubble */}
        <div
          className={`px-5 py-4 rounded-2xl shadow-xl ${
            isUser
              ? "bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-tr-sm"
              : "bg-gradient-to-br from-gray-800 to-gray-900 text-gray-100 rounded-tl-sm border border-gray-700/50"
          }`}
        >
          {isUser ? (
            <p className="text-sm leading-relaxed">{sanitizeHtml(message.content)}</p>
          ) : (
            <div className="ai-response">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                  // Headings
                  h1: ({ children }) => (
                    <h1 className="text-xl font-bold text-white mt-4 mb-3 pb-2 border-b border-cyan-500/30">
                      🎯 {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-lg font-bold text-cyan-300 mt-4 mb-2">
                      📌 {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-base font-semibold text-indigo-300 mt-3 mb-2">
                      ▸ {children}
                    </h3>
                  ),

                  // Paragraphs
                  p: ({ children }) => (
                    <p className="text-sm leading-relaxed text-gray-200 mb-3">
                      {children}
                    </p>
                  ),

                  // Bold - Highlighted
                  strong: ({ children }) => (
                    <strong className="font-bold text-cyan-300 bg-cyan-500/10 px-1 rounded">
                      {children}
                    </strong>
                  ),

                  // Italic
                  em: ({ children }) => (
                    <em className="italic text-indigo-300">{children}</em>
                  ),

                  // Lists
                  ul: ({ children }) => (
                    <ul className="space-y-2 mb-4 ml-1">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="space-y-2 mb-4 ml-1 list-decimal list-inside">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-sm text-gray-200 flex items-start gap-2">
                      <span className="text-cyan-400 mt-1">•</span>
                      <span className="flex-1">{children}</span>
                    </li>
                  ),

                  // Code - Formulas & Definitions
                  code: ({ className, children, ...props }) => {
                    const isInline = !className;
                    if (isInline) {
                      return (
                        <code className="bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 text-cyan-300 px-2 py-1 rounded-lg text-sm font-mono border border-cyan-500/30">
                          {children}
                        </code>
                      );
                    }
                    return (
                      <code
                        className="block bg-gray-950 border border-gray-700 rounded-xl p-4 text-sm font-mono text-green-400 overflow-x-auto my-3"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },

                  // Pre blocks
                  pre: ({ children }) => (
                    <pre className="bg-gray-950 border border-gray-700 rounded-xl p-4 overflow-x-auto my-3 shadow-inner">
                      {children}
                    </pre>
                  ),

                  // Blockquotes - Definitions & Important Notes
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-cyan-500 bg-gradient-to-r from-cyan-500/10 to-transparent pl-4 py-3 my-4 rounded-r-xl">
                      <div className="flex items-start gap-2">
                        <span className="text-lg">💡</span>
                        <div className="flex-1">{children}</div>
                      </div>
                    </blockquote>
                  ),

                  // Tables
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-4 rounded-xl border border-gray-700">
                      <table className="min-w-full text-sm">{children}</table>
                    </div>
                  ),
                  thead: ({ children }) => (
                    <thead className="bg-gradient-to-r from-indigo-600/30 to-cyan-600/30">
                      {children}
                    </thead>
                  ),
                  tbody: ({ children }) => (
                    <tbody className="divide-y divide-gray-700/50 bg-gray-900/50">
                      {children}
                    </tbody>
                  ),
                  tr: ({ children }) => (
                    <tr className="hover:bg-gray-800/50 transition-colors">
                      {children}
                    </tr>
                  ),
                  th: ({ children }) => (
                    <th className="px-4 py-3 text-left font-bold text-cyan-300 text-sm">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="px-4 py-3 text-gray-300 text-sm">{children}</td>
                  ),

                  // Links
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:text-cyan-300 underline decoration-cyan-400/50 hover:decoration-cyan-300 transition-colors"
                    >
                      {children} ↗
                    </a>
                  ),

                  // Horizontal rule
                  hr: () => (
                    <hr className="border-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent my-4" />
                  ),
                }}
              >
                {processContent(message.content)}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}