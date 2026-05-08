import React from "react";

interface RichTextRendererProps {
  content: string;
  className?: string;
}

/**
 * Renders mixed paragraph/bullet text content.
 * Lines starting with "• " are rendered as bullet list items.
 * Consecutive bullets are grouped into a single <ul>.
 * Everything else renders as paragraph text.
 */
export default function RichTextRenderer({
  content,
  className = "",
}: RichTextRendererProps) {
  if (!content) return null;

  const lines = content.split("\n");
  const blocks: { type: "paragraph" | "bullets"; lines: string[] }[] = [];

  for (const line of lines) {
    const isBullet = line.startsWith("• ");
    const text = isBullet ? line.slice(2) : line;

    if (isBullet) {
      // Add to existing bullet block or create new one
      const last = blocks[blocks.length - 1];
      if (last && last.type === "bullets") {
        last.lines.push(text);
      } else {
        blocks.push({ type: "bullets", lines: [text] });
      }
    } else {
      // Add to existing paragraph block or create new one
      const last = blocks[blocks.length - 1];
      if (last && last.type === "paragraph") {
        last.lines.push(line);
      } else {
        blocks.push({ type: "paragraph", lines: [line] });
      }
    }
  }

  return (
    <div className={className}>
      {blocks.map((block, idx) => {
        if (block.type === "bullets") {
          return (
            <ul
              key={idx}
              className="list-disc pl-5 space-y-1"
              style={{ overflowWrap: "break-word", wordBreak: "normal" }}
            >
              {block.lines.map((line, li) => (
                <li key={li}>{line}</li>
              ))}
            </ul>
          );
        }

        // Paragraph — join lines with line breaks, skip empty-only blocks
        const text = block.lines.join("\n");
        if (!text.trim()) return null;

        return (
          <p
            key={idx}
            className="whitespace-pre-wrap"
            style={{ overflowWrap: "break-word", wordBreak: "normal" }}
          >
            {text}
          </p>
        );
      })}
    </div>
  );
}
