import React from "react";

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  if (!content) return null;

  // Split content by double newlines into block elements
  const blocks = content.split(/\n\n+/);

  const parseInline = (text: string): React.ReactNode[] => {
    // Basic regex parser for inline items: bold (**), italic (*), inline code (`)
    const parts: React.ReactNode[] = [];
    let currentIndex = 0;
    
    // Combine patterns into a single matcher
    // Group 1: bold (**word**)
    // Group 2: italic (*word*)
    // Group 3: code (`code`)
    const regex = /(\*\*|__)(.*?)\1|(\*)(.*?)\3|(`)(.*?)\5/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      // Add text before the match
      if (match.index > currentIndex) {
        parts.push(text.substring(currentIndex, match.index));
      }

      if (match[1]) {
        // Bold
        parts.push(
          <strong key={match.index} className="font-semibold text-white">
            {match[2]}
          </strong>
        );
      } else if (match[3]) {
        // Italic
        parts.push(<em key={match.index} className="italic text-gray-300">{match[4]}</em>);
      } else if (match[5]) {
        // Inline Code
        parts.push(
          <code key={match.index} className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded font-mono text-[11px] text-[#5ed29c]">
            {match[6]}
          </code>
        );
      }

      currentIndex = regex.lastIndex;
    }

    if (currentIndex < text.length) {
      parts.push(text.substring(currentIndex));
    }

    return parts.length > 0 ? parts : [text];
  };

  return (
    <div className="flex flex-col gap-3 font-sans text-xs leading-relaxed text-gray-300">
      {blocks.map((block, bIdx) => {
        const trimmed = block.trim();
        
        if (!trimmed) return null;

        // Headers
        if (trimmed.startsWith("### ")) {
          return (
            <h3 key={bIdx} className="font-display font-bold text-sm text-[#5ed29c] tracking-tight mt-1 mb-0.5 flex items-center gap-2">
              {parseInline(trimmed.replace("### ", ""))}
            </h3>
          );
        }
        if (trimmed.startsWith("#### ")) {
          return (
            <h4 key={bIdx} className="font-display font-semibold text-xs uppercase tracking-wider text-gray-200 mt-1 mb-0.5">
              {parseInline(trimmed.replace("#### ", ""))}
            </h4>
          );
        }

        // Horizontal Line
        if (trimmed === "---") {
          return <hr key={bIdx} className="border-white/10 my-1" />;
        }

        // List Block
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          const items = trimmed.split(/\n[-*]\s+/);
          return (
            <ul key={bIdx} className="list-none pl-1 flex flex-col gap-1.5 my-1">
              {items.map((item, iIdx) => {
                // Remove initial bullet character if this is the very first list item in the block
                const itemText = (iIdx === 0 && (item.startsWith("- ") || item.startsWith("* ")))
                  ? item.substring(2)
                  : item;
                
                return (
                  <li key={iIdx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5ed29c]/60 mt-1.5 shrink-0" />
                    <span className="flex-1">{parseInline(itemText)}</span>
                  </li>
                );
              })}
            </ul>
          );
        }

        // Standard Paragraph
        return (
          <p key={bIdx} className="my-0.5">
            {parseInline(trimmed)}
          </p>
        );
      })}
    </div>
  );
}
