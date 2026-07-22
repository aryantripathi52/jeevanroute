import { Activity, Phone, Mail, MapPin, CheckCircle2 } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-brand-navy-dark border-t border-white/5 pt-16 pb-8 overflow-hidden">
      {/* Footer Top */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Logo & Description */}
          <div className="space-y-4 col-span-1 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="relative flex items-center justify-center w-8 h-8 rounded bg-brand-red/10 border border-brand-red/30">
                <Activity className="h-4.5 w-4.5 text-brand-red" />
              </div>
              <span className="font-sans font-bold text-lg text-white">
                JR <span className="text-gray-300 font-light">JeevanRoute</span>
              </span>
            </div>
            <p className="text-xs text-gray-400 font-light leading-relaxed max-w-sm">
              National smart algorithm-directed medical transit routing infrastructure. Streamlining dispatch networks, securing emergency admissions, and optimizing transit routes to protect lives.
            </p>
            {/* Active Status Badge */}
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-medical-emerald/10 border border-medical-emerald/20 text-medical-emerald text-[10px] font-mono">
              <CheckCircle2 className="h-3.5 w-3.5" />
              SYSTEM STATUS: ALL NETWORKS NOMINAL
            </div>
          </div>

          {/* Quick links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white tracking-widest uppercase font-mono">Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#features" className="text-gray-400 hover:text-white transition-colors">Platform Features</a>
              </li>
              <li>
                <a href="#about" className="text-gray-400 hover:text-white transition-colors font-light">About Platform</a>
              </li>
              <li>
                <a href="#faq" className="text-gray-400 hover:text-white transition-colors font-light">FAQ & Compliance</a>
              </li>
              <li>
                <a href="#privacy" className="text-gray-400 hover:text-white transition-colors font-light">Security & Privacy</a>
              </li>
            </ul>
          </div>

          {/* Active Contact Indicators */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white tracking-widest uppercase font-mono">Dispatch & Contact</h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-2 text-gray-400">
                <Phone className="h-4 w-4 text-brand-red flex-shrink-0" />
                <span className="font-mono text-white font-medium">1800-999-ROUTE</span>
              </li>
              <li className="flex items-center gap-2 text-gray-400">
                <Mail className="h-4 w-4 text-brand-red flex-shrink-0" />
                <span>ops@jeevanroute.in</span>
              </li>
              <li className="flex items-center gap-2 text-gray-400 items-start">
                <MapPin className="h-4 w-4 text-brand-red flex-shrink-0 mt-0.5" />
                <span>National Health Command HQ, New Delhi, India</span>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Footer Bottom */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-white/5 text-center md:flex md:items-center md:justify-between text-[11px] text-gray-500">
        <p>© {currentYear} JeevanRoute Tech. All rights reserved.</p>
        <p className="mt-2 md:mt-0 font-light">
          Approved for emergency medical coordination operations by NDHM & NDMA protocols.
        </p>
      </div>
    </footer>
  );
}
