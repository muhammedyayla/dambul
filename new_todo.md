```markdown
# TODO.md — Mapbox → MapLibre Geçişi

## TASK 1 — Paket değişimi

- `npm uninstall mapbox-gl @types/mapbox-gl`
- `npm install maplibre-gl`
- `main.tsx`'te mapbox CSS import'unu şununla değiştir:
  `import 'maplibre-gl/dist/maplibre-gl.css'`

---

## TASK 2 — MapScreen.tsx yeniden yaz

- Tüm `mapboxgl` import ve referanslarını `maplibregl` ile değiştir
- `mapboxgl.accessToken` satırını tamamen sil
- Map init:

```typescript
const map = new maplibregl.Map({
  container: mapContainer.current,
  style: 'https://tiles.openfreemap.org/styles/bright',
  center: [28.9784, 41.0082],
  zoom: 12,
  pitch: 45,
  bearing: -17.6,
  canvasContextAttributes: { antialias: true }
})
```

- `map.on('load')` içinde 3D bina katmanı ekle:

```typescript
const layers = map.getStyle().layers
let labelLayerId
for (let i = 0; i < layers.length; i++) {
  if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
    labelLayerId = layers[i].id
    break
  }
}
map.addSource('openfreemap', {
  url: 'https://tiles.openfreemap.org/planet',
  type: 'vector'
})
map.addLayer({
  id: '3d-buildings',
  source: 'openfreemap',
  'source-layer': 'building',
  type: 'fill-extrusion',
  minzoom: 15,
  filter: ['!=', ['get', 'hide_3d'], true],
  paint: {
    'fill-extrusion-color': [
      'interpolate', ['linear'], ['get', 'render_height'],
      0, 'lightgray', 200, 'royalblue', 400, 'lightblue'
    ],
    'fill-extrusion-height': [
      'interpolate', ['linear'], ['zoom'],
      15, 0, 16, ['get', 'render_height']
    ],
    'fill-extrusion-base': [
      'case', ['>=', ['get', 'zoom'], 16],
      ['get', 'render_min_height'], 0
    ]
  }
}, labelLayerId)
```

- Heatmap ve kullanıcı marker mantığını koru, sadece `mapboxgl` → `maplibregl`
- Mevcut overlay'lere dokunma:
  - Sol üst: konum + saat + hava
  - Sağ üst: avatar + boost + events butonları
  - Alt: FloatingTabBar

---

## TASK 3 — Vite config temizliği

- `vite.config.ts`'ten `MAP_BOX_TOKEN` inject satırını kaldır
- `vite-env.d.ts`'ten `VITE_MAP_BOX_TOKEN` veya `MAP_BOX_TOKEN` tanımını kaldır
- `.env`'deki `map_box_token` değişkenine artık gerek yok (yorum  satırı yap)
``` 