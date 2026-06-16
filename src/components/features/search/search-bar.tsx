"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { useSearch, useFetchSuggestions } from "@/hooks/use-search";
import { SearchSuggestions } from "./search-suggestions";

interface SearchBarProps {
  className?: string;
  initialSearch?: string;
}

export function SearchBar({ className, initialSearch }: SearchBarProps) {
  const t = useTranslations("search");
  const locale = useLocale();
  const { filters, updateFilters, removeFilter } = useSearch();
  const [localValue, setLocalValue] = useState(initialSearch ?? "");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: suggestions = [] } = useFetchSuggestions(localValue);

  // Close suggestions on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = useCallback(
    (value: string) => {
      setLocalValue(value);
      setShowSuggestions(value.length >= 2);

      // Debounced URL update
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        updateFilters({ search: value || undefined });
      }, 500);
    },
    [updateFilters]
  );

  const handleClear = useCallback(() => {
    setLocalValue("");
    setShowSuggestions(false);
    removeFilter("search");
    inputRef.current?.focus();
  }, [removeFilter]);

  const handleSelectSuggestion = useCallback(
    (slug: string) => {
      setShowSuggestions(false);
      // Navigate to event detail
      window.location.href = `/${locale}/events/${slug}`;
    },
    [locale]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setShowSuggestions(false);
      updateFilters({ search: localValue || undefined, page: 1 });
    },
    [localValue, updateFilters]
  );

  return (
    <div ref={containerRef} className={`relative ${className ?? ""}`}>
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => {
            if (localValue.length >= 2) setShowSuggestions(true);
          }}
          placeholder={t("placeholder")}
          className="ps-10 pe-10 h-12 text-base"
          aria-label={t("placeholder")}
        />
        {localValue && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute end-1 top-1/2 -translate-y-1/2 h-8 w-8"
            onClick={handleClear}
            aria-label={t("clear")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <SearchSuggestions
          suggestions={
            suggestions as Array<{
              id: string;
              titleAr: string;
              titleEn: string | null;
              slug: string;
            }>
          }
          onSelect={handleSelectSuggestion}
          query={localValue}
        />
      )}
    </div>
  );
}
