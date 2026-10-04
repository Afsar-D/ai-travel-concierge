import React from 'react';

interface MarkdownViewProps {
  content: string;
}

export const MarkdownView: React.FC<MarkdownViewProps> = ({ content }) => {
  if (!content) return null;

  const blocks = content.split('\n\n');

  return (
    <div className="space-y-3 text-xs leading-relaxed text-slate-200">
      {blocks.map((block, bIdx) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        // Headers
        if (trimmed.startsWith('#')) {
          const level = trimmed.match(/^#+/)?.[0].length || 1;
          const text = trimmed.replace(/^#+\s*/, '');
          if (level === 1) {
            return (
              <h2 key={bIdx} className="font-extrabold text-base text-white border-b border-white/10 pb-1.5 pt-2">
                {renderInlineMarkdown(text)}
              </h2>
            );
          }
          if (level === 2) {
            return (
              <h3 key={bIdx} className="font-bold text-sm text-[#D4B886] pt-1">
                {renderInlineMarkdown(text)}
              </h3>
            );
          }
          return (
            <h4 key={bIdx} className="font-semibold text-xs text-white pt-1">
              {renderInlineMarkdown(text)}
            </h4>
          );
        }

        // Horizontal Divider
        if (trimmed === '---' || trimmed === '***') {
          return <hr key={bIdx} className="border-white/10 my-2" />;
        }

        // Bullet Lists
        if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
          const listItems = trimmed.split('\n').filter(Boolean);
          return (
            <ul key={bIdx} className="space-y-1.5 pl-1">
              {listItems.map((item, iIdx) => {
                const cleanItem = item.replace(/^[\*\-•]\s*/, '');
                return (
                  <li key={iIdx} className="flex items-start space-x-2">
                    <span className="text-[#D4B886] font-bold text-xs shrink-0">•</span>
                    <span>{renderInlineMarkdown(cleanItem)}</span>
                  </li>
                );
              })}
            </ul>
          );
        }

        // Standard Paragraph
        return (
          <p key={bIdx} className="text-slate-300">
            {renderInlineMarkdown(trimmed)}
          </p>
        );
      })}
    </div>
  );
};

function renderInlineMarkdown(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-bold text-white">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={index} className="italic text-slate-200">{part.slice(1, -1)}</em>;
    }
    return part;
  });
}
