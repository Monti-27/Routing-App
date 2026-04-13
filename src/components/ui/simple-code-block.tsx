"use client";

import { cn } from "@/lib/utils";

const TOKEN_PATTERN =
  /(https?:\/\/[^\s"']+|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\b(?:curl|Authorization|Content-Type|Bearer|model|messages|role|content)\b|--?[A-Za-z-]+|[{}\[\]:,])/g;

const getTokenColor = (token: string) => {
  if (token.startsWith("http://") || token.startsWith("https://")) {
    return "#3b82f6";
  }

  if (token.startsWith('"') || token.startsWith("'")) {
    return "#22c55e";
  }

  if (token === "curl") {
    return "#a855f7";
  }

  if (token.startsWith("-")) {
    return "#f59e0b";
  }

  if (["Authorization", "Content-Type", "Bearer"].includes(token)) {
    return "#eab308";
  }

  if (["model", "messages", "role", "content"].includes(token)) {
    return "#38bdf8";
  }

  if (/^[{}\[\]:,]$/.test(token)) {
    return "color-mix(in srgb, var(--foreground) 72%, transparent)";
  }

  return undefined;
};

const renderHighlightedLine = (line: string) => {
  if (!line) {
    return " ";
  }

  if (line.trimStart().startsWith("#")) {
    return <span style={{ color: "#94a3b8" }}>{line}</span>;
  }

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  for (const match of line.matchAll(TOKEN_PATTERN)) {
    const token = match[0];
    const index = match.index ?? 0;

    if (index > lastIndex) {
      parts.push(line.slice(lastIndex, index));
    }

    parts.push(
      <span key={`${token}-${index}`} style={{ color: getTokenColor(token) }}>
        {token}
      </span>,
    );
    lastIndex = index + token.length;
  }

  if (lastIndex < line.length) {
    parts.push(line.slice(lastIndex));
  }

  return parts;
};

type SimpleCodeBlockProps = {
  code: string;
  filename?: string;
  className?: string;
  codePadding?: string;
  lineNumberXShift?: string;
  filenameColor?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: string;
  rootBorderRadius?: string;
  rootPadding?: string;
  lineNumberColor?: string;
  codeTextColor?: string;
  fontFamily?: string;
  codeTextSize?: string;
  titleFontSize?: string;
  codeLineHeight?: string;
  hyperlinkUnderlineColor?: string;
};

export function SimpleCodeBlock({
  code,
  filename,
  className,
  codePadding = "16px 16px 16px 52px",
  lineNumberXShift = "0px",
  filenameColor = "var(--foreground)",
  backgroundColor = "var(--card)",
  borderColor = "var(--input)",
  borderWidth = "1px",
  rootBorderRadius = "8px",
  rootPadding = "12px 8px 12px 8px",
  lineNumberColor = "var(--muted-foreground)",
  codeTextColor = "var(--foreground)",
  fontFamily = "var(--font-lt-superior-mono)",
  codeTextSize = "0.9rem",
  titleFontSize = "1rem",
  codeLineHeight = "1.45rem",
  hyperlinkUnderlineColor = "currentColor",
}: SimpleCodeBlockProps) {
  const lines = code.split("\n");

  return (
    <div
      className={cn("w-full overflow-hidden", className)}
      style={{
        backgroundColor,
        border: `${borderWidth} solid ${borderColor}`,
        borderRadius: rootBorderRadius,
        padding: rootPadding,
      }}
    >
      {filename ? (
        <div
          className="border-b px-3 pb-2 pt-0 text-sm font-medium"
          style={{ borderColor, color: filenameColor, fontSize: titleFontSize }}
        >
          {filename}
        </div>
      ) : null}
      <div className="overflow-x-auto">
        <div className="min-w-full">
          {lines.map((line, index) => (
            <div
              className="grid grid-cols-[32px_minmax(0,1fr)] items-start"
              key={`${index + 1}-${line}`}
              style={{
                color: codeTextColor,
                fontFamily,
                fontSize: codeTextSize,
                lineHeight: codeLineHeight,
              }}
            >
              <span
                className="select-none pr-2 pt-3 text-right"
                style={{
                  color: lineNumberColor,
                  transform: `translateX(${lineNumberXShift})`,
                }}
              >
                {index + 1}
              </span>
              <pre
                className="m-0 whitespace-pre"
                style={{
                  padding: codePadding,
                  textDecorationColor: hyperlinkUnderlineColor,
                }}
              >
                <code>{renderHighlightedLine(line)}</code>
              </pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
