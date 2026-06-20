'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase, Alert, Case, Hospital } from '@/lib/supabase'
import Link from 'next/link'
import { Suspense } from 'react'

function ETACountdown({ minutes }: { minutes: number }) {
  const [remaining, setRemaining] = useState(minutes * 60)

  useEffect(() => {
    if (remaining <= 0) return
    const t = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000)
    return () => clearInterval(t)
  }, [remaining])

  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60
  const pct = Math.max(0, (remaining / (minutes * 60)) * 100)

  return (
    <div className="text-center p-4 rounded-2xl" style={{ background: 'rgba(37,99,235,0.05)', border: '1px solid rgba(37,99,235,0.15)' }}>
      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#64748B' }}>ETA Countdown</p>
      <p className="text-4xl font-black font-mono mb-3" style={{ color: remaining < 300 ? '#EF4444' : '#2563EB' }}>
        {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </p>
      <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: '#E2E8F0' }}>
        <div className="h-full rounded-full transition-all duration-1000" style={{
          width: `${pct}%`,
          background: remaining < 300 ? '#EF4444' : '#2563EB',
        }} />
      </div>
    </div>
  )
}

function DeclineModal({ onDecline, onClose }: { onDecline: (reason: string) => void; onClose: () => void }) {
  const [reason, setReason] = useState('')
  const reasons = ['ICU at capacity', 'No specialist available', 'Equipment unavailable', 'Other']

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
      <div className="rounded-2xl p-6 max-w-sm w-full animate-slide-in-up" style={{
        background: 'white', boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
      }}>
        <h3 className="text-lg font-bold mb-1" style={{ color: '#0F172A' }}>Decline Alert</h3>
        <p className="text-sm mb-5" style={{ color: '#64748B' }}>Please select a reason for declining this patient</p>
        <div className="space-y-2 mb-5">
          {reasons.map((r) => (
            <button
              key={r}
              onClick={() => setReason(r)}
              className="w-full px-4 py-3 rounded-xl text-left text-sm font-medium transition-all"
              style={{
                background: reason === r ? 'rgba(239,68,68,0.1)' : '#F8FAFC',
                border: `1px solid ${reason === r ? '#EF4444' : '#E2E8F0'}`,
                color: reason === r ? '#EF4444' : '#374151',
              }}
            >
              {r}
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl font-semibold text-sm" style={{
            background: '#F1F5F9', color: '#374151'
          }}>
            Cancel
          </button>
          <button
            onClick={() => reason && onDecline(reason)}
            disabled={!reason}
            className="flex-1 py-3 rounded-xl font-bold text-sm text-white transition-all"
            style={{
              background: reason ? '#EF4444' : '#94A3B8',
              opacity: reason ? 1 : 0.6,
            }}
          >
            Confirm Decline
          </button>
        </div>
      </div>
    </div>
  )
}

function IncomingAlertContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const alertId = searchParams.get('alertId')
  const hospitalId = searchParams.get('hospitalId')

  const [alert, setAlert] = useState<Alert | null>(null)
  const [caseData, setCaseData] = useState<Case | null>(null)
  const [hospital, setHospital] = useState<Hospital | null>(null)
  const [etaMinutes, setEtaMinutes] = useState(15)
  const [showDeclineModal, setShowDeclineModal] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [loading, setLoading] = useState(true)
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!alertId) return
    const load = async () => {
      const { data: a } = await supabase
        .from('alerts')
        .select('*')
        .eq('id', alertId)
        .single()
      if (!a) return

      setAlert(a as Alert)

      const { data: c } = await supabase.from('cases').select('*').eq('id', a.case_id).single()
      if (c) setCaseData(c as Case)

      if (hospitalId) {
        const { data: h } = await supabase.from('hospitals').select('*').eq('id', hospitalId).single()
        if (h) setHospital(h as Hospital)
      }

      // Calculate ETA if case data available
      if (c && hospitalId) {
        const { data: h } = await supabase.from('hospitals').select('*').eq('id', hospitalId).single()
        if (h && c.current_lat && c.current_lng) {
          const R = 6371
          const dLat = ((h.lat - c.current_lat) * Math.PI) / 180
          const dLng = ((h.lng - c.current_lng) * Math.PI) / 180
          const aVal = Math.sin(dLat / 2) ** 2 + Math.cos((c.current_lat * Math.PI) / 180) * Math.cos((h.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
          const dist = R * 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal))
          setEtaMinutes(Math.max(5, Math.round((dist / 40) * 60)))
        }
      }

      setLoading(false)
    }
    load()
  }, [alertId, hospitalId])

  // Load mini map
  useEffect(() => {
    if (!caseData || !hospital || loading) return
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey || apiKey === 'your_google_maps_api_key') return

    const loadMap = () => {
      if (!mapRef.current || !window.google) return
      const map = new window.google.maps.Map(mapRef.current, {
        zoom: 12,
        center: { lat: caseData.current_lat || caseData.pickup_lat, lng: caseData.current_lng || caseData.pickup_lng },
        styles: [
          { elementType: 'geometry', stylers: [{ color: '#F8FAFC' }] },
          { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#E2E8F0' }] },
          { featureType: 'poi', stylers: [{ visibility: 'off' }] },
        ],
        disableDefaultUI: true,
      })
      new window.google.maps.Marker({
        position: { lat: caseData.current_lat || caseData.pickup_lat, lng: caseData.current_lng || caseData.pickup_lng },
        map,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="#EF4444" stroke="white" stroke-width="2"/><text x="16" y="21" text-anchor="middle" font-size="14">🚑</text></svg>`),
          scaledSize: new window.google.maps.Size(32, 32),
        }
      })
      new window.google.maps.Marker({
        position: { lat: hospital.lat, lng: hospital.lng },
        map,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="#2563EB" stroke="white" stroke-width="2"/><text x="16" y="21" text-anchor="middle" font-size="14">🏥</text></svg>`),
          scaledSize: new window.google.maps.Size(32, 32),
        }
      })
    }

    if (window.google) { loadMap() } else {
      window.initMap = loadMap
      if (!document.querySelector('script[src*="maps.googleapis.com"]')) {
        const script = document.createElement('script')
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`
        script.async = true
        document.head.appendChild(script)
      }
    }
  }, [caseData, hospital, loading])

  const handleAccept = async () => {
    if (!alertId || processing) return
    setProcessing(true)
    await fetch(`/api/alert/${alertId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'accepted' }),
    })
    router.push(`/hospital/prep/${alertId}`)
  }

  const handleDecline = async (reason: string) => {
    if (!alertId || processing) return
    setShowDeclineModal(false)
    setProcessing(true)
    await fetch(`/api/alert/${alertId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'declined', decline_reason: reason }),
    })
    router.push('/hospital')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-t-blue-500 border-r-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const triage = caseData?.ai_triage_result

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
      {showDeclineModal && (
        <DeclineModal onDecline={handleDecline} onClose={() => setShowDeclineModal(false)} />
      )}

      {/* ETA Countdown */}
      <ETACountdown minutes={etaMinutes} />

      {/* Patient summary card */}
      <div className="rounded-2xl p-6" style={{ background: 'white', border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg" style={{ color: '#0F172A' }}>Patient Summary</h2>
          {triage && (
            <span className="text-xs font-bold px-3 py-1 rounded-full" style={{
              background: triage.urgency === 'critical' ? 'rgba(239,68,68,0.1)' :
                triage.urgency === 'high' ? 'rgba(234,179,8,0.1)' : 'rgba(34,197,94,0.1)',
              color: triage.urgency === 'critical' ? '#DC2626' :
                triage.urgency === 'high' ? '#CA8A04' : '#16A34A',
            }}>
              {triage.urgency?.toUpperCase() || 'MODERATE'}
            </span>
          )}
        </div>

        {/* AI summary */}
        {triage && (
          <div className="mb-4 px-4 py-3 rounded-xl" style={{ background: 'rgba(37,99,235,0.05)', border: '1px solid rgba(37,99,235,0.1)' }}>
            <p className="text-sm font-medium" style={{ color: '#1D4ED8' }}>
              🧠 {caseData?.patient_condition} patient requiring {triage.required_specialty} care
            </p>
          </div>
        )}

        {/* Patient details grid */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          {[
            { label: 'Age', value: `${caseData?.age} yrs` },
            { label: 'Blood Group', value: caseData?.blood_group || '—' },
            { label: 'Allergies', value: caseData?.allergies || 'None' },
          ].map((d) => (
            <div key={d.label} className="text-center p-3 rounded-xl" style={{ background: '#F8FAFC' }}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#94A3B8' }}>{d.label}</p>
              <p className="font-bold text-sm" style={{ color: '#0F172A' }}>{d.value}</p>
            </div>
          ))}
        </div>

        {/* Equipment needed */}
        {triage?.equipment_needed && triage.equipment_needed.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#94A3B8' }}>Equipment Required</p>
            <div className="flex flex-wrap gap-2">
              {triage.equipment_needed.map((e) => (
                <span key={e} className="text-xs px-2 py-1 rounded-lg font-medium" style={{
                  background: 'rgba(239,68,68,0.08)', color: '#DC2626', border: '1px solid rgba(239,68,68,0.15)'
                }}>{e}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mini map */}
      <div className="rounded-2xl overflow-hidden" style={{ height: '180px', border: '1px solid #E2E8F0' }}>
        <div ref={mapRef} className="w-full h-full" style={{ background: '#F1F5F9' }}>
          {(!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY === 'your_google_maps_api_key') && (
            <div className="flex items-center justify-center h-full" style={{ color: '#94A3B8' }}>
              <span className="text-sm">🗺️ Map requires Google Maps API key</span>
            </div>
          )}
        </div>
      </div>

      {/* Accept / Decline buttons */}
      {alert?.status === 'pending' ? (
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setShowDeclineModal(true)}
            disabled={processing}
            className="py-5 rounded-2xl font-bold text-lg transition-all duration-200 hover:scale-105 active:scale-100"
            style={{
              background: 'rgba(239,68,68,0.08)',
              border: '2px solid rgba(239,68,68,0.3)',
              color: '#EF4444',
            }}
          >
            ❌ Decline
          </button>
          <button
            onClick={handleAccept}
            disabled={processing}
            className="py-5 rounded-2xl font-bold text-lg transition-all duration-200 hover:scale-105 active:scale-100 text-white"
            style={{
              background: 'linear-gradient(135deg, #16A34A, #15803D)',
              boxShadow: '0 0 20px rgba(22,163,74,0.3)',
            }}
          >
            {processing ? '...' : '✅ Accept'}
          </button>
        </div>
      ) : (
        <div className="py-5 rounded-2xl font-bold text-lg text-center" style={{
          background: alert?.status === 'accepted' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
          border: `2px solid ${alert?.status === 'accepted' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
          color: alert?.status === 'accepted' ? '#16A34A' : '#EF4444',
        }}>
          {alert?.status === 'accepted' ? '✅ Accepted' : '❌ Declined'}
        </div>
      )}

      <Link href="/hospital" className="block text-center text-sm" style={{ color: '#94A3B8' }}>
        ← Back to dashboard
      </Link>
    </div>
  )
}

export default function IncomingPage() {
  return (
    <main className="min-h-screen" style={{ background: '#F8FAFC' }}>
      <header className="border-b px-6 py-4 flex items-center gap-4" style={{ background: 'white', borderColor: '#E2E8F0' }}>
        <Link href="/hospital" className="text-blue-600 hover:text-blue-700 transition-colors">←</Link>
        <div>
          <h1 className="font-bold" style={{ color: '#0F172A' }}>Incoming Alert</h1>
          <p className="text-xs" style={{ color: '#64748B' }}>Review and respond to patient alert</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs font-bold" style={{ color: '#EF4444' }}>INCOMING</span>
        </div>
      </header>
      <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-t-blue-500 border-r-transparent rounded-full animate-spin" /></div>}>
        <IncomingAlertContent />
      </Suspense>
    </main>
  )
}
