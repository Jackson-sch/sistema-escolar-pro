"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  IconMapPin,
  IconSearch,
  IconLoader2,
  IconX,
} from "@tabler/icons-react";

interface LocationPickerProps {
  value: { lat: number; lng: number } | null;
  onChange: (coords: { lat: number; lng: number } | null) => void;
  disabled?: boolean;
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

export function LocationPicker({
  value,
  onChange,
  disabled,
}: LocationPickerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const maplibreRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Default center (Peru)
  const defaultCenter: [number, number] = [-79.000787, -8.083672];

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;
    let cancelled = false;

    import("maplibre-gl").then((maplibregl) => {
      if (cancelled || !mapContainer.current) return;

      // @ts-ignore
      import("maplibre-gl/dist/maplibre-gl.css");

      maplibreRef.current = maplibregl.default || maplibregl;
      const ml = maplibreRef.current;

      const initialCenter = value ? [value.lng, value.lat] : defaultCenter;

      const map = new ml.Map({
        container: mapContainer.current,
        style: {
          version: 8,
          sources: {
            voyager: {
              type: "raster",
              tiles: [
                "https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
              ],
              tileSize: 256,
              attribution:
                "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors &copy; <a href='https://carto.com/attributions'>CARTO</a>",
            },
          },
          layers: [
            {
              id: "voyager-layer",
              type: "raster",
              source: "voyager",
            },
          ],
        },
        center: initialCenter as [number, number],
        zoom: value ? 16 : 13,
        attributionControl: false,
      });

      mapInstance.current = map;

      map.on("load", () => {
        if (cancelled) return;
        setIsMapReady(true);

        // Place initial marker if value exists
        if (value) {
          placeMarker(value.lat, value.lng, ml, map);
        }
      });

      // Click to place marker
      map.on("click", (e: any) => {
        if (disabled) return;
        const { lng, lat } = e.lngLat;
        placeMarker(lat, lng, ml, map);
        onChange({ lat, lng });
      });
    });

    return () => {
      cancelled = true;
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        maplibreRef.current = null;
        setIsMapReady(false);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync marker when value changes externally
  useEffect(() => {
    if (!isMapReady || !maplibreRef.current || !mapInstance.current) return;
    if (value) {
      placeMarker(
        value.lat,
        value.lng,
        maplibreRef.current,
        mapInstance.current,
      );
      mapInstance.current.easeTo({
        center: [value.lng, value.lat],
        zoom: 16,
        duration: 500,
      });
    } else if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value?.lat, value?.lng, isMapReady]);

  const placeMarker = useCallback(
    (lat: number, lng: number, ml: any, map: any) => {
      if (markerRef.current) {
        markerRef.current.setLngLat([lng, lat]);
        return;
      }

      const el = document.createElement("div");
      el.innerHTML = `
      <div style="
        width: 36px; height: 36px;
        background: linear-gradient(135deg, #3b82f6, #6366f1);
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.5);
        display: flex; align-items: center; justify-content: center;
        cursor: grab;
      ">
        <div style="
          width: 10px; height: 10px;
          background: white;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    `;

      const marker = new ml.Marker({
        element: el,
        anchor: "bottom-left",
        draggable: !disabled,
      })
        .setLngLat([lng, lat])
        .addTo(map);

      marker.on("dragend", () => {
        const lngLat = marker.getLngLat();
        onChange({ lat: lngLat.lat, lng: lngLat.lng });
      });

      markerRef.current = marker;
    },
    [disabled, onChange],
  );

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
      // Show a meaningful portion of the address (first 3 parts)
      const parts = result.display_name.split(", ");
      setSearchQuery(parts.slice(0, 3).join(", "));
      setShowSuggestions(false);

      if (mapInstance.current) {
        mapInstance.current.easeTo({
          center: [lng, lat],
          zoom: 16,
          duration: 600,
        });
      }
    },
    [onChange],
  );

  const clearLocation = useCallback(() => {
    onChange(null);
    setSearchQuery("");
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
    if (mapInstance.current) {
      mapInstance.current.easeTo({
        center: defaultCenter,
        zoom: 13,
        duration: 500,
      });
    }
  }, [onChange]);

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
    <div className="space-y-2">
      {/* Search bar */}
      <div className="relative" ref={suggestionsRef}>
        <div className="flex items-center gap-2 h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-within:ring-1 focus-within:ring-ring">
          {isSearching ? (
            <IconLoader2 className="h-4 w-4 text-muted-foreground animate-spin shrink-0" />
          ) : (
            <IconSearch className="h-4 w-4 text-muted-foreground shrink-0" />
          )}
          <input
            type="text"
            placeholder="Buscar dirección..."
            className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            disabled={disabled}
          />
          {value && (
            <button
              type="button"
              onClick={clearLocation}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <IconX className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

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

      {/* Mini map */}
      <div className="relative rounded-lg overflow-hidden border border-border/50 shadow-sm">
        <div
          ref={mapContainer}
          className="w-full h-[180px]"
          style={{ background: "#e5e7eb" }}
        />

        {/* Hint overlay */}
        {!value && isMapReady && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <IconMapPin className="h-3.5 w-3.5" />
              Haz clic en el mapa para ubicar la sede
            </div>
          </div>
        )}
      </div>

      {/* Coordinate readout */}
      {value && (
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground/70 font-mono px-1">
          <span>Lat: {value.lat.toFixed(6)}</span>
          <span>•</span>
          <span>Lng: {value.lng.toFixed(6)}</span>
        </div>
      )}
    </div>
  );
}
