import { Brain, Navigation, RefreshCw, CheckCircle2, ShieldAlert, Clock } from 'lucide-react';

export default function Features() {
  return (
    <section id="features" className="relative py-24 bg-brand-navy-dark overflow-hidden">
      {/* Decorative side grid overlay */}
      <div className="absolute right-0 top-0 w-1/3 h-full bg-brand-red/[0.02] pointer-events-none blur-2xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="font-mono text-xs text-brand-red font-semibold uppercase tracking-widest">
            CORE PLATFORM FUNCTIONS
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
            Engineered for Crisis. Optimized for Life.
          </h2>
          <p className="text-sm sm:text-base text-gray-400 font-light">
            JeevanRoute replaces legacy emergency phone lines with intelligent, automated data pipelines that eliminate coordination friction.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-12 gap-6 lg:gap-8">
          
          {/* Card 1: AI Triage Engine (7 Cols on Desktop) */}
          <div className="col-span-12 lg:col-span-7 rounded-2xl border border-white/5 bg-brand-navy-light/10 p-6 sm:p-8 backdrop-blur-sm flex flex-col justify-between group hover:border-white/10 transition-all duration-300">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-lg bg-brand-red/10 border border-brand-red/20 text-brand-red">
                  <Brain className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-white font-sans">AI Triage Engine</h3>
              </div>
              <p className="text-sm text-gray-400 font-light leading-relaxed mb-6">
                Analyzes live patient symptoms and telemetry en-route to recommend matching hospitals. Checks department workloads, ICU bed availability, and live status of crucial equipment like CT scanners or ventilators.
              </p>
            </div>

            {/* Visual Widget: Symptom Analysis UI */}
            <div className="rounded-xl border border-white/5 bg-brand-navy-dark/80 p-4 font-mono text-xs text-left space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/5 text-[10px] text-gray-500">
                <span>PRE-ARRIVAL DIAGNOSTICS</span>
                <span className="text-brand-red flex items-center gap-1 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-red"></span>
                  ANALYZING
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="text-gray-500">PRIMARY SYMPTOMS</div>
                  <div className="text-white text-[11px] font-semibold">Acute Chest Pain, Dyspnea</div>
                </div>
                <div className="space-y-1">
                  <div className="text-gray-500">EKG TELEMETRY</div>
                  <div className="text-brand-red text-[11px] font-semibold flex items-center gap-1">
                    STEMI Suspicion (High)
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t border-white/5 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-gray-400">Target Hospital Capability Match:</span>
                  <span className="text-medical-emerald font-semibold">98.2%</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 rounded bg-medical-emerald/10 text-medical-emerald text-[9px] font-medium flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Cath Lab Active
                  </span>
                  <span className="px-2 py-0.5 rounded bg-medical-emerald/10 text-medical-emerald text-[9px] font-medium flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Cardiologist On-Site
                  </span>
                  <span className="px-2 py-0.5 rounded bg-medical-emerald/10 text-medical-emerald text-[9px] font-medium flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> ICU Beds: 3 Available
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Dynamic Routing (5 Cols on Desktop) */}
          <div className="col-span-12 lg:col-span-5 rounded-2xl border border-white/5 bg-brand-navy-light/10 p-6 sm:p-8 backdrop-blur-sm flex flex-col justify-between group hover:border-white/10 transition-all duration-300">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-500">
                  <Navigation className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-white font-sans">Dynamic Routing</h3>
              </div>
              <p className="text-sm text-gray-400 font-light leading-relaxed mb-6">
                Real-time traffic ingestion and signal overrides pre-plan the fastest path, updating ETAs by the second to keep both paramedics and hospitals in sync.
              </p>
            </div>

            {/* Visual Widget: Route Steps */}
            <div className="rounded-xl border border-white/5 bg-brand-navy-dark/80 p-4 font-mono text-xs text-left space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/5 text-[10px] text-gray-500">
                <span>ACTIVE NAVIGATION TRACKER</span>
                <span className="text-blue-400 font-semibold">RECUTTING</span>
              </div>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span className="text-gray-300">Outer Ring Rd (NH-44)</span>
                  </div>
                  <span className="text-gray-500">2.4 km</span>
                </div>
                <div className="pl-2 border-l border-brand-red/30 space-y-1.5 my-1">
                  <div className="text-[10px] text-brand-red flex items-center gap-1.5">
                    <ShieldAlert className="h-3 w-3" /> Gridlock at Toll Plaza (+9m delay)
                  </div>
                  <div className="text-[10px] text-medical-emerald flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3" /> Diversion: Bypass Rd Approved
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] font-semibold text-white">
                  <span>OPTIMIZED TRANSIT TIME</span>
                  <span className="text-brand-red animate-pulse">11m 45s (-7m saved)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Auto-Failover Alerts (12 Cols - Full width banner style) */}
          <div className="col-span-12 rounded-2xl border border-white/5 bg-brand-navy-light/10 p-6 sm:p-8 backdrop-blur-sm group hover:border-white/10 transition-all duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Text Area */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-medical-emerald/10 border border-medical-emerald/20 text-medical-emerald">
                    <RefreshCw className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white font-sans">Auto-Failover Alerts</h3>
                </div>
                <p className="text-sm text-gray-400 font-light leading-relaxed">
                  Eliminates waiting. When an ambulance is routed, the target hospital is pinged. If the hospital doesn't accept the case within 60 seconds (due to workload spikes or staff issues), the system triggers auto-failover, alerting the next best matching ER.
                </p>
                <div className="flex flex-wrap gap-4 text-xs font-mono text-gray-500 pt-2">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-brand-red" />
                    <span>60s Response Deadline</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-medical-emerald" />
                    <span>Instant Re-Routing Cascade</span>
                  </div>
                </div>
              </div>

              {/* Visual Widget: Failover Log Timeline */}
              <div className="lg:col-span-5 w-full">
                <div className="rounded-xl border border-white/5 bg-brand-navy-dark/80 p-4 font-mono text-xs text-left space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-white/5 text-[10px] text-gray-500">
                    <span>ALERT FLOW SEC-99</span>
                    <span className="text-medical-emerald">ACTIVE CASCADE</span>
                  </div>
                  <div className="space-y-3 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/5">
                    
                    {/* Step 1: Hospital A timeout */}
                    <div className="flex items-start gap-4 relative">
                      <div className="w-4 h-4 rounded-full bg-brand-red/20 border border-brand-red flex items-center justify-center text-[8px] text-brand-red font-bold z-10">
                        ✖
                      </div>
                      <div className="flex-1 space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="text-white font-semibold">City Heart Hospital</span>
                          <span className="text-[9px] text-gray-500">Timeout (60s)</span>
                        </div>
                        <p className="text-[10px] text-gray-500">Cardiac unit overload reported. Auto-declined.</p>
                      </div>
                    </div>

                    {/* Step 2: Failover Broadcast */}
                    <div className="flex items-start gap-4 relative">
                      <div className="w-4 h-4 rounded-full bg-brand-red/20 border border-brand-red flex items-center justify-center z-10 animate-ping">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-red"></span>
                      </div>
                      <div className="flex-1 space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="text-brand-red font-bold">Auto-Failover Protocol</span>
                          <span className="text-[9px] text-brand-red font-bold">0.4s</span>
                        </div>
                        <p className="text-[10px] text-gray-500">Broadcasting vitals packet to alternative tier-1 centers.</p>
                      </div>
                    </div>

                    {/* Step 3: Hospital B Accepted */}
                    <div className="flex items-start gap-4 relative">
                      <div className="w-4 h-4 rounded-full bg-medical-emerald/20 border border-medical-emerald flex items-center justify-center text-[8px] text-medical-emerald font-bold z-10">
                        ✓
                      </div>
                      <div className="flex-1 space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="text-medical-emerald font-bold">Metro Super Specialty</span>
                          <span className="text-[9px] text-medical-emerald font-semibold">ACCEPTED</span>
                        </div>
                        <p className="text-[10px] text-gray-500">Cardiac bay reserved. ETA locking at 8 mins.</p>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
