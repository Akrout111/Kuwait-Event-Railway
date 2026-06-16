"use client";

interface HighlightTextProps {
  text: string;
  query: string;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Safely renders text that may contain <mark> tags from server-side highlighting
 * by parsing them into React elements instead of using dangerouslySetInnerHTML.
 */
function renderMarkedText(html: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  // Match <mark>...</mark> tags
  const markRegex = /<mark>(.*?)<\/mark>/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = markRegex.exec(html)) !== null) {
    // Add text before the <mark> tag
    if (match.index > lastIndex) {
      parts.push(
        <span key={key++}>{html.slice(lastIndex, match.index)}</span>
      );
    }
    // Add the highlighted text inside <mark>
    parts.push(
      <mark
        key={key++}
        className="bg-warning/20 dark:bg-warning/30 rounded px-0.5"
      >
        {match[1]}
      </mark>
    );
    lastIndex = match.index + match[0].length;
  }

  // Add remaining text after the last </mark>
  if (lastIndex < html.length) {
    parts.push(<span key={key++}>{html.slice(lastIndex)}</span>);
  }

  return parts;
}

export function HighlightText({ text, query }: HighlightTextProps) {
  if (!query || query.trim().length === 0) {
    return <>{text}</>;
  }

  // If text already contains <mark> tags from server-side highlighting, parse safely
  if (text.includes("<mark>")) {
    return <>{renderMarkedText(text)}</>;
  }

  // Client-side highlighting
  const words = query.trim().split(/\s+/).filter(Boolean);
  const regex = new RegExp(`(${words.map(escapeRegex).join("|")})`, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        words.some((w) => part.toLowerCase() === w.toLowerCase()) ? (
          <mark
            key={i}
            className="bg-warning/20 dark:bg-warning/30 rounded px-0.5"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}
