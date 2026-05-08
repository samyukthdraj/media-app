"use client";

import { useState, useRef, KeyboardEvent } from "react";

interface RichTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
}

/**
 * A textarea with a paragraph/bullet mode toggle.
 * 
 * Convention: lines starting with "• " are bullet points.
 * Everything else is paragraph text. Both can be mixed freely.
 */
export default function RichTextarea({
  value,
  onChange,
  placeholder = "Start typing...",
  className = "",
  rows = 5,
}: RichTextareaProps) {
  const [mode, setMode] = useState<"paragraph" | "bullet">("paragraph");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && mode === "bullet") {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const before = value.slice(0, start);
      const after = value.slice(textarea.selectionEnd);

      // Check if the current line is an empty bullet — if so, exit bullet (remove "• ")
      const lines = before.split("\n");
      const currentLine = lines[lines.length - 1];
      if (currentLine === "• ") {
        // Remove the empty bullet
        const newValue = before.slice(0, -2) + after;
        onChange(newValue);
        // Move cursor back
        requestAnimationFrame(() => {
          textarea.selectionStart = textarea.selectionEnd = start - 2;
        });
        return;
      }

      // Insert new line with bullet prefix
      const newValue = before + "\n• " + after;
      onChange(newValue);
      requestAnimationFrame(() => {
        const newPos = start + 3; // \n + • + space
        textarea.selectionStart = textarea.selectionEnd = newPos;
      });
    }
  };

  const insertBullet = () => {
    setMode("bullet");
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const before = value.slice(0, start);
    const after = value.slice(textarea.selectionEnd);

    // If we're at the start of a line or at position 0, just add bullet
    const needsNewline = before.length > 0 && !before.endsWith("\n");
    const prefix = needsNewline ? "\n• " : "• ";
    const newValue = before + prefix + after;
    onChange(newValue);

    requestAnimationFrame(() => {
      const newPos = start + prefix.length;
      textarea.selectionStart = textarea.selectionEnd = newPos;
      textarea.focus();
    });
  };

  const switchToParagraph = () => {
    setMode("paragraph");
    textareaRef.current?.focus();
  };

  return (
    <div className="flex flex-col gap-0">
      <div className="flex items-center gap-1 bg-slate-100 border border-b-0 rounded-t-xl px-2 py-1.5">
        <button
          type="button"
          onClick={switchToParagraph}
          className={`text-xs px-2.5 py-1 rounded-md font-semibold transition-all ${
            mode === "paragraph"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          ¶ Paragraph
        </button>
        <button
          type="button"
          onClick={insertBullet}
          className={`text-xs px-2.5 py-1 rounded-md font-semibold transition-all ${
            mode === "bullet"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          • Bullets
        </button>
      </div>
      <textarea
        ref={textareaRef}
        className={`w-full p-4 border rounded-b-xl rounded-t-none focus:ring-2 ring-primary outline-none ${className}`}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={rows}
      />
    </div>
  );
}
