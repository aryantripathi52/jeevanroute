'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase, Case, Alert, ScoredHospital } from '@/lib/supabase'
import Link from 'next/link'

declare global {
  interface Window {
    google: typeof google
    initMap: () => void
  }
}

type ToastMessage = { id: string; type: 'error' | 'success' | 'info'; message: string }

function Toast({ toasts, onRemove }: { toasts: ToastMessage[]; onRemove: (id: string) => void }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div key={t.id} className="flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl animate-slide-in-up cursor-pointer" style={{
          background: t.type === 'error' ? '#1F0A0A' : t.type === 'success' ? '#0A1F0A' : '#0A0F2A',
          border: `1px solid ${t.type === 'error' ? '#EF4444' : t.type === 'success' ? '#22C55E' : '#3B82F6'}`,
          color: t.type === 'error' ? '#EF4444' : t.type === 'success' ? '#22C55E' : '#60A5FA',
          minWidth: '300px',
        }} onClick={() => onRemove(t.id)}>
          <span className="text-lg">{t.type === 'error' ? '🔴' : t.type === 'success' ? '✅' : 'ℹ️'}</span>
          <span className="text-sm font-medium flex-1">{t.message}</span>
          <span className="text-xs opacity-50">✕</span>
        </div>
      ))}
    </div>
  )
}

function StatusBar({ alert, hospital }: { alert: Alert | null; hospital: ScoredHospital | null }) {
  if (!alert || !hospital) return null

  const configs = {
    pending: {
      bg: 'rgba(234,179,8,0.1)', border: 'rgba(234,179,8,0.3)', color: '#EAB308',
      icon: '⏳', text: `Alert sent to ${hospital.name} · Awaiting response...`
    },
    accepted: {
      bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.3)', color: '#22C55E',
      icon: '✅', text: `${hospital.name} Confirmed · Navigate now!`
    },
    declined: {
      bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', color: '#EF4444',
      icon: '🔴', text: `${hospital.name} Declined — ${alert.decline_reason || 'No reason given'}`
    },
    preparing: {
      bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.3)', color: '#3B82F6',
      icon: '🔧', text: `${hospital.name} Preparing · On your way!`
    },
    arrived: {
      bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.3)', color: '#22C55E',
      icon: '🏥', text: `Arrived at ${hospital.name}!`
    },
  }

  const cfg = configs[alert.status] || configs.pending

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-4 animate-fade-in" style={{
      background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color,
    }}>
      <span className="text-xl">{cfg.icon}</span>
      <span className="font-semibold text-sm">{cfg.text}</span>
      {alert.status === 'pending' && (
        <div className="ml-auto flex gap-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{
              background: cfg.color, animationDelay: `${i * 0.15}s`
            }} />
          ))}
        </div>
      )}
    </div>
  )
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? '#22C55E' : score >= 60 ? '#EAB308' : '#EF4444'
  return (
    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{
      background: `${color}20`, color, border: `1px solid ${color}40`
    }}>
      {score}% match
    </span>
  )
}

function HospitalCard({
  hospital, rank, onSendAlert, alertSent, isNew
}: {
  hospital: ScoredHospital
  rank: number
  onSendAlert: (h: ScoredHospital) => void
  alertSent: boolean
  isNew?: boolean
}) {
  return (
    <div className={`rounded-xl p-4 transition-all duration-500 ${isNew ? 'animate-slide-in-up' : ''}`} style={{
      background: rank === 1 ? 'rgba(239,68,68,0.05)' : '#111827',
      border: `1px solid ${rank === 1 ? 'rgba(239,68,68,0.3)' : 'rgba(239,68,68,0.1)'}`,
    }}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black" style={{
            background: rank === 1 ? '#EF4444' : '#374151', color: 'white'
          }}>#{rank}</div>
          <div>
            <h3 className="font-bold text-sm leading-tight" style={{ color: '#F9FAFB' }}>{hospital.name}</h3>
            <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>{hospital.address}</p>
          </div>
        </div>
        <ScoreBadge score={hospital.score} />
      </div>

      {/* Distance + ETA */}
      <div className="flex gap-4 mb-3">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">📍</span>
          <span className="text-sm font-semibold" style={{ color: '#F9FAFB' }}>{hospital.distance_km} km</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-sm">⏱</span>
          <span className="text-sm font-semibold" style={{ color: '#F9FAFB' }}>{hospital.eta_minutes} min ETA</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-sm">🛏</span>
          <span className="text-sm font-semibold" style={{ color: hospital.available_beds > 5 ? '#22C55E' : '#EAB308' }}>
            {hospital.available_beds} beds
          </span>
        </div>
      </div>

      {/* Specialty chips */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {hospital.specialties?.slice(0, 4).map((s) => (
          <span key={s} className="text-xs px-2 py-0.5 rounded-full font-medium" style={{
            background: 'rgba(239,68,68,0.1)', color: '#FCA5A5', border: '1px solid rgba(239,68,68,0.2)'
          }}>{s}</span>
        ))}
        {hospital.icu_available && (
          <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{
            background: 'rgba(34,197,94,0.1)', color: '#86EFAC', border: '1px solid rgba(34,197,94,0.2)'
          }}>ICU ✓</span>
        )}
      </div>

      {/* Alert button — only rank 1 */}
      {rank === 1 && !alertSent && (
        <button
          onClick={() => onSendAlert(hospital)}
          className="w-full py-3 rounded-xl font-bold text-sm transition-all duration-200 hover:scale-105 active:scale-100 text-white"
          style={{ background: 'linear-gradient(135deg, #EF4444, #DC2626)', boxShadow: '0 0 20px rgba(239,68,68,0.3)' }}
        >
          🔔 Send Alert to this Hospital
        </button>
      )}
      {rank === 1 && alertSent && (
        <div className="w-full py-3 rounded-xl font-bold text-sm text-center" style={{
          background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.3)', color: '#EAB308'
        }}>
          ⏳ Alert sent — awaiting response
        </div>
      )}
    </div>
  )
}

export default function ResultsPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [caseData, setCaseData] = useState<Case | null>(null)
  const [hospitals, setHospitals] = useState<ScoredHospital[]>([])
  const [activeAlert, setActiveAlert] = useState<Alert | null>(null)
  const [alertSent, setAlertSent] = useState(false)
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const [rerouting, setRerouting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [newHospitalIds, setNewHospitalIds] = useState<Set<string>>(new Set())
  const [responderPhone, setResponderPhone] = useState<string | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<google.maps.Marker[]>([])
  const routeRef = useRef<google.maps.DirectionsRenderer | null>(null)
  const locationRef = useRef<{ lat: number; lng: number } | null>(null)

  const addToast = useCallback((type: ToastMessage['type'], message: string) => {
    const t = { id: Date.now().toString(), type, message }
    setToasts((prev) => [...prev, t])
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== t.id)), 6000)
  }, [])

  // Load Google Maps
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey || apiKey === 'your_google_maps_api_key') return

    if (window.google) { initMap(); return }

    window.initMap = initMap
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap&libraries=directions`
    script.async = true
    document.head.appendChild(script)

    return () => { document.head.removeChild(script) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function initMap() {
    if (!mapRef.current) return
    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      zoom: 12,
      center: { lat: 28.567, lng: 77.21 },
      styles: [
        { elementType: 'geometry', stylers: [{ color: '#0A0F1E' }] },
        { elementType: 'labels.text.stroke', stylers: [{ color: '#0A0F1E' }] },
        { elementType: 'labels.text.fill', stylers: [{ color: '#9CA3AF' }] },
        { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1F2937' }] },
        { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#111827' }] },
        { featureType: 'poi', stylers: [{ visibility: 'off' }] },
        { featureType: 'transit', stylers: [{ visibility: 'off' }] },
      ],
    })
    routeRef.current = new window.google.maps.DirectionsRenderer({
      suppressMarkers: true,
      polylineOptions: { strokeColor: '#EF4444', strokeWeight: 4 },
    })
    routeRef.current.setMap(mapInstance.current)
  }

  const updateMap = useCallback((loc: { lat: number; lng: number }, hs: ScoredHospital[]) => {
    if (!mapInstance.current || !window.google) return

    // Clear existing markers
    markersRef.current.forEach((m) => m.setMap(null))
    markersRef.current = []

    // Ambulance marker
    const ambMarker = new window.google.maps.Marker({
      position: loc,
      map: mapInstance.current,
      title: 'Ambulance',
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="18" fill="#EF4444" stroke="white" stroke-width="2"/>
            <text x="20" y="27" text-anchor="middle" font-size="18">🚑</text>
          </svg>`),
        scaledSize: new window.google.maps.Size(40, 40),
      }
    })
    markersRef.current.push(ambMarker)

    // Hospital markers
    hs.slice(0, 3).forEach((h, i) => {
      const colors = ['#EF4444', '#EAB308', '#22C55E']
      const marker = new window.google.maps.Marker({
        position: { lat: h.lat, lng: h.lng },
        map: mapInstance.current!,
        title: h.name,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="16" fill="${colors[i]}" stroke="white" stroke-width="2"/>
              <text x="18" y="24" text-anchor="middle" font-size="14" fill="white" font-weight="bold">${i + 1}</text>
            </svg>`),
          scaledSize: new window.google.maps.Size(36, 36),
        }
      })
      markersRef.current.push(marker)
    })

    // Draw route to hospital #1
    if (hs.length > 0 && routeRef.current) {
      const ds = new window.google.maps.DirectionsService()
      ds.route({
        origin: loc,
        destination: { lat: hs[0].lat, lng: hs[0].lng },
        travelMode: window.google.maps.TravelMode.DRIVING,
      }, (result, status) => {
        if (status === 'OK' && result) {
          routeRef.current!.setDirections(result)
        }
      })
    }

    // Fit bounds
    const bounds = new window.google.maps.LatLngBounds()
    bounds.extend(loc)
    hs.slice(0, 3).forEach((h) => bounds.extend({ lat: h.lat, lng: h.lng }))
    mapInstance.current.fitBounds(bounds, 60)
  }, [])

  // Fetch initial data
  useEffect(() => {
    if (!id) return

    const fetchData = async () => {
      const { data: c } = await supabase.from('cases').select('*').eq('id', id).single()
      if (!c) return
      setCaseData(c)
      locationRef.current = { lat: c.current_lat || c.pickup_lat, lng: c.current_lng || c.pickup_lng }

      // Fetch recommendations
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ case_id: id, lat: c.current_lat || c.pickup_lat, lng: c.current_lng || c.pickup_lng }),
      })
      const { hospitals: hs } = await res.json()
      setHospitals(hs || [])
      if (hs && locationRef.current) updateMap(locationRef.current, hs)

      // Check existing alert
      const { data: alerts } = await supabase
        .from('alerts')
        .select('*')
        .eq('case_id', id)
        .order('created_at', { ascending: false })
        .limit(1)

      if (alerts && alerts.length > 0) {
        setActiveAlert(alerts[0])
        setAlertSent(true)
      }

      setLoading(false)
    }

    fetchData()
  }, [id, updateMap])

  // Real-time subscription on alerts
  useEffect(() => {
    if (!id) return

    const fetchResponderProfile = async (alert: Alert) => {
      if (alert.responded_by) {
        const { data } = await supabase
          .from('hospital_profiles')
          .select('phone')
          .eq('user_id', alert.responded_by)
          .single()
        setResponderPhone(data?.phone || null)
      } else {
        setResponderPhone(null)
      }
    }

    // Initial load of active alert and profile
    const loadInitialAlert = async () => {
      const { data: alerts } = await supabase
        .from('alerts')
        .select('*')
        .eq('case_id', id)
        .order('created_at', { ascending: false })

      if (alerts && alerts.length > 0) {
        const activeAlert = alerts.find(a => ['accepted', 'preparing', 'arrived'].includes(a.status)) || alerts[0]
        setActiveAlert(activeAlert)
        if (['accepted', 'preparing', 'arrived'].includes(activeAlert.status)) {
          fetchResponderProfile(activeAlert)
        }
      }
    }

    loadInitialAlert()

    const channel = supabase
      .channel(`alert-status-${id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'alerts',
        filter: `case_id=eq.${id}`,
      }, (payload) => {
        const newAlert = payload.new as Alert
        setActiveAlert(newAlert)

        if (newAlert.status === 'accepted') {
          addToast('success', `✅ ${hospitals.find(h => h.id === newAlert.hospital_id)?.name || 'Hospital'} accepted! Navigate now.`)
          fetchResponderProfile(newAlert)
        }

        if (newAlert.status === 'declined') {
          addToast('error', `🔴 Hospital declined: ${newAlert.decline_reason || 'No reason given'}`)
          triggerReroute()
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, hospitals, addToast])

  const triggerReroute = useCallback(async () => {
    if (!id || !locationRef.current || rerouting) return
    setRerouting(true)
    addToast('info', '🔄 Finding next best hospital from your current location...')

    try {
      const res = await fetch('/api/reroute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_id: id,
          current_lat: locationRef.current.lat,
          current_lng: locationRef.current.lng,
        }),
      })
      const data = await res.json()

      if (data.hospitals) {
        setNewHospitalIds(new Set([data.hospital?.id]))
        setHospitals(data.hospitals)
        setAlertSent(true)
        if (locationRef.current) updateMap(locationRef.current, data.hospitals)
        addToast('success', `✅ Redirected to ${data.hospital?.name} — ETA: ${data.hospital?.eta_minutes} min`)
      }
    } catch (err) {
      addToast('error', 'Reroute failed. Please try manually.')
    } finally {
      setRerouting(false)
    }
  }, [id, rerouting, addToast, updateMap])

  const sendAlert = async (hospital: ScoredHospital) => {
    setAlertSent(true)
    try {
      const res = await fetch('/api/alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ case_id: id, hospital_id: hospital.id }),
      })
      const { alert } = await res.json()
      setActiveAlert(alert)
      addToast('info', `⏳ Alert sent to ${hospital.name}`)
    } catch {
      setAlertSent(false)
      addToast('error', 'Failed to send alert. Try again.')
    }
  }

  const handleMarkArrived = async () => {
    if (!activeAlert?.id) return
    
    try {
      await fetch(`/api/alert/${activeAlert.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'arrived' })
      })
      
      // Navigate back to ambulance dashboard to take new patient
      router.push('/ambulance')
    } catch (error) {
      console.error('Failed to mark as arrived:', error)
      addToast('error', 'Failed to mark as arrived')
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: '#0A0F1E' }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-red-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4" />
          <p style={{ color: '#9CA3AF' }}>Loading recommendations...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col" style={{ background: '#0A0F1E' }}>
      <Toast toasts={toasts} onRemove={(id) => setToasts(p => p.filter(t => t.id !== id))} />

      {/* Header */}
      <header className="border-b px-6 py-4 flex items-center justify-between flex-shrink-0" style={{ borderColor: 'rgba(239,68,68,0.15)', background: '#111827' }}>
        <div className="flex items-center gap-3">
          <Link href="/ambulance" className="text-red-400 hover:text-red-300 transition-colors text-lg">←</Link>
          <div>
            <h1 className="font-bold" style={{ color: '#F9FAFB' }}>Hospital Recommendations</h1>
            <p className="text-xs" style={{ color: '#9CA3AF' }}>AI-ranked by specialty + proximity</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs font-semibold" style={{ color: '#EF4444' }}>LIVE</span>
        </div>
      </header>

      {/* Rerouting banner */}
      {rerouting && (
        <div className="px-6 py-3 flex items-center gap-3 animate-fade-in" style={{
          background: 'rgba(59,130,246,0.1)', borderBottom: '1px solid rgba(59,130,246,0.3)'
        }}>
          <div className="w-4 h-4 border-2 border-t-blue-400 border-r-transparent rounded-full animate-spin flex-shrink-0" />
          <span className="text-sm font-semibold" style={{ color: '#60A5FA' }}>
            🔄 Finding next best hospital from your current location...
          </span>
        </div>
      )}

      <div className="flex flex-1 min-h-0">
        {/* Left panel */}
        <div className="w-full lg:w-96 xl:w-[420px] flex-shrink-0 flex flex-col overflow-y-auto p-4 gap-3 border-r" style={{ borderColor: 'rgba(239,68,68,0.1)' }}>
          {/* Status bar */}
          <StatusBar alert={activeAlert} hospital={hospitals.find(h => activeAlert?.hospital_id === h.id) ?? hospitals[0] ?? null} />

          {activeAlert && ['accepted', 'preparing', 'arrived'].includes(activeAlert.status) ? (
            <>
              {/* Detailed Hospital Info Card */}
              <div className="rounded-xl p-6" style={{ background: '#111827', border: '1px solid rgba(239,68,68,0.1)' }}>
                <h2 className="text-xl font-black" style={{ color: '#F9FAFB', marginBottom: '1.5rem' }}>
                  🚑 En Route To Hospital
                </h2>
                
                {/* Hospital Info */}
                <div className="space-y-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide font-bold" style={{ color: '#9CA3AF', marginBottom: '0.25rem' }}>
                      Hospital
                    </p>
                    <p className="text-lg font-black" style={{ color: '#F9FAFB' }}>
                      {hospitals.find(h => activeAlert.hospital_id === h.id)?.name}
                    </p>
                    <p className="text-sm" style={{ color: '#9CA3AF', marginTop: '0.25rem' }}>
                      {hospitals.find(h => activeAlert.hospital_id === h.id)?.address}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wide font-bold" style={{ color: '#9CA3AF', marginBottom: '0.25rem' }}>
                      Distance
                    </p>
                    <p className="text-lg font-black" style={{ color: '#F9FAFB' }}>
                      {hospitals.find(h => activeAlert.hospital_id === h.id)?.distance_km?.toFixed(1) || '0.0'} km
                    </p>
                    <p className="text-sm" style={{ color: '#9CA3AF', marginTop: '0.25rem' }}>
                      ETA: {hospitals.find(h => activeAlert.hospital_id === h.id)?.eta_minutes || '0'} mins
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wide font-bold" style={{ color: '#9CA3AF', marginBottom: '0.25rem' }}>
                      Hospital Contact
                    </p>
                    <p className="text-lg font-black" style={{ color: '#F9FAFB' }}>
                      {responderPhone ? (
                        <a 
                          href={`tel:${responderPhone}`} 
                          style={{ color: '#22C55E', textDecoration: 'none' }}
                        >
                          {responderPhone}
                        </a>
                      ) : 'Not available'}
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => {
                        const hospital = hospitals.find(h => activeAlert?.hospital_id === h.id);
                        if (hospital) {
                          window.open(`https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lng}`, '_blank');
                        }
                      }}
                      className="flex-1 py-4 rounded-xl font-black text-lg transition-all duration-200 hover:scale-105 active:scale-100 text-white"
                      style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)', boxShadow: '0 0 20px rgba(34,197,94,0.3)' }}
                    >
                      🗺️ Get Directions
                    </button>
                    <button
                      onClick={handleMarkArrived}
                      className="flex-1 py-4 rounded-xl font-black text-lg transition-all duration-200 hover:scale-105 active:scale-100 text-white"
                      style={{ background: 'linear-gradient(135deg, #EF4444, #DC2626)', boxShadow: '0 0 20px rgba(239,68,68,0.3)' }}
                    >
                      ✅ Mark Arrived
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Triage info */}
              {caseData?.ai_triage_result && (
                <div className="rounded-xl p-4 mb-1" style={{ background: '#111827', border: '1px solid rgba(239,68,68,0.1)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#9CA3AF' }}>AI Triage Result</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{
                      background: caseData.ai_triage_result.urgency === 'critical' ? 'rgba(239,68,68,0.2)' :
                        caseData.ai_triage_result.urgency === 'high' ? 'rgba(234,179,8,0.2)' : 'rgba(34,197,94,0.2)',
                      color: caseData.ai_triage_result.urgency === 'critical' ? '#EF4444' :
                        caseData.ai_triage_result.urgency === 'high' ? '#EAB308' : '#22C55E',
                    }}>
                      {caseData.ai_triage_result.urgency?.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm font-semibold" style={{ color: '#F9FAFB' }}>
                    Specialty: {caseData.ai_triage_result.required_specialty}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {caseData.ai_triage_result.equipment_needed?.map((e) => (
                      <span key={e} className="text-xs px-2 py-0.5 rounded-full" style={{
                        background: '#374151', color: '#D1D5DB'
                      }}>{e}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Hospital cards */}
              {hospitals.length === 0 ? (
                <div className="text-center py-12" style={{ color: '#6B7280' }}>No hospitals found</div>
              ) : (
                hospitals.map((h, i) => (
                  <HospitalCard
                    key={h.id}
                    hospital={h}
                    rank={i + 1}
                    onSendAlert={sendAlert}
                    alertSent={alertSent}
                    isNew={newHospitalIds.has(h.id)}
                  />
                ))
              )}
            </>
          )}
        </div>

        {/* Right panel — Map */}
        <div className="flex-1 relative min-h-64">
          <div ref={mapRef} className="absolute inset-0" />
          {(!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY === 'your_google_maps_api_key') && (
            <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: '#111827' }}>
              <div className="text-5xl mb-4">🗺️</div>
              <p className="text-sm" style={{ color: '#9CA3AF' }}>Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to enable map</p>
              <div className="mt-6 grid grid-cols-1 gap-2 w-48">
                {hospitals.slice(0, 3).map((h, i) => (
                  <div key={h.id} className="flex items-center gap-2 text-xs" style={{ color: '#9CA3AF' }}>
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ background: ['#EF4444', '#EAB308', '#22C55E'][i] }}>
                      {i + 1}
                    </span>
                    {h.name.split(' ').slice(0, 2).join(' ')}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
