"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  IconMapPin,
  IconSearch,
  IconLoader2,
  IconX,
} from "@tabler/icons-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";

export interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

interface LocationSearchInputProps {
  value: { lat: number; lng: number } | null;
  onChange: (coords: { lat: number; lng: number } | null) => void;
  onFlyTo: (lng: number, lat: number) => void;
  onClear: () => void;
  disabled?: boolean;
}

export function LocationSearchInput({
  value,
  onChange,
  onFlyTo,
  onClear,
  disabled,
}: LocationSearchInputProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Nominatim search with debounce
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=pe&accept-language=es&addressdetails=1`,
          { headers: { "User-Agent": "SistemaEscolarPro/1.0" } },
        );
        if (!res.ok) {
          setSuggestions([]);
          setShowSuggestions(false);
          return;
        }
        const data: NominatimResult[] = await res.json();
        setSuggestions(data);
        setShowSuggestions(data.length > 0);
      } catch {
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);
  }, []);

  const selectSuggestion = useCallback(
    (result: NominatimResult) => {
      const lat = parseFloat(result.lat);
      const lng = parseFloat(result.lon);
      onChange({ lat, lng });
      const parts = result.display_name.split(", ");
      setSearchQuery(parts.slice(0, 3).join(", "));
      setShowSuggestions(false);
      onFlyTo(lng, lat);
    },
    [onChange, onFlyTo],
  );

  const handleClearLocation = useCallback(() => {
    setSearchQuery("");
    onClear();
  }, [onClear]);

  // Close suggestions on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={suggestionsRef}>
      <InputGroup className="rounded-full transition-colors px-2">
        <InputGroupAddon>
          {isSearching ? (
            <IconLoader2 className="h-4 w-4 text-muted-foreground animate-spin shrink-0" />
          ) : (
            <IconSearch className="h-4 w-4 text-muted-foreground shrink-0" />
          )}
        </InputGroupAddon>
        <InputGroupInput
          type="text"
          placeholder="Buscar dirección..."
          aria-label="Buscar dirección"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          disabled={disabled}
        />
        <InputGroupAddon align="inline-end">
          {value && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleClearLocation}
              aria-label="Limpiar ubicación"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <IconX className="h-3.5 w-3.5" />
            </Button>
          )}
        </InputGroupAddon>
      </InputGroup>

      {/* Suggestions dropdown */}
      {showSuggestions && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg overflow-hidden max-h-48 overflow-y-auto">
          {suggestions.map((s) => (
            <button
              key={s.place_id}
              type="button"
              className="w-full text-left px-3 py-2.5 text-xs hover:bg-accent transition-colors flex items-start gap-2 border-b border-border/50 last:border-0"
              onClick={() => selectSuggestion(s)}
            >
              <IconMapPin className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
              <span className="line-clamp-2 text-muted-foreground">
                {s.display_name}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
