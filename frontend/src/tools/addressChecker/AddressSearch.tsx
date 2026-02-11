"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import clsx from "clsx";

import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { useDebounce } from "@/components/hooks/useDebounce";
import { autocompleteAddress } from "@/services/api";
import type { AddressSuggestion } from "@/types/viennagis";

interface AddressSearchProps {
  onSelect: (suggestion: AddressSuggestion) => void;
  onSearch: (query: string) => void;
  isLoading?: boolean;
  /** "default" = current, "large" = hero, "compact" = sticky bar */
  size?: "default" | "large" | "compact";
}

export default function AddressSearch({
  onSelect,
  onSearch,
  isLoading = false,
  size = "default",
}: AddressSearchProps) {
  const t = useTranslations("sections.addressChecker.search");

  // ---- state ----
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  const debouncedQuery = useDebounce(query, 300);

  // ---- refs ----
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ---- fetch suggestions when debounced query changes ----
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    let cancelled = false;

    async function fetchSuggestions() {
      setIsFetching(true);
      setError(null);

      try {
        const results = await autocompleteAddress(debouncedQuery);

        if (cancelled) return;

        setSuggestions(results);
        setIsOpen(results.length > 0);
        setActiveIndex(-1);
      } catch {
        if (cancelled) return;
        setError(t("error"));
        setSuggestions([]);
        setIsOpen(false);
      } finally {
        if (!cancelled) setIsFetching(false);
      }
    }

    fetchSuggestions();

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, t]);

  // ---- close on outside click ----
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ---- scroll active option into view ----
  useEffect(() => {
    if (activeIndex < 0 || !listboxRef.current) return;

    const option = listboxRef.current.children[activeIndex] as
      | HTMLElement
      | undefined;
    option?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  // ---- select a suggestion ----
  const selectSuggestion = useCallback(
    (suggestion: AddressSuggestion) => {
      setQuery(suggestion.fullAddress);
      setIsOpen(false);
      setSuggestions([]);
      onSelect(suggestion);
    },
    [onSelect],
  );

  // ---- keyboard navigation ----
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setActiveIndex((prev) =>
            prev < suggestions.length - 1 ? prev + 1 : 0,
          );
          break;

        case "ArrowUp":
          e.preventDefault();
          setActiveIndex((prev) =>
            prev > 0 ? prev - 1 : suggestions.length - 1,
          );
          break;

        case "Enter":
          e.preventDefault();
          if (activeIndex >= 0 && suggestions[activeIndex]) {
            selectSuggestion(suggestions[activeIndex]);
          }
          break;

        case "Escape":
          e.preventDefault();
          setIsOpen(false);
          setActiveIndex(-1);
          break;
      }
    },
    [isOpen, activeIndex, suggestions, selectSuggestion],
  );

  // ---- derive IDs for ARIA ----
  const listboxId = "address-suggestions";
  const activeOptionId =
    activeIndex >= 0 ? `address-option-${activeIndex}` : undefined;

  const isLarge = size === "large";
  const isCompact = size === "compact";

  return (
    <div
      ref={containerRef}
      className={clsx(
        "relative w-full",
        isLarge && "rounded-(--radius) bg-(--color-surface) p-2 shadow-(--shadow-sm) border border-[color-mix(in_srgb,var(--color-border)_50%,transparent)]",
      )}
    >
      <Label htmlFor="address-input" className={isLarge || isCompact ? "sr-only" : undefined}>
        {t("label")}
      </Label>

      <div className="flex gap-3">
        {/* Combobox input */}
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            id="address-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("placeholder")}
            autoComplete="off"
            role="combobox"
            aria-expanded={isOpen}
            aria-controls={listboxId}
            aria-activedescendant={activeOptionId}
            aria-autocomplete="list"
            disabled={isLoading}
            className={clsx(
              isLarge && "!text-lg !py-4 !px-5",
              isCompact && "!py-2 !text-sm",
            )}
          />

          {/* Spinner inside input */}
          {isFetching && (
            <div
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
              aria-hidden="true"
            >
              <div
                className={clsx(
                  "h-5 w-5 rounded-full border-2 border-current border-t-transparent",
                  "animate-spin text-(--color-muted)",
                )}
              />
            </div>
          )}
        </div>

        <Button
          type="button"
          disabled={isLoading || query.length < 3}
          size={isLarge ? "lg" : isCompact ? "sm" : undefined}
          onClick={() => {
            setIsOpen(false);
            onSearch(query);
          }}
        >
          {isLoading ? t("searching") : t("button")}
        </Button>
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-2 text-sm text-(--color-warning)" role="alert">
          {error}
        </p>
      )}

      {/* Suggestions dropdown */}
      {isOpen && suggestions.length > 0 && (
        <ul
          ref={listboxRef}
          id={listboxId}
          role="listbox"
          aria-label={t("multipleResults")}
          className={clsx(
            "absolute z-20 mt-1 w-full overflow-auto",
            "max-h-72 rounded-xs",
            "border border-[color-mix(in_srgb,var(--color-border)_80%,transparent)]",
            "bg-(--color-surface) shadow-(--shadow-sm)",
          )}
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={`${suggestion.fullAddress}-${suggestion.postalCode}`}
              id={`address-option-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              className={clsx(
                "cursor-pointer px-4 py-3 text-sm",
                "[transition:background_var(--transition-fade)]",
                index === activeIndex
                  ? "bg-(--color-accent-soft) text-(--color-accent-strong)"
                  : "text-(--color-fg) hover:bg-(--color-surface-muted)",
              )}
              onMouseDown={(e) => {
                // mousedown instead of click to fire before blur
                e.preventDefault();
                selectSuggestion(suggestion);
              }}
              onMouseEnter={() => setActiveIndex(index)}
            >
              <span className="font-medium">{suggestion.street} {suggestion.houseNumber}</span>
              <span className="ml-2 text-(--color-muted)">
                {suggestion.postalCode} Wien
              </span>
            </li>
          ))}
        </ul>
      )}

      {/* No results message */}
      {isOpen && suggestions.length === 0 && !isFetching && !error && debouncedQuery.length >= 2 && (
        <p className="mt-2 text-sm text-(--color-muted)">
          {t("noResults")}
        </p>
      )}
    </div>
  );
}
