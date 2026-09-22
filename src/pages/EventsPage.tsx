import { useState } from 'react';
import { 
  Calendar, MapPin, Search, Clock, CheckCircle, Ticket, Plus, Trash2, X
} from 'lucide-react';
import { db, type Event } from '../data/mockDatabase';
import { api } from '../data/api';
import EventRegistrationModal from '../components/EventRegistrationModal';
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

  // Dynamic Event Registration Modal State
  const [dynamicRegModalOpen, setDynamicRegModalOpen] = useState(false);
  const [selectedRegEvent, setSelectedRegEvent] = useState<Event | null>(null);
  const [ticketDownloaded, setTicketDownloaded] = useState<string | null>(null);

  // Admin Event Management States
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    time: '18:00 - 20:00',
    venue: 'Zoom Online Meeting',
    fees: 0,
    seatsTotal: 50,
    category: 'Career Prep',
    banner: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800'
  });
  const [adminToast, setAdminToast] = useState('');

  const handleAdminDeleteEvent = async (eventId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to remove the event: "${title}"?`)) return;
    try {
      await api.events.delete(eventId);
      const updated = events.filter(e => e.id !== eventId);
      setEvents(updated);
      db.saveEvents(updated);
      window.dispatchEvent(new Event('db-update'));
      setAdminToast(`Workshop "${title}" removed successfully.`);
      setTimeout(() => setAdminToast(''), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to delete event');
    }
  };

  const handleAdminAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const added = await api.events.add({
        title: newEvent.title,
        description: newEvent.description,
        date: newEvent.date,
        time: newEvent.time,
        venue: newEvent.venue,
        fees: Number(newEvent.fees),
        seatsTotal: Number(newEvent.seatsTotal),
        category: newEvent.category,
        banner: newEvent.banner
      });
      const updated = [added, ...events];
      setEvents(updated);
      db.saveEvents(updated);
      window.dispatchEvent(new Event('db-update'));
      setShowAddModal(false);
      setNewEvent({
        title: '',
        description: '',
        date: '',
        time: '18:00 - 20:00',
        venue: 'Zoom Online Meeting',
        fees: 0,
        seatsTotal: 50,
        category: 'Career Prep',
        banner: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800'
      });
      setAdminToast(`New event "${added.title}" published successfully!`);
      setTimeout(() => setAdminToast(''), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to add event');
    }
  };

  const categories = ['All', 'Career Prep', 'Public Speaking', 'Networking', 'Leadership'];

  const filteredEvents = events.filter(evt => {
    const matchesCat = selectedCategory === 'All' || evt.category === selectedCategory;
    const matchesSearch = evt.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          evt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          evt.venue.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleRegisterClick = (evt: Event) => {
    setSelectedRegEvent(evt);
    setDynamicRegModalOpen(true);
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

        {/* Admin Event Management Toolbar */}
        {currentUser?.role === 'admin' && (
          <div className="mb-8 p-5 rounded-2xl bg-gradient-to-r from-indigo-950/80 via-slate-900/90 to-purple-950/80 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
                <Plus className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white flex items-center gap-2">
                  <span>👑 Admin Controls Active</span>
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-md uppercase tracking-wider font-bold">Manage Live Events</span>
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  You can publish new workshops or delete existing events directly from this page or your Admin Dashboard.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setShowAddModal(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Add New Event</span>
              </button>
            </div>
          </div>
        )}

        {adminToast && (
          <div className="mb-6 p-4 rounded-xl bg-slate-900/90 border border-white/20 text-white text-xs flex items-center gap-2 animate-fade-in shadow-xl">
            <CheckCircle className="h-4 w-4 text-green-400 shrink-0" />
            <span>{adminToast}</span>
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
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-blue-400" />
                      <span>{evt.date} • {evt.time}</span>
                    </div>
                  </div>
                </div>

                {/* Event Content Body */}
                <div className="flex flex-col flex-1 justify-between pt-4">
                  <div>
                    <h3 className="text-base font-black text-white group-hover:text-blue-400 transition-colors line-clamp-2 min-h-[2.75rem]">
                      {evt.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                      {evt.description}
                    </p>

                    {/* Venue & Price */}
                    <div className="mt-4 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-slate-400 max-w-[65%] truncate">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-indigo-400" />
                        <span className="truncate">{evt.venue}</span>
                      </div>
                      <div className="font-extrabold text-sm text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                        {evt.fees === 0 && (!evt.feesTier || evt.feesTier.regular === 0) 
                          ? 'FREE' 
                          : evt.feesTier && evt.feesTier.earlyBird !== undefined && evt.feesTier.earlyBird > 0
                            ? `From ₹${evt.feesTier.earlyBird}` 
                            : `₹${evt.fees}`}
                      </div>
                    </div>

                    {evt.deadline && (
                      <div className="mt-2 text-[10px] text-amber-400 flex items-center gap-1 font-medium">
                        <Clock className="h-3 w-3" />
                        <span>Deadline: {evt.deadline}</span>
                      </div>
                    )}

                    {/* Registration Progress */}
                    <div className="mt-3">
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
                  <div className="mt-auto pt-4 border-t border-white/10 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
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

                    {currentUser?.role === 'admin' && (
                      <button
                        onClick={() => handleAdminDeleteEvent(evt.id, evt.title)}
                        className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 hover:text-red-300 py-2 text-center text-xs font-bold transition cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Remove Event (Admin)</span>
                      </button>
                    )}
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

      {/* Dynamic Event Registration Modal */}
      {selectedRegEvent && (
        <EventRegistrationModal
          isOpen={dynamicRegModalOpen}
          onClose={() => setDynamicRegModalOpen(false)}
          onSuccess={() => {
            setEvents(db.getEvents());
            setTicketDownloaded(selectedRegEvent?.title || 'Workshop Pass');
            setAdminToast('Registration submitted successfully! Verification pending admin approval.');
            setTimeout(() => setAdminToast(''), 5000);
          }}
          event={selectedRegEvent}
        />
      )}

      {/* Admin Add New Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg rounded-2xl border border-indigo-500/30 bg-slate-900 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">
                  <Plus className="h-4 w-4" />
                </span>
                <h3 className="text-base font-black text-white">Create New Workshop Event</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAdminAddEvent} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Executive Presence & Non-Verbal Gravitas"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Describe the skills and learning objectives..."
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Time Range</label>
                  <input
                    type="text"
                    required
                    placeholder="18:00 - 20:00"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={newEvent.category}
                    onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-slate-800 p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Career Prep">Career Prep</option>
                    <option value="Public Speaking">Public Speaking</option>
                    <option value="Networking">Networking</option>
                    <option value="Leadership">Leadership</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Fees (₹)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newEvent.fees}
                    onChange={(e) => setNewEvent({ ...newEvent, fees: Number(e.target.value) })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Total Seats</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newEvent.seatsTotal}
                    onChange={(e) => setNewEvent({ ...newEvent, seatsTotal: Number(e.target.value) })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Venue / Online Link</label>
                <input
                  type="text"
                  required
                  placeholder="Zoom Online Meeting / Hyderabad Auditorium"
                  value={newEvent.venue}
                  onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Banner Image URL</label>
                <input
                  type="text"
                  value={newEvent.banner}
                  onChange={(e) => setNewEvent({ ...newEvent, banner: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 rounded-xl border border-white/10 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/5 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 transition cursor-pointer"
                >
                  Publish Workshop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
