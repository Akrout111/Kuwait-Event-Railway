"use client";

import { Search } from "lucide-react";
import { HighlightText } from "./highlight-text";

interface Suggestion {
  id: string;
  titleAr: string;
  titleEn: string | null;
  slug: string;
}

interface SearchSuggestionsProps {
  suggestions: Suggestion[];
  onSelect: (slug: string) => void;
  query: string;
}

export function SearchSuggestions({
  suggestions,
  onSelect,
  query,
}: SearchSuggestionsProps) {
  return (
    <div className="absolute top-full mt-1 inset-x-0 z-50 bg-background border border-border rounded-lg shadow-lg overflow-hidden">
      <ul role="listbox" aria-label="Search suggestions">
        {suggestions.map((suggestion) => (
          <li key={suggestion.id}>
            <button
              type="button"
              className="w-full flex items-center gap-3 px-4 py-3 text-start hover:bg-accent transition-colors"
              onClick={() => onSelect(suggestion.slug)}
              role="option"
              aria-selected={false}
            >
              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="truncate">
                <HighlightText text={suggestion.titleAr} query={query} />
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
