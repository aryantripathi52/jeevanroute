import { useState, useEffect } from 'react';
import { Brain, Navigation, RefreshCw, ArrowLeft, Activity, Fingerprint } from 'lucide-react';
import { SignIn as ClerkSignIn, SignUp as ClerkSignUp } from '@clerk/clerk-react';

interface SignInProps {
  onViewChange: (view: 'landing' | 'driver' | 'admin' | 'login') => void;
}

export default function SignIn({ onViewChange }: SignInProps) {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [selectedRole, setSelectedRole] = useState<'DRIVER' | 'ADMIN' | null>(null);

  // Clear any stale selectedRole when SignIn component mounts to ensure clean slate
  useEffect(() => {
    localStorage.removeItem('selectedRole');
    setSelectedRole(null);
  }, []);

  // Track hash routing updates to synchronize headings with Clerk's inner navigation controls
  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash.includes('sign-up')) {
        setAuthMode('signup');
      } else {
        setAuthMode('signin');
        setSelectedRole(null);
        localStorage.removeItem('selectedRole');
      }
    };
    window.addEventListener('hashchange', handleHash);
    handleHash(); // Initial sync
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  return (
    <div className="min-h-screen bg-[#090d16] flex flex-col lg:flex-row relative overflow-hidden font-sans">
      
      {/* 1. Left Column (The Brand/Context) - Hidden on Mobile */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#020617] relative flex-col justify-between p-12 border-r border-white/5 overflow-hidden">
        
        {/* Animated SVG Map Mesh Background */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g stroke="rgba(225, 29, 72, 0.15)" strokeWidth="1">
              {[...Array(15)].map((_, i) => (
                <line key={`lh-${i}`} x1="0" y1={i * 40} x2="500" y2={i * 40} />
              ))}
              {[...Array(15)].map((_, i) => (
                <line key={`lv-${i}`} x1={i * 40} y1="0" x2={i * 40} y2="500" />
              ))}
            </g>
            {/* Pulsing glow nodes */}
            <circle cx="160" cy="200" r="40" fill="rgba(99, 102, 241, 0.1)" className="animate-pulse" />
            <circle cx="360" cy="320" r="60" fill="rgba(225, 29, 72, 0.08)" className="animate-pulse-soft" />
            
            {/* Glowing routes */}
            <path d="M40,240 Q160,160 280,240 T440,240" stroke="#E11D48" strokeWidth="2" strokeOpacity="0.4" strokeDasharray="5 5" />
            <path d="M120,400 Q240,280 360,400" stroke="#6366F1" strokeWidth="2" strokeOpacity="0.3" strokeDasharray="5 5" />
          </svg>
        </div>

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-brand-red/10 border border-brand-red/30">
            <Activity className="h-5 w-5 text-brand-red" />
          </div>
          <span className="font-bold text-lg text-white">
            JR <span className="text-gray-300 font-light">JeevanRoute</span>
          </span>
        </div>

        {/* Central Core Pitch */}
        <div className="relative z-10 my-auto max-w-lg space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight font-sans">
            Every Second Counts.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-brand-red">
              Connecting Ambulances & Hospitals in Real-Time.
            </span>
          </h2>
          <p className="text-sm text-gray-400 font-light leading-relaxed">
            JeevanRoute streamlines critical medical dispatches, enabling instant routing, telemetry broadcasts, and zero-delay hospital slots.
          </p>

          {/* 3 mini feature callouts */}
          <div className="space-y-4 pt-6">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded bg-brand-red/10 border border-brand-red/20 text-brand-red mt-0.5">
                <Brain className="h-4.5 w-4.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Smart Algorithm-Driven Triage</h4>
                <p className="text-xs text-gray-500 font-light mt-0.5">Vitals analyzed en-route to match specialized medical staff.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2 rounded bg-blue-500/10 border border-blue-500/20 text-blue-500 mt-0.5">
                <Navigation className="h-4.5 w-4.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Live Traffic Routing</h4>
                <p className="text-xs text-gray-500 font-light mt-0.5">Municipal bypass feeds override congestion automatically.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2 rounded bg-medical-emerald/10 border border-medical-emerald/20 text-medical-emerald mt-0.5">
                <RefreshCw className="h-4.5 w-4.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Automated Hospital Failovers</h4>
                <p className="text-xs text-gray-500 font-light mt-0.5">60s hospital timeout triggers direct cascade routing.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-[10px] text-gray-500 font-mono">
          SECURE CONNECTION • DISHA COMPLIANT
        </div>

      </div>

      {/* 2. Right Column (The Auth Form Wrapper) */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-12 relative">
        
        {/* Mobile Header Branding - Shown only on Mobile */}
        <div className="flex items-center justify-between lg:hidden pb-6 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center w-8 h-8 rounded bg-brand-red/10 border border-brand-red/30">
              <Activity className="h-4.5 w-4.5 text-brand-red" />
            </div>
            <span className="font-bold text-base text-white">JeevanRoute</span>
          </div>
          <button 
            type="button"
            onClick={() => onViewChange('landing')}
            className="text-xs text-gray-400 hover:text-white flex items-center gap-1 font-semibold cursor-pointer border-0 bg-transparent"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </button>
        </div>

        {/* Desktop Close/Back - Shown only on Desktop */}
        <div className="hidden lg:flex items-center justify-end relative z-10">
          <button 
            type="button"
            onClick={() => onViewChange('landing')}
            className="px-3.5 py-1.5 rounded-lg border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-xs font-semibold text-white flex items-center gap-1.5 transition-all duration-200 cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
          </button>
        </div>

        {/* Core Card Container (Centered) */}
        <div className="my-auto mx-auto w-full max-w-[420px] relative z-10">
          
          {/* Card with glowing indigo/crimson gradient border */}
          <div className="relative rounded-2xl p-0.5 bg-gradient-to-tr from-brand-red/20 via-white/5 to-indigo-500/20 shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-[#090d16] to-[#05080f] rounded-2xl pointer-events-none"></div>

            <div className="relative p-6 sm:p-8 rounded-2xl space-y-5">
              
              {/* Framing Elements */}
              <div className="text-center space-y-2">
                <div className="mx-auto w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Fingerprint className="h-5.5 w-5.5 animate-pulse" />
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  {authMode === 'signin' ? 'Welcome Back Dispatcher' : 'Register New Dispatcher'}
                </h3>
                <p className="text-xs text-gray-400 font-light leading-relaxed">
                  Access your secure authenticated profile through Clerk Dispatch service.
                </p>
              </div>

              {/* Form Content Switcher */}
              <div className="flex justify-center w-full min-h-[300px]">
                {authMode === 'signin' ? (
                  <div className="w-full space-y-4">
                    <ClerkSignIn 
                      routing="hash"
                      signUpUrl="#/sign-up"
                      appearance={{
                        variables: {
                          colorPrimary: '#E11D48',
                          colorBackground: 'transparent',
                          colorInputBackground: '#0b1220',
                          colorInputText: '#ffffff',
                          colorText: '#f3f4f6',
                          colorTextSecondary: '#9ca3af',
                        },
                        elements: {
                          cardBox: 'shadow-none border-0 bg-transparent w-full',
                          card: 'bg-transparent border-0 shadow-none p-0 w-full',
                          headerTitle: 'hidden',
                          headerSubtitle: 'hidden',
                          socialButtonsBlockButton: 'bg-white/5 border border-white/10 hover:bg-white/10 text-white',
                          socialButtonsBlockButtonText: 'text-white font-medium',
                          formButtonPrimary: 'bg-indigo-600 hover:bg-indigo-700 text-white font-bold',
                          footerActionLink: 'text-indigo-400 hover:text-indigo-300',
                          formFieldInput: 'bg-white/5 border border-white/10 text-white text-xs',
                          formFieldLabel: 'text-gray-300 text-xs font-mono',
                          dividerLine: 'bg-white/5',
                          dividerText: 'text-gray-500 font-mono text-[9px]',
                          footer: 'bg-transparent p-0 border-t border-white/5 mt-4'
                        }
                      }}
                    />
                    
                    {/* Custom Sign In Footer Toggle */}
                    <p className="text-center text-xs text-gray-400 mt-4">
                      Don’t have an account?{' '}
                      <button 
                        type="button" 
                        onClick={() => {
                          setAuthMode('signup');
                          setSelectedRole(null);
                        }} 
                        className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer border-0 bg-transparent"
                      >
                        Sign up
                      </button>
                    </p>
                  </div>
                ) : (
                  /* SignUp Page */
                  selectedRole === null ? (
                    /* Role/Portal Selection Step */
                    <div className="w-full space-y-5 pt-2 text-center">
                      <p className="text-xs text-gray-400 font-light leading-relaxed">
                        Please select your emergency operational access portal to begin registration.
                      </p>
                      <div className="flex flex-col gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            localStorage.setItem('selectedRole', 'DRIVER');
                            setSelectedRole('DRIVER');
                          }}
                          className="w-full py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-brand-red rounded-xl text-xs font-bold uppercase tracking-wider text-white transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                          <Activity className="h-4.5 w-4.5 text-brand-red animate-pulse" />
                          Ambulance Driver Portal
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            localStorage.setItem('selectedRole', 'ADMIN');
                            setSelectedRole('ADMIN');
                          }}
                          className="w-full py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-indigo-500 rounded-xl text-xs font-bold uppercase tracking-wider text-white transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                          <Brain className="h-4.5 w-4.5 text-indigo-400" />
                          Hospital Admin Portal
                        </button>
                      </div>
                      <p className="text-center text-xs text-gray-400 mt-4">
                        Already have an account?{' '}
                        <button 
                          type="button" 
                          onClick={() => {
                            setAuthMode('signin');
                            setSelectedRole(null);
                          }} 
                          className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer border-0 bg-transparent"
                        >
                          Sign In
                        </button>
                      </p>
                    </div>
                  ) : (
                    /* Clerk Sign Up with Selected Role Header */
                    <div className="w-full space-y-4">
                      <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 bg-white/[0.02] border border-white/10 px-3.5 py-2.5 rounded-xl">
                        <span>PORTAL SELECTED: <strong className="text-white uppercase font-bold">{selectedRole === 'DRIVER' ? 'Ambulance' : 'Hospital Admin'}</strong></span>
                        <button
                          type="button"
                          onClick={() => {
                            localStorage.removeItem('selectedRole');
                            setSelectedRole(null);
                          }}
                          className="text-brand-red hover:underline font-extrabold uppercase"
                        >
                          Change
                        </button>
                      </div>
                      
                      <ClerkSignUp
                        routing="hash"
                        signInUrl="#/sign-in"
                        appearance={{
                          variables: {
                            colorPrimary: '#E11D48',
                            colorBackground: 'transparent',
                            colorInputBackground: '#0b1220',
                            colorInputText: '#ffffff',
                            colorText: '#f3f4f6',
                            colorTextSecondary: '#9ca3af',
                          },
                          elements: {
                            cardBox: 'shadow-none border-0 bg-transparent w-full',
                            card: 'bg-transparent border-0 shadow-none p-0 w-full',
                            headerTitle: 'hidden',
                            headerSubtitle: 'hidden',
                            socialButtonsBlockButton: 'bg-white/5 border border-white/10 hover:bg-white/10 text-white',
                            socialButtonsBlockButtonText: 'text-white font-medium',
                            formButtonPrimary: 'bg-indigo-600 hover:bg-indigo-700 text-white font-bold',
                            footerActionLink: 'text-indigo-400 hover:text-indigo-300',
                            formFieldInput: 'bg-white/5 border border-white/10 text-white text-xs',
                            formFieldLabel: 'text-gray-300 text-xs font-mono',
                            dividerLine: 'bg-white/5',
                            dividerText: 'text-gray-500 font-mono text-[9px]',
                            footer: 'bg-transparent p-0 border-t border-white/5 mt-4'
                          }
                        }}
                      />

                      {/* Custom Sign Up Footer Toggle */}
                      <p className="text-center text-xs text-gray-400 mt-4">
                        Already have an account?{' '}
                        <button 
                          type="button" 
                          onClick={() => {
                            setAuthMode('signin');
                            setSelectedRole(null);
                          }} 
                          className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer border-0 bg-transparent"
                        >
                          Sign In
                        </button>
                      </p>
                    </div>
                  )
                )}
              </div>

              {/* Security info */}
              <p className="text-[10px] text-center text-gray-500 leading-normal">
                By signing in, you agree to our emergency operational protocols. Access is monitored under audit log guidelines.
              </p>
            </div>
          </div>
        </div>

        {/* Footer - Copyright */}
        <div className="text-center text-[10px] text-gray-500 font-mono pt-8">
          © {new Date().getFullYear()} JEEVANROUTE SYSTEMS INC.
        </div>

      </div>

    </div>
  );
}
