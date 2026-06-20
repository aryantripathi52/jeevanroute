'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, Alert, Hospital, InventoryItem, Case } from '@/lib/supabase'
import GlassCard from '@/components/GlassCard'
import GlassButton from '@/components/GlassButton'
import GlassNav from '@/components/GlassNav'
import TabSwitcher from '@/components/TabSwitcher'
import StatusBadge from '@/components/StatusBadge'

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

  const tabs = ['Upcoming Requests', 'Accept Request', 'Prepared / Arrived', 'Inventory']

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
    setActiveTab('Accept Request')
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
      <div className="min-h-screen flex items-center justify-center text-primary bg-primary">
        Loading...
      </div>
    )
  }

  const pendingAlerts = alerts.filter(a => a.status === 'pending')
  const acceptedAlerts = alerts.filter(a => ['accepted', 'preparing', 'arrived'].includes(a.status))

  return (
    <div className="min-h-screen bg-secondary">
      <GlassNav>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-2xl">
              🏥
            </div>
            <span className="text-primary font-bold text-lg">{hospital?.name}</span>
          </div>
          <div className="flex items-center gap-6">
            <button className="text-secondary hover:text-primary font-medium">Hospital Profile</button>
            <button onClick={handleLogout} className="text-secondary hover:text-primary font-medium">Logout</button>
          </div>
        </div>
      </GlassNav>

      <div className="p-4">
        <TabSwitcher tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      <div className="px-4 pb-4">
        {activeTab === 'Upcoming Requests' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-primary">Incoming Alerts</h2>
            {pendingAlerts.length === 0 ? (
              <GlassCard className="p-8 text-center text-secondary">
                No incoming alerts
              </GlassCard>
            ) : (
              pendingAlerts.map((alert) => (
                <GlassCard key={alert.id} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-primary flex items-center gap-3">
                        {alert.cases?.patient_condition || 'Unknown'} Emergency
                        <StatusBadge status={getSeverityLabel(alert.cases?.severity || 5)} />
                      </h3>
                      <p className="text-secondary mt-1">
                        Age: {alert.cases?.age} · Blood Group: {alert.cases?.blood_group}
                      </p>
                    </div>
                    <p className="text-tertiary text-sm">
                      {new Date(alert.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <GlassButton
                      variant="success"
                      onClick={() => handleAcceptAlert(alert)}
                    >
                      ✅ Accept
                    </GlassButton>
                    <GlassButton
                      variant="danger"
                      onClick={() => handleDeclineAlert(alert)}
                    >
                      ❌ Decline
                    </GlassButton>
                  </div>
                </GlassCard>
              ))
            )}
          </div>
        )}

        {activeTab === 'Accept Request' && (
          <div>
            {acceptedAlert ? (
              <GlassCard className="p-8">
                <h2 className="text-xl font-bold text-primary mb-6">Active Case</h2>
                <div className="mb-6 space-y-2">
                  <p className="text-secondary">
                    <strong className="text-primary">Condition:</strong> {acceptedAlert.cases.patient_condition}
                  </p>
                  <p className="text-secondary">
                    <strong className="text-primary">Severity:</strong> {acceptedAlert.cases.severity}
                  </p>
                  <p className="text-secondary">
                    <strong className="text-primary">Age:</strong> {acceptedAlert.cases.age}
                  </p>
                  <p className="text-secondary">
                    <strong className="text-primary">Blood Group:</strong> {acceptedAlert.cases.blood_group}
                  </p>
                </div>
                <div className="flex gap-4">
                  <GlassButton
                    variant="info"
                    onClick={() => handleUpdateAlertStatus(acceptedAlert.id, 'preparing')}
                    disabled={acceptedAlert.status === 'preparing' || acceptedAlert.status === 'arrived'}
                  >
                    🔧 {acceptedAlert.status === 'preparing' ? 'Preparing...' : 'Mark Preparing'}
                  </GlassButton>
                  <GlassButton
                    variant="success"
                    onClick={() => handleUpdateAlertStatus(acceptedAlert.id, 'arrived')}
                    disabled={acceptedAlert.status === 'arrived'}
                  >
                    ✅ {acceptedAlert.status === 'arrived' ? 'Patient Arrived' : 'Mark Arrived'}
                  </GlassButton>
                </div>
              </GlassCard>
            ) : (
              <GlassCard className="p-8 text-center text-secondary">
                No active case accepted yet
              </GlassCard>
            )}
          </div>
        )}

        {activeTab === 'Prepared / Arrived' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-primary">Prepared / Arrived Cases</h2>
            {acceptedAlerts.length === 0 ? (
              <GlassCard className="p-8 text-center text-secondary">
                No cases yet
              </GlassCard>
            ) : (
              acceptedAlerts.map((alert) => (
                <GlassCard key={alert.id} className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-primary">
                        {alert.cases?.patient_condition}
                      </h3>
                      <p className="text-secondary mt-1">
                        Accepted at: {new Date(alert.created_at).toLocaleString()}
                      </p>
                    </div>
                    <StatusBadge status={alert.status} />
                  </div>
                  <div className="mt-4">
                    <GlassButton>Completed</GlassButton>
                  </div>
                </GlassCard>
              ))
            )}
          </div>
        )}

        {activeTab === 'Inventory' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-primary">Inventory Management</h2>
              <GlassButton variant="success" onClick={handleAddInventoryItem}>
                + Add Item
              </GlassButton>
            </div>
            <GlassCard className="p-6">
              <div className="space-y-4">
                {inventory.length === 0 ? (
                  <p className="text-secondary">No inventory items yet</p>
                ) : (
                  inventory.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                      <input
                        type="text"
                        value={item.item_name}
                        onChange={(e) => handleUpdateInventoryItem(item.id, { item_name: e.target.value })}
                        className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg text-primary focus:outline-none focus:border-red-500 focus:ring-3 focus:ring-red-50"
                      />
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleUpdateInventoryItem(item.id, { quantity: parseInt(e.target.value) || 0 })}
                        className="w-24 px-4 py-2 bg-white border border-gray-200 rounded-lg text-primary focus:outline-none focus:border-red-500 focus:ring-3 focus:ring-red-50"
                      />
                      <input
                        type="text"
                        value={item.unit}
                        onChange={(e) => handleUpdateInventoryItem(item.id, { unit: e.target.value })}
                        className="w-24 px-4 py-2 bg-white border border-gray-200 rounded-lg text-primary focus:outline-none focus:border-red-500 focus:ring-3 focus:ring-red-50"
                      />
                    </div>
                  ))
                )}
              </div>
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  )
}