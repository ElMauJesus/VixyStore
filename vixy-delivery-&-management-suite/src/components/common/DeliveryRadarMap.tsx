import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Flame, 
  Store, 
  Bike, 
  Compass, 
  Navigation, 
  Layers, 
  Eye, 
  EyeOff, 
  Clock, 
  TrendingUp, 
  ShoppingBag, 
  Sparkles,
  Info,
  Maximize2,
  Radio,
  Gauge,
  Phone,
  MessageSquare,
  ShieldCheck,
  Battery,
  MapPin,
  KeyRound,
  Crosshair
} from 'lucide-react';
import { COMERCIOS_ACTIVOS_CARACAS, ZONAS_CALOR_CARACAS } from '../../data/initialData';
import { useDelivery } from '../../context/DeliveryContext';
import { Conductor } from '../../types/delivery';

export type CartoMapStyle = 'dark' | 'voyager' | 'light';

interface DeliveryRadarMapProps {
  onSelectComercio?: (comercioId: string) => void;
  onSelectDriver?: (driverId: string) => void;
  driverLocation?: { lat: number; lng: number; nombre: string };
  compact?: boolean;
  showAllDrivers?: boolean;
  selectedDriverId?: string | null;
  customApiKey?: string;
  defaultStyle?: CartoMapStyle;
  className?: string;
}

export const DeliveryRadarMap: React.FC<DeliveryRadarMapProps> = ({ 
  onSelectComercio, 
  onSelectDriver,
  driverLocation = { lat: 10.4930, lng: -66.8520, nombre: 'Chacao Centro (Av. Francisco de Miranda)' },
  compact = false,
  showAllDrivers = true,
  selectedDriverId: externalSelectedDriverId = null,
  customApiKey,
  defaultStyle = 'dark',
  className = ''
}) => {
  const { realGpsActive, realGpsCoords, driver, allDrivers, openCall, openChat, cartoApiKey, setCartoApiKey } = useDelivery();
  
  // Basemap & Filter state
  const [mapStyle, setMapStyle] = useState<CartoMapStyle>(defaultStyle);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showComercios, setShowComercios] = useState(true);
  const [selectedComercio, setSelectedComercio] = useState<typeof COMERCIOS_ACTIVOS_CARACAS[0] | null>(null);
  const [selectedZona, setSelectedZona] = useState<typeof ZONAS_CALOR_CARACAS[0] | null>(null);
  const [selectedDriverOnMap, setSelectedDriverOnMap] = useState<Conductor | null>(null);
  const [driverFilter, setDriverFilter] = useState<'todos' | 'disponibles' | 'en_ruta'>('todos');
  const [showApiInfo, setShowApiInfo] = useState(false);
  const [inputApiKey, setInputApiKey] = useState('');

  // Map DOM & Leaflet references
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const driversLayerRef = useRef<L.LayerGroup | null>(null);
  const heatLayerRef = useRef<L.LayerGroup | null>(null);
  const comerciosLayerRef = useRef<L.LayerGroup | null>(null);
  const gpsLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);

  // CARTO API Key: uses prop customApiKey, then cartoApiKey from backend context, then VITE_CARTO_API_KEY from env, or empty string (standard free OSM/CARTO CDN)
  const effectiveApiKey = customApiKey || cartoApiKey || (import.meta as any).env?.VITE_CARTO_API_KEY || '';

  // Get tile URL for the chosen CARTO basemap style
  const getCartoTileUrl = (style: CartoMapStyle) => {
    let baseUrl = '';
    if (style === 'dark') {
      // CARTO Dark Matter
      baseUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    } else if (style === 'voyager') {
      // CARTO Voyager (detailed streets & landmarks)
      baseUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    } else {
      // CARTO Positron (light minimal)
      baseUrl = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
    }

    if (effectiveApiKey) {
      return `${baseUrl}?api_key=${encodeURIComponent(effectiveApiKey)}`;
    }
    return baseUrl;
  };

  // Coordenadas efectivas: prioridad al sensor GPS del dispositivo para el conductor activo
  const effectiveLat = realGpsCoords ? realGpsCoords.lat : (driver?.lat || driverLocation.lat);
  const effectiveLng = realGpsCoords ? realGpsCoords.lng : (driver?.lng || driverLocation.lng);

  // 1. Initialize Leaflet Map Instance
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const initialCenter: [number, number] = [effectiveLat || 10.4912, effectiveLng || -66.8580];

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: compact ? 13 : 14,
      minZoom: 11,
      maxZoom: 19,
      zoomControl: false,
      attributionControl: true
    });

    // Custom Zoom control in bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Initial CARTO tile layer
    const tileLayer = L.tileLayer(getCartoTileUrl(mapStyle), {
      subdomains: 'abcd',
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank" rel="noreferrer">CARTO</a>'
    }).addTo(map);
    tileLayerRef.current = tileLayer;

    // Create Layer Groups
    heatLayerRef.current = L.layerGroup().addTo(map);
    comerciosLayerRef.current = L.layerGroup().addTo(map);
    driversLayerRef.current = L.layerGroup().addTo(map);
    gpsLayerRef.current = L.layerGroup().addTo(map);
    routeLayerRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    // Guarantee full tile render by invalidating size after mount
    const timer1 = setTimeout(() => {
      map.invalidateSize();
    }, 150);
    const timer2 = setTimeout(() => {
      map.invalidateSize();
    }, 450);

    // Handle container resizing smoothly
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(mapContainerRef.current);

    const handleWindowResize = () => {
      map.invalidateSize();
    };
    window.addEventListener('resize', handleWindowResize);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      window.removeEventListener('resize', handleWindowResize);
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Switch Basemap Tiles when mapStyle or apiKey changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }

    const newTileLayer = L.tileLayer(getCartoTileUrl(mapStyle), {
      subdomains: 'abcd',
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions" target="_blank" rel="noreferrer">CARTO</a>'
    }).addTo(mapInstanceRef.current);

    tileLayerRef.current = newTileLayer;
    newTileLayer.bringToBack();
  }, [mapStyle, effectiveApiKey]);

  // 3. Update Heatmap Zones
  useEffect(() => {
    if (!heatLayerRef.current || !mapInstanceRef.current) return;
    heatLayerRef.current.clearLayers();

    if (!showHeatmap) return;

    ZONAS_CALOR_CARACAS.forEach(zona => {
      let strokeColor = '#eab308';
      let fillColor = '#eab308';
      let opacity = 0.35;

      if (zona.nivelDemanda === 'muy_alta') {
        strokeColor = '#ef4444';
        fillColor = '#dc2626';
        opacity = 0.42;
      } else if (zona.nivelDemanda === 'alta') {
        strokeColor = '#f97316';
        fillColor = '#ea580c';
        opacity = 0.38;
      }

      const circle = L.circle([zona.lat, zona.lng], {
        radius: zona.radioMetros,
        color: strokeColor,
        weight: 2,
        dashArray: '4, 4',
        fillColor: fillColor,
        fillOpacity: opacity
      });

      circle.on('click', () => {
        setSelectedZona(zona);
        setSelectedComercio(null);
        setSelectedDriverOnMap(null);
        mapInstanceRef.current?.panTo([zona.lat, zona.lng]);
      });

      // Bind tooltip
      circle.bindTooltip(`
        <div style="font-family: system-ui; padding: 2px 4px; text-align: center;">
          <strong style="color: ${strokeColor}; font-size: 11px;">🔥 ${zona.nombreZona}</strong><br/>
          <span style="font-size: 10px; color: #cbd5e1;">${zona.pedidosPorHora} ped/h • $${zona.ticketPromedioUsd.toFixed(2)} ticket</span>
        </div>
      `, {
        direction: 'top',
        className: 'carto-tooltip',
        permanent: false
      });

      heatLayerRef.current?.addLayer(circle);
    });
  }, [showHeatmap]);

  // 4. Update Comercios (Active Stores)
  useEffect(() => {
    if (!comerciosLayerRef.current || !mapInstanceRef.current) return;
    comerciosLayerRef.current.clearLayers();

    if (!showComercios) return;

    COMERCIOS_ACTIVOS_CARACAS.forEach(com => {
      // Create rich HTML icon for store
      const storeHtml = `
        <div class="relative group cursor-pointer transition-transform duration-200 hover:scale-115">
          <div class="w-8 h-8 rounded-xl bg-orange-500 text-slate-950 flex items-center justify-center shadow-lg border-2 border-slate-900 font-bold text-xs">
            🏪
          </div>
          <div class="absolute -bottom-1 -right-1 px-1 py-0.2 rounded-full bg-slate-950 text-amber-400 border border-amber-500/50 text-[8px] font-black font-mono shadow-xs">
            ${com.pedidosEnCola}
          </div>
        </div>
      `;

      const storeIcon = L.divIcon({
        className: 'custom-comercio-pin',
        html: storeHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -18]
      });

      const marker = L.marker([com.lat, com.lng], { icon: storeIcon });

      marker.on('click', () => {
        setSelectedComercio(com);
        setSelectedZona(null);
        setSelectedDriverOnMap(null);
        if (onSelectComercio) onSelectComercio(com.id);
        mapInstanceRef.current?.panTo([com.lat, com.lng]);
      });

      marker.bindTooltip(`
        <div style="padding: 2px 4px;">
          <strong style="color: #f97316; font-size: 11px;">${com.nombre}</strong><br/>
          <span style="font-size: 10px; color: #94a3b8;">${com.categoria} • ${com.tiempoPromedioDespachoMin} min despacho</span>
        </div>
      `, { direction: 'top' });

      comerciosLayerRef.current?.addLayer(marker);
    });
  }, [showComercios, onSelectComercio]);

  // 5. Update Drivers Layer (Motorizados)
  useEffect(() => {
    if (!driversLayerRef.current || !mapInstanceRef.current) return;
    driversLayerRef.current.clearLayers();

    const activeDriverId = externalSelectedDriverId || selectedDriverOnMap?.id;

    // Filter drivers
    const driversToRender = allDrivers.map(d => {
      if (d.id === driver?.id && realGpsCoords) {
        return {
          ...d,
          lat: realGpsCoords.lat,
          lng: realGpsCoords.lng,
          velocidadKmh: realGpsCoords.speed || d.velocidadKmh || 0,
          precisionGps: realGpsCoords.accuracy || d.precisionGps || 5
        };
      }
      return d;
    }).filter(d => {
      if (!showAllDrivers && d.id !== driver?.id) return false;
      if (driverFilter === 'disponibles') return d.disponible;
      if (driverFilter === 'en_ruta') return !d.disponible;
      return true;
    });

    driversToRender.forEach(drv => {
      const isSelected = activeDriverId === drv.id;
      const isAvailable = drv.disponible;
      const ringColor = isAvailable ? '#10b981' : '#3b82f6';
      const badgeBg = isAvailable ? 'bg-emerald-500' : 'bg-blue-500';

      const driverHtml = `
        <div class="relative cursor-pointer transition-all duration-300 ${isSelected ? 'scale-125 z-50' : 'hover:scale-115'}">
          <!-- Pulse animation for live tracking -->
          <div class="absolute -inset-1.5 rounded-full ${isAvailable ? 'bg-emerald-500/30' : 'bg-blue-500/30'} animate-ping pointer-events-none"></div>
          
          <!-- Outer circular avatar pin -->
          <div class="relative w-10 h-10 rounded-full border-2 ${isSelected ? 'border-amber-400 shadow-amber-500/50 shadow-xl' : (isAvailable ? 'border-emerald-400 shadow-emerald-500/40 shadow-lg' : 'border-blue-400 shadow-blue-500/40 shadow-lg')} bg-slate-900 overflow-hidden flex items-center justify-center">
            <img src="${drv.fotoUrl}" alt="${drv.nombre}" class="w-full h-full object-cover" onerror="this.src='https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'" />
          </div>

          <!-- Bottom Bike Badge -->
          <div class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-full ${badgeBg} text-slate-950 font-black text-[8px] flex items-center gap-0.5 shadow-md border border-slate-900 whitespace-nowrap">
            <span>🏍️</span>
            <span>${drv.velocidadKmh || 0}k</span>
          </div>

          ${isSelected ? `
            <div class="absolute -top-5 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 font-bold text-[8px] uppercase tracking-wider shadow-md whitespace-nowrap">
              ${drv.nombre.split(' ')[0]}
            </div>
          ` : ''}
        </div>
      `;

      const driverIcon = L.divIcon({
        className: 'custom-driver-pin',
        html: driverHtml,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -22]
      });

      const marker = L.marker([drv.lat, drv.lng], { 
        icon: driverIcon,
        zIndexOffset: isSelected ? 1000 : 100
      });

      marker.on('click', () => {
        setSelectedDriverOnMap(drv);
        setSelectedComercio(null);
        setSelectedZona(null);
        if (onSelectDriver) onSelectDriver(drv.id);
        mapInstanceRef.current?.flyTo([drv.lat, drv.lng], 15, { duration: 0.8 });
      });

      marker.bindTooltip(`
        <div style="padding: 2px 4px;">
          <strong style="color: ${ringColor}; font-size: 11px;">${drv.nombre} ${drv.apellido}</strong><br/>
          <span style="font-size: 10px; color: #cbd5e1;">${drv.moto.marca} ${drv.moto.modelo} [${drv.moto.placa}]</span><br/>
          <span style="font-size: 9px; color: ${isAvailable ? '#34d399' : '#60a5fa'}; font-weight: bold;">
            ${isAvailable ? '● DISPONIBLE' : '● EN RUTA A ENTREGA'} • ⚡ ${drv.velocidadKmh || 0} km/h
          </span>
        </div>
      `, { direction: 'top' });

      driversLayerRef.current?.addLayer(marker);
    });
  }, [allDrivers, driverFilter, externalSelectedDriverId, selectedDriverOnMap, showAllDrivers, realGpsCoords, onSelectDriver]);

  // 6. Real GPS Beacon Layer
  useEffect(() => {
    if (!gpsLayerRef.current || !mapInstanceRef.current) return;
    gpsLayerRef.current.clearLayers();

    if (!realGpsActive || !realGpsCoords) return;

    // Accuracy Circle
    const accuracyCircle = L.circle([realGpsCoords.lat, realGpsCoords.lng], {
      radius: realGpsCoords.accuracy || 15,
      color: '#06b6d4',
      weight: 1.5,
      fillColor: '#06b6d4',
      fillOpacity: 0.15
    });

    // High tech pulsing beacon marker
    const beaconHtml = `
      <div class="relative flex items-center justify-center">
        <div class="w-6 h-6 rounded-full bg-cyan-500/30 animate-ping absolute"></div>
        <div class="w-3.5 h-3.5 rounded-full bg-cyan-400 border-2 border-white shadow-cyan-400/60 shadow-lg relative z-10"></div>
      </div>
    `;

    const beaconIcon = L.divIcon({
      className: 'gps-beacon-icon',
      html: beaconHtml,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    const beaconMarker = L.marker([realGpsCoords.lat, realGpsCoords.lng], {
      icon: beaconIcon,
      zIndexOffset: 2000
    }).bindTooltip('<strong style="color: #22d3ee;">📍 Tu Sensor GPS en Vivo</strong>', { direction: 'top' });

    gpsLayerRef.current.addLayer(accuracyCircle);
    gpsLayerRef.current.addLayer(beaconMarker);
  }, [realGpsActive, realGpsCoords]);

  // Synchronize externalSelectedDriverId with map selection
  useEffect(() => {
    if (externalSelectedDriverId) {
      const found = allDrivers.find(d => d.id === externalSelectedDriverId);
      if (found) {
        setSelectedDriverOnMap(found);
        mapInstanceRef.current?.flyTo([found.lat, found.lng], 15, { duration: 0.8 });
      }
    }
  }, [externalSelectedDriverId, allDrivers]);

  // Recenter map functions
  const recenterCaracas = () => {
    mapInstanceRef.current?.flyTo([10.4912, -66.8580], 14, { duration: 0.8 });
  };

  const recenterUserGps = () => {
    if (realGpsCoords) {
      mapInstanceRef.current?.flyTo([realGpsCoords.lat, realGpsCoords.lng], 16, { duration: 0.8 });
    } else if (driver?.lat && driver?.lng) {
      mapInstanceRef.current?.flyTo([driver.lat, driver.lng], 15, { duration: 0.8 });
    } else {
      recenterCaracas();
    }
  };

  return (
    <div className={`relative bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col ${className || (compact ? 'h-[380px] min-h-[380px]' : 'h-[620px] lg:h-full min-h-[520px]')}`}>
      {/* Top Map Toolbar with CARTO OpenSource controls */}
      <div className="p-2.5 sm:p-3 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 flex items-center justify-between z-20 gap-2 shrink-0 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-xs shrink-0">
            <Compass className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Radar Caracas & Flota en Vivo</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                CARTO OpenSource
              </span>
              {realGpsActive && (
                <span className="text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  GPS SATELITAL
                </span>
              )}
            </h4>
            <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
              <span>OpenStreetMap / CARTO Basemaps</span>
              {realGpsCoords && (
                <span className="text-cyan-400 font-bold hidden sm:inline">
                  • ±{realGpsCoords.accuracy}m • {realGpsCoords.speed} km/h
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Right Toolbar Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap ml-auto">
          {/* CARTO Style Selector */}
          <div className="flex items-center bg-slate-800/90 p-0.5 rounded-xl border border-slate-700 text-[10px]">
            <button
              type="button"
              onClick={() => setMapStyle('dark')}
              className={`px-2 py-0.8 rounded-lg font-bold transition cursor-pointer ${
                mapStyle === 'dark' ? 'bg-slate-700 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title="CARTO Dark Matter (Nocturno)"
            >
              Dark
            </button>
            <button
              type="button"
              onClick={() => setMapStyle('voyager')}
              className={`px-2 py-0.8 rounded-lg font-bold transition cursor-pointer ${
                mapStyle === 'voyager' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title="CARTO Voyager (Calles & Comercios)"
            >
              Calles
            </button>
            <button
              type="button"
              onClick={() => setMapStyle('light')}
              className={`px-2 py-0.8 rounded-lg font-bold transition cursor-pointer ${
                mapStyle === 'light' ? 'bg-slate-200 text-slate-900 shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title="CARTO Positron (Claro)"
            >
              Claro
            </button>
          </div>

          {/* Driver Status Filter */}
          <div className="flex items-center bg-slate-800/90 p-0.5 rounded-xl border border-slate-700 text-[10px]">
            <button
              type="button"
              onClick={() => setDriverFilter('todos')}
              className={`px-2 py-0.8 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
                driverFilter === 'todos' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title="Mostrar todos los motorizados"
            >
              <Bike className="w-3 h-3" />
              <span>Flota ({allDrivers.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setDriverFilter('disponibles')}
              className={`px-1.5 py-0.8 rounded-lg font-bold transition cursor-pointer ${
                driverFilter === 'disponibles' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title="Solo disponibles"
            >
              Libres
            </button>
            <button
              type="button"
              onClick={() => setDriverFilter('en_ruta')}
              className={`px-1.5 py-0.8 rounded-lg font-bold transition cursor-pointer ${
                driverFilter === 'en_ruta' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title="En reparto"
            >
              Ruta
            </button>
          </div>

          {/* Heatmap Toggle */}
          <button
            type="button"
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`px-2 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1 transition cursor-pointer ${
              showHeatmap
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Activar o desactivar zonas de demanda y calor"
          >
            <Flame className="w-3 h-3" />
            <span>Calor {showHeatmap ? 'ON' : 'OFF'}</span>
          </button>

          {/* Comercios Toggle */}
          <button
            type="button"
            onClick={() => setShowComercios(!showComercios)}
            className={`px-2 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1 transition cursor-pointer ${
              showComercios
                ? 'bg-orange-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Mostrar / Ocultar comercios asociados"
          >
            <Store className="w-3 h-3" />
            <span>Locales</span>
          </button>

          {/* Center Caracas / GPS */}
          <button
            type="button"
            onClick={realGpsActive ? recenterUserGps : recenterCaracas}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs transition cursor-pointer"
            title={realGpsActive ? 'Centrar en mi ubicación GPS' : 'Centrar en Caracas'}
          >
            <Crosshair className="w-3.5 h-3.5" />
          </button>

          {/* CARTO API Key Info Modal Button */}
          <button
            type="button"
            onClick={() => setShowApiInfo(!showApiInfo)}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl text-xs transition cursor-pointer"
            title="Detalles de mapas OpenSource & CARTO API Key"
          >
            <KeyRound className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Leaflet Map Stage Container */}
      <div className="relative flex-1 w-full h-full min-h-[460px] overflow-hidden">
        <div 
          ref={mapContainerRef} 
          className="w-full h-full bg-[#0b1120] select-none"
        />

        {/* Floating Legend / Quick Stats Pill */}
        <div className="absolute bottom-3 left-3 bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-800 text-[10px] text-slate-300 space-y-1 z-20 shadow-xl pointer-events-auto">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Libres ({allDrivers.filter(d => d.disponible).length})
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              En Ruta ({allDrivers.filter(d => !d.disponible).length})
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              Comercios ({COMERCIOS_ACTIVOS_CARACAS.length})
            </span>
            {showHeatmap && (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                Zonas Demanda
              </span>
            )}
          </div>
        </div>

        {/* CARTO API Key Info Flyout */}
        {showApiInfo && (
          <div className="absolute top-3 left-3 max-w-sm w-84 bg-slate-900/95 backdrop-blur-md p-4 rounded-2xl border border-amber-500/50 shadow-2xl z-30 text-xs space-y-2.5 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                <KeyRound className="w-4 h-4 shrink-0" />
                <span>Gestión de Mapas OpenSource (CARTO)</span>
              </div>
              <button
                type="button"
                onClick={() => setShowApiInfo(false)}
                className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-bold text-xs transition cursor-pointer"
              >
                ×
              </button>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              La plataforma utiliza mapas OpenSource de <strong>CARTO.com</strong> sobre <strong>OpenStreetMap</strong>. Funciona de inmediato sin API key obligatoria. Si posees una API Key privada de CARTO, puedes guardarla aquí.
            </p>
            <div className="p-2.5 bg-slate-800/80 rounded-xl space-y-1.5 text-[10px] font-mono border border-slate-700/60">
              <div className="flex justify-between text-slate-400">
                <span>Proveedor Activo:</span>
                <strong className="text-emerald-400">CARTO CDN Tiles (OSM)</strong>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Estado Clave:</span>
                <strong className={effectiveApiKey ? 'text-emerald-400' : 'text-amber-400'}>
                  {effectiveApiKey ? 'API Key Configurada' : 'Mosaicos Libres (Sin Key)'}
                </strong>
              </div>
              {effectiveApiKey && (
                <div className="text-slate-300 truncate pt-0.5">
                  Clave: {effectiveApiKey.slice(0, 8)}••••••••
                </div>
              )}
            </div>

            {/* Input to set / update CARTO API Key */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[10px] uppercase font-bold text-slate-400 block">
                Actualizar Clave CARTO (Backend Web):
              </label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={inputApiKey}
                  onChange={(e) => setInputApiKey(e.target.value)}
                  placeholder={effectiveApiKey ? 'Reemplazar API Key...' : 'Pegar CARTO API Key...'}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white placeholder-slate-500 font-mono focus:outline-hidden focus:border-amber-400"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (inputApiKey.trim()) {
                      setCartoApiKey(inputApiKey.trim());
                      setInputApiKey('');
                    }
                  }}
                  className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-lg text-xs transition cursor-pointer"
                >
                  Guardar
                </button>
                {effectiveApiKey && (
                  <button
                    type="button"
                    onClick={() => {
                      setCartoApiKey('');
                      setInputApiKey('');
                    }}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-red-400 font-bold rounded-lg text-xs transition cursor-pointer"
                    title="Limpiar clave y usar CDN libre"
                  >
                    Borrar
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Selected Driver Details Flyout */}
        {selectedDriverOnMap && (
          <div className="absolute top-3 right-3 max-w-xs w-72 bg-slate-900/95 backdrop-blur-md p-4 rounded-3xl border border-emerald-500/50 shadow-2xl z-30 text-xs space-y-2.5 animate-in fade-in slide-in-from-top-2 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <img
                  src={selectedDriverOnMap.fotoUrl}
                  alt={selectedDriverOnMap.nombre}
                  className="w-9 h-9 rounded-xl object-cover border-2 border-emerald-400 shrink-0"
                />
                <div className="min-w-0">
                  <h5 className="font-bold text-white text-xs truncate">
                    {selectedDriverOnMap.nombre} {selectedDriverOnMap.apellido}
                  </h5>
                  <div className="flex items-center gap-1 text-[10px]">
                    <span className={`w-1.5 h-1.5 rounded-full ${selectedDriverOnMap.disponible ? 'bg-emerald-400 animate-ping' : 'bg-blue-400'}`} />
                    <span className={selectedDriverOnMap.disponible ? 'text-emerald-400 font-semibold' : 'text-blue-400 font-semibold'}>
                      {selectedDriverOnMap.disponible ? 'Disponible para pedidos' : 'En camino a entrega'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDriverOnMap(null)}
                className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-bold text-xs transition cursor-pointer"
              >
                ×
              </button>
            </div>

            {/* Vehicle & Telemetry Details */}
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="p-2 bg-slate-800/80 rounded-xl space-y-0.5">
                <span className="text-slate-400 block font-medium">Moto Asignada</span>
                <span className="font-bold text-slate-200 truncate block">
                  {selectedDriverOnMap.moto.marca} {selectedDriverOnMap.moto.modelo}
                </span>
                <span className="font-mono text-emerald-400 block">[{selectedDriverOnMap.moto.placa}]</span>
              </div>
              <div className="p-2 bg-slate-800/80 rounded-xl space-y-0.5">
                <span className="text-slate-400 block font-medium">Velocidad / Precisión</span>
                <span className="font-mono font-bold text-white text-xs block">
                  ⚡ {selectedDriverOnMap.velocidadKmh || 0} km/h
                </span>
                <span className="text-slate-400 font-mono text-[9px] block">
                  GPS: ±{selectedDriverOnMap.precisionGps || 5}m
                </span>
              </div>
            </div>

            <div className="p-2 bg-slate-800/50 rounded-xl text-[10px] space-y-1">
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Sector actual:</span>
                <span className="font-medium truncate max-w-[140px] text-right">{selectedDriverOnMap.ubicacionActual}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Rating e historial:</span>
                <span className="font-bold text-amber-400">⭐ {selectedDriverOnMap.rating} ({selectedDriverOnMap.totalEntregas} viajes)</span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => openCall(selectedDriverOnMap.nombre, selectedDriverOnMap.telefono, selectedDriverOnMap.fotoUrl)}
                className="py-1.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-[11px] flex items-center justify-center gap-1 transition cursor-pointer shadow-xs"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Llamar</span>
              </button>
              <button
                type="button"
                onClick={() => openChat(`conductor-${selectedDriverOnMap.id}`, `${selectedDriverOnMap.nombre} ${selectedDriverOnMap.apellido}`)}
                className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-[11px] flex items-center justify-center gap-1 transition cursor-pointer border border-slate-700"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chat</span>
              </button>
            </div>
          </div>
        )}

        {/* Selected Merchant Details Flyout */}
        {selectedComercio && (
          <div className="absolute top-3 right-3 max-w-xs w-64 bg-slate-900/95 backdrop-blur-md p-3.5 rounded-2xl border border-orange-500/50 shadow-2xl z-30 text-xs space-y-2 animate-in fade-in slide-in-from-top-2 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div>
                <span className="text-[9px] uppercase font-bold text-orange-400 block">Comercio Activo</span>
                <h5 className="font-bold text-white text-xs truncate">{selectedComercio.nombre}</h5>
              </div>
              <button
                type="button"
                onClick={() => setSelectedComercio(null)}
                className="text-slate-400 hover:text-white font-bold text-sm cursor-pointer"
              >
                ×
              </button>
            </div>

            <p className="text-[11px] text-slate-300">{selectedComercio.direccion}</p>

            <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
              <div className="p-2 bg-slate-800/60 rounded-xl">
                <span className="text-slate-400 block font-medium">Despacho Promedio</span>
                <span className="font-mono font-bold text-emerald-400">⏱️ {selectedComercio.tiempoPromedioDespachoMin} min</span>
              </div>
              <div className="p-2 bg-slate-800/60 rounded-xl">
                <span className="text-slate-400 block font-medium">Pedidos en Cola</span>
                <span className="font-mono font-bold text-amber-400">📦 {selectedComercio.pedidosEnCola} órdenes</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
              <span>Zona: <strong>{selectedComercio.zona}</strong></span>
              <span className="text-emerald-400 font-bold">● Local Abierto</span>
            </div>
          </div>
        )}

        {/* Selected Heat Zone Details Flyout */}
        {selectedZona && (
          <div className="absolute top-3 right-3 max-w-xs w-64 bg-slate-900/95 backdrop-blur-md p-3.5 rounded-2xl border border-red-500/50 shadow-2xl z-30 text-xs space-y-2 animate-in fade-in slide-in-from-top-2 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-red-500 animate-bounce" />
                <div>
                  <span className="text-[9px] uppercase font-bold text-red-400 block">Zona de Alta Demanda</span>
                  <h5 className="font-bold text-white text-xs">{selectedZona.nombreZona}</h5>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedZona(null)}
                className="text-slate-400 hover:text-white font-bold text-sm cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="p-2 bg-red-950/40 border border-red-900/50 rounded-xl space-y-1">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-300">Actividad de Compras:</span>
                <span className="font-mono font-black text-red-400">{selectedZona.pedidosPorHora} pedidos / hora</span>
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-400">
                <span>Ticket Promedio:</span>
                <span className="font-mono font-bold text-emerald-400">${selectedZona.ticketPromedioUsd.toFixed(2)} USD</span>
              </div>
            </div>

            <p className="text-[10px] text-slate-400">
              Concentra <strong>{selectedZona.comerciosActivos} comercios activos</strong> de alta demanda en el corredor metropolitano.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
