import { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  Navigation, 
  MapPin, 
  Compass, 
  User as UserIcon,
  LogOut,
  ChevronDown,
  Volume2,
  VolumeX,
  Clock,
  Route as RouteIcon,
  Loader2
} from 'lucide-react';
import { Map, type MapRef, MapMarker, MapControls, MarkerContent, MapRoute, MarkerLabel } from '@/components/ui/map';

interface DriverDashboardProps {
  onLogout: () => void;
}

interface RouteData {
  coordinates: [number, number][];
  duration: number; // seconds
  distance: number; // meters
}

const mapStyles = {
  default: undefined,
  openstreetmap: 'https://tiles.openfreemap.org/styles/bright',
  openstreetmap3d: 'https://tiles.openfreemap.org/styles/liberty',
};

type StyleKey = keyof typeof mapStyles;

function formatDuration(seconds: number): string {
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} mins`;
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return `${hours}h ${remainingMins}m`;
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

export default function DriverDashboard({ onLogout }: DriverDashboardProps) {
  // Patient details state
  const [selectedCondition, setSelectedCondition] = useState<string>('cardiac');
  const [severity, setSeverity] = useState<number>(5);
  const [age, setAge] = useState<string>('45');
  const [bloodGroup, setBloodGroup] = useState<string>('Select');
  const [locationMode, setLocationMode] = useState<'auto' | 'manual'>('auto');

  // Simulation states
  const [incidentState, setIncidentState] = useState<'idle' | 'navigating'>('idle');
  const [soundMuted, setSoundMuted] = useState(false);
  const [eta, setEta] = useState(720); // 12 minutes in seconds
  const [gpsLog, setGpsLog] = useState('28.6139° N, 77.2090° E');
  
  // Routing states
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // mapcn Map states
  const mapRef = useRef<MapRef>(null);
  const [style, setStyle] = useState<StyleKey>('default');
  const [ambulancePosition, setAmbulancePosition] = useState<[number, number]>([77.2090, 28.6139]); // [lng, lat]
  const [mapCenter, setMapCenter] = useState<[number, number]>([77.2090, 28.6139]);
  const hospitalCoords: [number, number] = [77.3724, 28.5186]; // Jaypee Hospital Noida coordinates [lng, lat]
  
  const selectedStyle = mapStyles[style];
  const is3D = style === 'openstreetmap3d';

  // Apply pitch for 3D map
  useEffect(() => {
    mapRef.current?.easeTo({ pitch: is3D ? 60 : 0, duration: 500 });
  }, [is3D]);

  // Auto Geolocation detection when locationMode is 'auto'
  useEffect(() => {
    if (locationMode === 'auto' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lng = pos.coords.longitude;
          const lat = pos.coords.latitude;
          setAmbulancePosition([lng, lat]);
          setMapCenter([lng, lat]);
          setGpsLog(`${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`);
          
          mapRef.current?.flyTo({
            center: [lng, lat],
            zoom: 13,
            duration: 1500
          });
        },
        (err) => {
          console.error('Error getting Geolocation:', err);
        },
        { enableHighAccuracy: true }
      );
    }
  }, [locationMode]);

  // Fetch routes from OSRM
  const fetchRoutes = async (startCoords: [number, number], endCoords: [number, number]) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${startCoords[0]},${startCoords[1]};${endCoords[0]},${endCoords[1]}?overview=full&geometries=geojson&alternatives=true`
      );
      const data = await response.json();

      if (data.routes?.length > 0) {
        const routeData: RouteData[] = data.routes.map(
          (route: any) => ({
            coordinates: route.geometry.coordinates,
            duration: route.duration,
            distance: route.distance,
          })
        );
        setRoutes(routeData);
        setSelectedIndex(0);
        setEta(routeData[0].duration);
      }
    } catch (error) {
      console.error('Failed to fetch routes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Sync ETA to selected route duration
  useEffect(() => {
    if (routes[selectedIndex]) {
      setEta(routes[selectedIndex].duration);
    }
  }, [selectedIndex, routes]);

  // Simulated movement/ETA countdown when navigating
  useEffect(() => {
    let timer: any;
    if (incidentState === 'navigating' && eta > 0) {
      timer = setInterval(() => {
        setEta((prev) => Math.max(0, prev - 1));
        
        // Slightly update coordinate path to simulate movement
        setAmbulancePosition((prev) => {
          const nextLng = prev[0] + 0.00003;
          const nextLat = prev[1] + 0.00002;
          setGpsLog(`${nextLat.toFixed(4)}° N, ${nextLng.toFixed(4)}° E`);
          
          // Fly to updated position to keep it in view
          mapRef.current?.easeTo({
            center: [nextLng, nextLat],
            duration: 1000
          });
          
          return [nextLng, nextLat];
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [incidentState, eta]);

  const handleSuggest = () => {
    setIncidentState('navigating');
    fetchRoutes(ambulancePosition, hospitalCoords);
  };

  const handleComplete = () => {
    setIncidentState('idle');
    setRoutes([]);
  };

  // Get severity text/color class
  const getSeverityInfo = (val: number) => {
    if (val <= 3) return { text: 'Mild', color: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' };
    if (val <= 7) return { text: 'High', color: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' };
    return { text: 'Critical', color: 'bg-red-500/10 text-red-400 border border-red-500/20' };
  };

  const severityInfo = getSeverityInfo(severity);

  // Conditions list matching the screenshot
  const conditions = [
    { id: 'cardiac', label: 'Cardiac', icon: '❤️' },
    { id: 'trauma', label: 'Trauma', icon: '💊' },
    { id: 'neuro', label: 'Neuro', icon: '🧠' },
    { id: 'burns', label: 'Burns', icon: '🔥' },
    { id: 'maternity', label: 'Maternity', icon: '🤰' },
    { id: 'respiratory', label: 'Respiratory', icon: '🫁' }
  ];

  // Sort routes: non-selected first, selected last (renders on top)
  const sortedRoutes = routes
    .map((route, index) => ({ route, index }))
    .sort((a, b) => {
      if (a.index === selectedIndex) return 1;
      if (b.index === selectedIndex) return -1;
      return 0;
    });

  return (
    <div className="w-full min-h-screen bg-[#070B14] text-white flex flex-col font-sans select-none">
      
      {/* 1. Top Header */}
      <header className="bg-[#0c1322] border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-md">
        {/* Left Side: Avatar and Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-red text-white flex items-center justify-center font-bold text-lg border border-brand-red/30 shadow-md">
            A
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-gray-200 text-sm">Aryan Tripathi</span>
            <span className="text-[10px] text-gray-500 font-mono tracking-wider">UNIT OPERATIVE</span>
          </div>
        </div>

        {/* Center: Title */}
        <div className="text-xl font-bold text-white tracking-widest font-mono">
          JeevanRoute
        </div>

        {/* Right Side: Links & Vehicle Code */}
        <div className="flex items-center gap-6 text-sm text-gray-400 font-medium">
          <button type="button" className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5">
            <UserIcon className="h-4 w-4" /> Profile
          </button>
          <button 
            type="button"
            onClick={onLogout}
            className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
          <div className="flex items-center gap-2 bg-brand-navy-dark px-3 py-1.5 rounded-lg border border-white/15 text-white font-mono text-xs">
            <span className="w-2 h-2 rounded-full bg-brand-red animate-pulse"></span>
            HR-25-AB-2501
          </div>
        </div>
      </header>

      {/* 2. Main Body Grid */}
      <main className="flex-grow flex flex-col lg:flex-row gap-6 p-6">
        
        {/* Left Column: Patient Condition Form */}
        <div className="w-full lg:w-[420px] flex-shrink-0 flex flex-col gap-5">
          
          {/* Active Navigation Instructions HUD when navigating */}
          {incidentState === 'navigating' && (
            <div className="rounded-2xl border border-medical-emerald bg-medical-emerald/5 p-4 space-y-3 shadow-lg shadow-medical-emerald/5 animate-pulse-soft">
              <div className="flex items-center justify-between pb-2 border-b border-white/5 text-xs font-mono">
                <span className="text-medical-emerald font-bold flex items-center gap-1.5">
                  <Navigation className="h-4 w-4 animate-spin-slow" style={{ animationDuration: '4s' }} />
                  ACTIVE ROUTE LOCKED
                </span>
                <span className="text-gray-400">{gpsLog}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-gray-500 uppercase tracking-wider block">INSTRUCTIONS</span>
                  <span className="text-sm font-bold text-white">Turn Left in 200m onto NH-48</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-gray-500 uppercase tracking-wider block">ETA</span>
                  <span className="text-base font-extrabold text-brand-red font-mono">{formatDuration(eta)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleComplete}
                className="w-full mt-1 py-2.5 bg-white text-brand-navy-dark hover:bg-gray-100 text-xs font-bold uppercase rounded-lg active:scale-95 transition-all duration-150 flex items-center justify-center gap-1"
              >
                Complete Transit / Clear Unit
              </button>
            </div>
          )}

          {/* Patient Condition Selector Block */}
          <div className="rounded-2xl border border-white/10 bg-[#0c1322]/80 p-5 space-y-5 shadow-xl">
            <h2 className="text-lg font-bold text-white tracking-wide border-b border-white/5 pb-2">
              Patient Condition
            </h2>

            {/* Grid of condition buttons */}
            <div className="grid grid-cols-2 gap-3">
              {conditions.map((cond) => {
                const isActive = selectedCondition === cond.id;
                return (
                  <button
                    key={cond.id}
                    type="button"
                    onClick={() => setSelectedCondition(cond.id)}
                    className={`py-3 px-4 rounded-xl border flex items-center gap-2 text-xs font-semibold transition-all duration-200 cursor-pointer ${
                      isActive 
                        ? 'bg-brand-red/10 border-brand-red text-white shadow-lg shadow-brand-red/10' 
                        : 'border-white/10 bg-white/[0.02] hover:bg-white/5 text-gray-300 hover:text-white'
                    }`}
                  >
                    <span className="text-base">{cond.icon}</span>
                    <span>{cond.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Severity Slider */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-sm font-semibold">
                <span className="text-gray-300">Severity</span>
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-white text-base font-bold">{severity}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wide ${severityInfo.color}`}>
                    {severityInfo.text}
                  </span>
                </div>
              </div>

              <input
                type="range"
                min="1"
                max="10"
                value={severity}
                onChange={(e) => setSeverity(parseInt(e.target.value))}
                className="w-full accent-brand-red bg-white/10 h-1.5 rounded-lg appearance-none cursor-pointer hover:bg-white/15"
              />

              <div className="flex justify-between text-[10px] text-gray-500 font-mono font-medium">
                <span>1 — Mild</span>
                <span>5 — High</span>
                <span>10 — Critical</span>
              </div>
            </div>

            {/* Age & Blood Group side-by-side */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-500 font-semibold tracking-wider block uppercase">Age</label>
                <input
                  type="text"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full h-11 bg-white/[0.02] border border-white/10 rounded-xl px-4 text-sm font-semibold text-white focus:outline-none focus:border-brand-red transition-all"
                />
              </div>

              <div className="space-y-1.5 relative">
                <label className="text-[10px] text-gray-500 font-semibold tracking-wider block uppercase">Blood Group</label>
                <div className="relative">
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full h-11 bg-white/[0.02] border border-white/10 rounded-xl px-4 pr-10 text-sm font-semibold text-white focus:outline-none focus:border-brand-red transition-all appearance-none cursor-pointer"
                  >
                    <option value="Select" className="bg-[#0c1322]">Select</option>
                    <option value="A+" className="bg-[#0c1322]">A+</option>
                    <option value="A-" className="bg-[#0c1322]">A-</option>
                    <option value="B+" className="bg-[#0c1322]">B+</option>
                    <option value="B-" className="bg-[#0c1322]">B-</option>
                    <option value="AB+" className="bg-[#0c1322]">AB+</option>
                    <option value="AB-" className="bg-[#0c1322]">AB-</option>
                    <option value="O+" className="bg-[#0c1322]">O+</option>
                    <option value="O-" className="bg-[#0c1322]">O-</option>
                  </select>
                  <ChevronDown className="absolute right-3.5 top-3.5 h-4 w-4 text-gray-500 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Location Selector */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Location</span>
              <div className="flex bg-white/[0.02] border border-white/10 rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => setLocationMode('auto')}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
                    locationMode === 'auto'
                      ? 'bg-brand-red text-white shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <MapPin className="h-3.5 w-3.5" /> Auto
                </button>
                <button
                  type="button"
                  onClick={() => setLocationMode('manual')}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    locationMode === 'manual'
                      ? 'bg-brand-red text-white shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Manual
                </button>
              </div>
            </div>

            {/* Action Button: Suggest Hospital */}
            <button
              type="button"
              onClick={handleSuggest}
              className="w-full mt-4 py-3.5 bg-[#F88B8B] hover:bg-[#F88B8B]/95 text-[#070B14] font-extrabold uppercase text-sm rounded-xl tracking-wider shadow-lg shadow-red-500/10 active:scale-95 transition-all duration-150 cursor-pointer"
            >
              Suggest Hospital
            </button>
          </div>

          {/* Telemetry diagnostics connection indicator */}
          <div className="flex items-center justify-between text-[11px] text-gray-500 bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3">
            <span className="flex items-center gap-1.5 font-mono">
              <Activity className="h-4 w-4 text-brand-red animate-pulse" />
              TELEMETRY CONNECTED
            </span>
            <button
              type="button"
              onClick={() => setSoundMuted(!soundMuted)}
              className="p-1 rounded hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
            >
              {soundMuted ? <VolumeX className="h-4 w-4 text-brand-red" /> : <Volume2 className="h-4 w-4 text-medical-emerald" />}
            </button>
          </div>
        </div>

        {/* Right Column: mapcn Maplibre GL Panel */}
        <div className="flex-grow bg-[#0c1322]/80 border border-white/10 rounded-2xl overflow-hidden relative min-h-[500px] flex flex-col shadow-xl">
          
          {/* Custom style selector overlay */}
          <div className="absolute top-4 left-4 z-20">
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value as StyleKey)}
              className="bg-[#0c1322] text-gray-200 rounded-lg border border-white/15 px-3 py-1.5 text-xs shadow-md focus:outline-none cursor-pointer"
            >
              <option value="default">Default (Carto)</option>
              <option value="openstreetmap">OpenStreetMap</option>
              <option value="openstreetmap3d">OpenStreetMap 3D</option>
            </select>
          </div>

          {/* OSRM Route Selector Overlay */}
          {routes.length > 0 && (
            <div className="absolute top-16 left-4 z-20 flex flex-col gap-2 max-w-[220px]">
              {routes.map((route, index) => {
                const isActive = index === selectedIndex;
                const isFastest = index === 0;
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedIndex(index)}
                    className={`justify-start gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center transition-all cursor-pointer shadow-md border ${
                      isActive 
                        ? 'bg-brand-red border-brand-red text-white' 
                        : 'bg-[#0c1322]/90 border-white/10 text-gray-300 hover:text-white hover:bg-[#0c1322]'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-white/90" />
                      <span>{formatDuration(route.duration)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] opacity-80 font-mono">
                      <RouteIcon className="h-3.5 w-3.5" />
                      <span>{formatDistance(route.distance)}</span>
                    </div>
                    {isFastest && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase tracking-wider ${
                        isActive ? 'bg-white text-brand-red' : 'bg-green-500/25 text-green-400'
                      }`}>
                        Fastest
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* mapcn Map component */}
          <Map
            ref={mapRef}
            center={mapCenter}
            zoom={12}
            styles={
              selectedStyle
                ? { light: selectedStyle, dark: selectedStyle }
                : undefined
            }
          >
            {/* Draw Routes */}
            {sortedRoutes.map(({ route, index }) => {
              const isSelected = index === selectedIndex;
              return (
                <MapRoute
                  key={index}
                  coordinates={route.coordinates}
                  color={isSelected ? '#E11D48' : '#94a3b8'}
                  width={isSelected ? 6 : 4}
                  opacity={isSelected ? 1 : 0.6}
                  onClick={() => setSelectedIndex(index)}
                />
              );
            })}

            {/* Pulsing ambulance marker (Start) */}
            <MapMarker longitude={ambulancePosition[0]} latitude={ambulancePosition[1]}>
              <MarkerContent>
                <div className="relative flex items-center justify-center">
                  <span className="absolute inline-flex h-6 w-6 rounded-full bg-brand-red/30 animate-ping" />
                  <div className="relative bg-brand-red w-4.5 h-4.5 rounded-full border-3 border-white shadow-lg shadow-brand-red/35 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  </div>
                </div>
                <MarkerLabel position="bottom">Ambulance Unit</MarkerLabel>
              </MarkerContent>
            </MapMarker>

            {/* Suggested Hospital marker (End) */}
            {incidentState === 'navigating' && (
              <MapMarker longitude={hospitalCoords[0]} latitude={hospitalCoords[1]}>
                <MarkerContent>
                  <div className="w-5 h-5 rounded-full bg-emerald-500 border-2 border-white shadow-lg flex items-center justify-center text-[10px] font-bold text-white">
                    H
                  </div>
                  <MarkerLabel position="top">Jaypee Hospital</MarkerLabel>
                </MarkerContent>
              </MapMarker>
            )}

            {/* Interactive Map Controls */}
            <MapControls
              position="bottom-right"
              showZoom
              showCompass
              showLocate
              showFullscreen
              onLocate={(coords) => {
                setAmbulancePosition([coords.longitude, coords.latitude]);
                setGpsLog(`${coords.latitude.toFixed(4)}° N, ${coords.longitude.toFixed(4)}° E`);
              }}
            />
          </Map>

          {/* Loading Indicator */}
          {isLoading && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#070B14]/40 backdrop-blur-xs">
              <Loader2 className="h-8 w-8 animate-spin text-brand-red" />
            </div>
          )}

          {/* Map Compass HUD */}
          <div className="absolute top-4 right-4 z-20 bg-[#0c1322]/90 border border-white/10 rounded-lg p-2.5 backdrop-blur-md flex items-center gap-1.5 text-[10px] font-mono shadow-md">
            <Compass className="h-4 w-4 text-brand-red animate-spin-slow" style={{ animationDuration: '15s' }} />
            <span>N 12° E</span>
          </div>

          {/* Navigation Street HUD */}
          {incidentState === 'navigating' && (
            <div className="absolute bottom-4 left-4 right-4 z-20 bg-[#0c1322]/95 border border-white/10 rounded-xl p-3.5 backdrop-blur-sm flex items-center justify-between text-xs font-mono shadow-lg">
              <span className="text-gray-400">ROUTE LOCK: Delhi NCR &rarr; Noida</span>
              <span className="text-medical-emerald font-bold">SPEED: 65 km/h</span>
            </div>
          )}
        </div>

      </main>
      
    </div>
  );
}
