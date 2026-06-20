'use client'

import Link from 'next/link'
import GlassCard from '@/components/GlassCard'
import GlassButton from '@/components/GlassButton'
import GlassInput from '@/components/GlassInput'

export default function LandingPage() {
  return (
    <div className="bg-white text-gray-900">
      {/* Navigation */}
      <nav className="border-b border-gray-200 sticky top-0 bg-white z-50">
        <div className="section-container flex justify-between items-center py-20">
          <Link href="#home" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
              <span className="text-xl font-bold text-white">JR</span>
            </div>
            <span className="text-xl font-bold text-gray-900">JeevanRoute</span>
          </Link>
          <div className="flex gap-8 items-center">
            <Link href="#services" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Services</Link>
            <Link href="#about" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">About</Link>
            <Link href="#faq" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">FAQ</Link>
            <Link href="#contact" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Contact</Link>
            <Link href="/auth/login" className="text-gray-900 font-medium px-5 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-all">Login</Link>
          </div>
        </div>
      </nav>

      <main className="w-full">
        {/* Hero Section */}
        <section id="home">
          <div className="section-container">
            <div className="text-center">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Every Second Counts.
                <br />
                <span className="text-red-500">Get to the Right Hospital.</span>
              </h1>
              <p className="text-xl text-gray-600 mb-12 leading-relaxed max-w-5xl ml-10 md:ml-26">
                AI-powered routing for ambulances across India. Connecting patients with the nearest available hospitals in real-time.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14 max-w-7xl mx-auto">
                <GlassCard className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Reduced Response Time</h3>
                  <p className="text-gray-500">Cutting down time to hospital by 30%</p>
                </GlassCard>
                <GlassCard className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">1000+ Hospitals</h3>
                  <p className="text-gray-500">Network across major cities in India</p>
                </GlassCard>
                <GlassCard className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">AI-Powered</h3>
                  <p className="text-gray-500">Smart triage and real-time routing</p>
                </GlassCard>
              </div>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link href="/auth/signup">
                  <GlassButton variant="primary">
                  Get Started
                </GlassButton>
                </Link>
                <Link href="#contact">
                  <GlassButton variant="secondary">
                    Contact Us
                  </GlassButton>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* About Us Section */}
        <section id="about" className="bg-gray-50">
          <div className="section-container">
            <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">About Us</h2>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <GlassCard className="p-8">
                <p className="text-gray-700 text-lg leading-relaxed mb-6">
                  JeevanRoute is revolutionizing emergency medical response in India. Our AI-powered 
                  platform connects ambulances with hospitals in real-time, ensuring patients get 
                  to the right facility at the right time. We prioritize specialty matching, 
                  available beds, and real-time traffic data to save lives.
                </p>
                <p className="text-gray-700 text-lg leading-relaxed mb-6">
                  Founded in 2024, we have already helped thousands of patients get the critical 
                  care they need. Our mission is to make emergency medical services accessible, 
                  efficient, and reliable for everyone across the country.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4">
                    <div className="text-3xl font-bold text-red-500 mb-1">5000+</div>
                    <div className="text-gray-500">Patients Helped</div>
                  </div>
                  <div className="text-center p-4">
                    <div className="text-3xl font-bold text-gray-700 mb-1">24/7</div>
                    <div className="text-gray-500">Available</div>
                  </div>
                </div>
              </GlassCard>
              <div className="space-y-6">
                <GlassCard className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Our Mission</h3>
                  <p className="text-gray-600">
                    To provide every patient in need with the fastest possible access to the right hospital.
                  </p>
                </GlassCard>
                <GlassCard className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Our Vision</h3>
                  <p className="text-gray-600">
                    To become the leading emergency medical response platform across all of South Asia.
                  </p>
                </GlassCard>
                <GlassCard className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Our Values</h3>
                  <p className="text-gray-600">
                    Speed, Reliability, Compassion, and Innovation.
                  </p>
                </GlassCard>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services">
          <div className="section-container">
            <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">Our Services</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <GlassCard className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-5 text-center">AI Triage</h3>
                <p className="text-gray-600 text-lg leading-relaxed text-center mb-6">
                  Our AI analyzes patient condition in seconds and provides critical insights 
                  to both ambulance operators and hospitals.
                </p>
                <ul className="text-gray-500 space-y-2">
                  <li className="flex items-start gap-2"><span className="text-green-600">✓</span> Symptom Analysis</li>
                  <li className="flex items-start gap-2"><span className="text-green-600">✓</span> Specialty Matching</li>
                  <li className="flex items-start gap-2"><span className="text-green-600">✓</span> Equipment Requirements</li>
                  <li className="flex items-start gap-2"><span className="text-green-600">✓</span> Urgency Assessment</li>
                </ul>
              </GlassCard>
              <GlassCard className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-5 text-center">Real-time Routing</h3>
                <p className="text-gray-600 text-lg leading-relaxed text-center mb-6">
                  Live traffic data and hospital availability ensure the fastest possible route 
                  to the most appropriate facility.
                </p>
                <ul className="text-gray-500 space-y-2">
                  <li className="flex items-start gap-2"><span className="text-blue-600">✓</span> Live Traffic Data</li>
                  <li className="flex items-start gap-2"><span className="text-blue-600">✓</span> Bed Availability Check</li>
                  <li className="flex items-start gap-2"><span className="text-blue-600">✓</span> ETA Calculation</li>
                  <li className="flex items-start gap-2"><span className="text-blue-600">✓</span> Alternative Routes</li>
                </ul>
              </GlassCard>
              <GlassCard className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-5 text-center">Hospital Alerts</h3>
                <p className="text-gray-600 text-lg leading-relaxed text-center mb-6">
                  Instant alerts notify hospitals of incoming patients, with auto-failover 
                  if the first hospital declines.
                </p>
                <ul className="text-gray-500 space-y-2">
                  <li className="flex items-start gap-2"><span className="text-red-600">✓</span> Instant Notifications</li>
                  <li className="flex items-start gap-2"><span className="text-red-600">✓</span> Auto-failover System</li>
                  <li className="flex items-start gap-2"><span className="text-red-600">✓</span> Status Updates</li>
                  <li className="flex items-start gap-2"><span className="text-red-600">✓</span> Real-time Communication</li>
                </ul>
              </GlassCard>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="bg-gray-50">
          <div className="section-container">
            <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">Frequently Asked Questions</h2>
            <div className="grid md:grid-cols-2 gap-6 max-w-7xl mx-auto">
              <GlassCard className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">How does the AI triage work?</h3>
                <p className="text-gray-600">
                  Our AI analyzes patient symptoms and provides specialty recommendations, urgency levels, and equipment needs.
                </p>
              </GlassCard>
              <GlassCard className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Is my data secure?</h3>
                <p className="text-gray-600">
                  Yes, we use Supabase for secure authentication and data storage, with end-to-end encryption.
                </p>
              </GlassCard>
              <GlassCard className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">How many hospitals are on the platform?</h3>
                <p className="text-gray-600">
                  We are continuously expanding our network. Currently, we cover major hospitals in Delhi/NCR with more coming soon.
                </p>
              </GlassCard>
              <GlassCard className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">How do I sign up as a hospital?</h3>
                <p className="text-gray-600">
                  Hospitals can sign up through our portal, verify their credentials, and join our network within 24 hours.
                </p>
              </GlassCard>
              <GlassCard className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Do you cover rural areas?</h3>
                <p className="text-gray-600">
                  We are working hard to expand to rural areas. Currently, we focus on major cities but plan to cover rural regions soon.
                </p>
              </GlassCard>
              <GlassCard className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">What if a hospital is full?</h3>
                <p className="text-gray-600">
                  Our system automatically checks bed availability and reroutes to the next best hospital instantly.
                </p>
              </GlassCard>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact">
          <div className="section-container">
            <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">Get In Touch</h2>
            <div className="grid md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <GlassCard className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-5">Phone & WhatsApp</h3>
                  <div className="space-y-4">
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <p className="text-gray-500 text-sm mb-1">Emergency Hotline</p>
                      <a href="tel:+911123456789" className="text-xl font-bold text-gray-900 hover:text-red-500 transition-colors">+91-11-2345-6789</a>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <p className="text-gray-500 text-sm mb-1">WhatsApp Support</p>
                      <a href="https://wa.me/919876543210" target="_blank" className="text-xl font-bold text-green-600 hover:text-green-700 transition-colors">+91-98765-43210</a>
                    </div>
                  </div>
                </GlassCard>
                
                <GlassCard className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-5">Email</h3>
                  <div className="space-y-4">
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <p className="text-gray-500 text-sm mb-1">General Inquiries</p>
                      <a href="mailto:info@jeevanroute.in" className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors">info@jeevanroute.in</a>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <p className="text-gray-500 text-sm mb-1">Support</p>
                      <a href="mailto:support@jeevanroute.in" className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors">support@jeevanroute.in</a>
                    </div>
                  </div>
                </GlassCard>

                <GlassCard className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-5">Follow Us</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <a href="https://instagram.com/goldenhour.in" target="_blank" className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all">
                      <span className="text-gray-900 font-medium">Instagram</span>
                    </a>
                    <a href="https://facebook.com/goldenhour.in" target="_blank" className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all">
                      <span className="text-gray-900 font-medium">Facebook</span>
                    </a>
                    <a href="https://twitter.com/goldenhour_in" target="_blank" className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all">
                      <span className="text-gray-900 font-medium">Twitter/X</span>
                    </a>
                    <a href="https://linkedin.com/company/goldenhour-in" target="_blank" className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all">
                      <span className="text-gray-900 font-medium">LinkedIn</span>
                    </a>
                  </div>
                </GlassCard>
              </div>
              
              <GlassCard className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Send us a message</h3>
                <form className="space-y-5">
                  <div>
                    <label className="block text-lg text-gray-700 mb-2 font-medium">Name</label>
                    <GlassInput placeholder="Your full name" />
                  </div>
                  <div>
                    <label className="block text-lg text-gray-700 mb-2 font-medium">Email</label>
                    <GlassInput type="email" placeholder="your@email.com" />
                  </div>
                  <div>
                    <label className="block text-lg text-gray-700 mb-2 font-medium">Phone</label>
                    <GlassInput type="tel" placeholder="+91-98765-43210" />
                  </div>
                  <div>
                    <label className="block text-lg text-gray-700 mb-2 font-medium">Message</label>
                    <textarea
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 resize-none"
                      rows={6}
                      placeholder="How can we help you..."
                    />
                  </div>
                  <GlassButton type="submit" variant="primary" className="w-full">
                    Send Message
                  </GlassButton>
                </form>
              </GlassCard>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-10 border-t border-gray-200 bg-white">
          <div className="section-container text-center">
            <p className="text-gray-600 mb-1">&copy; 2024 JeevanRoute. All rights reserved.</p>
            <p className="text-gray-400">Saving lives, one second at a time.</p>
          </div>
        </footer>
      </main>
    </div>
  )
}
