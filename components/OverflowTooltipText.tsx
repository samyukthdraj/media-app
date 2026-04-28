"use client";

import {
  ElementType,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

interface OverflowTooltipTextProps {
  text?: string | null;
  className?: string;
  as?: ElementType;
  tooltipClassName?: string;
}

export default function OverflowTooltipText({
  text,
  className = "",
  as = "span",
  tooltipClassName = "",
}: OverflowTooltipTextProps) {
  const Tag = as;
  const content = useMemo(() => (text ?? "").toString(), [text]);
  const textRef = useRef<HTMLElement | null>(null);
  const holdTimerRef = useRef<number | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const checkOverflow = useCallback(() => {
    const el = textRef.current;
    if (!el) return;

    const hasOverflow =
      el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight;
    setIsOverflowing(hasOverflow);
    if (!hasOverflow) setShowTooltip(false);
  }, []);

  useEffect(() => {
    checkOverflow();
  }, [content, checkOverflow]);

  useEffect(() => {
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [checkOverflow]);

  useEffect(() => {
    return () => {
      if (holdTimerRef.current) {
        window.clearTimeout(holdTimerRef.current);
      }
    };
  }, []);

  const updateCoords = () => {
    if (textRef.current) {
      const rect = textRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom,
        left: rect.left + rect.width / 2,
        width: rect.width,
      });
    }
  };

  const openTooltip = () => {
    if (isOverflowing) {
      updateCoords();
      setShowTooltip(true);
    }
  };

  const closeTooltip = () => {
    setShowTooltip(false);
  };

  const handleTouchStart = () => {
    if (!isOverflowing) return;
    if (holdTimerRef.current) window.clearTimeout(holdTimerRef.current);
    holdTimerRef.current = window.setTimeout(() => {
      updateCoords();
      setShowTooltip(true);
    }, 200);
  };

  const handleTouchEnd = () => {
    if (holdTimerRef.current) {
      window.clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    setShowTooltip(false);
  };

  const tooltipElement =
    mounted && showTooltip && isOverflowing
      ? createPortal(
          <div
            role="tooltip"
            style={{
              position: "fixed",
              top: `${coords.top + 8}px`,
              left: `${coords.left}px`,
              transform: "translateX(-50%)",
            }}
            className={`pointer-events-none z-9999 rounded-md bg-slate-900 px-3 py-2 text-xs font-medium text-white shadow-xl whitespace-normal wrap-break-word max-w-[min(90vw,32rem)] animate-in fade-in zoom-in-95 duration-100 ${tooltipClassName}`}
          >
            {content}
          </div>,
          document.body,
        )
      : null;

  return (
    <span className="inline-block min-w-0 max-w-full">
      <Tag
        ref={textRef}
        className={className}
        onMouseEnter={openTooltip}
        onMouseLeave={closeTooltip}
        onFocus={openTooltip}
        onBlur={closeTooltip}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        {content}
      </Tag>
      {tooltipElement}
    </span>
  );
}
