'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase, Alert, Case } from '@/lib/supabase'
import Link from 'next/link'

function ETACountdown({ minutes }: { minutes: number }) {
  const [remaining, setRemaining] = useState(minutes * 60)

  useEffect(() => {
    if (remaining <= 0) return
    const t = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000)
    return () => clearInterval(t)
  }, [remaining])

  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{
      background: 'rgba(37,99,235,0.05)', border: '1px solid rgba(37,99,235,0.15)'
    }}>
      <span className="text-xl">⏱</span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#64748B' }}>Patient ETA</p>
        <p className="text-2xl font-black font-mono" style={{ color: remaining < 300 ? '#EF4444' : '#2563EB' }}>
          {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
        </p>
      </div>
    </div>
  )
}

export default function PrepPage() {
  const { alertId } = useParams<{ alertId: string }>()
  const router = useRouter()
  const [alert, setAlert] = useState<Alert | null>(null)
  const [caseData, setCaseData] = useState<Case | null>(null)
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set())
  const [etaMinutes, setEtaMinutes] = useState(15)
  const [loading, setLoading] = useState(true)
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    if (!alertId) return
    const load = async () => {
      const { data: a } = await supabase.from('alerts').select('*').eq('id', alertId).single()
      if (!a) return
      setAlert(a as Alert)

      const { data: c } = await supabase.from('cases').select('*').eq('id', a.case_id).single()
      if (c) {
        setCaseData(c as Case)
        // Estimate ETA
        if (c.ai_triage_result) setEtaMinutes(Math.floor(Math.random() * 10) + 8)
      }
      setLoading(false)
    }
    load()
  }, [alertId])

  const prepItems: string[] = caseData?.ai_triage_result?.prep_instructions || [
    'Clear ICU bay and prepare reception area',
    'Alert on-call specialist for this condition',
    'Prepare required medications and antidotes',
    'Set up monitoring equipment (ECG, pulse ox, BP)',
    'Ensure blood bank has required type on standby',
    'Brief nursing team on incoming patient status',
    'Document patient details in hospital system',
  ]

  const handleCheck = (i: number) => {
    setCheckedItems((prev) => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  const handleArrived = async () => {
    if (!caseData) return
    await supabase.from('cases').update({ status: 'completed' }).eq('id', caseData.id)
    setCompleted(true)
    setTimeout(() => router.push('/hospital'), 2000)
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: '#F8FAFC' }}>
        <div className="w-10 h-10 border-4 border-t-blue-500 border-r-transparent rounded-full animate-spin" />
      </main>
    )
  }

  const progress = prepItems.length > 0 ? Math.round((checkedItems.size / prepItems.length) * 100) : 0
  const triage = caseData?.ai_triage_result

  return (
    <main className="min-h-screen pb-16" style={{ background: '#F8FAFC' }}>
      {completed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="text-center animate-slide-in-up">
            <div className="text-6xl mb-4">✅</div>
            <p className="text-2xl font-bold" style={{ color: 'white' }}>Case Completed</p>
            <p className="text-sm mt-2" style={{ color: '#94A3B8' }}>Returning to dashboard...</p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="border-b px-6 py-4 flex items-center gap-4 sticky top-0 z-10" style={{
        background: 'white', borderColor: '#E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <Link href="/hospital" className="text-blue-600 hover:text-blue-700 transition-colors">←</Link>
        <div className="flex-1">
          <h1 className="font-bold" style={{ color: '#0F172A' }}>Preparing for Incoming Patient</h1>
          <p className="text-xs" style={{ color: '#64748B' }}>
            {caseData?.patient_condition} · {triage?.required_specialty}
          </p>
        </div>
        <ETACountdown minutes={etaMinutes} />
      </header>

      <div className="max-w-2xl mx-auto px-6 pt-8 space-y-6">
        {/* Patient info banner */}
        {triage && (
          <div className="rounded-2xl p-4 flex flex-wrap gap-4" style={{
            background: 'white', border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
          }}>
            <div>
              <p className="text-xs uppercase tracking-wider mb-0.5" style={{ color: '#94A3B8' }}>Condition</p>
              <p className="font-bold" style={{ color: '#0F172A' }}>{caseData?.patient_condition}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider mb-0.5" style={{ color: '#94A3B8' }}>Specialty</p>
              <p className="font-bold" style={{ color: '#0F172A' }}>{triage.required_specialty}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider mb-0.5" style={{ color: '#94A3B8' }}>Urgency</p>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{
                background: triage.urgency === 'critical' ? 'rgba(239,68,68,0.1)' :
                  triage.urgency === 'high' ? 'rgba(234,179,8,0.1)' : 'rgba(34,197,94,0.1)',
                color: triage.urgency === 'critical' ? '#DC2626' :
                  triage.urgency === 'high' ? '#CA8A04' : '#16A34A',
              }}>
                {triage.urgency?.toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider mb-0.5" style={{ color: '#94A3B8' }}>Blood</p>
              <p className="font-bold" style={{ color: '#0F172A' }}>{caseData?.blood_group}</p>
            </div>
          </div>
        )}

        {/* Progress */}
        <div className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid #E2E8F0' }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-lg" style={{ color: '#0F172A' }}>Prep Checklist</h2>
            <span className="text-sm font-semibold" style={{ color: '#2563EB' }}>
              {checkedItems.size}/{prepItems.length} complete
            </span>
          </div>
          <div className="w-full h-3 rounded-full mb-1 overflow-hidden" style={{ background: '#F1F5F9' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progress}%`,
                background: progress === 100 ? '#16A34A' : '#2563EB',
              }}
            />
          </div>
          <p className="text-xs text-right" style={{ color: '#94A3B8' }}>{progress}%</p>
        </div>

        {/* Checklist items */}
        <div className="space-y-3">
          {prepItems.map((item, i) => (
            <button
              key={i}
              onClick={() => handleCheck(i)}
              className="w-full flex items-start gap-4 p-4 rounded-xl text-left transition-all duration-200 hover:scale-101 group"
              style={{
                background: checkedItems.has(i) ? 'rgba(34,197,94,0.05)' : 'white',
                border: `1px solid ${checkedItems.has(i) ? 'rgba(34,197,94,0.3)' : '#E2E8F0'}`,
              }}
            >
              <div className="w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center transition-all duration-200 mt-0.5" style={{
                background: checkedItems.has(i) ? '#16A34A' : '#F1F5F9',
                border: `2px solid ${checkedItems.has(i) ? '#16A34A' : '#CBD5E1'}`,
              }}>
                {checkedItems.has(i) && <span className="text-white text-xs font-bold">✓</span>}
              </div>
              <span className="text-sm font-medium leading-relaxed" style={{
                color: checkedItems.has(i) ? '#64748B' : '#0F172A',
                textDecoration: checkedItems.has(i) ? 'line-through' : 'none',
              }}>
                {item}
              </span>
            </button>
          ))}
        </div>

        {/* Patient Arrived button */}
        <button
          onClick={handleArrived}
          className="w-full py-5 rounded-2xl font-bold text-lg transition-all duration-200 hover:scale-105 active:scale-100 mt-6"
          style={{
            background: progress === 100
              ? 'linear-gradient(135deg, #16A34A, #15803D)'
              : 'linear-gradient(135deg, #2563EB, #1D4ED8)',
            color: 'white',
            boxShadow: progress === 100 ? '0 0 20px rgba(22,163,74,0.3)' : '0 0 20px rgba(37,99,235,0.3)',
          }}
        >
          {progress === 100 ? '🎉 Patient Arrived — Close Case' : '🏥 Patient Arrived →'}
        </button>
      </div>
    </main>
  )
}
