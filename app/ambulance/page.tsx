'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, ScoredHospital, Hospital, TriageResult, Alert } from '@/lib/supabase'
import { Map, type MapRef, MapMarker, MapControls, MarkerContent, MapRoute } from '@/components/ui/map'
import GlassCard from '@/components/GlassCard'
import GlassButton from '@/components/GlassButton'
import StatusBadge from '@/components/StatusBadge'
import HospitalCard from '@/components/HospitalCard'
import Link from 'next/link'
import { Activity, ShieldAlert, Heart, Siren, Compass, Navigation, Phone, ChevronRight } from 'lucide-react'

const CONDITIONS = [
  { id: 'Cardiac', label: 'Cardiac', icon: '❤️' },
  { id: 'Trauma', label: 'Trauma', icon: '🩹' },
  { id: 'Neurological', label: 'Neuro', icon: '🧠' },
  { id: 'Burns', label: 'Burns', icon: '🔥' },
  { id: 'Maternity', label: 'Maternity', icon: '🤱' },
  { id: 'Respiratory', label: 'Respiratory', icon: '🫁' },
]

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']

const MAP_STYLES = {
  default: undefined,
  openstreetmap: 'https://tiles.openfreemap.org/styles/bright',
  openstreetmap3d: 'https://tiles.openfreemap.org/styles/liberty',
}
type StyleKey = keyof typeof MAP_STYLES;

const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#0f172a" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0f172a" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#cbd5e1" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#94a3b8" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#022e37" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#306e73" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#1e293b" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#334155" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#64748b" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#0f172a" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1e293b" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#cbd5e1" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#1e293b" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#cbd5e1" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#070b14" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#475569" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#070b14" }],
  },
]

export default function AmbulanceDashboard() {
  const router = useRouter()
  
  const mapRef = useRef<MapRef>(null)

  const [operatorProfile, setOperatorProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Form state
  const [condition, setCondition] = useState('')
  const [severity, setSeverity] = useState(5)
  const [age, setAge] = useState('')
  const [bloodGroup, setBloodGroup] = useState('')
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locating, setLocating] = useState(false)

  // Results state
  const [hospitals, setHospitals] = useState<ScoredHospital[]>([])
  const [caseId, setCaseId] = useState<string | null>(null)
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null)
  const [requestStatus, setRequestStatus] = useState('')
  
  // Live alert tracking
  const [activeAlert, setActiveAlert] = useState<Alert | null>(null)
  const [activeHospital, setActiveHospital] = useState<ScoredHospital | null>(null)
  const [responderPhone, setResponderPhone] = useState<string | null>(null)
  const [directionsUnavailable, setDirectionsUnavailable] = useState(false)

  const [routeCoords, setRouteCoords] = useState<[number, number][]>([])
  const [routeDuration, setRouteDuration] = useState<string>('')

  const [mapStyle, setMapStyle] = useState<StyleKey>('default')
  const selectedStyle = MAP_STYLES[mapStyle]

  // Tilt/ease camera pitch when style is 3D
  useEffect(() => {
    const map = mapRef.current
    if (map) {
      map.easeTo({ pitch: mapStyle === 'openstreetmap3d' ? 60 : 0, duration: 500 })
    }
  }, [mapStyle])

  useEffect(() => {
    const checkProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      const { data } = await supabase
        .from('operator_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()
      if (!data) {
        router.push('/auth/profile-setup/ambulance')
      } else {
        setOperatorProfile(data)
      }
      setLoading(false)
    }
    checkProfile()
  }, [router])

  // Live subscription: watch alerts for the current case
  useEffect(() => {
    if (!caseId) return

    const loadActiveAlert = async () => {
      const { data } = await supabase
        .from('alerts')
        .select('*')
        .eq('case_id', caseId)
        .order('created_at', { ascending: false })

      if (!data) return

      const accepted = data.find((a) =>
        ['accepted', 'preparing', 'arrived'].includes(a.status)
      )

      if (accepted) {
        setActiveAlert(accepted as Alert)
        const hosp = hospitals.find((h) => h.id === accepted.hospital_id)
        if (hosp) setActiveHospital(hosp)

        if (accepted.responded_by) {
          const { data: profile } = await supabase
            .from('hospital_profiles')
            .select('phone')
            .eq('user_id', accepted.responded_by)
            .single()
          setResponderPhone(profile?.phone || null)
        }
      } else {
        const declinedIds = data.filter((a) => a.status === 'declined').map((a) => a.hospital_id)
        if (declinedIds.length > 0) {
          setHospitals((prev) => prev.filter((h) => !declinedIds.includes(h.id)))
        }
      }
    }

    loadActiveAlert()

    const channel = supabase
      .channel(`ambulance-case-${caseId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'alerts',
          filter: `case_id=eq.${caseId}`,
        },
        () => loadActiveAlert()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [caseId, hospitals.length])

  // Fetch turn-by-turn directions via OSRM once a hospital accepts
  useEffect(() => {
    if (!location || !activeHospital) {
      setRouteCoords([])
      setRouteDuration('')
      setDirectionsUnavailable(false)
      return
    }

    const fetchOSRMRoute = async () => {
      try {
        const res = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${location.lng},${location.lat};${activeHospital.lng},${activeHospital.lat}?overview=full&geometries=geojson`
        )
        const data = await res.json()
        if (data.routes && data.routes[0]) {
          setRouteCoords(data.routes[0].geometry.coordinates)
          const durSeconds = data.routes[0].duration
          const mins = Math.round(durSeconds / 60)
          setRouteDuration(`${mins} mins`)
          setDirectionsUnavailable(false)
          
          // Fly map to show the route
          const map = mapRef.current
          if (map) {
            const lats = [location.lat, activeHospital.lat]
            const lngs = [location.lng, activeHospital.lng]
            const minLat = Math.min(...lats)
            const maxLat = Math.max(...lats)
            const minLng = Math.min(...lngs)
            const maxLng = Math.max(...lngs)
            map.fitBounds([[minLng, minLat], [maxLng, maxLat]], { padding: 60, maxZoom: 15 })
          }
        } else {
          setRouteCoords([])
          setRouteDuration('')
          setDirectionsUnavailable(true)
        }
      } catch (error) {
        setRouteCoords([])
        setRouteDuration('')
        setDirectionsUnavailable(true)
        console.error('OSRM Routing failed:', error)
      }
    }

    fetchOSRMRoute()
  }, [location, activeHospital])

  // Center/fit map on initial hospital suggestions
  useEffect(() => {
    const map = mapRef.current
    if (!map || !location || activeHospital) return

    const lats = [location.lat]
    const lngs = [location.lng]

    hospitals.slice(0, 4).forEach((h) => {
      if (h.lat && h.lng) {
        lats.push(h.lat)
        lngs.push(h.lng)
      }
    })

    if (lats.length > 1) {
      const minLat = Math.min(...lats)
      const maxLat = Math.max(...lats)
      const minLng = Math.min(...lngs)
      const maxLng = Math.max(...lngs)
      map.fitBounds([[minLng, minLat], [maxLng, maxLat]], { padding: 60, maxZoom: 15 })
    } else {
      map.flyTo({ center: [location.lng, location.lat], zoom: 12 })
    }
  }, [location, hospitals, activeHospital])

  const detectLocation = () => {
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocating(false)
      },
      () => {
        setLocation({ lat: 28.5672, lng: 77.2100 })
        setLocating(false)
      },
      { timeout: 10000 }
    )
  }

  const handleSuggestHospitals = async () => {
    if (!condition) return alert('Please select patient condition')
    if (!location) return alert('Please detect your location first')
    if (!age) return alert('Please enter patient age')
    if (!bloodGroup) return alert('Please select blood group')

    setRequestStatus('Creating case...')

    try {
      const { data: newCase, error: caseError } = await supabase
        .from('cases')
        .insert({
          patient_condition: condition,
          severity,
          age: parseInt(age),
          blood_group: bloodGroup,
          allergies: '',
          pickup_lat: location.lat,
          pickup_lng: location.lng,
          current_lat: location.lat,
          current_lng: location.lng,
          status: 'active'
        })
        .select()
        .single()

      if (caseError) {
        console.error('Case insert error:', caseError.message)
        setRequestStatus(`❌ DB Error: ${caseError.message}`)
        return
      }

      setCaseId(newCase.id)
      setRequestStatus('AI triaging...')

      const triageRes = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_id: newCase.id,
          condition,
          severity,
          age: parseInt(age),
          blood_group: bloodGroup,
          allergies: ''
        })
      })

      if (!triageRes.ok) {
        setRequestStatus(`❌ Triage API Error: ${triageRes.status}`)
        return
      }

      const triageData = await triageRes.json()
      setTriageResult(triageData.triage)

      setRequestStatus('Finding hospitals...')

      const recommendRes = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_id: newCase.id,
          lat: location.lat,
          lng: location.lng
        })
      })

      if (!recommendRes.ok) {
        setRequestStatus(`❌ Recommend API Error: ${recommendRes.status}`)
        return
      }

      const recommendData = await recommendRes.json()
      setHospitals(recommendData.hospitals)

      setRequestStatus('Ready to send alert')

    } catch (err: any) {
      console.error(err)
      setRequestStatus(`❌ Error: ${err?.message || 'Unknown error'}`)
    }
  }

  const handleSendAlert = async (hospital: ScoredHospital) => {
    if (!caseId) return
    setRequestStatus('Sending alert...')
    try {
      const alertRes = await fetch('/api/alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_id: caseId,
          hospital_id: hospital.id,
        }),
      })
      if (!alertRes.ok) throw new Error('Alert failed')
      setRequestStatus('Alert sent! Waiting for response...')
    } catch (err) {
      console.error(err)
      setRequestStatus('Error sending alert')
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleMarkArrived = async () => {
    if (!activeAlert?.id) return
    
    try {
      await fetch(`/api/alert/${activeAlert.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'arrived' })
      })
      
      setActiveAlert(null)
      setActiveHospital(null)
      setResponderPhone(null)
      setRouteCoords([])
      setRouteDuration('')
      setCaseId(null)
      setHospitals([])
      setTriageResult(null)
      setCondition('')
      setSeverity(5)
      setAge('')
      setBloodGroup('')
      setRequestStatus('')
    } catch (error) {
      console.error('Failed to mark as arrived:', error)
    }
  }

  const getSeverityLabel = (s: number) => s <= 3 ? 'Moderate' : s <= 6 ? 'High' : 'Critical'

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-brand-red bg-[#070b14] font-mono">
        <div className="flex flex-col items-center gap-3">
          <Activity className="h-10 w-10 animate-pulse" />
          <span>ESTABLISHING SECURE GATEWAY...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-gray-100 flex flex-col">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#070B14]/80 backdrop-blur-md border-b border-white/5 py-4">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-brand-red/10 border border-brand-red/30 flex items-center justify-center">
              <Activity className="h-5 w-5 text-brand-red animate-pulse" />
            </div>
            <span className="text-white font-bold tracking-tight font-mono text-sm">
              JR // OPERATOR PORTAL
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs">
            <span className="text-gray-400 font-mono">
              CALLSIGN: <span className="text-white font-bold">{operatorProfile?.operator_name}</span>
            </span>
            <span className="text-gray-400 font-mono">
              VEHICLE: <span className="text-brand-red font-bold">{operatorProfile?.vehicle_number}</span>
            </span>
            <button 
              onClick={handleLogout} 
              className="text-gray-400 hover:text-white transition-colors border border-white/10 rounded px-2.5 py-1 hover:bg-white/5 cursor-pointer font-mono"
            >
              DISCONNECT
            </button>
          </div>
        </div>
      </nav>

      {/* Main Grid Layout */}
      <div className="flex-grow pt-20 p-4 flex gap-4 h-[calc(100vh-20px)] overflow-hidden">
        
        {/* Left Panel: Triage & Intake form */}
        <div className="w-1/3 flex flex-col gap-4 overflow-y-auto pr-1">
          
          <GlassCard className="p-5 border border-white/5 flex-shrink-0">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/5">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Patient Triage Intake
              </h2>
              <span className="text-[10px] text-gray-500 font-mono">STATUS: ACTIVE</span>
            </div>

            {/* Condition Pills */}
            <div className="space-y-2 mb-4">
              <label className="block text-xs font-mono text-gray-400">PATIENT PRIMARY CONDITION</label>
              <div className="grid grid-cols-2 gap-2">
                {CONDITIONS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCondition(c.id)}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all text-left flex items-center gap-2 cursor-pointer ${
                      condition === c.id
                        ? 'border-brand-red bg-brand-red/10 text-white'
                        : 'border-white/5 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span>{c.icon}</span>
                    <span>{c.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Severity Slider */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-mono text-gray-400">ACUITY INDEX (SEVERITY)</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-white">{severity}</span>
                  <StatusBadge status={getSeverityLabel(severity)} />
                </div>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={severity}
                onChange={(e) => setSeverity(parseInt(e.target.value))}
                className="w-full cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-500 font-mono mt-1">
                <span>1 - STABLE</span>
                <span>5 - HIGH</span>
                <span>10 - CRITICAL</span>
              </div>
            </div>

            {/* Age & Blood Group */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="space-y-1">
                <label className="block text-xs font-mono text-gray-400">AGE</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="input text-xs"
                  placeholder="e.g. 45"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-mono text-gray-400">BLOOD GROUP</label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="input text-xs"
                >
                  <option value="">SELECT</option>
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Geolocation */}
            <div className="mb-4">
              <label className="block text-xs font-mono text-gray-400 mb-2">OPERATOR GEOLOCATION</label>
              <div className="flex gap-2">
                <button
                  onClick={detectLocation}
                  disabled={locating}
                  className="flex-1 py-2 px-3 rounded-lg border border-white/10 bg-white/5 text-xs text-white font-semibold hover:bg-white/10 transition-all cursor-pointer"
                >
                  {locating ? 'Locking Signal...' : '🛰️ Detect GPS'}
                </button>
                {location && (
                  <div className="flex items-center px-3 border border-white/5 bg-white/5 rounded-lg text-xs font-mono text-brand-red">
                    {location.lat.toFixed(4)}N, {location.lng.toFixed(4)}E
                  </div>
                )}
              </div>
            </div>

            {/* Suggest Button */}
            <GlassButton
              variant="primary"
              className="w-full py-3 text-xs font-mono tracking-wider"
              onClick={handleSuggestHospitals}
              disabled={!condition || !age || !bloodGroup || !location}
            >
              RUN AI ROUTE SEARCH
            </GlassButton>

            {/* Status log */}
            {requestStatus && (
              <div className="mt-3 p-2 bg-white/5 border border-white/5 rounded text-[10px] text-gray-400 font-mono text-center">
                {requestStatus}
              </div>
            )}
          </GlassCard>

          {/* AI Triage Recommendation Panel */}
          {triageResult && (
            <GlassCard className="p-4 border border-white/5 bg-brand-red/5 flex-shrink-0 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-white font-mono uppercase">
                <Siren className="h-4 w-4 text-brand-red" />
                <span>AI Clinical Report</span>
              </div>
              <div className="text-xs space-y-2 font-mono text-gray-300">
                <div>
                  <span className="text-gray-500">SEVERITY LEVEL:</span> {triageResult.urgency}
                </div>
                <div>
                  <span className="text-gray-500">RECOMMENDED DEPT:</span> {triageResult.required_specialty}
                </div>
                {triageResult.equipment_needed?.length > 0 && (
                  <div>
                    <span className="text-gray-500">EQUIPMENT NEEDED:</span> {triageResult.equipment_needed.join(', ')}
                  </div>
                )}
                {triageResult.prep_instructions?.length > 0 && (
                  <div className="p-2 bg-brand-navy-dark/95 border border-white/5 rounded text-gray-400 text-[10px] leading-relaxed">
                    <span className="text-gray-500 block mb-1">PREP INSTRUCTIONS:</span>
                    {triageResult.prep_instructions.join('. ')}
                  </div>
                )}
              </div>
            </GlassCard>
          )}
        </div>

        {/* Right Panel: Map & Action Dashboard */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          
          {/* Map Frame */}
          <div className="flex-grow rounded-xl overflow-hidden relative border border-white/5 bg-[#090d16]">
            <Map
              ref={mapRef}
              center={location ? [location.lng, location.lat] : [77.2090, 28.6139]}
              zoom={location ? 12 : 10}
              className="w-full h-full"
              styles={selectedStyle ? { light: selectedStyle, dark: selectedStyle } : undefined}
            >
              {location && (
                <MapMarker longitude={location.lng} latitude={location.lat}>
                  <MarkerContent>
                    <div className="relative flex items-center justify-center">
                      <span className="absolute inline-flex h-6 w-6 rounded-full bg-brand-red/30 animate-ping" />
                      <div className="relative bg-brand-red w-4.5 h-4.5 rounded-full border-3 border-white shadow-lg flex items-center justify-center">
                        <span className="text-[10px]">🚑</span>
                      </div>
                    </div>
                  </MarkerContent>
                </MapMarker>
              )}
              {activeAlert && activeHospital ? (
                <>
                  <MapMarker longitude={activeHospital.lng} latitude={activeHospital.lat}>
                    <MarkerContent>
                      <div className="w-5 h-5 rounded-full bg-emerald-500 border-2 border-white shadow-lg flex items-center justify-center text-[10px] font-bold text-white">
                        🏥
                      </div>
                    </MarkerContent>
                  </MapMarker>
                  {routeCoords && routeCoords.length > 0 && (
                    <MapRoute coordinates={routeCoords} color="#10B981" width={5} />
                  )}
                </>
              ) : (
                hospitals.map((h: any) =>
                  h.lat && h.lng ? (
                    <MapMarker key={h.id} longitude={h.lng} latitude={h.lat}>
                      <MarkerContent>
                        <div className="w-5 h-5 rounded-full bg-blue-500 border-2 border-white shadow-lg flex items-center justify-center text-[10px] font-bold text-white">
                          🏥
                        </div>
                      </MarkerContent>
                    </MapMarker>
                  ) : null
                )
              )}
              <MapControls position="bottom-right" showZoom showCompass showLocate showFullscreen />
            </Map>

            {/* Map Style Selector */}
            <div className="absolute top-3 right-3 z-10 flex gap-2">
              <select
                value={mapStyle}
                onChange={(e) => setMapStyle(e.target.value as StyleKey)}
                className="bg-brand-navy-dark/95 text-white border border-white/10 rounded px-2.5 py-1 text-[10px] font-mono shadow-md focus:outline-none focus:border-brand-red cursor-pointer"
              >
                <option value="default">🛰️ CARTODB DARK</option>
                <option value="openstreetmap">🗺️ OSM BRIGHT</option>
                <option value="openstreetmap3d">🏙️ OSM 3D LIBERTY</option>
              </select>
            </div>

            {/* Overlay telemetry info */}
            <div className="absolute top-3 left-3 bg-brand-navy-dark/95 border border-white/10 rounded px-2.5 py-1 text-[10px] font-mono text-gray-300">
              <span className="text-brand-red animate-ping mr-1.5">•</span>
              LIVE GPS LOGGED
            </div>
          </div>

          {directionsUnavailable && (
            <div className="px-2">
              <p className="text-[10px] text-gray-500 font-mono text-center">
                ⚠️ Live path-finding unavailable. Map shows straight-line coordinates.
              </p>
            </div>
          )}

          {/* Active alerts or recommendations selection */}
          {activeAlert && activeHospital ? (
            <GlassCard className="p-4 border border-white/5 bg-medical-emerald/5 flex-shrink-0">
              <div className="flex items-center gap-2 mb-3 text-xs font-bold text-white uppercase tracking-wider font-mono">
                <Navigation className="h-4 w-4 text-medical-emerald animate-pulse" />
                <span>TRANSIT MISSION ACTIVE</span>
              </div>
              <div className="grid grid-cols-4 gap-4 mb-4 font-mono text-xs text-gray-300">
                <div className="col-span-2">
                  <span className="text-[10px] text-gray-500 block">RECEIVING CENTER</span>
                  <span className="text-white font-bold">{activeHospital.name}</span>
                  <span className="text-gray-400 block text-[10px] truncate">{activeHospital.address}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block">ETA METRIC</span>
                  <span className="text-brand-red font-bold">
                    {routeDuration || `${activeHospital.distance_km?.toFixed(1)} km`}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block">ER BAY STATUS</span>
                  <StatusBadge status={activeAlert.status} />
                </div>
              </div>

              <div className="flex gap-3">
                {responderPhone && (
                  <a 
                    href={`tel:${responderPhone}`} 
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-white/5 hover:border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2.5 text-xs font-semibold text-white transition-all active:scale-98"
                  >
                    <Phone className="h-3.5 w-3.5" /> Call ER Desk
                  </a>
                )}
                <GlassButton
                  variant="primary"
                  className="flex-1 text-xs font-mono py-2.5"
                  onClick={handleMarkArrived}
                >
                  CONFIRM ARRIVAL AT BAY
                </GlassButton>
              </div>
            </GlassCard>
          ) : (
            hospitals.length > 0 && (
              <div className="p-4 border border-white/5 bg-brand-navy-light/10 rounded-xl flex-shrink-0 overflow-y-auto max-h-[220px]">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono mb-3">
                  AI Hospital Recommendations
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {hospitals.slice(0, 4).map((hospital) => (
                    <div 
                      key={hospital.id} 
                      className="p-3 rounded-lg border border-white/5 bg-brand-navy-dark/95 flex flex-col justify-between"
                    >
                      <div className="mb-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-white font-bold truncate max-w-[140px]">
                            {hospital.name}
                          </span>
                          <span className="text-[9px] font-mono text-brand-red font-bold">
                            {hospital.distance_km?.toFixed(1)} km
                          </span>
                        </div>
                        <p className="text-[9px] text-gray-500 font-mono">
                          MATCH: {(hospital.score * 100).toFixed(0)}% | BEDS: {hospital.available_beds}
                        </p>
                      </div>
                      <GlassButton
                        variant="secondary"
                        className="py-1 text-[10px] font-mono"
                        onClick={() => handleSendAlert(hospital)}
                      >
                        TRANSMIT TELEMETRY & ALERT
                      </GlassButton>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
        </div>

      </div>
    </div>
  )
}
