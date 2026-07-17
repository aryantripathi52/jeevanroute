import { useState, useEffect } from 'react';
import { Activity, Menu, X } from 'lucide-react';

interface NavbarProps {
  currentView: 'landing' | 'driver' | 'admin' | 'login';
  onViewChange: (view: 'landing' | 'driver' | 'admin' | 'login') => void;
}

export default function Navbar({ currentView, onViewChange }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-brand-navy-dark/80 backdrop-blur-md border-b border-white/5 py-3' 
        : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-brand-red/10 border border-brand-red/30">
              <div className="absolute inset-0 rounded-lg bg-brand-red/20 blur-sm animate-pulse"></div>
              <Activity className="h-5.5 w-5.5 text-brand-red relative z-10" />
            </div>
            <span className="font-sans font-bold text-xl tracking-tight text-white flex items-center gap-1.5">
              JR <span className="text-gray-300 font-light">JeevanRoute</span>
            </span>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
              Features
            </a>
            <a href="#about" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
              About
            </a>
            <a href="#faq" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
              FAQ
            </a>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <button 
              onClick={() => onViewChange('login')}
              className="relative group overflow-hidden rounded-md bg-white text-brand-navy-dark font-medium text-xs px-4 py-2 transition-all duration-200 hover:bg-gray-100 active:scale-95 border border-white/10 cursor-pointer"
            >
              Login / Register
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-white/5 focus:outline-none transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden absolute top-full left-0 right-0 bg-brand-navy-dark/95 backdrop-blur-lg border-b border-white/5 transition-all duration-300 ease-in-out ${
        isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'
      }`}>
        <div className="px-4 pt-2 pb-6 space-y-3 sm:px-3">
          <a
            href="#features"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
          >
            Features
          </a>
          <a
            href="#about"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
          >
            About
          </a>
          <a
            href="#faq"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
          >
            FAQ
          </a>
          <div className="pt-4 border-t border-white/5 px-3">
            <button 
              onClick={() => {
                onViewChange('login');
                setIsOpen(false);
              }}
              className="w-full text-center rounded-md bg-white text-brand-navy-dark font-semibold text-sm py-2 transition-colors hover:bg-gray-100 cursor-pointer"
            >
              Login / Register
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
