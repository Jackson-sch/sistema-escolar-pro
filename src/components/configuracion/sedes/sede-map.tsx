"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { IconSchool, IconLibrary } from "@tabler/icons-react";
import { SedePopupContent } from "./sede-popup-content";

interface SedeMapProps {
  sedes: any[];
  activeSedeId?: string;
  onSedeClick: (sedeId: string) => void;
}

export function SedeMap({ sedes, activeSedeId, onSedeClick }: SedeMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const maplibreRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  const hasFitBounds = useRef(false);
  const onSedeClickRef = useRef(onSedeClick);
  const sedesRef = useRef(sedes);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    onSedeClickRef.current = onSedeClick;
  }, [onSedeClick]);

  useEffect(() => {
    sedesRef.current = sedes;
  }, [sedes]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainer.current) return;
    let cancelled = false;

    import("maplibre-gl").then((maplibregl) => {
      if (cancelled || !mapContainer.current) return;
      import("maplibre-gl/dist/maplibre-gl.css");

      maplibreRef.current = maplibregl.default || maplibregl;
      const ml = maplibreRef.current;
      const center: [number, number] = [-79.000787, -8.083672];

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
        center: center,
        zoom: 16,
        minZoom: 12,
        maxZoom: 19,
        attributionControl: false,
      });

      mapInstance.current = map;

      map.on("load", () => {
        if (!cancelled) {
          setIsMapReady(true);
        }
      });
    }).catch((error) => {
      if (!cancelled) {
        console.error("Error al inicializar el mapa:", error);
      }
    });

    return () => {
      cancelled = true;
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        maplibreRef.current = null;
        setIsMapReady(false);
      }
    };
  }, []);

  // Sync Markers + Fit Bounds
  const syncMarkers = useCallback(() => {
    const map = mapInstance.current;
    const ml = maplibreRef.current;
    if (!map || !ml) return;

    const currentSedes = sedesRef.current;

    // Fit bounds on first data load
    if (!hasFitBounds.current && currentSedes.length > 0) {
      const bounds = new ml.LngLatBounds();
      let hasValidCoords = false;
      currentSedes.forEach((s: any) => {
        if (s.lng && s.lat) {
          bounds.extend([s.lng, s.lat]);
          hasValidCoords = true;
        }
      });
      if (hasValidCoords) {
        map.fitBounds(bounds, { padding: 80, maxZoom: 16, animate: false });
        hasFitBounds.current = true;
      }
    }

    // Remove old markers
    const currentSedeIds = new Set(currentSedes.map((s: any) => s.id));
    Object.keys(markersRef.current).forEach((id) => {
      if (!currentSedeIds.has(id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });

    // Add new markers
    currentSedes.forEach((sede: any) => {
      if (!sede.lat || !sede.lng) return;
      if (markersRef.current[sede.id]) {
        markersRef.current[sede.id].setLngLat([sede.lng, sede.lat]);
        return;
      }

      const el = document.createElement("div");
      el.className = "marker-container";

      const inner = document.createElement("div");
      inner.className =
        "cursor-pointer transition-transform duration-300 hover:scale-110 active:scale-95";

      const icon = document.createElement("div");
      if (sede.esPrincipal) {
        icon.className =
          "w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white border-2 border-white shadow-lg";
        icon.style.boxShadow = "0 0 15px rgba(37, 99, 235, 0.6)";
      } else {
        icon.className =
          "w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white border-2 border-white shadow-md";
      }
      const iconRoot = createRoot(icon);
      iconRoot.render(
        sede.esPrincipal ? (
          <IconSchool className="text-sm" />
        ) : (
          <IconLibrary className="text-xs" />
        ),
      );
      inner.appendChild(icon);
      el.appendChild(inner);

      // Popup Content
      const popupContent = document.createElement("div");
      popupContent.className = "premium-popup-container";
      const root = createRoot(popupContent);
      root.render(<SedePopupContent sede={sede} />);

      const popup = new ml.Popup({
        offset: 15,
        closeButton: false,
        maxWidth: "240px",
        className: "premium-map-popup",
      }).setDOMContent(popupContent);

      const marker = new ml.Marker({ element: el, anchor: "center" })
        .setLngLat([sede.lng, sede.lat])
        .setPopup(popup)
        .addTo(map);

      inner.addEventListener("click", (e: MouseEvent) => {
        e.stopPropagation();
        onSedeClickRef.current(sede.id);
      });

      markersRef.current[sede.id] = marker;
    });
  }, []);

  useEffect(() => {
    if (isMapReady) {
      syncMarkers();
    }
  }, [isMapReady, sedes, syncMarkers]);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !activeSedeId || !isMapReady) return;

    const activeSede = sedes.find((s) => s.id === activeSedeId);
    if (activeSede && activeSede.lat && activeSede.lng) {
      Object.entries(markersRef.current).forEach(([id, m]: [string, any]) => {
        if (id !== activeSedeId && m.getPopup()?.isOpen()) {
          m.togglePopup();
        }
      });

      map.easeTo({
        center: [activeSede.lng, activeSede.lat],
        zoom: 16,
        duration: 600,
      });

      const marker = markersRef.current[activeSedeId];
      if (marker && !marker.getPopup()?.isOpen()) {
        const onMoveEnd = () => {
          marker.togglePopup();
          map.off("moveend", onMoveEnd);
        };
        map.on("moveend", onMoveEnd);
        return () => map.off("moveend", onMoveEnd);
      }
    }
  }, [activeSedeId, isMapReady, sedes]);

  return (
    <div className="w-full h-full relative group rounded-3xl overflow-hidden bg-muted/10 shadow-lg border border-border/20">
      <div
        ref={mapContainer}
        className="w-full h-full"
        style={{ background: "#e5e7eb" }}
      />
      <div className="absolute inset-0 pointer-events-none border-t border-white/5 rounded-3xl z-10" />
      <div className="absolute inset-0 pointer-events-none rounded-3xl z-10 shadow-[inset_0_0_80px_rgba(0,0,0,0.15)]" />

      <style jsx global>{`
        .marker-container {
          width: 0;
          height: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .maplibregl-popup-content {
          background: #f3f4f6 !important;
          border: 1px solid rgba(0, 0, 0, 0.08) !important;
          border-radius: 1.25rem !important;
          padding: 0 !important;
          overflow: hidden !important;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15) !important;
          min-width: 220px !important;
          color: #1f2937 !important;
        }
        .maplibregl-popup-anchor-bottom .maplibregl-popup-tip {
          border-top-color: #f3f4f6 !important;
        }
        .maplibregl-popup-anchor-top .maplibregl-popup-tip {
          border-bottom-color: #f3f4f6 !important;
        }
        .maplibregl-popup-anchor-left .maplibregl-popup-tip {
          border-right-color: #f3f4f6 !important;
        }
        .maplibregl-popup-anchor-right .maplibregl-popup-tip {
          border-left-color: #f3f4f6 !important;
        }
        .maplibregl-marker svg {
          cursor: pointer !important;
        }
      `}</style>
    </div>
  );
}
