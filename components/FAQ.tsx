import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      id: 'faq-security',
      question: 'How does JeevanRoute guarantee patient data security?',
      answer: 'All patient telemetry, vital logs, and routing data are encrypted end-to-end using AES-256. We comply with global HIPAA standards and India\'s DISHA (Digital Information Security in Healthcare Act) guidelines, ensuring patient medical files are only accessible to the dispatch team and the confirmed receiving hospital.',
    },
    {
      id: 'faq-connectivity',
      question: 'What happens in rural zones with weak network connectivity?',
      answer: 'Our mobile client features an offline-first telemetry engine. In low-bandwidth areas (like edge 2G), the system compresses vitals and GPS coordinates into lightweight, secure SMS-based telemetry packets which are resolved on our gateway server, maintaining real-time routing even under extreme signal loss.',
    },
    {
      id: 'faq-integration',
      question: 'Can private hospital chains and municipal fleets integrate with this?',
      answer: 'Yes. JeevanRoute provides plug-and-play APIs and SDKs that easily connect with pre-existing telemetry hardware in modern ambulance fleets. Hospital ER dashboards operate as standalone web apps requiring zero local installation, or they can integrate into existing HMIS (Hospital Management Information Systems).',
    },
    {
      id: 'faq-failover',
      question: 'How fast is the auto-failover process during emergencies?',
      answer: 'If the initial receiving hospital does not confirm capacity within 60 seconds, our AI immediately triggers the routing cascade. The platform checks nearby alternatives in less than 500ms, pushes the vitals to the next best match, and triggers audible dashboard alerts for the new ER team.',
    },
  ];

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="relative py-24 bg-brand-navy-dark/70 border-t border-white/5 overflow-hidden">
      {/* Background glow points */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-brand-red/[0.02] blur-3xl pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <span className="font-mono text-xs text-brand-red font-semibold uppercase tracking-widest">
            OPERATIONAL CLEARANCE
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
            Frequently Answered Questions
          </h2>
          <p className="text-sm text-gray-400 font-light">
            Understand how our medical dispatch tech secures slots, handles signal drops, and complies with healthcare regulations.
          </p>
        </div>

        {/* Accordion Group */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={faq.id}
                className="rounded-xl border border-white/5 bg-brand-navy-light/10 overflow-hidden transition-colors duration-200 hover:border-white/10"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-5 text-left text-white font-medium hover:bg-white/[0.02] transition-colors focus:outline-none"
                >
                  <span className="flex items-center gap-3 text-sm sm:text-base font-semibold">
                    <HelpCircle className="h-4.5 w-4.5 text-brand-red flex-shrink-0" />
                    {faq.question}
                  </span>
                  <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${
                    isOpen ? 'transform rotate-180 text-brand-red' : ''
                  }`} />
                </button>
                
                {/* Content Panel */}
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  isOpen ? 'max-h-60 border-t border-white/5 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="p-5 text-xs sm:text-sm text-gray-400 font-light leading-relaxed bg-brand-navy-dark/40">
                    {faq.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
