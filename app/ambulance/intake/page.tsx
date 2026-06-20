'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { GoogleMap, Marker, DirectionsRenderer, useJsApiLoader } from '@react-google-maps/api'
import { supabase, ScoredHospital, Hospital, TriageResult, Alert } from '@/lib/supabase'
import GlassCard from '@/components/GlassCard'
import GlassButton from '@/components/GlassButton'
import GlassNav from '@/components/GlassNav'
import StatusBadge from '@/components/StatusBadge'
import HospitalCard from '@/components/HospitalCard'
import Link from 'next/link'

const CONDITIONS = [
  { id: 'Cardiac', label: 'Cardiac', icon: '❤️' },
  { id: 'Trauma', label: 'Trauma', icon: '🩹' },
  { id: 'Neurological', label: 'Neuro', icon: '🧠' },
  { id: 'Burns', label: 'Burns', icon: '🔥' },
  { id: 'Maternity', label: 'Maternity', icon: '🤱' },
  { id: 'Respiratory', label: 'Respiratory', icon: '🫁' },
]

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']

const MAP_LIBRARIES: ('places' | 'geometry')[] = []

export default function AmbulanceDashboard() {
  const router = useRouter()

  const { isLoaded: mapLoaded, loadError: mapLoadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: MAP_LIBRARIES,
  })
  
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

  // Live alert tracking (accept/reject/preparing/arrived)
  const [activeAlert, setActiveAlert] = useState<Alert | null>(null)
  const [activeHospital, setActiveHospital] = useState<ScoredHospital | null>(null)
  const [responderPhone, setResponderPhone] = useState<string | null>(null)
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null)
  const [directionsUnavailable, setDirectionsUnavailable] = useState(false)

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
  }, [router, supabase])

  // Live subscription: watch alerts for the current case so we know
  // the instant a hospital accepts / declines / updates status.
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
        // Look up the hospital + the responder's phone
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
        // No accepted alert — check for newly declined hospitals so we
        // can drop them from the suggestion list.
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

  // Fetch turn-by-turn directions once a hospital accepts
  useEffect(() => {
    if (!mapLoaded || !location || !activeHospital) {
      setDirections(null)
      setDirectionsUnavailable(false)
      return
    }

    try {
      const directionsService = new google.maps.DirectionsService()
      directionsService.route(
        {
          origin: location,
          destination: { lat: activeHospital.lat, lng: activeHospital.lng },
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            setDirections(result)
            setDirectionsUnavailable(false)
          } else {
            // Handle directions errors gracefully without spamming console
            setDirections(null)
            setDirectionsUnavailable(true)
            console.log('Directions unavailable (check Google Maps API key/billing)')
          }
        }
      )
    } catch (error) {
      setDirections(null)
      setDirectionsUnavailable(true)
      console.log('Directions unavailable (check Google Maps API key/billing)')
    }
  }, [mapLoaded, location, activeHospital])

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
      // Step 1: Create case
      console.log('Inserting case with data:', {
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
        console.error('Case insert error:', JSON.stringify(caseError, null, 2))
        console.error('Case error message:', caseError.message)
        console.error('Case error details:', caseError.details)
        console.error('Case error hint:', caseError.hint)
        setRequestStatus(`❌ DB Error: ${caseError.message}`)
        return
      }

      console.log('Case created:', newCase)
      setCaseId(newCase.id)
      setRequestStatus('AI triaging...')

      // Step 2: Call triage API
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

      const triageText = await triageRes.text()
      console.log('Triage raw response:', triageText)

      if (!triageRes.ok) {
        setRequestStatus(`❌ Triage API Error: ${triageRes.status} — ${triageText}`)
        return
      }

      const triageData = JSON.parse(triageText)
      console.log('Triage result:', triageData)
      setTriageResult(triageData.triage)

      setRequestStatus('Finding hospitals...')

      // Step 3: Call recommend API
      const recommendRes = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_id: newCase.id,
          lat: location.lat,
          lng: location.lng
        })
      })

      const recommendText = await recommendRes.text()
      console.log('Recommend raw response:', recommendText)

      if (!recommendRes.ok) {
        setRequestStatus(`❌ Recommend API Error: ${recommendRes.status} — ${recommendText}`)
        return
      }

      const recommendData = JSON.parse(recommendText)
      setHospitals(recommendData.hospitals)

      setRequestStatus('Ready to send alert')

    } catch (err: any) {
      console.error('Full error object:', JSON.stringify(err, null, 2))
      console.error('Error message:', err?.message)
      console.error('Error stack:', err?.stack)
      setRequestStatus(`❌ Error: ${err?.message || 'Unknown error — check console'}`)
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
      
      // Reset all state to start fresh
      setActiveAlert(null)
      setActiveHospital(null)
      setResponderPhone(null)
      setDirections(null)
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
      <div className="min-h-screen flex items-center justify-center text-primary bg-primary">
        Loading...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary">
      <GlassNav>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-lg font-bold text-white">
              {operatorProfile?.operator_name?.charAt(0) || 'O'}
            </div>
            <span className="text-primary font-medium">{operatorProfile?.operator_name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary">JeevanRoute</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-secondary hover:text-primary font-medium">Profile</button>
            <button onClick={handleLogout} className="text-secondary hover:text-primary font-medium">Logout</button>
            <span className="text-secondary">🚑 {operatorProfile?.vehicle_number}</span>
          </div>
        </div>
      </GlassNav>

      <div className="flex h-[calc(100vh-100px)] p-4 gap-4">
        {/* Left Panel: Intake */}
        <GlassCard className="w-1/3 p-6 overflow-y-auto">
          <h2 className="text-xl font-bold text-primary mb-6">Patient Condition</h2>

          {/* Condition Pills */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {CONDITIONS.map((c) => (
              <button
                key={c.id}
                onClick={() => setCondition(c.id)}
                className={`py-3 px-4 rounded-lg border font-medium transition-all ${
                  condition === c.id
                    ? 'border-red-500 bg-red-50 text-primary'
                    : 'border-gray-200 bg-white text-secondary hover:bg-gray-50'
                }`}
              >
                {c.icon} {c.label}
              </button>
            ))}
          </div>

          {/* Severity Slider */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-secondary">Severity</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-primary">{severity}</span>
                <StatusBadge status={getSeverityLabel(severity)} />
              </div>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={severity}
              onChange={(e) => setSeverity(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-tertiary mt-2">
              <span>1 — Mild</span>
              <span>5 — High</span>
              <span>10 — Critical</span>
            </div>
          </div>

          {/* Age & Blood Group */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm text-secondary mb-2 font-medium">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="input"
                placeholder="45"
              />
            </div>
            <div>
              <label className="block text-sm text-secondary mb-2 font-medium">Blood Group</label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="input"
              >
                <option value="">Select</option>
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Location */}
          <div className="mb-6">
            <label className="block text-sm text-secondary mb-2 font-medium">Location</label>
            <div className="flex gap-3 mb-3">
              <button
                onClick={detectLocation}
                disabled={locating}
                className="flex-1 py-3 px-4 rounded-lg border border-gray-300 bg-white text-primary font-medium hover:bg-gray-50 transition-all"
              >
                {locating ? 'Detecting...' : '📍 Auto'}
              </button>
              <button className="py-3 px-4 rounded-lg border border-gray-300 bg-white text-primary font-medium hover:bg-gray-50 transition-all">
                Manual
              </button>
            </div>
            {location && (
              <p className="text-sm text-secondary">
                {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </p>
            )}
          </div>

          {/* Suggest Button */}
          <GlassButton
            variant="primary"
            className="w-full"
            onClick={handleSuggestHospitals}
            disabled={!condition || !age || !bloodGroup || !location}
          >
            Suggest Hospital
          </GlassButton>

          {/* Status */}
          {requestStatus && (
            <p className="text-center text-secondary mt-4">{requestStatus}</p>
          )}
        </GlassCard>

        {/* Right Panel: Map & Hospitals */}
        <GlassCard className="flex-1 flex flex-col">
          <div className="flex-1 bg-gray-50 rounded-xl m-4 overflow-hidden relative min-h-[300px] border border-gray-200">
            {!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-tertiary text-lg px-6 text-center">
                  ⚠️ Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env.local
                </span>
              </div>
            ) : mapLoadError ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-tertiary text-lg px-6 text-center">
                  ⚠️ Map failed to load — check API key restrictions
                </span>
              </div>
            ) : !mapLoaded ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-tertiary text-lg">Loading map…</span>
              </div>
            ) : (
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={location || { lat: 28.6139, lng: 77.2090 }}
                zoom={location ? 12 : 10}
                options={{
                  disableDefaultUI: false,
                  zoomControl: true,
                }}
              >
                {location && (
                  <Marker
                    position={location}
                    icon={{
                      path: window.google.maps.SymbolPath.CIRCLE,
                      scale: 9,
                      fillColor: '#EF4444',
                      fillOpacity: 1,
                      strokeColor: '#ffffff',
                      strokeWeight: 2,
                    }}
                    title="Ambulance (your location)"
                  />
                )}
                {activeAlert && activeHospital ? (
                  <>
                    <Marker
                      position={{ lat: activeHospital.lat, lng: activeHospital.lng }}
                      title={activeHospital.name}
                    />
                    {directions && (
                      <DirectionsRenderer
                        directions={directions}
                        options={{
                          suppressMarkers: true,
                          polylineOptions: { strokeColor: '#22C55E', strokeWeight: 5 },
                        }}
                      />
                    )}
                  </>
                ) : (
                  hospitals.map((hospital: any) =>
                    hospital.lat && hospital.lng ? (
                      <Marker
                        key={hospital.id}
                        position={{ lat: hospital.lat, lng: hospital.lng }}
                        title={hospital.name}
                      />
                    ) : null
                  )
                )}
              </GoogleMap>
            )}
          </div>
          {directionsUnavailable && (
            <div className="px-4 pb-2">
              <p className="text-xs text-tertiary text-center">
                📍 Estimated distance shown — live routing temporarily unavailable
              </p>
            </div>
          )}
          {activeAlert && activeHospital ? (
            <div className="p-4 border-t border-gray-200">
              <h3 className="text-2xl font-bold text-primary mb-4">🚑 En Route To Hospital</h3>
              <GlassCard className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <p className="text-tertiary text-xs uppercase tracking-wide mb-1 font-bold">Hospital</p>
                    <p className="text-primary font-bold text-xl">{activeHospital.name}</p>
                    <p className="text-secondary text-lg mt-1">{activeHospital.address}</p>
                  </div>
                  <div>
                    <p className="text-tertiary text-xs uppercase tracking-wide mb-1 font-bold">Distance</p>
                    <p className="text-primary font-bold text-xl">
                      {directions
                        ? directions.routes[0]?.legs[0]?.distance?.text
                        : `${activeHospital.distance_km?.toFixed(1)} km`}
                    </p>
                    {directions && (
                      <p className="text-secondary text-lg mt-1">
                        ETA: {directions.routes[0]?.legs[0]?.duration?.text}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-tertiary text-xs uppercase tracking-wide mb-1 font-bold">Hospital Contact</p>
                    <p className="text-primary font-bold text-xl">
                      {responderPhone ? (
                        <a href={`tel:${responderPhone}`} className="text-green-600 hover:text-green-700">
                          {responderPhone}
                        </a>
                      ) : 'Not available'}
                    </p>
                  </div>
                  <div>
                    <p className="text-tertiary text-xs uppercase tracking-wide mb-1 font-bold">Status</p>
                    <StatusBadge status={activeAlert.status} />
                  </div>
                </div>
                <div className="flex gap-4">
                  <GlassButton
                    variant="success"
                    className="flex-1 py-4 text-lg font-bold"
                    onClick={() => {
                      if (activeHospital) {
                        window.open(`https://www.google.com/maps/dir/?api=1&destination=${activeHospital.lat},${activeHospital.lng}`, '_blank');
                      }
                    }}
                  >
                    🗺️ Get Directions
                  </GlassButton>
                  <GlassButton
                    variant="primary"
                    className="flex-1 py-4 text-lg font-bold"
                    onClick={handleMarkArrived}
                  >
                    ✅ Mark Arrived
                  </GlassButton>
                </div>
              </GlassCard>
            </div>
          ) : (
            hospitals.length > 0 && (
              <div className="p-4 border-t border-gray-200">
                <h3 className="text-lg font-bold text-primary mb-4">Top Recommended Hospitals</h3>
                <div className="grid grid-cols-2 gap-4">
                  {hospitals.slice(0, 4).map((hospital) => (
                    <div key={hospital.id} className="relative">
                      <HospitalCard hospital={hospital} />
                      <GlassButton
                        variant="success"
                        className="w-full mt-2"
                        onClick={() => handleSendAlert(hospital)}
                      >
                        Send Alert
                      </GlassButton>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
        </GlassCard>
      </div>
    </div>
  )
}
