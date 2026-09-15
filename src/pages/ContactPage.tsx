import { useState, type FormEvent } from 'react';
import { 
  PhoneCall, Mail, MapPin, Send, CheckCircle, 
  HelpCircle, ChevronDown, ArrowRight
} from 'lucide-react';
import type { NavPage } from '../components/Navbar';

interface ContactPageProps {
  onNavigate?: (page: NavPage) => void;
}

export default function ContactPage({ onNavigate }: ContactPageProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Student Support & Course Inquiries');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How do I access my event QR ticket after payment?',
      a: 'As soon as your Razorpay transaction completes, your ticket is automatically generated. You can inspect, screenshot, or download the high-resolution QR pass directly from your Student Dashboard under "Registered Events".'
    },
    {
      q: 'Are the certificates verifiable by recruiters?',
      a: 'Yes! Every COMMUNITY.VA course and live workshop certificate includes a unique verification code and cryptographic QR link that employers can scan to verify the student name, completion date, and syllabus rubric.'
    },
    {
      q: 'Can colleges book customized offline on-campus bootcamps?',
      a: 'Absolutely. We host 2-day physical bootcamps covering resume audits, group discussion simulations, and panel mock interviews. Visit our "For Colleges" page or email institutional@communityva.com to request an MOU proposal.'
    },
    {
      q: 'What is the refund policy if I cannot attend a live masterclass?',
      a: 'We offer a 100% no-questions-asked refund up to 24 hours prior to the scheduled event start time. You can request a refund directly inside your dashboard or by pinging our support team.'
    },
    {
      q: 'How does the Campus Ambassador referral payout work?',
      a: 'When someone enrolls in any course or paid workshop using your unique referral link or coupon code, they receive ₹500 off, and ₹500 is credited to your ambassador account payable via UPI/Bank transfer on the 1st of every month.'
    }
  ];

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1 text-xs font-bold text-blue-400 mb-4">
            <PhoneCall className="h-3.5 w-3.5" />
            <span>24/7 Dedicated Student & Institutional Support</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            We’re Here to Help You Accelerate
          </h1>
          <p className="text-sm sm:text-base text-slate-400 mt-4 leading-relaxed">
            Have questions about workshops, campus ambassador chapters, or college partnership MOUs? Reach out and our team will get back to you within a few hours.
          </p>
          {onNavigate && (
            <div className="pt-4 flex justify-center">
              <button 
                onClick={() => onNavigate('for-colleges')}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Looking for university campus workshops? Explore College MOUs</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="p-6 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400">
              <Mail className="h-5 w-5" />
            </div>
            <h3 className="font-extrabold text-sm text-white">Direct Emails</h3>
            <p className="text-xs text-slate-400">
              Students: <a href="mailto:support@communityva.com" className="text-blue-400 hover:underline">support@communityva.com</a><br/>
              Colleges: <a href="mailto:colleges@communityva.com" className="text-blue-400 hover:underline">colleges@communityva.com</a>
            </p>
            <span className="text-[11px] text-slate-500 block">Typical response time: Under 2 hours</span>
          </div>

          <div className="p-6 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400">
              <PhoneCall className="h-5 w-5" />
            </div>
            <h3 className="font-extrabold text-sm text-white">Student Helpline</h3>
            <p className="text-xs text-slate-400">
              Call / WhatsApp: <span className="text-white font-semibold">+91 98765 43210</span><br/>
              Mon - Sat: 9:00 AM - 8:00 PM IST
            </p>
            <span className="text-[11px] text-slate-500 block">Instant emergency ticket resolution</span>
          </div>

          <div className="p-6 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/20 text-green-400">
              <MapPin className="h-5 w-5" />
            </div>
            <h3 className="font-extrabold text-sm text-white">Innovation Headquarters</h3>
            <p className="text-xs text-slate-400">
              COMMUNITY.VA Technologies Pvt. Ltd.<br/>
              Koramangala 4th Block, Bangalore, KA 560034
            </p>
            <span className="text-[11px] text-slate-500 block">Regional hubs in Delhi NCR & Hyderabad</span>
          </div>
        </div>

        {/* Contact Form & FAQ Split */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* Form */}
          <div className="p-8 rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl shadow-2xl">
            <h2 className="text-2xl font-black text-white">Send Us a Message</h2>
            <p className="text-xs text-slate-400 mt-1">Fill out the form below and we will reach out shortly.</p>

            {submitted ? (
              <div className="mt-8 p-6 rounded-2xl bg-green-500/10 border border-green-500/30 text-center space-y-2">
                <CheckCircle className="h-10 w-10 text-green-400 mx-auto" />
                <h4 className="font-bold text-white text-base">Message Sent Successfully!</h4>
                <p className="text-xs text-green-200">
                  Thank you for contacting COMMUNITY.VA. An advisor has been assigned to your query and will reply via email.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Your Name</label>
                    <input 
                      type="text"
                      required
                      placeholder="Alex Mercer"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Email Address</label>
                    <input 
                      type="email"
                      required
                      placeholder="alex@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Inquiry Topic</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-800 p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Student Support & Course Inquiries">Student Support & Course Inquiries</option>
                    <option value="Event Registration & Ticket Issue">Event Registration & Ticket Issue</option>
                    <option value="College Partnership & Campus Workshop">College Partnership & Campus Workshop</option>
                    <option value="Campus Ambassador Program">Campus Ambassador Program</option>
                    <option value="Careers & Job Application">Careers & Job Application</option>
                    <option value="Corporate Mentorship">Corporate Mentorship</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Message</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="How can we assist you today?"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 py-3 text-xs font-extrabold text-white shadow-lg shadow-indigo-500/25 transition hover:scale-101 cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                  <span>Send Message</span>
                </button>
              </form>
            )}
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                <HelpCircle className="h-6 w-6 text-blue-400" />
                <span>Frequently Asked Questions</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">Instant answers to common student and institutional inquiries.</p>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div 
                    key={index}
                    className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl overflow-hidden transition"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="w-full flex items-center justify-between p-4 text-left text-xs font-bold text-white hover:text-blue-400 transition cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-400' : ''}`} />
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 pt-1 text-xs text-slate-400 leading-relaxed border-t border-white/5 animate-fade-in">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
