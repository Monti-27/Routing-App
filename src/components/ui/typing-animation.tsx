"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface TypingAnimationProps {
  text: string;
  duration?: number;
  className?: string;
  showCursor?: boolean;
  onComplete?: () => void;
}

export function TypingAnimation({
  text,
  duration = 50,
  className,
  showCursor = true,
  onComplete,
}: TypingAnimationProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setDisplayedText("");
    setIsComplete(false);

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsComplete(true);
        clearInterval(interval);
        onComplete?.();
      }
    }, duration);

    return () => clearInterval(interval);
  }, [text, duration, onComplete]);

  return (
    <span className={cn("font-mono", className)}>
      {displayedText}
      {showCursor && !isComplete && (
        <span className="inline-block w-2 h-4 ml-1 bg-brand-purple animate-pulse" />
      )}
    </span>
  );
}

interface TypewriterProps {
  words: string[];
  loop?: boolean;
  cursorClassName?: string;
  textClassName?: string;
}

export function Typewriter({ words, loop = true, cursorClassName, textClassName }: TypewriterProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[currentWordIndex];
    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          if (currentCharIndex < currentWord.length) {
            setCurrentCharIndex((prev) => prev + 1);
          } else {
            setTimeout(() => setIsDeleting(true), 1500);
          }
        } else {
          if (currentCharIndex > 0) {
            setCurrentCharIndex((prev) => prev - 1);
          } else {
            setIsDeleting(false);
            if (loop) {
              setCurrentWordIndex((prev) => (prev + 1) % words.length);
            }
          }
        }
      },
      isDeleting ? 30 : 80
    );

    return () => clearTimeout(timeout);
  }, [currentCharIndex, currentWordIndex, isDeleting, loop, words]);

  const currentWord = words[currentWordIndex];

  return (
    <span className={cn("inline-flex items-center", textClassName)}>
      <span>{currentWord.slice(0, currentCharIndex)}</span>
      <span className={cn("inline-block w-0.5 h-5 ml-0.5 bg-brand-purple animate-blink", cursorClassName)} />
    </span>
  );
}
