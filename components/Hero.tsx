import { useState, useEffect } from 'react';
import { ArrowRight, Compass, ShieldAlert, Heart, Siren, Activity } from 'lucide-react';

export default function Hero() {
  const [eta, setEta] = useState(258); // 4 minutes 18 seconds in seconds

  useEffect(() => {
    // Countdown simulation for ETA
    const timer = setInterval(() => {
      setEta((prev) => (prev > 10 ? prev - 1 : 258));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatEta = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  return (
    <section className="relative min-h-screen pt-32 pb-20 flex items-center justify-center overflow-hidden tech-grid">
      {/* Background glow points */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-brand-red/10 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] rounded-full bg-brand-red/5 blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/3 right-1/3 w-[300px] h-[300px] rounded-full bg-medical-emerald/5 blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 text-left space-y-8">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-red/10 border border-brand-red/20 text-brand-red text-xs font-semibold uppercase tracking-wider animate-pulse-soft">
              <Siren className="h-3.5 w-3.5" />
              Real-time Emergency Response System
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1] font-sans">
                Every Second Counts.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-brand-red">
                  Get to the Right Hospital.
                </span>
              </h1>
              <p className="text-lg text-gray-400 max-w-xl font-light leading-relaxed">
                smart algorithm-driven real-time routing for ambulances across India. Smart triage, live traffic optimization, and automated hospital alerts.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="#dispatch"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-red px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-red/20 hover:bg-brand-red/90 hover:shadow-brand-red/40 active:scale-98 transition-all duration-200"
              >
                Emergency Dispatch Portal
                <ArrowRight className="h-4 w-4" />
              </a>
              <a 
                href="#register"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 px-6 py-3.5 text-sm font-semibold text-white hover:text-white transition-all duration-200"
              >
                Register Hospital
              </a>
            </div>

            {/* Trust indicators */}
            <div className="pt-6 border-t border-white/5 flex items-center gap-6">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full border border-brand-navy bg-brand-navy-light flex items-center justify-center text-[10px] text-brand-red font-bold">1</div>
                <div className="w-8 h-8 rounded-full border border-brand-navy bg-brand-navy-light flex items-center justify-center text-[10px] text-brand-red font-bold">2</div>
                <div className="w-8 h-8 rounded-full border border-brand-navy bg-brand-navy-light flex items-center justify-center text-[10px] text-brand-red font-bold">3</div>
              </div>
              <p className="text-xs text-gray-500 max-w-xs">
                Trusted by 50+ municipal corporations, private hospitals, and government ambulance networks.
              </p>
            </div>
          </div>

          {/* Right Dashboard Column */}
          <div className="lg:col-span-5 relative w-full max-w-[500px] lg:max-w-none mx-auto">
            {/* Visual Frame */}
            <div className="relative rounded-2xl border border-white/10 bg-brand-navy-dark/90 p-4 shadow-2xl overflow-hidden backdrop-blur-md">
              {/* Scan Line effect */}
              <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-brand-red/20 to-transparent animate-scan-line pointer-events-none"></div>

              {/* Map Header Panel */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/5 text-xs text-gray-400">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-red animate-pulse"></span>
                  <span className="font-mono text-gray-300 font-medium">DISPATCH SYSTEM ACTV</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono">SYS STATUS: OK</span>
                  <Compass className="h-3.5 w-3.5 text-gray-500 animate-spin-slow" style={{ animationDuration: '20s' }} />
                </div>
              </div>

              {/* SVG Graphic Map */}
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-brand-navy-dark border border-white/5">
                <svg className="w-full h-full text-white" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Grid Lines */}
                  <g stroke="rgba(255,255,255,0.02)" strokeWidth="1">
                    {[...Array(12)].map((_, i) => (
                      <line key={`v-${i}`} x1={i * 35} y1="0" x2={i * 35} y2="300" />
                    ))}
                    {[...Array(9)].map((_, i) => (
                      <line key={`h-${i}`} x1="0" y1={i * 35} x2="400" y2={i * 35} />
                    ))}
                  </g>

                  {/* Route Paths (Roads) */}
                  <path d="M20,150 Q100,50 200,150 T380,150" stroke="rgba(255,255,255,0.05)" strokeWidth="4" strokeLinecap="round" />
                  <path d="M50,280 C150,250 220,120 300,50" stroke="rgba(255,255,255,0.05)" strokeWidth="4" strokeLinecap="round" />
                  <path d="M120,20 Q240,240 370,120" stroke="rgba(255,255,255,0.05)" strokeWidth="4" strokeLinecap="round" />

                  {/* Congested Route sections */}
                  <path d="M200,150 Q245,175 290,150" stroke="#EF4444" strokeWidth="4" strokeLinecap="round" strokeOpacity="0.4" />

                  {/* Smart Algorithm Optimized Route (Emergency Red Route Line) */}
                  <path d="M50,280 C150,250 208,142 225,123 L280,68" stroke="#E11D48" strokeWidth="3.5" strokeLinecap="round" className="animate-route-flow" id="route-line" />

                  {/* Radar Pulse / Hospital coverage */}
                  <circle cx="280" cy="68" r="8" fill="rgba(16, 185, 129, 0.2)" />
                  <circle cx="280" cy="68" r="16" stroke="#10B981" strokeWidth="1" strokeOpacity="0.5" className="origin-center scale-90 animate-radar-pulse" />
                  
                  {/* Hospitals (Verified Points) */}
                  {/* Hospital 1 (Target Emerald) */}
                  <g transform="translate(280, 68)">
                    <circle cx="0" cy="0" r="6" fill="#10B981" />
                    <circle cx="0" cy="0" r="12" stroke="#10B981" strokeWidth="1" strokeOpacity="0.3" />
                  </g>
                  {/* Hospital 2 (Red - Full Cap) */}
                  <g transform="translate(160, 210)">
                    <circle cx="0" cy="0" r="5" fill="#EF4444" />
                    <circle cx="0" cy="0" r="10" stroke="#EF4444" strokeWidth="1" strokeOpacity="0.3" />
                  </g>
                  {/* Hospital 3 (Amber - Moderate) */}
                  <g transform="translate(320, 180)">
                    <circle cx="0" cy="0" r="5" fill="#F59E0B" />
                    <circle cx="0" cy="0" r="10" stroke="#F59E0B" strokeWidth="1" strokeOpacity="0.3" />
                  </g>

                  {/* Ambulance Marker */}
                  <g transform="translate(160, 203)">
                    <circle cx="0" cy="0" r="6" fill="#E11D48" className="animate-pulse" />
                    <polygon points="-4,4 0,-6 4,4" fill="#ffffff" transform="rotate(35)" />
                  </g>
                </svg>

                {/* On-Map Stats HUD Overlay */}
                <div className="absolute bottom-3 left-3 right-3 bg-brand-navy-dark/90 border border-white/10 rounded-lg p-3 backdrop-blur-md">
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                    <div className="space-y-1">
                      <div className="text-gray-500">TARGET APEX</div>
                      <div className="text-white font-bold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-medical-emerald"></span>
                        FORTIS HOSP. SEC-62
                      </div>
                      <div className="text-gray-500">TRAFFIC INDEX</div>
                      <div className="text-medical-emerald font-semibold">CLEAR (SMART ALGORITHM REROUTED)</div>
                    </div>
                    <div className="space-y-1 border-l border-white/5 pl-3">
                      <div className="text-gray-500">OPTIMIZED ETA</div>
                      <div className="text-brand-red font-bold text-xs">{formatEta(eta)}</div>
                      <div className="text-gray-500">HOSP. ALERTS SENT</div>
                      <div className="text-white flex items-center gap-1 text-[9px]">
                        <span className="w-1 h-1 rounded-full bg-brand-red animate-ping"></span>
                        SLOTS SECURED (CARDIAC)
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tiny HUD Marker Target */}
                <div className="absolute top-8 right-16 px-2 py-0.5 rounded bg-medical-emerald/10 border border-medical-emerald/20 text-medical-emerald font-mono text-[9px]">
                  VERIFIED DEPT
                </div>
              </div>

              {/* Vitals Telemetry Drawer */}
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-brand-red/10">
                    <Activity className="h-4.5 w-4.5 text-brand-red animate-pulse" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-mono">LIVE TELEMETRY</p>
                    <p className="text-xs text-white font-mono font-medium">HR: 84bpm | SpO2: 96%</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-500 font-mono">AMBULANCE ID</p>
                  <p className="text-xs text-white font-mono font-semibold">KA-51-EM-2384</p>
                </div>
              </div>

            </div>

            {/* Interactive map background floating accents */}
            <div className="absolute -top-4 -left-4 w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-sm -rotate-6 shadow-lg shadow-black/30">
              <ShieldAlert className="h-5 w-5 text-brand-red" />
            </div>
            <div className="absolute -bottom-4 -right-4 w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-sm rotate-12 shadow-lg shadow-black/30">
              <Heart className="h-5 w-5 text-brand-red animate-pulse" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
