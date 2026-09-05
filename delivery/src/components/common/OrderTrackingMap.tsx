import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Compass, Navigation, Store, Bike, MapPin, Layers } from 'lucide-react';

interface OrderTrackingMapProps {
  storeLat: number;
  storeLng: number;
  storeName: string;
  driverLat?: number;
  driverLng?: number;
  driverName?: string;
  driverPhoto?: string;
  clientLat?: number;
  clientLng?: number;
  clientAddress?: string;
  orderStatus: string;
  customApiKey?: string;
}

export const OrderTrackingMap: React.FC<OrderTrackingMapProps> = ({
  storeLat,
  storeLng,
  storeName,
  driverLat,
  driverLng,
  driverName = 'Motorizado Vixy',
  driverPhoto,
  clientLat = 10.4900,
  clientLng = -66.8520,
  clientAddress = 'Av. Francisco de Miranda, Chacao',
  orderStatus,
  customApiKey
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const [mapStyle, setMapStyle] = useState<'dark' | 'voyager'>('dark');

  const effectiveApiKey = customApiKey || (import.meta as any).env?.VITE_CARTO_API_KEY || '';

  const getTileUrl = (style: 'dark' | 'voyager') => {
    const base = style === 'dark'
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    return effectiveApiKey ? `${base}?api_key=${encodeURIComponent(effectiveApiKey)}` : base;
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [storeLat, storeLng],
      zoom: 14,
      zoomControl: false,
      attributionControl: true
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const tile = L.tileLayer(getTileUrl(mapStyle), {
      subdomains: 'abcd',
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions" target="_blank" rel="noreferrer">CARTO</a>'
    }).addTo(map);
    tileLayerRef.current = tile;

    mapInstanceRef.current = map;

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update tile when style changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }
    const tile = L.tileLayer(getTileUrl(mapStyle), {
      subdomains: 'abcd',
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions" target="_blank" rel="noreferrer">CARTO</a>'
    }).addTo(mapInstanceRef.current);
    tileLayerRef.current = tile;
    tile.bringToBack();
  }, [mapStyle, effectiveApiKey]);

  // Update markers and route lines
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing overlay layers (except tile)
    map.eachLayer((layer) => {
      if (layer !== tileLayerRef.current) {
        map.removeLayer(layer);
      }
    });

    const bounds: [number, number][] = [];

    // 1. Store Marker
    const storeIconHtml = `
      <div class="relative cursor-pointer transition hover:scale-110">
        <div class="w-8 h-8 rounded-xl bg-orange-500 text-slate-950 flex items-center justify-center font-bold text-sm shadow-lg border-2 border-slate-900">
          🏪
        </div>
      </div>
    `;
    const storeMarker = L.marker([storeLat, storeLng], {
      icon: L.divIcon({
        className: 'tracking-store-pin',
        html: storeIconHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      })
    }).bindTooltip(`<strong>${storeName}</strong><br/><span style="font-size:10px; color:#94a3b8;">Origen del pedido</span>`, { direction: 'top' });
    storeMarker.addTo(map);
    bounds.push([storeLat, storeLng]);

    // 2. Client Destination Marker
    const clientIconHtml = `
      <div class="relative cursor-pointer transition hover:scale-110">
        <div class="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-lg border-2 border-slate-900">
          📍
        </div>
      </div>
    `;
    const clientMarker = L.marker([clientLat, clientLng], {
      icon: L.divIcon({
        className: 'tracking-client-pin',
        html: clientIconHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      })
    }).bindTooltip(`<strong>Entrega a Cliente</strong><br/><span style="font-size:10px; color:#94a3b8;">${clientAddress}</span>`, { direction: 'top' });
    clientMarker.addTo(map);
    bounds.push([clientLat, clientLng]);

    // 3. Driver Marker (if assigned)
    const effectiveDriverLat = driverLat || (storeLat + clientLat) / 2;
    const effectiveDriverLng = driverLng || (storeLng + clientLng) / 2;

    if (driverLat !== undefined && driverLng !== undefined) {
      const driverIconHtml = `
        <div class="relative cursor-pointer transition hover:scale-110">
          <div class="absolute -inset-2 rounded-full bg-emerald-500/30 animate-ping"></div>
          <div class="relative w-10 h-10 rounded-full border-2 border-emerald-400 bg-slate-900 overflow-hidden shadow-emerald-500/50 shadow-xl flex items-center justify-center">
            <img src="${driverPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}" alt="${driverName}" class="w-full h-full object-cover" />
          </div>
          <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1 rounded-full bg-emerald-500 text-slate-950 font-black text-[8px] whitespace-nowrap">
            🏍️ En Moto
          </div>
        </div>
      `;

      const driverMarker = L.marker([effectiveDriverLat, effectiveDriverLng], {
        icon: L.divIcon({
          className: 'tracking-driver-pin',
          html: driverIconHtml,
          iconSize: [40, 40],
          iconAnchor: [20, 20]
        }),
        zIndexOffset: 1000
      }).bindTooltip(`<strong>${driverName}</strong><br/><span style="font-size:10px; color:#34d399;">Repartidor en camino</span>`, { direction: 'top' });
      driverMarker.addTo(map);
      bounds.push([effectiveDriverLat, effectiveDriverLng]);

      // Draw route polyline from Driver to Client
      const routeLine = L.polyline([
        [storeLat, storeLng],
        [effectiveDriverLat, effectiveDriverLng],
        [clientLat, clientLng]
      ], {
        color: '#10b981',
        weight: 3.5,
        opacity: 0.75,
        dashArray: '6, 8',
        lineCap: 'round'
      });
      routeLine.addTo(map);
    } else {
      // Connect store to client directly
      const directLine = L.polyline([
        [storeLat, storeLng],
        [clientLat, clientLng]
      ], {
        color: '#f97316',
        weight: 3,
        opacity: 0.6,
        dashArray: '5, 5'
      });
      directLine.addTo(map);
    }

    if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
    }
  }, [storeLat, storeLng, storeName, driverLat, driverLng, driverName, driverPhoto, clientLat, clientLng, clientAddress, orderStatus]);

  return (
    <div className="relative w-full h-56 rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col">
      {/* Mini top toolbar */}
      <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-20 pointer-events-none">
        <div className="px-2 py-1 bg-slate-950/80 backdrop-blur-md rounded-lg border border-slate-800 text-[10px] text-white flex items-center gap-1.5 pointer-events-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold">CARTO OpenSource</span>
          <span className="text-slate-400 text-[9px]">• Caracas</span>
        </div>

        <div className="flex items-center bg-slate-950/80 backdrop-blur-md p-0.5 rounded-lg border border-slate-800 text-[10px] pointer-events-auto">
          <button
            type="button"
            onClick={() => setMapStyle('dark')}
            className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
              mapStyle === 'dark' ? 'bg-slate-700 text-white' : 'text-slate-400'
            }`}
          >
            Dark
          </button>
          <button
            type="button"
            onClick={() => setMapStyle('voyager')}
            className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
              mapStyle === 'voyager' ? 'bg-amber-600 text-white' : 'text-slate-400'
            }`}
          >
            Calles
          </button>
        </div>
      </div>

      <div ref={mapContainerRef} className="w-full h-full bg-[#0b1120]" />
    </div>
  );
};
