import { useEffect, useRef, useState } from "react";
import { useLoaderData, useNavigate } from "react-router";
import maplibregl from "maplibre-gl";
import { MapPin, Clock, CloudSun, Rocket, Calendar } from "lucide-react";
import { toast } from "sonner";
import { FloatingTabBar } from "../components/FloatingTabBar";
import { apiGet } from "../api";
import type { SessionUser } from "../types";

type MapUser = { id: string; name: string; avatar_url: string | null; lat: number; lng: number };

export function MapScreen() {
  const loaderData = useLoaderData() as SessionUser;
  const navigate = useNavigate();
  const mapRef = useRef<maplibregl.Map | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const [clock, setClock] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!wrapRef.current) return;

    const map = new maplibregl.Map({
      container: wrapRef.current,
      style: "https://tiles.openfreemap.org/styles/bright",
      center:
        loaderData.lng != null && loaderData.lat != null ? [loaderData.lng, loaderData.lat] : [28.9784, 41.0082],
      zoom: 12,
      pitch: 45,
      bearing: -17.6,
      canvasContextAttributes: { antialias: true }
    });
    map.dragRotate.enable();
    map.touchZoomRotate.enableRotation();
    mapRef.current = map;

    map.on("style.load", () => {
      // Style loaded
    });

    map.on("load", () => {
      void (async () => {
        try {
          const list = await apiGet<MapUser[]>("/api/users/map");

          const filteredList = list.filter(u => u.lng != null && u.lat != null);

          const geojson: GeoJSON.FeatureCollection = {
            type: "FeatureCollection",
            features: filteredList.map((u) => ({
              type: "Feature",
              properties: { id: u.id },
              geometry: { type: "Point", coordinates: [u.lng, u.lat] },
            })),
          };

          if (!map.getSource("users-heat")) {
            map.addSource("users-heat", { type: "geojson", data: geojson });
            map.addLayer({
              id: "users-heat-layer",
              type: "heatmap",
              source: "users-heat",
              paint: {
                "heatmap-weight": 1,
                "heatmap-intensity": 1,
                "heatmap-radius": 40,
                "heatmap-opacity": 0.65,
              },
            });
          } else {
            (map.getSource("users-heat") as maplibregl.GeoJSONSource).setData(geojson);
          }

          markersRef.current.forEach((m) => m.remove());
          markersRef.current = [];
          filteredList.forEach((u) => {
            const el = document.createElement("button");
            el.type = "button";
            el.className =
              "size-10 overflow-hidden rounded-full border-2 border-white/30 shadow-lg ring-2 ring-violet-500/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400";
            el.style.background = "#27272a";
            if (u.avatar_url) {
              const img = document.createElement("img");
              img.src = u.avatar_url;
              img.alt = "";
              img.className = "size-full object-cover";
              el.appendChild(img);
            } else {
              el.textContent = u.name.slice(0, 1).toUpperCase();
              el.className += " text-sm font-bold text-white";
            }
            el.addEventListener("click", () => navigate(`/profile/${u.id}`));
            const marker = new maplibregl.Marker({ element: el }).setLngLat([u.lng, u.lat]).addTo(map);
            markersRef.current.push(marker);
          });
        } catch {
          toast.error("Harita verileri yüklenemedi");
        }
      })();

      // 3D bina katmanı ekle
      const layers = map.getStyle().layers;
      let labelLayerId;
      for (let i = 0; i < layers.length; i++) {
        if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
          labelLayerId = layers[i].id;
          break;
        }
      }
      map.addSource('openfreemap', {
        url: 'https://tiles.openfreemap.org/planet',
        type: 'vector'
      });
      map.addLayer({
        id: '3d-buildings',
        source: 'openfreemap',
        'source-layer': 'building',
        type: 'fill-extrusion',
        minzoom: 15,
        filter: ['!=', ['get', 'hide_3d'], true],
        paint: {
          'fill-extrusion-color': [
            'interpolate', ['linear'], ['coalesce', ['get', 'render_height'], 0],
            0, 'lightgray', 200, 'royalblue', 400, 'lightblue'
          ],
          'fill-extrusion-height': [
            'interpolate', ['linear'], ['zoom'],
            15, 0, 16, ['coalesce', ['get', 'render_height'], 0]
          ],
          'fill-extrusion-base': [
            'case', ['>=', ['get', 'zoom'], 16],
            ['coalesce', ['get', 'render_min_height'], 0], 0
          ]
        }
      }, labelLayerId);
    });

    map.on("styleimagemissing", (e) => {
      const emptyImage = {
        width: 1,
        height: 1,
        data: new Uint8Array(4),
      };
      map.addImage(e.id, emptyImage as any);
    });

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, [loaderData.lat, loaderData.lng, loaderData.id, navigate]);

  const cityLabel = loaderData.city || "Konum";

  return (
    <div className="relative h-screen w-full overflow-hidden bg-zinc-950">
      <div ref={wrapRef} className="absolute inset-0" />

      <div className="pointer-events-none absolute left-4 top-4 z-[900] flex flex-col gap-3 text-zinc-100">
        <div className="pointer-events-auto flex items-center gap-2 rounded-xl bg-zinc-950/85 px-3 py-2 text-sm shadow-lg ring-1 ring-zinc-700/80 backdrop-blur">
          <MapPin className="size-5 shrink-0 text-violet-400" />
          <span className="font-bold">{cityLabel}</span>
        </div>
        <div className="pointer-events-auto flex items-center gap-2 rounded-xl bg-zinc-950/85 px-3 py-2 text-sm shadow-lg ring-1 ring-zinc-700/80 backdrop-blur">
          <Clock className="size-5 shrink-0 text-amber-300" />
          <span>
            {clock.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </span>
        </div>
        <div className="pointer-events-auto flex items-center gap-2 rounded-xl bg-zinc-950/85 px-3 py-2 text-sm shadow-lg ring-1 ring-zinc-700/80 backdrop-blur">
          <CloudSun className="size-5 shrink-0 text-sky-300" />
          <span>18°C</span>
        </div>
      </div>

      <div className="absolute right-4 top-4 z-[900] flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/settings")}
          className="flex size-12 items-center justify-center overflow-hidden rounded-full border-2 border-zinc-600 bg-zinc-900 shadow-lg ring-2 ring-violet-500/30"
        >
          {loaderData.avatar_url ? (
            <img src={loaderData.avatar_url} alt="" className="size-full object-cover" />
          ) : (
            <span className="text-lg font-bold text-white">{loaderData.name.slice(0, 1)}</span>
          )}
        </button>
        <button
          type="button"
          onClick={() => toast("Boost yakında")}
          className="flex size-12 items-center justify-center rounded-full bg-zinc-900/95 text-violet-300 shadow-lg ring-1 ring-zinc-700"
        >
          <Rocket className="size-5" />
        </button>
        <button
          type="button"
          onClick={() => toast("Etkinlikler yakında")}
          className="flex size-12 items-center justify-center rounded-full bg-zinc-900/95 text-emerald-300 shadow-lg ring-1 ring-zinc-700"
        >
          <Calendar className="size-5" />
        </button>
      </div>

      <FloatingTabBar />
    </div>
  );
}
