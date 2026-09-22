import { useState } from 'react';
import { 
  Sparkles, ArrowRight, CheckCircle, Star, Calendar, 
  Trophy, PlayCircle, Clock, MapPin, Gift, ChevronDown, Award, TrendingUp,
  Users
} from 'lucide-react';
import { db } from '../data/mockDatabase';
import PaymentModal from '../components/PaymentModal';
import EventRegistrationModal from '../components/EventRegistrationModal';
import type { NavPage } from '../components/Navbar';

interface LandingPageProps {
  onNavigate: (view: NavPage) => void;
  currentUser: any;
  onLogout: () => void;
}

export default function LandingPage({ onNavigate, currentUser }: LandingPageProps) {
  const events = db.getEvents().slice(0, 3);
  const courses = db.getCourses().slice(0, 3);
  const testimonials = db.getTestimonials();
  const partners = db.getCollegePartners();

  // Full-screen Dynamic Event Registration Modal
  const [selectedRegEvent, setSelectedRegEvent] = useState<any | null>(null);

  // Payment Modal (Courses)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ name: string; price: number; type: 'course' | 'event'; id: string } | null>(null);

  // FAQ Accordion
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Why are non-technical skills more important than coding or grades?',
      a: 'Technical knowledge gets you the interview; non-technical skills get you the offer and determine your promotion velocity. Recruiters evaluate whether you can communicate trade-offs, persuade stakeholders, and resolve conflict under pressure.'
    },
    {
      q: 'How are COMMUNITY.VA workshops different from recorded YouTube videos?',
      a: 'We emphasize deliberate practice. You do not watch slides; you simulate real panel interviews, defend counter-offers against actual HR mentors, and receive immediate rubric-based voice and body language feedback.'
    },
    {
      q: 'Do I get a verifiable certificate upon completion?',
      a: 'Yes. Every course and live workshop issues a cryptographic, QR-enabled certificate that prospective recruiters can verify with a single click on LinkedIn or resumes.'
    },
    {
      q: 'How does the UPI QR payment and event registration work?',
      a: 'Simply click Register on any event, fill in your details, scan the event UPI QR code to complete the transfer, and upload your screenshot. We verify your receipt and confirm your seat through WhatsApp and Email.'
    }
  ];

  const handleQuickRegister = (evt: any) => {
    setSelectedRegEvent(evt);
  };

  const handleQuickEnroll = (crs: any) => {
    if (!currentUser) {
      onNavigate('login');
      return;
    }
    setSelectedItem({ name: crs.title, price: crs.price, type: 'course', id: crs.id });
    setPaymentModalOpen(true);
  };

  const handlePaymentSuccess = (method: string, finalAmount: number) => {
    if (!selectedItem || !currentUser) return;

    if (selectedItem.type === 'event') {
      const currentRegs = db.getRegistrations();
      db.saveRegistrations([{
        id: `reg_${Date.now()}`,
        userId: currentUser.id,
        eventId: selectedItem.id,
        paymentStatus: 'completed',
        paymentId: `pay_${Date.now()}`,
        registeredAt: new Date().toISOString()
      }, ...currentRegs]);
    } else {
      const currentEnrolls = db.getEnrollments();
      db.saveEnrollments([{
        id: `enr_${Date.now()}`,
        userId: currentUser.id,
        courseId: selectedItem.id,
        progress: 0,
        completedLessons: [],
        certificateStatus: 'not_earned',
        enrolledAt: new Date().toISOString()
      }, ...currentEnrolls]);
    }

    const currentPayments = db.getPayments();
    db.savePayments([{
      id: `pay_${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      amount: finalAmount,
      paymentMethod: method,
      status: 'success',
      date: new Date().toISOString(),
      itemType: selectedItem.type,
      itemId: selectedItem.id,
      itemName: selectedItem.name
    }, ...currentPayments]);

    onNavigate('client');
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 selection:bg-blue-600 selection:text-white overflow-hidden">
      
      {/* Glow Orbs / Ambient Lighting (Linear / Stripe style) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-tr from-blue-600/20 via-indigo-600/20 to-purple-600/10 blur-[130px] rounded-full pointer-events-none"></div>
      <div className="absolute top-96 right-0 w-[400px] h-[400px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none"></div>

      {/* 1. HERO SECTION */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          
          {/* Badge Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 px-4 py-1.5 text-xs font-bold text-indigo-300 backdrop-blur-md shadow-inner shadow-indigo-500/10 animate-fade-in">
            <Sparkles className="h-3.5 w-3.5 text-blue-400" />
            <span>India's Leading Non-Technical EdTech Startup</span>
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400"></span>
            <span className="text-white font-medium">Batch 2026 Open</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.1]">
            Learn Beyond the <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-500">
              Classroom.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            The career accelerator equipping ambitious college students and graduates with elite non-technical superpowers: high-stakes negotiation, executive storytelling, emotional intelligence, and interview-winning presence.
          </p>

          {/* CTA Group */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={() => onNavigate(currentUser ? 'client' : 'register')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 px-7 py-3.5 text-xs sm:text-sm font-extrabold text-white shadow-xl shadow-indigo-500/30 transition-all hover:scale-102 cursor-pointer"
            >
              <span>Join Community</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => onNavigate('events')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 hover:bg-white/10 px-7 py-3.5 text-xs sm:text-sm font-bold text-slate-200 backdrop-blur-md transition cursor-pointer"
            >
              <Calendar className="h-4 w-4 text-blue-400" />
              <span>Explore Events & Cohorts</span>
            </button>
          </div>

          {/* Social Proof Tags */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-green-400" /> 25,000+ Students Upskilled
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-blue-400" /> 45+ College Chapters
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-purple-400" /> 94% Placement Conversion
            </span>
          </div>

        </div>

        {/* Hero Interactive Mockup / Floating Card */}
        <div className="mt-14 relative max-w-5xl mx-auto rounded-3xl border border-white/15 bg-gradient-to-b from-slate-900/80 to-slate-950/90 p-4 sm:p-6 backdrop-blur-2xl shadow-2xl shadow-indigo-500/10">
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-500/80"></span>
              <span className="h-3 w-3 rounded-full bg-yellow-500/80"></span>
              <span className="h-3 w-3 rounded-full bg-green-500/80"></span>
              <span className="ml-3 text-[11px] font-mono text-slate-500">communityva.platform/accelerator-v2</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-green-500/10 border border-green-500/20 px-2 py-0.5 text-[10px] font-bold text-green-400 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-ping"></span>
                Active Workshop Live
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">Career Impact</span>
              <h4 className="font-extrabold text-sm text-white">ATS Resume & STAR Prep</h4>
              <p className="text-xs text-slate-400">Transform passive college projects into quantifiable business accomplishments recruiters hunt for.</p>
              <div className="pt-2 text-xs font-bold text-green-400 flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5" /> +3.2x Interview Callbacks
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">Real Compensation</span>
              <h4 className="font-extrabold text-sm text-white">First Salary Counter-Offer</h4>
              <p className="text-xs text-slate-400">Exact psychological negotiation scripts proven to yield ₹1.5L to ₹3L higher compensation packages.</p>
              <div className="pt-2 text-xs font-bold text-purple-300 flex items-center gap-1">
                <Award className="h-3.5 w-3.5" /> ₹2,40,000 Avg. Upside
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Campus Growth</span>
              <h4 className="font-extrabold text-sm text-white">Campus Ambassador Program</h4>
              <p className="text-xs text-slate-400">Lead soft-skill clubs in your university, earn official LORs, network with corporate CXOs, and earn stipends.</p>
              <div className="pt-2 text-xs font-bold text-emerald-400 flex items-center gap-1">
                <Gift className="h-3.5 w-3.5" /> ₹500 Payout / Peer Enrolled
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. COLLEGE PARTNERS TICKER / MARQUEE */}
      <section className="py-10 border-y border-white/10 bg-slate-950/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400 block mb-6">
            Trusted by Leaders, TPOs & Students Across 45+ Premier Indian Campuses
          </span>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 opacity-85">
            {partners.map(p => (
              <div key={p.id} className="flex items-center gap-2 group cursor-pointer" onClick={() => onNavigate('for-colleges')}>
                <span className="text-xl">{p.logo}</span>
                <span className="text-xs sm:text-sm font-extrabold text-slate-300 group-hover:text-white transition">
                  {p.shortName}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. ANIMATED METRICS / GROWTH SECTION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl text-center space-y-1">
            <span className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">25,000+</span>
            <h4 className="text-sm font-bold text-white mt-1">Students Certified</h4>
            <p className="text-xs text-slate-400">Graduates equipped with high-impact soft skills</p>
          </div>
          <div className="p-6 rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl text-center space-y-1">
            <span className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">120+</span>
            <h4 className="text-sm font-bold text-white mt-1">Live Masterclasses</h4>
            <p className="text-xs text-slate-400">Hands-on workshops hosted by corporate executives</p>
          </div>
          <div className="p-6 rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl text-center space-y-1">
            <span className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">45+</span>
            <h4 className="text-sm font-bold text-white mt-1">College Chapters</h4>
            <p className="text-xs text-slate-400">Active campus student networks nationwide</p>
          </div>
          <div className="p-6 rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl text-center space-y-1">
            <span className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">94%</span>
            <h4 className="text-sm font-bold text-white mt-1">Placement Boost</h4>
            <p className="text-xs text-slate-400">Higher confidence during high-stakes panel rounds</p>
          </div>
        </div>
      </section>

      {/* 4. FEATURED EVENTS SECTION */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-blue-400 block mb-1">Live Learning</span>
            <h2 className="text-2xl sm:text-4xl font-black text-white">Upcoming Live Cohorts & Masterclasses</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">Direct interactive sessions with real-time feedback from top mentors.</p>
          </div>
          <button
            onClick={() => onNavigate('events')}
            className="flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 transition cursor-pointer"
          >
            <span>View All Events</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {events.map(evt => {
            const seatsPercent = Math.round(((evt.seatsTotal - evt.seatsAvailable) / evt.seatsTotal) * 100);
            return (
              <div 
                key={evt.id}
                className="group flex flex-col justify-between h-full rounded-3xl border border-white/10 bg-slate-900/60 hover:bg-slate-900/90 backdrop-blur-xl p-5 transition-all duration-300 hover:border-blue-500/40 hover:-translate-y-1 shadow-xl"
              >
                <div className="relative h-44 w-full overflow-hidden rounded-2xl bg-slate-800 shrink-0">
                  <img src={evt.banner} alt={evt.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80"></div>
                  <span className="absolute top-3 left-3 rounded-lg bg-blue-600 px-2.5 py-1 text-[10px] font-extrabold uppercase text-white shadow">
                    {evt.category}
                  </span>
                  <div className="absolute bottom-3 left-3 right-3 flex justify-between text-[11px] font-semibold text-slate-200">
                    <span className="bg-black/60 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Clock className="h-3 w-3 text-blue-400" /> {evt.time}
                    </span>
                    <span className="bg-black/60 px-2 py-0.5 rounded-md font-bold text-white">
                      {evt.fees === 0 ? 'Free' : `₹${evt.fees}`}
                    </span>
                  </div>
                </div>

                <div className="flex-1 flex flex-col pt-4">
                  <span className="text-[11px] font-semibold text-blue-400">{evt.date}</span>
                  <h3 className="font-extrabold text-base text-white mt-1 group-hover:text-blue-400 transition leading-snug line-clamp-2 min-h-[2.75rem]">
                    {evt.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed min-h-[2.5rem]">
                    {evt.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-white/10 text-xs text-slate-400 space-y-2">
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{evt.venue}</span>
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                        <span>{evt.seatsAvailable} seats available</span>
                        <span className="font-bold text-white">{seatsPercent}% booked</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500" style={{ width: `${seatsPercent}%` }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto pt-4">
                    <button
                      onClick={() => handleQuickRegister(evt)}
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-500/20 transition cursor-pointer"
                    >
                      <span>{evt.fees === 0 ? 'Register Free' : 'Secure Pass (₹' + evt.fees + ')'}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. POPULAR COURSES SECTION */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-purple-400 block mb-1">Self-Paced Learning</span>
            <h2 className="text-2xl sm:text-4xl font-black text-white">Most Enrolled Non-Technical Curricula</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">High-yield frameworks with downloadable PDF guides and verifiable certifications.</p>
          </div>
          <button
            onClick={() => onNavigate('courses')}
            className="flex items-center gap-1.5 text-xs font-bold text-purple-400 hover:text-purple-300 transition cursor-pointer"
          >
            <span>View All Courses</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {courses.map(crs => (
            <div 
              key={crs.id}
              className="group flex flex-col justify-between h-full rounded-3xl border border-white/10 bg-slate-900/60 hover:bg-slate-900/90 backdrop-blur-xl p-5 transition-all duration-300 hover:border-purple-500/40 hover:-translate-y-1 shadow-xl"
            >
              <div className="relative h-44 w-full overflow-hidden rounded-2xl bg-slate-800 shrink-0">
                <img src={crs.thumbnail} alt={crs.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80"></div>
                <span className="absolute top-3 left-3 rounded-lg bg-purple-600 px-2.5 py-1 text-[10px] font-extrabold uppercase text-white shadow">
                  {crs.category}
                </span>
                <div className="absolute bottom-3 left-3 right-3 flex justify-between text-[11px] font-semibold text-slate-200">
                  <span className="bg-black/60 px-2 py-0.5 rounded-md flex items-center gap-1 text-amber-400">
                    <Star className="h-3 w-3 fill-current" /> {crs.rating} ({crs.reviewsCount})
                  </span>
                  <span className="bg-black/60 px-2 py-0.5 rounded-md font-bold text-white">
                    ₹{crs.price}
                  </span>
                </div>
              </div>

              <div className="flex-1 flex flex-col pt-4">
                <span className="text-[11px] font-semibold text-purple-400">{crs.instructor}</span>
                <h3 className="font-extrabold text-base text-white mt-1 group-hover:text-purple-400 transition leading-snug line-clamp-2 min-h-[2.75rem]">
                  {crs.title}
                </h3>
                <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed min-h-[2.5rem]">
                  {crs.description}
                </p>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <PlayCircle className="h-3.5 w-3.5 text-purple-400" /> {crs.videos.length} Modules
                  </span>
                  <span className="flex items-center gap-1">
                    <Award className="h-3.5 w-3.5 text-amber-400" /> Certificate
                  </span>
                </div>

                <div className="mt-auto pt-4">
                  <button
                    onClick={() => handleQuickEnroll(crs)}
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 py-2.5 text-xs font-bold text-white shadow-md shadow-purple-500/20 transition cursor-pointer"
                  >
                    <span>Enroll for ₹{crs.price}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. CAMPUS AMBASSADOR & REFERRAL HUB */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-tr from-slate-900 via-indigo-950/30 to-purple-950/40 p-8 sm:p-12 backdrop-blur-2xl shadow-2xl">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="space-y-4 max-w-xl text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-bold text-indigo-300">
                <Gift className="h-3.5 w-3.5 text-indigo-400" />
                <span>Earn While You Learn</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
                Become a Campus Ambassador & Earn ₹500 Per Referral
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Lead non-technical upskilling chapters inside your college. Share your unique student link, earn cash stipends credited straight to UPI, unlock Letter of Recommendation from our founders, and network with hiring partners.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-left">
                  <span className="text-xs font-black text-indigo-400 block">₹500 / Student</span>
                  <span className="text-[11px] text-slate-400">Direct UPI Referral Payout</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-left">
                  <span className="text-xs font-black text-purple-400 block">Official LOR</span>
                  <span className="text-[11px] text-slate-400">Signed by Startup Leadership</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-left">
                  <span className="text-xs font-black text-blue-400 block">VIP Access</span>
                  <span className="text-[11px] text-slate-400">Free passes to all cohorts</span>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => onNavigate('community')}
                  className="rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 px-6 py-3 text-xs font-extrabold text-white shadow-lg shadow-indigo-500/25 transition cursor-pointer"
                >
                  Join Ambassador Program
                </button>
                <button
                  onClick={() => onNavigate(currentUser ? 'client' : 'login')}
                  className="rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-6 py-3 text-xs font-bold text-slate-300 transition cursor-pointer"
                >
                  Track My Referral Earnings
                </button>
              </div>
            </div>

            {/* Visual Ambassador Badge Card */}
            <div className="w-full lg:w-80 p-6 rounded-2xl border border-white/15 bg-slate-900/80 backdrop-blur-xl shadow-xl text-center space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px] font-bold">
                <Users className="h-3 w-3" /> 450+ Active Ambassadors
              </div>
              <div className="flex justify-center -space-x-2 overflow-hidden py-1">
                <img className="inline-block h-10 w-10 rounded-full ring-2 ring-indigo-500 object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120" alt="Ambassador" />
                <img className="inline-block h-10 w-10 rounded-full ring-2 ring-purple-500 object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120" alt="Ambassador" />
                <img className="inline-block h-10 w-10 rounded-full ring-2 ring-blue-500 object-cover" src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=120" alt="Ambassador" />
                <img className="inline-block h-10 w-10 rounded-full ring-2 ring-pink-500 object-cover" src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120" alt="Ambassador" />
              </div>
              <div className="border-t border-white/10 pt-3 text-xs text-slate-300">
                <div className="flex justify-between font-bold text-white mb-1">
                  <span>Average Monthly Payout</span>
                  <span className="text-green-400 font-extrabold">₹8,500</span>
                </div>
                <p className="text-[11px] text-slate-400">Top student ambassadors earn up to ₹25,000/month promoting career cohorts.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. COMPARISON: WHY GRADES AREN'T ENOUGH */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="p-8 sm:p-12 rounded-3xl border border-white/15 bg-gradient-to-r from-blue-950/30 via-slate-900/60 to-purple-950/30 backdrop-blur-2xl shadow-2xl">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-400 block mb-2">The Unspoken Reality</span>
            <h2 className="text-2xl sm:text-4xl font-black text-white">Why Pure Academic Grades Aren’t Enough</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Compare how the traditional path stacks against the COMMUNITY.VA competitive edge.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl border border-red-500/20 bg-red-950/10 space-y-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-red-400">Traditional College Path</span>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">✕</span>
                  <span>Memorizes formulas without knowing how to articulate complex trade-offs to business leaders</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">✕</span>
                  <span>Submits generic 2-page academic resumes rejected by modern corporate ATS filters</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">✕</span>
                  <span>Accepts the first salary offer out of fear of seeming ungrateful or aggressive</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">✕</span>
                  <span>Freezes during high-pressure behavioral panel questions (STAR method deficits)</span>
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl border border-green-500/30 bg-green-950/10 space-y-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-green-400">The COMMUNITY.VA Advantage</span>
              <ul className="space-y-2.5 text-xs text-slate-200">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 font-bold">✓</span>
                  <span>Masters executive storytelling and presents projects with quantifiable business value</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 font-bold">✓</span>
                  <span>Builds high-converting 1-page ATS resumes benchmarked with corporate recruiters</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 font-bold">✓</span>
                  <span>Negotiates starting compensation with professional scripts (+₹2.4 LPA average increase)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 font-bold">✓</span>
                  <span>Radiates stage confidence, active listening, and calm executive presence</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 8. STUDENT SUCCESS TESTIMONIALS */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-extrabold uppercase tracking-widest text-blue-400 block mb-1">Student Outcomes</span>
          <h2 className="text-2xl sm:text-4xl font-black text-white">Hear from Placed Graduates</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Real stories from college students who landed dream roles at top tech and consulting firms.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map(tst => (
            <div key={tst.id} className="p-6 rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(tst.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed italic">
                  "{tst.quote}"
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center gap-3">
                <img src={tst.avatar} alt={tst.name} className="h-11 w-11 rounded-full object-cover border-2 border-indigo-500" />
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-white">{tst.name}</h4>
                  <span className="text-[11px] text-indigo-400 font-semibold block">{tst.rolePlaced} at {tst.company}</span>
                  <span className="text-[10px] text-slate-500">{tst.college}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 9. COMMUNITY HIGHLIGHTS & WEEKLY CHALLENGES PREVIEW */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="p-8 sm:p-12 rounded-3xl border border-purple-500/20 bg-gradient-to-b from-purple-950/30 via-slate-900/60 to-slate-900/90 backdrop-blur-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-bold text-purple-300">
                <Trophy className="h-3.5 w-3.5 text-amber-400" />
                <span>Weekly Soft-Skills Arena</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                Compete in the 60-Second Elevator Pitch Challenge
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Submit short video pitches, get peer reviews, climb the all-India student leaderboard, and win direct mentorship sessions with Fortune 500 executives.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => onNavigate('community')}
                  className="rounded-xl bg-purple-600 hover:bg-purple-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-500/25 transition cursor-pointer"
                >
                  Enter Weekly Challenge
                </button>
                <button
                  onClick={() => onNavigate('community')}
                  className="rounded-xl border border-white/10 hover:bg-white/5 px-5 py-2.5 text-xs font-bold text-slate-300 transition cursor-pointer"
                >
                  View Campus Leaderboard
                </button>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md w-full md:w-80 text-center space-y-3">
              <span className="text-[10px] font-extrabold uppercase text-amber-400 tracking-wider block">Leader of the Week</span>
              <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150" alt="Rohan" className="h-16 w-16 rounded-full mx-auto object-cover border-2 border-amber-400 shadow-md" />
              <div>
                <h4 className="font-bold text-sm text-white">Rohan Deshmukh</h4>
                <span className="text-xs text-indigo-300">IIT Bombay • 4,850 Points</span>
              </div>
              <span className="text-[11px] text-slate-400 block">Unlocked Diamond Ambassador Status</span>
            </div>
          </div>
        </div>
      </section>

      {/* 10. FAQ ACCORDION SECTION */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-extrabold uppercase tracking-widest text-blue-400 block mb-1">Got Questions?</span>
          <h2 className="text-2xl sm:text-4xl font-black text-white">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div key={idx} className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl overflow-hidden transition">
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left text-xs sm:text-sm font-bold text-white hover:text-blue-400 transition cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-400' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-white/5 animate-fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 11. FINAL BOTTOM HIGH-CONVERSION CTA BANNER */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="p-8 sm:p-14 rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-blue-950/60 via-indigo-950/60 to-purple-950/60 backdrop-blur-2xl text-center space-y-6 shadow-2xl shadow-indigo-500/10">
          <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight">
            Ready to Accelerate Your Career Trajectory?
          </h2>
          <p className="text-xs sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Join 25,000+ ambitious college students and graduates. Master high-stakes communication, negotiate your worth, and graduate with unshakeable workplace confidence.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onNavigate(currentUser ? 'client' : 'register')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 px-8 py-3.5 text-xs sm:text-sm font-extrabold text-white shadow-xl shadow-indigo-500/30 transition hover:scale-102 cursor-pointer"
            >
              <span>Get Started Now</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => onNavigate('for-colleges')}
              className="w-full sm:w-auto rounded-2xl border border-white/15 bg-white/5 hover:bg-white/10 px-8 py-3.5 text-xs sm:text-sm font-bold text-slate-200 transition cursor-pointer"
            >
              Partner as a College
            </button>
          </div>
        </div>
      </section>

      {/* Full-screen Dynamic Event Registration */}
      {selectedRegEvent && (
        <EventRegistrationModal
          isOpen={!!selectedRegEvent}
          event={selectedRegEvent}
          onClose={() => setSelectedRegEvent(null)}
          onSuccess={() => {
            setSelectedRegEvent(null);
            window.dispatchEvent(new Event('db-update'));
          }}
        />
      )}

      {/* Payment Modal (Courses) */}
      {selectedItem && (
        <PaymentModal
          isOpen={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          onSuccess={handlePaymentSuccess}
          amount={selectedItem.price}
          itemName={selectedItem.name}
          itemType={selectedItem.type}
        />
      )}

    </div>
  );
}
