import { useState } from 'react';
import { 
  Calendar, MapPin, Search, Clock, CheckCircle, Ticket
} from 'lucide-react';
import { db, type Event } from '../data/mockDatabase';
import PaymentModal from '../components/PaymentModal';
import type { NavPage } from '../components/Navbar';

interface EventsPageProps {
  onNavigate: (page: NavPage) => void;
  currentUser: any;
}

export default function EventsPage({ onNavigate, currentUser }: EventsPageProps) {
  const [events, setEvents] = useState<Event[]>(() => db.getEvents());
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Payment Modal State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentTarget, setPaymentTarget] = useState<Event | null>(null);
  const [ticketDownloaded, setTicketDownloaded] = useState<string | null>(null);

  const categories = ['All', 'Career Prep', 'Public Speaking', 'Networking', 'Leadership'];

  const filteredEvents = events.filter(evt => {
    const matchesCat = selectedCategory === 'All' || evt.category === selectedCategory;
    const matchesSearch = evt.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          evt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          evt.venue.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleRegisterClick = (evt: Event) => {
    if (!currentUser) {
      onNavigate('login');
      return;
    }
    setPaymentTarget(evt);
    setPaymentModalOpen(true);
  };

  const handlePaymentSuccess = (method: string, finalAmount: number) => {
    if (!paymentTarget || !currentUser) return;

    // Create registration in db
    const currentRegs = db.getRegistrations();
    const newReg = {
      id: `reg_${Date.now()}`,
      userId: currentUser.id,
      eventId: paymentTarget.id,
      paymentStatus: 'completed' as const,
      paymentId: `pay_${Date.now()}`,
      registeredAt: new Date().toISOString()
    };
    db.saveRegistrations([newReg, ...currentRegs]);

    // Create payment record
    const currentPayments = db.getPayments();
    const newPayment = {
      id: `pay_${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      amount: finalAmount,
      paymentMethod: method,
      status: 'success' as const,
      date: new Date().toISOString(),
      itemType: 'event' as const,
      itemId: paymentTarget.id,
      itemName: paymentTarget.title
    };
    db.savePayments([newPayment, ...currentPayments]);

    // Update seat count
    const updatedEvents = events.map(e => {
      if (e.id === paymentTarget.id && e.seatsAvailable > 0) {
        return { ...e, seatsAvailable: e.seatsAvailable - 1 };
      }
      return e;
    });
    setEvents(updatedEvents);
    db.saveEvents(updatedEvents);

    // Trigger downloaded ticket feedback
    setTicketDownloaded(paymentTarget.id);
    setTimeout(() => setTicketDownloaded(null), 6000);
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1 text-xs font-bold text-blue-400 mb-3">
            <Calendar className="h-3.5 w-3.5" />
            <span>Interactive Live Cohorts & Bootcamps</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Upcoming Masterclasses & Workshops
          </h1>
          <p className="text-sm sm:text-base text-slate-400 mt-3 leading-relaxed">
            Live, hands-on masterclasses designed with senior executives from McKinsey, Google, and Deloitte. Build real workplace communication, salary leverage, and executive presence.
          </p>
        </div>

        {/* Success Alert Banner if Ticket Generated */}
        {ticketDownloaded && (
          <div className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-green-950/80 to-emerald-900/60 border border-green-500/30 backdrop-blur-md flex items-center justify-between shadow-xl animate-fade-in">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-400 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-white">Seat Confirmed & QR Ticket Generated!</h4>
                <p className="text-xs text-green-200 mt-0.5">
                  Your event registration is complete. You can download and inspect your QR pass anytime inside your Student Dashboard.
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('client')}
              className="rounded-xl bg-green-500 hover:bg-green-400 text-slate-950 font-extrabold text-xs px-4 py-2 transition shrink-0 cursor-pointer"
            >
              View Ticket in Dashboard
            </button>
          </div>
        )}

        {/* Search and Category Filter Toolbar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 bg-slate-900/60 border border-white/10 p-3.5 rounded-2xl backdrop-blur-xl">
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedCategory === cat 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by topic or venue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map(evt => {
            const seatsPercent = Math.round(((evt.seatsTotal - evt.seatsAvailable) / evt.seatsTotal) * 100);
            return (
              <div 
                key={evt.id}
                className="group relative flex flex-col justify-between h-full rounded-2xl border border-white/10 bg-slate-900/60 hover:bg-slate-900/90 backdrop-blur-xl p-5 shadow-xl transition-all duration-300 hover:border-blue-500/40 hover:shadow-2xl hover:-translate-y-1"
              >
                {/* Banner Thumbnail */}
                <div className="relative h-44 w-full overflow-hidden rounded-xl bg-slate-800 shrink-0">
                  <img 
                    src={evt.banner} 
                    alt={evt.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80"></div>
                  <div className="absolute top-3 left-3">
                    <span className="rounded-lg bg-blue-600/90 backdrop-blur-md px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white shadow">
                      {evt.category}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-semibold text-slate-300">
                    <span className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md">
                      <Clock className="h-3 w-3 text-blue-400" />
                      {evt.time}
                    </span>
                    <span className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md text-white font-bold">
                      {evt.fees === 0 ? 'Free' : `₹${evt.fees}`}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col pt-4">
                  <span className="text-[11px] font-semibold text-blue-400">{evt.date}</span>
                  <h3 className="font-extrabold text-base text-white mt-1 group-hover:text-blue-400 transition leading-snug line-clamp-2 min-h-[2.75rem]">
                    {evt.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed line-clamp-2 min-h-[2.5rem]">
                    {evt.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-white/10 text-xs text-slate-400 space-y-2">
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{evt.venue}</span>
                    </div>

                    {/* Seat Progress Bar */}
                    <div>
                      <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                        <span>{evt.seatsAvailable} seats left</span>
                        <span className="font-bold text-white">{seatsPercent}% filled</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
                          style={{ width: `${seatsPercent}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-auto pt-4 border-t border-white/10 flex items-center gap-2">
                    <button
                      onClick={() => setSelectedEvent(evt)}
                      className="flex-1 rounded-xl border border-white/10 hover:bg-white/5 py-2.5 text-center text-xs font-bold text-slate-300 hover:text-white transition cursor-pointer"
                    >
                      View Agenda
                    </button>
                    <button
                      onClick={() => handleRegisterClick(evt)}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 py-2.5 text-center text-xs font-bold text-white shadow-md shadow-indigo-500/20 transition cursor-pointer"
                    >
                      <Ticket className="h-3.5 w-3.5" />
                      <span>{evt.fees === 0 ? 'Register Free' : 'Secure Pass'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-20 bg-slate-900/40 rounded-2xl border border-white/10">
            <Calendar className="h-12 w-12 text-slate-600 mx-auto mb-3" />
            <h3 className="font-bold text-white text-base">No events found matching your criteria</h3>
            <p className="text-xs text-slate-400 mt-1">Try resetting your search query or selecting "All Categories".</p>
            <button
              onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
              className="mt-4 px-4 py-2 rounded-xl bg-white/10 text-xs font-bold text-white hover:bg-white/15 transition cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}

      </div>

      {/* Event Details Agenda Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg rounded-2xl border border-white/15 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <span className="rounded-lg bg-blue-500/20 px-2.5 py-1 text-xs font-bold text-blue-400 uppercase">
                {selectedEvent.category}
              </span>
              <button
                onClick={() => setSelectedEvent(null)}
                className="rounded-lg p-1 text-slate-400 hover:text-white transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <h3 className="text-xl font-black text-white">{selectedEvent.title}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{selectedEvent.description}</p>

            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block font-bold">Schedule</span>
                <span className="font-semibold text-white">{selectedEvent.date} • {selectedEvent.time}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block font-bold">Pass Price</span>
                <span className="font-bold text-blue-400 text-sm">
                  {selectedEvent.fees === 0 ? 'Free Entry' : `₹${selectedEvent.fees}`}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-[10px] text-slate-400 uppercase block font-bold">Location / Platform</span>
                <span className="font-semibold text-white">{selectedEvent.venue}</span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-white block">What You Will Take Away:</span>
              <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-4">
                <li>Interactive case simulations with immediate mentor critique</li>
                <li>Downloadable cheat sheets, frameworks, and negotiation scripts</li>
                <li>Verifiable COMMUNITY.VA Certificate of Participation</li>
                <li>Entry to the exclusive Student Alumni Discord chapter</li>
              </ul>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                onClick={() => setSelectedEvent(null)}
                className="flex-1 rounded-xl border border-white/10 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/5 transition cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const target = selectedEvent;
                  setSelectedEvent(null);
                  handleRegisterClick(target);
                }}
                className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 transition cursor-pointer"
              >
                Proceed to Register
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Razorpay Simulated Payment Modal */}
      {paymentTarget && (
        <PaymentModal
          isOpen={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          onSuccess={handlePaymentSuccess}
          amount={paymentTarget.fees}
          itemName={paymentTarget.title}
          itemType="event"
        />
      )}

    </div>
  );
}
