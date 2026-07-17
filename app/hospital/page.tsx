'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, Alert, Hospital, InventoryItem, Case } from '@/lib/supabase'
import GlassCard from '@/components/GlassCard'
import GlassButton from '@/components/GlassButton'
import StatusBadge from '@/components/StatusBadge'
import { Activity, Siren, Clock, User, ShieldAlert, LogOut, CheckCircle2 } from 'lucide-react'

type AlertWithCase = Alert & {
  cases: Case
}

export default function HospitalDashboard() {
  const router = useRouter()
  
  const [hospitalProfile, setHospitalProfile] = useState<Hospital | null>(null)
  const [hospital, setHospital] = useState<Hospital | null>(null)
  const [activeTab, setActiveTab] = useState('Upcoming Requests')
  const [alerts, setAlerts] = useState<AlertWithCase[]>([])
  const [acceptedAlert, setAcceptedAlert] = useState<AlertWithCase | null>(null)
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const channelRef = useRef<any>(null)

  const tabs = ['Upcoming Requests', 'Active Case', 'Mission Log', 'Inventory']

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data: profile } = await supabase
        .from('hospital_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      if (!profile) {
        router.push('/auth/profile-setup/hospital')
        return
      }
      
      setHospitalProfile(profile)
      
      if (profile.hospital_id) {
        const { data: hosp } = await supabase
          .from('hospitals')
          .select('*')
          .eq('id', profile.hospital_id)
          .single()
        setHospital(hosp)
        await loadAlerts(profile.hospital_id)
        await loadInventory(profile.hospital_id)
        if (channelRef.current) {
          await supabase.removeChannel(channelRef.current)
        }
        channelRef.current = subscribeToAlerts(profile.hospital_id)
      }

      setLoading(false)
    }
    init()

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [router])

  const loadAlerts = async (hospitalId: string) => {
    const { data } = await supabase
      .from('alerts')
      .select('*, cases(*)')
      .eq('hospital_id', hospitalId)
      .order('created_at', { ascending: false })
    if (data) {
      setAlerts(data as AlertWithCase[])
      setAcceptedAlert((prev) => {
        if (!prev) return prev
        const updated = (data as AlertWithCase[]).find((a) => a.id === prev.id)
        return updated || prev
      })
    }
  }

  const loadInventory = async (hospitalId: string) => {
    const { data } = await supabase
      .from('inventory')
      .select('*')
      .eq('hospital_id', hospitalId)
    if (data) setInventory(data as InventoryItem[])
  }

  const subscribeToAlerts = (hospitalId: string) => {
    return supabase
      .channel(`hospital-${hospitalId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'alerts',
        filter: `hospital_id=eq.${hospitalId}`
      }, () => loadAlerts(hospitalId))
      .subscribe()
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleAcceptAlert = async (alert: AlertWithCase) => {
    const { data: { user } } = await supabase.auth.getUser()
    await fetch(`/api/alert/${alert.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'accepted', responded_by: user?.id })
    })
    setAcceptedAlert(alert)
    setActiveTab('Active Case')
  }

  const handleUpdateAlertStatus = async (alertId: string, status: 'preparing' | 'arrived') => {
    await fetch(`/api/alert/${alertId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
  }

  const handleDeclineAlert = async (alert: AlertWithCase) => {
    await fetch(`/api/alert/${alert.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'declined' })
    })
  }

  const handleAddInventoryItem = async () => {
    if (!hospital) return
    const newItem: Partial<InventoryItem> = {
      hospital_id: hospital.id,
      item_name: 'New Item',
      quantity: 0,
      unit: 'units'
    }
    const { data } = await supabase.from('inventory').insert(newItem).select().single()
    if (data) setInventory([...inventory, data])
  }

  const handleUpdateInventoryItem = async (id: string, updates: Partial<InventoryItem>) => {
    await supabase.from('inventory').update(updates).eq('id', id)
    setInventory(inventory.map(i => i.id === id ? { ...i, ...updates } : i))
  }

  const getSeverityLabel = (s: number) => s <= 3 ? 'moderate' : s <= 6 ? 'high' : 'critical'

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-brand-red bg-[#070b14] font-mono">
        <div className="flex flex-col items-center gap-3">
          <Activity className="h-10 w-10 animate-pulse" />
          <span>SYNCHRONIZING WITH HEALTH HUB COMMAND...</span>
        </div>
      </div>
    )
  }

  const pendingAlerts = alerts.filter(a => a.status === 'pending')
  const acceptedAlerts = alerts.filter(a => ['accepted', 'preparing', 'arrived'].includes(a.status))

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
              JR // HOSPITAL COMMAND
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs">
            <span className="text-gray-400 font-mono">
              COMMAND NODE: <span className="text-white font-bold">{hospital?.name}</span>
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

      {/* Segmented Tab Switcher */}
      <div className="pt-20 px-6 max-w-7xl mx-auto w-full mt-4">
        <div className="flex gap-1.5 p-1 bg-brand-navy-light/40 border border-white/5 rounded-xl max-w-md">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all font-mono cursor-pointer ${
                activeTab === tab
                  ? 'bg-brand-red text-white shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Workspace Panels */}
      <main className="flex-grow p-6 max-w-7xl mx-auto w-full">
        {activeTab === 'Upcoming Requests' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-red animate-ping"></span>
                Incoming Emergency Dispatches
              </h2>
              <span className="text-[10px] text-gray-500 font-mono">NODE LISTENERS ONLINE</span>
            </div>

            {pendingAlerts.length === 0 ? (
              <GlassCard className="p-12 text-center text-gray-500 font-mono text-sm border border-white/5">
                No active incoming dispatch requests
              </GlassCard>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingAlerts.map((alert) => (
                  <GlassCard key={alert.id} className="p-5 border border-white/5 hover:border-white/10 transition-colors flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <div className="space-y-1">
                          <span className="text-[10px] text-brand-red font-mono font-bold uppercase tracking-wider">
                            CRITICAL PRIORITY INBOUND
                          </span>
                          <h3 className="text-lg font-bold text-white font-sans flex items-center gap-2">
                            {alert.cases?.patient_condition || 'Unknown'} Emergency
                          </h3>
                        </div>
                        <StatusBadge status={getSeverityLabel(alert.cases?.severity || 5)} />
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs font-mono text-gray-400 mb-4 bg-brand-navy-dark/60 p-3 rounded-lg border border-white/5">
                        <div>
                          <span className="text-gray-500">AGE:</span> {alert.cases?.age}
                        </div>
                        <div>
                          <span className="text-gray-500">BLOOD GROUP:</span> {alert.cases?.blood_group}
                        </div>
                        <div>
                          <span className="text-gray-500">RECEIVED:</span> {new Date(alert.created_at).toLocaleTimeString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500">TIMER:</span> <span className="text-brand-red animate-pulse">60s</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleAcceptAlert(alert)}
                        className="flex-1 py-2 rounded-lg bg-medical-emerald hover:bg-emerald-600 text-white font-mono text-xs font-bold transition-all active:scale-98 cursor-pointer"
                      >
                        ✓ ACCEPT SLOT
                      </button>
                      <button
                        onClick={() => handleDeclineAlert(alert)}
                        className="py-2 px-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-gray-300 font-mono text-xs transition-all active:scale-98 cursor-pointer"
                      >
                        ✖ DECLINE
                      </button>
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'Active Case' && (
          <div className="max-w-xl mx-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/5">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Currently Monitored Patient
              </h2>
              <span className="text-[10px] text-medical-emerald font-mono">SLOT LOCKED</span>
            </div>

            {acceptedAlert ? (
              <GlassCard className="p-6 border border-white/5 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded bg-brand-red/10 border border-brand-red/20 text-brand-red animate-pulse">
                      <Siren className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white font-sans">
                        En Route: {acceptedAlert.cases.patient_condition}
                      </h3>
                      <p className="text-[10px] text-gray-500 font-mono">
                        CASE REF: #{acceptedAlert.id.substring(0, 8)}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs uppercase tracking-wider px-2.5 py-1 rounded bg-brand-red/10 border border-brand-red/20 text-brand-red font-mono">
                    SEVERITY: {acceptedAlert.cases.severity}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-mono text-gray-300 bg-brand-navy-dark/95 p-4 rounded-lg border border-white/5">
                  <div>
                    <span className="text-gray-500 block">PATIENT AGE</span>
                    <span className="text-white font-bold">{acceptedAlert.cases.age} yrs</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">BLOOD GROUP</span>
                    <span className="text-white font-bold">{acceptedAlert.cases.blood_group}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">MISSION STATUS</span>
                    <StatusBadge status={acceptedAlert.status} />
                  </div>
                  <div>
                    <span className="text-gray-500 block">COORDINATION</span>
                    <span className="text-medical-emerald font-bold">MUTUAL LINK NOMINAL</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleUpdateAlertStatus(acceptedAlert.id, 'preparing')}
                    disabled={acceptedAlert.status === 'preparing' || acceptedAlert.status === 'arrived'}
                    className="flex-1 py-2.5 rounded-lg border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white font-mono text-xs font-semibold transition-all active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    🔧 {acceptedAlert.status === 'preparing' ? 'Staff Preparing...' : 'Mark ER Ready'}
                  </button>
                  <button
                    onClick={() => handleUpdateAlertStatus(acceptedAlert.id, 'arrived')}
                    disabled={acceptedAlert.status === 'arrived'}
                    className="flex-1 py-2.5 rounded-lg bg-medical-emerald hover:bg-emerald-600 text-white font-mono text-xs font-bold transition-all active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    ✓ CONFIRM ARRIVED AT BAY
                  </button>
                </div>
              </GlassCard>
            ) : (
              <GlassCard className="p-12 text-center text-gray-500 font-mono text-sm border border-white/5">
                No active accepted case currently locked.
              </GlassCard>
            )}
          </div>
        )}

        {activeTab === 'Mission Log' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Accepted / Prepared Admissions History
              </h2>
              <span className="text-[10px] text-gray-500 font-mono">ARCHIVED RUNS</span>
            </div>

            {acceptedAlerts.length === 0 ? (
              <GlassCard className="p-12 text-center text-gray-500 font-mono text-sm border border-white/5">
                No missions archived.
              </GlassCard>
            ) : (
              <div className="space-y-2">
                {acceptedAlerts.map((alert) => (
                  <GlassCard key={alert.id} className="p-4 border border-white/5 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 rounded-full bg-medical-emerald"></div>
                      <div>
                        <h4 className="text-white font-bold font-sans text-sm">
                          {alert.cases?.patient_condition} Emergency
                        </h4>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          ADMITTED AT: {new Date(alert.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <StatusBadge status={alert.status} />
                      <span className="text-gray-500">SLOT SECURED</span>
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'Inventory' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-white/5">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Emergency Department Inventory
              </h2>
              <button 
                onClick={handleAddInventoryItem}
                className="py-1.5 px-3 rounded-lg bg-medical-emerald hover:bg-emerald-600 text-white font-mono text-xs font-bold transition-all active:scale-98 cursor-pointer"
              >
                + ADD ITEM
              </button>
            </div>

            <GlassCard className="p-6 border border-white/5">
              <div className="space-y-3">
                {inventory.length === 0 ? (
                  <p className="text-gray-500 font-mono text-xs text-center py-6">
                    No critical supplies registered in inventory
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {inventory.map((item) => (
                      <div 
                        key={item.id} 
                        className="flex items-center gap-3 border-b border-white/5 pb-2.5 last:border-0 last:pb-0"
                      >
                        <input
                          type="text"
                          value={item.item_name}
                          onChange={(e) => handleUpdateInventoryItem(item.id, { item_name: e.target.value })}
                          className="flex-1 input text-xs font-mono"
                          placeholder="SUPPLY NAME"
                        />
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleUpdateInventoryItem(item.id, { quantity: parseInt(e.target.value) || 0 })}
                          className="w-24 input text-xs font-mono"
                          placeholder="QTY"
                        />
                        <input
                          type="text"
                          value={item.unit}
                          onChange={(e) => handleUpdateInventoryItem(item.id, { unit: e.target.value })}
                          className="w-20 input text-xs font-mono"
                          placeholder="UNIT"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </GlassCard>
          </div>
        )}
      </main>
    </div>
  )
}
