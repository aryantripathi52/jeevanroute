import { Zap, Building2, Cpu } from 'lucide-react';

export default function Stats() {
  const stats = [
    {
      id: 'stat-response',
      value: '30% Faster',
      label: 'Response Time',
      description: 'Dynamic traffic rerouting and active green-corridor prompts save critical minutes when they matter most.',
      icon: Zap,
      accent: 'text-brand-red bg-brand-red/10 border-brand-red/20',
    },
    {
      id: 'stat-hospitals',
      value: '1,000+',
      label: 'Verified Hospitals',
      description: 'Integrated live telemetry feed linked directly with ICU, OT, and cardiac care departments nationwide.',
      icon: Building2,
      accent: 'text-medical-emerald bg-medical-emerald/10 border-medical-emerald/20',
    },
    {
      id: 'stat-triage',
      value: 'AI Triage',
      label: 'Real-time Routing',
      description: 'Patient vitals parsed en-route to automatically secure specific specialty unit allocations before arrival.',
      icon: Cpu,
      accent: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    },
  ];

  return (
    <section className="relative py-12 bg-brand-navy-dark/40 border-y border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div 
                key={stat.id}
                className="relative group rounded-xl border border-white/5 bg-brand-navy-light/20 p-6 backdrop-blur-sm transition-all duration-300 hover:border-white/10 hover:bg-brand-navy-light/40 hover:-translate-y-1 hover:shadow-2xl hover:shadow-brand-red/5 overflow-hidden"
              >
                {/* Accent glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-brand-red/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <span className="font-mono text-xs text-gray-500 font-medium tracking-wider uppercase">METRIC INDEX</span>
                    <h3 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                      {stat.value}
                    </h3>
                    <p className="text-sm font-semibold text-gray-200">
                      {stat.label}
                    </p>
                  </div>
                  <div className={`p-2.5 rounded-lg border ${stat.accent}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
                <p className="mt-4 text-xs leading-relaxed text-gray-400 font-light">
                  {stat.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
