"use client";

import {
  useCallback,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from "react";
import { IconMapPin } from "@tabler/icons-react";
import { LocationSearchInput } from "./location-search-input";

interface LocationPickerProps {
  value: { lat: number; lng: number } | null;
  onChange: (coords: { lat: number; lng: number } | null) => void;
  disabled?: boolean;
}

// Default center (Peru) - Mantenido como constante de módulo estable
const DEFAULT_CENTER: [number, number] = [-79.000787, -8.083672];

export function LocationPicker({
  value,
  onChange,
  disabled,
}: LocationPickerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const maplibreRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [markerEpoch, setMarkerEpoch] = useState(0);
  const [isMapReady, setIsMapReady] = useState(false);

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

      markerRef.current = marker;
      setMarkerEpoch((e) => e + 1);
    },
    [disabled],
  );

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;
    let cancelled = false;

    import("maplibre-gl").then((maplibregl) => {
      if (cancelled || !mapContainer.current) return;

      import("maplibre-gl/dist/maplibre-gl.css");

      maplibreRef.current = maplibregl.default || maplibregl;
      const ml = maplibreRef.current;

      const initialCenter = value ? [value.lng, value.lat] : DEFAULT_CENTER;

      const map = new ml.Map({
        container: mapContainer.current,
        style: {
          version: 8,
          sources: {
            osm: {
              type: "raster",
              tiles: [
                "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
                "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
                "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
              ],
              tileSize: 256,
              attribution:
                "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors",
              maxzoom: 19,
            },
          },
          layers: [
            {
              id: "osm-layer",
              type: "raster",
              source: "osm",
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

        if (value) {
          placeMarker(value.lat, value.lng, ml, map);
        }
      });

      map.on("click", (e: any) => {
        if (disabled) return;
        const { lng, lat } = e.lngLat;
        placeMarker(lat, lng, ml, map);
        onChange({ lat, lng });
      });
    })
      .catch((error) => {
        if (!cancelled) {
          console.error("Error al inicializar el mapa:", error);
        }
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
  }, [value, isMapReady, placeMarker]);

  const handleMarkerChange = useEffectEvent(
    (coords: { lat: number; lng: number } | null) => {
      onChange(coords);
    },
  );

  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) return;

    const handleDragEnd = () => {
      const lngLat = marker.getLngLat();
      handleMarkerChange({ lat: lngLat.lat, lng: lngLat.lng });
    };
    marker.on("dragend", handleDragEnd);
    return () => {
      marker.off("dragend", handleDragEnd);
    };
  }, [markerEpoch]);

  const handleFlyTo = useCallback((lng: number, lat: number) => {
    if (mapInstance.current) {
      mapInstance.current.easeTo({
        center: [lng, lat],
        zoom: 16,
        duration: 600,
      });
    }
  }, []);

  const handleClearLocation = useCallback(() => {
    onChange(null);
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
      setMarkerEpoch((e) => e + 1);
    }
    if (mapInstance.current) {
      mapInstance.current.easeTo({
        center: DEFAULT_CENTER,
        zoom: 13,
        duration: 500,
      });
    }
  }, [onChange]);

  return (
    <div className="space-y-2">
      <LocationSearchInput
        value={value}
        onChange={onChange}
        onFlyTo={handleFlyTo}
        onClear={handleClearLocation}
        disabled={disabled}
      />

      <div className="relative rounded-lg overflow-hidden border border-border/50 shadow-sm">
        <div
          ref={mapContainer}
          className="w-full h-[180px]"
          style={{ background: "#e5e7eb" }}
        />

        {!value && isMapReady && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <IconMapPin className="h-3.5 w-3.5" />
              Haz clic en el mapa para ubicar la sede
            </div>
          </div>
        )}
      </div>

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
