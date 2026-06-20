'use client'

import Link from 'next/link'
import GlassCard from '@/components/GlassCard'
import GlassButton from '@/components/GlassButton'
import GlassNav from '@/components/GlassNav'
import GlassInput from '@/components/GlassInput'

export default function LandingPage() {
  return (
    <div className="h-screen overflow-y-auto snap-y snap-mandatory">
      {/* Navigation */}
      <div className="fixed top-0 left-0 right-0 z-50 py-4 flex justify-center">
        <GlassNav className="flex justify-center">
          <div className="font-light text-center">
            <div className="flex justify-center items-center gap-12 flex-wrap px-4">
              <Link href="#home" className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-red-500/40 flex items-center justify-center border-3 border-red-400/30">
                  <span className="text-3xl font-black text-red-400">JR</span>
                </div>
                <span className="text-2xl font-black text-white">JeevanRoute</span>
              </Link>
              <div className="flex gap-10 text-white/90 items-center flex-wrap">
                <Link href="#services" className="hover:text-white font-bold transition-colors text-base">Services</Link>
                <Link href="#about" className="hover:text-white font-bold transition-colors text-base">About</Link>
                <Link href="#faq" className="hover:text-white font-bold transition-colors text-base">FAQ</Link>
                <Link href="#contact" className="hover:text-white font-bold transition-colors text-base">Contact</Link>
                <Link href="/auth/login" className="text-white font-black bg-white/20 px-6 py-2 rounded-2xl hover:bg-white/30 transition-all text-base border-2 border-white/30">Login</Link>
              </div>
            </div>
          </div>
        </GlassNav>
      </div>

      <main className="w-full">
        {/* Hero Section */}
        <section id="home" className="min-h-screen flex items-center justify-center snap-start pt-40">
          <div className="text-center max-w-5xl mx-auto px-6">
            <h1 className="text-6xl md:text-7xl font-black text-white mb-8 leading-tight">
              Every Second Counts.
              <br />
              <span className="text-red-400">Get to the Right Hospital.</span>
            </h1>
            <p className="text-3xl text-white/80 mb-12 leading-relaxed max-w-3xl mx-auto">
              AI-powered routing for ambulances across India. Connecting patients with the nearest available hospitals in real-time.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 max-w-4xl mx-auto">
              <GlassCard>
                <h3 className="text-2xl font-bold text-white mb-2">Reduced Response Time</h3>
                <p className="text-white/70 text-lg">Cutting down time to hospital by 30%</p>
              </GlassCard>
              <GlassCard>
                <h3 className="text-2xl font-bold text-white mb-2">1000+ Hospitals</h3>
                <p className="text-white/70 text-lg">Network across major cities in India</p>
              </GlassCard>
              <GlassCard>
                <h3 className="text-2xl font-bold text-white mb-2">AI-Powered</h3>
                <p className="text-white/70 text-lg">Smart triage and real-time routing</p>
              </GlassCard>
            </div>
            <div className="flex flex-wrap gap-8 justify-center">
              <Link href="/auth/signup">
                <GlassButton variant="red" className="text-2xl px-12 py-6 font-black">
                  Get Started
                </GlassButton>
              </Link>
              <Link href="#contact">
                <GlassButton className="text-2xl px-12 py-6 font-black">
                  Contact Us
                </GlassButton>
              </Link>
            </div>
          </div>
        </section>

        {/* About Us Section */}
        <section id="about" className="min-h-screen flex items-center justify-center snap-start pt-40">
          <div className="w-full max-w-7xl px-6">
            <h2 className="text-5xl font-black text-white text-center mb-16">About Us</h2>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <GlassCard>
                <p className="text-white/90 text-2xl leading-relaxed mb-8">
                  JeevanRoute is revolutionizing emergency medical response in India. Our AI-powered 
                  platform connects ambulances with hospitals in real-time, ensuring patients get 
                  to the right facility at the right time. We prioritize specialty matching, 
                  available beds, and real-time traffic data to save lives.
                </p>
                <p className="text-white/90 text-2xl leading-relaxed mb-8">
                  Founded in 2024, we have already helped thousands of patients get the critical 
                  care they need. Our mission is to make emergency medical services accessible, 
                  efficient, and reliable for everyone across the country.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4">
                    <div className="text-4xl font-black text-red-400 mb-2">5000+</div>
                    <div className="text-white/70 text-lg">Patients Helped</div>
                  </div>
                  <div className="text-center p-4">
                    <div className="text-4xl font-black text-blue-400 mb-2">24/7</div>
                    <div className="text-white/70 text-lg">Available</div>
                  </div>
                </div>
              </GlassCard>
              <div className="space-y-8">
                <GlassCard>
                  <h3 className="text-3xl font-bold text-white mb-4">Our Mission</h3>
                  <p className="text-white/80 text-xl">
                    To provide every patient in need with the fastest possible access to the right hospital.
                  </p>
                </GlassCard>
                <GlassCard>
                  <h3 className="text-3xl font-bold text-white mb-4">Our Vision</h3>
                  <p className="text-white/80 text-xl">
                    To become the leading emergency medical response platform across all of South Asia.
                  </p>
                </GlassCard>
                <GlassCard>
                  <h3 className="text-3xl font-bold text-white mb-4">Our Values</h3>
                  <p className="text-white/80 text-xl">
                    Speed, Reliability, Compassion, and Innovation.
                  </p>
                </GlassCard>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="min-h-screen flex items-center justify-center snap-start pt-40">
          <div className="w-full max-w-7xl px-6">
            <h2 className="text-5xl font-black text-white text-center mb-16">Our Services</h2>
            <div className="grid md:grid-cols-3 gap-10">
              <GlassCard>
                <h3 className="text-3xl font-black text-white mb-6 text-center">AI Triage</h3>
                <p className="text-white/80 text-2xl leading-relaxed text-center mb-8">
                  Our AI analyzes patient condition in seconds and provides critical insights 
                  to both ambulance operators and hospitals.
                </p>
                <ul className="text-white/70 text-lg space-y-3">
                  <li className="flex items-start gap-3"><span className="text-green-400 text-xl">✓</span> Symptom Analysis</li>
                  <li className="flex items-start gap-3"><span className="text-green-400 text-xl">✓</span> Specialty Matching</li>
                  <li className="flex items-start gap-3"><span className="text-green-400 text-xl">✓</span> Equipment Requirements</li>
                  <li className="flex items-start gap-3"><span className="text-green-400 text-xl">✓</span> Urgency Assessment</li>
                </ul>
              </GlassCard>
              <GlassCard>
                <h3 className="text-3xl font-black text-white mb-6 text-center">Real-time Routing</h3>
                <p className="text-white/80 text-2xl leading-relaxed text-center mb-8">
                  Live traffic data and hospital availability ensure the fastest possible route 
                  to the most appropriate facility.
                </p>
                <ul className="text-white/70 text-lg space-y-3">
                  <li className="flex items-start gap-3"><span className="text-blue-400 text-xl">✓</span> Live Traffic Data</li>
                  <li className="flex items-start gap-3"><span className="text-blue-400 text-xl">✓</span> Bed Availability Check</li>
                  <li className="flex items-start gap-3"><span className="text-blue-400 text-xl">✓</span> ETA Calculation</li>
                  <li className="flex items-start gap-3"><span className="text-blue-400 text-xl">✓</span> Alternative Routes</li>
                </ul>
              </GlassCard>
              <GlassCard>
                <h3 className="text-3xl font-black text-white mb-6 text-center">Hospital Alerts</h3>
                <p className="text-white/80 text-2xl leading-relaxed text-center mb-8">
                  Instant alerts notify hospitals of incoming patients, with auto-failover 
                  if the first hospital declines.
                </p>
                <ul className="text-white/70 text-lg space-y-3">
                  <li className="flex items-start gap-3"><span className="text-red-400 text-xl">✓</span> Instant Notifications</li>
                  <li className="flex items-start gap-3"><span className="text-red-400 text-xl">✓</span> Auto-failover System</li>
                  <li className="flex items-start gap-3"><span className="text-red-400 text-xl">✓</span> Status Updates</li>
                  <li className="flex items-start gap-3"><span className="text-red-400 text-xl">✓</span> Real-time Communication</li>
                </ul>
              </GlassCard>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="min-h-screen flex items-center justify-center snap-start pt-40 overflow-y-auto">
          <div className="w-full max-w-7xl px-6">
            <h2 className="text-5xl font-black text-white text-center mb-16">Frequently Asked Questions</h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              <GlassCard>
                <h3 className="text-2xl font-black text-white mb-5">How does the AI triage work?</h3>
                <p className="text-white/80 text-xl leading-relaxed">
                  Our AI uses Claude to analyze patient symptoms and provides specialty recommendations, urgency levels, and equipment needs.
                </p>
              </GlassCard>
              <GlassCard>
                <h3 className="text-2xl font-black text-white mb-5">Is my data secure?</h3>
                <p className="text-white/80 text-xl leading-relaxed">
                  Yes, we use Supabase for secure authentication and data storage, with end-to-end encryption.
                </p>
              </GlassCard>
              <GlassCard>
                <h3 className="text-2xl font-black text-white mb-5">How many hospitals are on the platform?</h3>
                <p className="text-white/80 text-xl leading-relaxed">
                  We are continuously expanding our network. Currently, we cover major hospitals in Delhi/NCR with more coming soon.
                </p>
              </GlassCard>
              <GlassCard>
                <h3 className="text-2xl font-black text-white mb-5">How do I sign up as a hospital?</h3>
                <p className="text-white/80 text-xl leading-relaxed">
                  Hospitals can sign up through our portal, verify their credentials, and join our network within 24 hours.
                </p>
              </GlassCard>
              <GlassCard>
                <h3 className="text-2xl font-black text-white mb-5">Do you cover rural areas?</h3>
                <p className="text-white/80 text-xl leading-relaxed">
                  We are working hard to expand to rural areas. Currently, we focus on major cities but plan to cover rural regions soon.
                </p>
              </GlassCard>
              <GlassCard>
                <h3 className="text-2xl font-black text-white mb-5">What if a hospital is full?</h3>
                <p className="text-white/80 text-xl leading-relaxed">
                  Our system automatically checks bed availability and reroutes to the next best hospital instantly.
                </p>
              </GlassCard>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="min-h-screen flex items-center justify-center snap-start pt-40">
          <div className="w-full max-w-7xl px-6">
            <h2 className="text-5xl font-black text-white text-center mb-16">Get In Touch</h2>
            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <GlassCard>
                  <h3 className="text-3xl font-bold text-white mb-6">Phone & WhatsApp</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-white/10 rounded-xl">
                      <p className="text-white/70 text-sm mb-1">Emergency Hotline</p>
                      <a href="tel:+911123456789" className="text-2xl font-bold text-white hover:text-red-400 transition-colors">+91-11-2345-6789</a>
                    </div>
                    <div className="p-4 bg-white/10 rounded-xl">
                      <p className="text-white/70 text-sm mb-1">WhatsApp Support</p>
                      <a href="https://wa.me/919876543210" target="_blank" className="text-2xl font-bold text-green-400 hover:text-green-300 transition-colors">+91-98765-43210</a>
                    </div>
                  </div>
                </GlassCard>
                
                <GlassCard>
                  <h3 className="text-3xl font-bold text-white mb-6">Email</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-white/10 rounded-xl">
                      <p className="text-white/70 text-sm mb-1">General Inquiries</p>
                      <a href="mailto:info@jeevanroute.in" className="text-xl font-bold text-white hover:text-blue-400 transition-colors">info@jeevanroute.in</a>
                    </div>
                    <div className="p-4 bg-white/10 rounded-xl">
                      <p className="text-white/70 text-sm mb-1">Support</p>
                      <a href="mailto:support@jeevanroute.in" className="text-xl font-bold text-white hover:text-blue-400 transition-colors">support@jeevanroute.in</a>
                    </div>
                  </div>
                </GlassCard>

                <GlassCard>
                  <h3 className="text-3xl font-bold text-white mb-6">Follow Us</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <a href="https://instagram.com/goldenhour.in" target="_blank" className="flex items-center gap-3 p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-all">
                      <span className="text-white font-bold text-lg">Instagram</span>
                    </a>
                    <a href="https://facebook.com/goldenhour.in" target="_blank" className="flex items-center gap-3 p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-all">
                      <span className="text-white font-bold text-lg">Facebook</span>
                    </a>
                    <a href="https://twitter.com/goldenhour_in" target="_blank" className="flex items-center gap-3 p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-all">
                      <span className="text-white font-bold text-lg">Twitter/X</span>
                    </a>
                    <a href="https://linkedin.com/company/goldenhour-in" target="_blank" className="flex items-center gap-3 p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-all">
                      <span className="text-white font-bold text-lg">LinkedIn</span>
                    </a>
                  </div>
                </GlassCard>
              </div>
              
              <GlassCard>
                <h3 className="text-3xl font-bold text-white mb-8">Send us a message</h3>
                <form className="space-y-6">
                  <div>
                    <label className="block text-2xl text-white/80 mb-4 font-bold">Name</label>
                    <GlassInput placeholder="Your full name" className="py-5 text-xl" />
                  </div>
                  <div>
                    <label className="block text-2xl text-white/80 mb-4 font-bold">Email</label>
                    <GlassInput type="email" placeholder="your@email.com" className="py-5 text-xl" />
                  </div>
                  <div>
                    <label className="block text-2xl text-white/80 mb-4 font-bold">Phone</label>
                    <GlassInput type="tel" placeholder="+91-98765-43210" className="py-5 text-xl" />
                  </div>
                  <div>
                    <label className="block text-2xl text-white/80 mb-4 font-bold">Message</label>
                    <textarea
                      className="w-full px-8 py-5 bg-white/15 border-3 border-white/25 rounded-2xl text-white placeholder-white/70 focus:outline-none focus:border-white/50 resize-none text-xl"
                      rows={6}
                      placeholder="How can we help you..."
                    />
                  </div>
                  <GlassButton type="submit" variant="red" className="w-full py-6 text-2xl font-black">
                    Send Message
                  </GlassButton>
                </form>
              </GlassCard>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="h-32 flex items-center justify-center text-white/70 w-full border-t border-white/10 snap-start">
          <div className="text-center">
            <p className="text-2xl mb-2">&copy; 2024 JeevanRoute. All rights reserved.</p>
            <p className="text-lg text-white/50">Saving lives, one second at a time.</p>
          </div>
        </footer>
      </main>
    </div>
  )
}
