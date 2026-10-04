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

        // Markdown Table
        if (trimmed.startsWith('|') && trimmed.includes('|')) {
          const lines = trimmed.split('\n').map(l => l.trim()).filter(Boolean);
          const headerLine = lines[0];
          const dataLines = lines.slice(1).filter(l => !l.match(/^\|[\s:\-|\+]+\|$/));

          if (headerLine && dataLines.length > 0) {
            const headers = headerLine.split('|').map(c => c.trim()).filter(Boolean);

            return (
              <div key={bIdx} className="my-3 overflow-x-auto rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-lg">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/10 text-white font-bold">
                      {headers.map((h, hIdx) => (
                        <th key={hIdx} className="p-3 font-bold uppercase tracking-wider text-[#D4B886]">
                          {renderInlineMarkdown(h)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {dataLines.map((rowStr, rIdx) => {
                      const cells = rowStr.split('|').map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
                      return (
                        <tr key={rIdx} className="hover:bg-white/5 transition-colors">
                          {cells.map((cell, cIdx) => (
                            <td key={cIdx} className="p-3 text-slate-200 align-top leading-relaxed">
                              {cell.split(/<br\s*\/?>/i).map((subItem, sIdx) => (
                                <div key={sIdx} className="py-0.5">
                                  {renderInlineMarkdown(subItem.trim())}
                                </div>
                              ))}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          }
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
