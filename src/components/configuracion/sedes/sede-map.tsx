"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";

interface SedeMapProps {
  sedes: any[];
  activeSedeId?: string;
  onSedeClick: (sedeId: string) => void;
}

// We dynamically import maplibre-gl inside the component to avoid SSR issues
// This lets us use a normal import in the parent (no next/dynamic needed)

export function SedeMap({ sedes, activeSedeId, onSedeClick }: SedeMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const maplibreRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  const hasFitBounds = useRef(false);
  const onSedeClickRef = useRef(onSedeClick);
  const sedesRef = useRef(sedes);
  const [isMapReady, setIsMapReady] = useState(false);

  // Keep refs in sync without triggering effects
  useEffect(() => {
    onSedeClickRef.current = onSedeClick;
  }, [onSedeClick]);

  useEffect(() => {
    sedesRef.current = sedes;
  }, [sedes]);

  // Initialize Map (runs once, never re-runs)
  useEffect(() => {
    if (!mapContainer.current) return;

    let cancelled = false;

    // Dynamic import of maplibre-gl — this is the key to avoiding SSR errors
    // without needing next/dynamic wrapper
    import("maplibre-gl").then((maplibregl) => {
      if (cancelled || !mapContainer.current) return;

      // Import CSS
      // @ts-ignore - CSS import has no type declarations
      import("maplibre-gl/dist/maplibre-gl.css");

      maplibreRef.current = maplibregl.default || maplibregl;
      const ml = maplibreRef.current;

      const center: [number, number] = [-79.000787, -8.083672];

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
        center: center,
        zoom: 16,
        minZoom: 16,
        maxZoom: 17,
        attributionControl: false,
      });

      mapInstance.current = map;

      map.on("load", () => {
        if (!cancelled) {
          setIsMapReady(true);
        }
      });
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
  }, []); // Empty deps — runs once on mount, never again

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

      const iconHtml = sede.esPrincipal
        ? `<div class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white border-2 border-white shadow-lg" style="box-shadow: 0 0 15px rgba(37, 99, 235, 0.6)">
             <span class="material-symbols-outlined text-sm">school</span>
           </div>`
        : `<div class="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white border-2 border-white shadow-md">
             <span class="material-symbols-outlined text-xs">local_library</span>
           </div>`;

      inner.innerHTML = iconHtml;
      el.appendChild(inner);

      // Popup Content
      const popupContent = document.createElement("div");
      popupContent.className = "premium-popup-container";

      const nombresNiveles = Array.from(
        new Set(sede.nivelesAcademicos?.map((na: any) => na.nivel?.nombre)),
      ).filter(Boolean) as string[];

      const root = createRoot(popupContent);
      root.render(
        <div className="flex flex-col gap-0 overflow-hidden">
          {sede.logo ? (
            <div className="relative w-full h-24 overflow-hidden rounded-t-xl mb-3">
              <img
                src={sede.logo}
                className="w-full h-full object-cover"
                alt={sede.nombre}
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-2 left-3 right-3 text-white">
                <h4 className="font-bold text-sm truncate drop-shadow-md">
                  {sede.nombre}
                </h4>
              </div>
            </div>
          ) : (
            <div className="p-3 pb-1">
              <h4 className="font-bold text-sm text-gray-900 mb-1">
                {sede.nombre}
              </h4>
            </div>
          )}

          <div className="px-3 pb-3 space-y-2.5">
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-[14px] text-blue-600 shrink-0 mt-0.5">
                location_on
              </span>
              <p className="text-[10px] text-gray-500 leading-snug">
                {sede.direccion || "Sin dirección física"}
              </p>
            </div>

            {nombresNiveles.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {nombresNiveles.map((nivel) => (
                  <span
                    key={nivel}
                    className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[9px] font-bold border border-blue-200"
                  >
                    {nivel}
                  </span>
                ))}
              </div>
            )}

            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
              <div className="flex items-center gap-1.5 text-gray-400">
                <span className="material-symbols-outlined text-[12px]">
                  verified
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider">
                  Sede {sede.esPrincipal ? "Principal" : "Secundaria"}
                </span>
              </div>
              {sede.esPrincipal && (
                <span className="material-symbols-outlined text-amber-500 text-sm">
                  stars
                </span>
              )}
            </div>
          </div>
        </div>,
      );

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

  // Trigger marker sync when map is ready or sedes change
  useEffect(() => {
    if (isMapReady) {
      syncMarkers();
    }
  }, [isMapReady, sedes, syncMarkers]);

  // Handle Active Sede — smooth pan + popup (NO re-init, just animation)
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !activeSedeId || !isMapReady) return;

    const activeSede = sedes.find((s) => s.id === activeSedeId);
    if (activeSede && activeSede.lat && activeSede.lng) {
      // Close all other popups first
      Object.entries(markersRef.current).forEach(([id, m]: [string, any]) => {
        if (id !== activeSedeId && m.getPopup()?.isOpen()) {
          m.togglePopup();
        }
      });

      // Use easeTo instead of flyTo — flyTo zooms out/in through uncached
      // zoom levels causing black tile gaps. easeTo does a direct pan at the
      // same zoom level, keeping cached tiles visible.
      map.easeTo({
        center: [activeSede.lng, activeSede.lat],
        zoom: 16,
        duration: 600,
      });

      // Open popup after animation completes
      const marker = markersRef.current[activeSedeId];
      if (marker && !marker.getPopup()?.isOpen()) {
        const onMoveEnd = () => {
          marker.togglePopup();
          map.off("moveend", onMoveEnd);
        };
        map.on("moveend", onMoveEnd);
      }
    }
  }, [activeSedeId, isMapReady]);

  return (
    <div className="w-full h-full relative group rounded-3xl overflow-hidden bg-muted/10 shadow-2xl border border-border/20">
      <div
        ref={mapContainer}
        className="w-full h-full"
        style={{ background: "#e5e7eb" }}
      />

      {/* Overlay frame for depth */}
      <div className="absolute inset-0 pointer-events-none border-t border-white/5 rounded-3xl z-10"></div>
      <div className="absolute inset-0 pointer-events-none rounded-3xl z-10 shadow-[inset_0_0_80px_rgba(0,0,0,0.15)]"></div>

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
