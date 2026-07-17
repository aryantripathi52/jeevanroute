import { useState, useEffect } from 'react';
import { 
  Building2, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Minus, 
  User, 
  Siren, 
  Timer, 
  Activity,
  Heart,
  LogOut
} from 'lucide-react';

interface LogItem {
  id: string;
  severity: 'Critical' | 'High' | 'Moderate';
  ambulance: string;
  eta: string;
  status: 'En Route' | 'Admitted' | 'Rerouted';
}

interface AdminDashboardProps {
  onLogout: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  // Navigation tabs state
  const [subTab, setSubTab] = useState<'upcoming' | 'inventory'>('upcoming');
  
  // Interactive Metric States
  const [icuBedsAvailable, setIcuBedsAvailable] = useState(4);
  const [icuBedsTotal] = useState(20);
  const [activeAmbulances, setActiveAmbulances] = useState(2);
  const [livesSaved, setLivesSaved] = useState(1248);
  
  // Alert States
  const [alertState, setAlertState] = useState<'active' | 'accepted' | 'declined' | 'timeout'>('active');
  const [countdown, setCountdown] = useState(20);

  // Table Logs State
  const [logs, setLogs] = useState<LogItem[]>([
    { id: '#INC-9821', severity: 'Critical', ambulance: 'KA-51-EM-2384', eta: '4 min', status: 'En Route' },
    { id: '#INC-9818', severity: 'High', ambulance: 'DL-2C-CD-9482', eta: '--', status: 'Admitted' },
    { id: '#INC-9815', severity: 'Critical', ambulance: 'MH-12-GP-1928', eta: '--', status: 'Rerouted' },
    { id: '#INC-9810', severity: 'Moderate', ambulance: 'DL-1C-AB-1234', eta: '--', status: 'Admitted' },
  ]);

  // Countdown timer logic for incoming incident
  useEffect(() => {
    let timer: any;
    if (alertState === 'active' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (alertState === 'active' && countdown === 0) {
      handleTimeout();
    }
    return () => clearInterval(timer);
  }, [alertState, countdown]);

  const handleAccept = () => {
    setAlertState('accepted');
    setActiveAmbulances((prev) => prev + 1);
    setIcuBedsAvailable((prev) => (prev > 0 ? prev - 1 : 0));
    setLivesSaved((prev) => prev + 1);
    
    // Add accepted patient to logs
    const newLog: LogItem = {
      id: '#INC-9840',
      severity: 'Critical',
      ambulance: 'HR-25-AB-2501',
      eta: '8 min',
      status: 'En Route',
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  const handleDecline = () => {
    setAlertState('declined');
    
    // Add declined patient as Rerouted in logs
    const newLog: LogItem = {
      id: '#INC-9840',
      severity: 'Critical',
      ambulance: 'HR-25-AB-2501',
      eta: '--',
      status: 'Rerouted',
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  const handleTimeout = () => {
    setAlertState('timeout');
    
    // Add timed out patient as Rerouted in logs
    const newLog: LogItem = {
      id: '#INC-9840',
      severity: 'Critical',
      ambulance: 'HR-25-AB-2501',
      eta: '--',
      status: 'Rerouted',
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  const simulateReset = () => {
    setAlertState('active');
    setCountdown(20);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#070B14] text-white font-sans select-none">
      
      {/* 1. Top Header */}
      <header className="bg-[#0c1322] border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          {/* Red Circle with Hospital Icon */}
          <div className="w-10 h-10 rounded-full bg-brand-red text-white flex items-center justify-center border border-brand-red/30 shadow-md">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-gray-200 text-sm">Jaypee Hospital Noida</span>
            <span className="text-[10px] text-gray-500 font-mono tracking-wider">SYSTEM ONLINE</span>
          </div>
        </div>

        {/* Right side Profile & Logout */}
        <div className="flex items-center gap-6 text-sm text-gray-400 font-medium">
          <button className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5">
            <User className="h-4 w-4" /> Hospital Profile
          </button>
          <button 
            onClick={onLogout}
            className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </header>

      {/* 2. Sub-Tabs Header */}
      <div className="bg-[#0c1322]/50 border-b border-white/10 px-6 flex items-center gap-8">
        <button
          onClick={() => setSubTab('upcoming')}
          className={`py-3.5 text-xs font-extrabold uppercase tracking-wider relative transition-all cursor-pointer ${
            subTab === 'upcoming' 
              ? 'text-brand-red border-b-2 border-brand-red' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Upcoming Requests
        </button>
        <button
          onClick={() => setSubTab('inventory')}
          className={`py-3.5 text-xs font-extrabold uppercase tracking-wider relative transition-all cursor-pointer ${
            subTab === 'inventory' 
              ? 'text-brand-red border-b-2 border-brand-red' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Accept Request Prepared / Arrived Inventory
        </button>
      </div>

      {/* 3. Main Panel Content */}
      <main className="flex-grow p-6 space-y-6 overflow-y-auto">
        {subTab === 'upcoming' ? (
          <div className="space-y-6 max-w-5xl mx-auto w-full">
            {/* Incoming Alerts Header and Container */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-white tracking-wider uppercase font-mono border-b border-white/5 pb-2 flex items-center justify-between">
                <span>Incoming Alerts</span>
                {alertState === 'active' && (
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-red animate-ping" />
                )}
              </h2>

              {alertState === 'active' ? (
                /* High-Priority Alerts Section (Countdown Ticker) */
                <div className="rounded-2xl border-2 border-brand-red bg-brand-red/5 p-6 space-y-4 shadow-lg shadow-brand-red/5 relative overflow-hidden">
                  <div className="absolute inset-0 border border-brand-red/20 animate-pulse pointer-events-none"></div>

                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-3 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-brand-red animate-pulse" />
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                        INCOMING EMERGENCY AMBULANCE DIRECT ROUTE ALERT
                      </h3>
                    </div>
                    {/* Countdown Timer */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-brand-red/10 border border-brand-red/20 text-brand-red font-mono text-xs font-bold">
                      <Timer className="h-4 w-4 animate-spin-slow" style={{ animationDuration: '6s' }} />
                      Auto-decline in {countdown}s
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-mono">
                    <div>
                      <span className="text-gray-500 block uppercase tracking-wider text-[10px] mb-1">Patient Vitals</span>
                      <p className="text-white font-semibold text-[13px]">Aryan Tripathi (Male, 45)</p>
                      <p className="text-gray-400 mt-1">Symptom: Cardiac Arrest</p>
                    </div>
                    <div className="border-t md:border-t-0 md:border-l border-white/5 pt-3 md:pt-0 md:pl-6">
                      <span className="text-gray-500 block uppercase tracking-wider text-[10px] mb-1">Telemetry Readings</span>
                      <p className="text-brand-red font-bold text-[13px]">SpO2: 88% | Pulse: 94 bpm</p>
                      <p className="text-gray-400 mt-1">BP: 160/100 mmHg | EKG anomaly detected</p>
                    </div>
                    <div className="border-t md:border-t-0 md:border-l border-white/5 pt-3 md:pt-0 md:pl-6">
                      <span className="text-gray-500 block uppercase tracking-wider text-[10px] mb-1">Assigned Ambulance & ETA</span>
                      <p className="text-white font-semibold text-[13px]">HR-25-AB-2501 (JeevanRoute Unit 12)</p>
                      <p className="text-medical-emerald font-bold mt-1">ETA: 12 Mins (Traffic Optimized)</p>
                    </div>
                  </div>

                  {/* Accept / Decline controls */}
                  <div className="flex items-center gap-4 pt-2">
                    <button
                      onClick={handleAccept}
                      className="px-6 py-3 bg-medical-emerald hover:bg-medical-emerald/90 text-brand-navy-dark text-xs font-bold uppercase rounded-lg active:scale-95 transition-all duration-150 flex items-center gap-1.5 cursor-pointer shadow-lg shadow-medical-emerald/10"
                    >
                      <CheckCircle2 className="h-4.5 w-4.5" /> Accept Patient
                    </button>
                    <button
                      onClick={handleDecline}
                      className="px-6 py-3 border border-brand-red/30 hover:border-brand-red/50 hover:bg-brand-red/5 text-brand-red text-xs font-bold uppercase rounded-lg active:scale-95 transition-all duration-150 flex items-center gap-1.5 cursor-pointer"
                    >
                      <XCircle className="h-4.5 w-4.5" /> Signal Capacity Full (Trigger Failover)
                    </button>
                  </div>
                </div>
              ) : (
                /* No incoming alerts placeholder - matches screenshot layout */
                <div className="flex flex-col items-center justify-center p-20 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                  <span className="text-gray-500 text-sm font-semibold tracking-wide select-none">
                    No incoming alerts
                  </span>
                  
                  {/* Subtle test button to trigger a new alert */}
                  <button 
                    onClick={simulateReset}
                    className="mt-6 px-4 py-2 bg-white/5 border border-white/10 hover:border-white/10 hover:bg-white/10 rounded-lg text-xs font-bold text-gray-300 active:scale-95 transition-all cursor-pointer"
                  >
                    Simulate Test Alert
                  </button>
                </div>
              )}
            </div>

            {/* Resolved Alerts displays */}
            {alertState === 'accepted' && (
              <div className="rounded-xl border border-medical-emerald/30 bg-medical-emerald/5 p-4 flex items-center justify-between text-xs font-mono">
                <span className="text-medical-emerald font-bold flex items-center gap-2">
                  <CheckCircle2 className="h-4.5 w-4.5" /> Patient Accepted. ICU Bay prepped. Ambulance HR-25-AB-2501 en route.
                </span>
                <button onClick={simulateReset} className="px-3 py-1 bg-white/5 border border-white/10 rounded hover:bg-white/10 text-white font-semibold">
                  Reset Simulation
                </button>
              </div>
            )}

            {alertState === 'declined' && (
              <div className="rounded-xl border border-brand-red/30 bg-brand-red/5 p-4 flex items-center justify-between text-xs font-mono">
                <span className="text-brand-red font-bold flex items-center gap-2">
                  <XCircle className="h-4.5 w-4.5" /> Capacity Flag Sent. Failover activated. Ambulance rerouted to Metro Hospital in 0.4s.
                </span>
                <button onClick={simulateReset} className="px-3 py-1 bg-white/5 border border-white/10 rounded hover:bg-white/10 text-white font-semibold">
                  Reset Simulation
                </button>
              </div>
            )}

            {alertState === 'timeout' && (
              <div className="rounded-xl border border-brand-red/30 bg-brand-red/5 p-4 flex items-center justify-between text-xs font-mono">
                <span className="text-brand-red font-bold flex items-center gap-2">
                  <ShieldAlert className="h-4.5 w-4.5 animate-pulse" /> 60s Dispatch Deadline Passed. Auto-failover activated. Ambulance successfully rerouted.
                </span>
                <button onClick={simulateReset} className="px-3 py-1 bg-white/5 border border-white/10 rounded hover:bg-white/10 text-white font-semibold">
                  Reset Simulation
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Inventory and Logs Tab */
          <div className="space-y-6 max-w-5xl mx-auto w-full">
            {/* Top Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* ICU Beds (Interactive) */}
              <div className="rounded-xl border border-white/5 bg-brand-navy-light/10 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-500 font-mono tracking-wider">AVAILABLE ICU BEDS</span>
                  <Activity className="h-4 w-4 text-brand-red animate-pulse" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-2xl font-extrabold text-white font-mono">
                      {icuBedsAvailable} <span className="text-sm font-semibold text-gray-500">/ {icuBedsTotal}</span>
                    </p>
                    <p className="text-[10px] text-gray-400">Slots mapped in real-time</p>
                  </div>
                  {/* Plus / Minus Buttons */}
                  <div className="flex items-center gap-1.5 bg-brand-navy-dark/95 border border-white/15 rounded-lg p-1">
                    <button 
                      onClick={() => setIcuBedsAvailable(prev => Math.max(0, prev - 1))}
                      className="p-1 rounded hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <button 
                      onClick={() => setIcuBedsAvailable(prev => Math.min(icuBedsTotal, prev + 1))}
                      className="p-1 rounded hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Inbound Ambulances */}
              <div className="rounded-xl border border-white/5 bg-brand-navy-light/10 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-500 font-mono tracking-wider">INBOUND AMBULANCES</span>
                  <Siren className="h-4 w-4 text-blue-500 animate-pulse" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-2xl font-extrabold text-white font-mono">
                    {activeAmbulances} <span className="text-sm font-semibold text-gray-500">En Route</span>
                  </p>
                  <p className="text-[10px] text-gray-400">Locking ER team allocations</p>
                </div>
              </div>

              {/* Handshake latency */}
              <div className="rounded-xl border border-white/5 bg-brand-navy-light/10 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-500 font-mono tracking-wider">AVG HANDSHAKE TIME</span>
                  <Timer className="h-4 w-4 text-brand-red" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-2xl font-extrabold text-white font-mono">
                    45s <span className="text-sm font-semibold text-gray-500">Sec</span>
                  </p>
                  <p className="text-[10px] text-gray-400">Pre-admit dashboard validation</p>
                </div>
              </div>

              {/* Lives Saved */}
              <div className="rounded-xl border border-white/5 bg-brand-navy-light/10 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-500 font-mono tracking-wider">LIVES SAVED</span>
                  <Heart className="h-4 w-4 text-brand-red animate-pulse" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-2xl font-extrabold text-white font-mono">
                    {livesSaved} <span className="text-sm font-semibold text-gray-500">This Month</span>
                  </p>
                  <p className="text-[10px] text-gray-400">Linked hospital admittances</p>
                </div>
              </div>

            </div>

            {/* Recent Emergency Logs Data Table */}
            <div className="rounded-2xl border border-white/5 bg-[#0c1322]/80 p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Recent Emergency Logs (Real-time Feed)
                </h3>
                <span className="text-[10px] text-gray-500 font-mono uppercase">LATEST ADMITTANCES</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/5 text-gray-500 font-mono">
                      <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[10px]">Incident ID</th>
                      <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[10px]">Severity</th>
                      <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[10px]">Assigned Ambulance</th>
                      <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[10px]">ETA</th>
                      <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[10px]">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-gray-300">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-white">{log.id}</td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            log.severity === 'Critical' 
                              ? 'bg-brand-red/10 text-brand-red' 
                              : log.severity === 'High' 
                              ? 'bg-orange-500/10 text-orange-500' 
                              : 'bg-yellow-500/10 text-yellow-500'
                          }`}>
                            {log.severity}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-gray-400">{log.ambulance}</td>
                        <td className="py-3.5 px-4 font-mono font-semibold">{log.eta}</td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1.5 font-bold ${
                            log.status === 'En Route' 
                              ? 'text-blue-400' 
                              : log.status === 'Admitted' 
                              ? 'text-medical-emerald' 
                              : 'text-gray-500'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              log.status === 'En Route' 
                                ? 'bg-blue-400 animate-pulse' 
                                : log.status === 'Admitted' 
                                ? 'bg-medical-emerald' 
                                : 'bg-gray-600'
                            }`} />
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
