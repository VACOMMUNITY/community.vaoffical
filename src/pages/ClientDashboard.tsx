import { useState } from 'react';
import { useDatabase } from '../hooks/useDatabase';
import { api } from '../data/api';
import PaymentModal from '../components/PaymentModal';
import ThemeToggle from '../components/ThemeToggle';
import { 
  LayoutDashboard, Calendar, BookOpen, MessageSquare, User as UserIcon, LogOut, Menu, X, 
  Search, CheckCircle, Play, Download, Award, Heart, Receipt, Sparkles, ArrowLeft, Star
} from 'lucide-react';

interface ClientDashboardProps {
  onLogout: () => void;
  onNavigate: (view: 'landing' | 'login' | 'register' | 'client' | 'admin') => void;
}

export default function ClientDashboard({ onLogout, onNavigate }: ClientDashboardProps) {
  const { currentUser, courses, events, enrollments, registrations, payments, forum } = useDatabase();
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'courses' | 'forum' | 'profile'>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Search & Filter states
  const [courseSearch, setCourseSearch] = useState('');
  const [courseCategory, setCourseCategory] = useState('All');
  const [eventCategory, setEventCategory] = useState('All');
  const [forumCategory, setForumCategory] = useState('All');
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  // Modal Payments State
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [payTarget, setPayTarget] = useState<{ amount: number; name: string; type: 'course' | 'event'; id: string } | null>(null);

  // Player view state
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
    bio: currentUser?.bio || '',
    photo: currentUser?.profilePhoto || '',
    newPassword: ''
  });
  const [newThread, setNewThread] = useState({ title: '', category: 'General Discussion', content: '' });
  const [replyContent, setReplyContent] = useState('');
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState('');

  if (!currentUser) return null;

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  // Calculate Profile Completion %
  const calculateProfileCompletion = () => {
    let completed = 25; // Registered is base 25%
    if (currentUser.name) completed += 25;
    if (currentUser.phone) completed += 25;
    if (currentUser.bio && currentUser.bio !== 'New COMMUNITY.VA member eager to learn soft skills.') completed += 25;
    return completed;
  };

  // --- Handlers ---
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.auth.updateProfile({
        name: profileForm.name,
        phone: profileForm.phone,
        bio: profileForm.bio,
        photo: profileForm.photo
      });
      showToast('Profile updated successfully!');
      window.dispatchEvent(new Event('profile-update'));
      window.dispatchEvent(new Event('db-update'));
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile.');
    }
  };

  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newThread.title || !newThread.content) return;
    try {
      await api.forum.createThread(newThread);
      setNewThread({ title: '', category: 'General Discussion', content: '' });
      showToast('Forum thread posted successfully!');
      window.dispatchEvent(new Event('db-update'));
    } catch (err: any) {
      showToast(err.message || 'Failed to post thread.');
    }
  };

  const handleAddReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent || !selectedThreadId) return;
    try {
      await api.forum.createReply(selectedThreadId, replyContent);
      setReplyContent('');
      showToast('Comment added!');
      window.dispatchEvent(new Event('db-update'));
    } catch (err: any) {
      showToast(err.message || 'Failed to add comment.');
    }
  };

  const handleLikeThread = async (threadId: string) => {
    try {
      await api.forum.toggleLike(threadId);
      window.dispatchEvent(new Event('db-update'));
    } catch (err: any) {
      showToast(err.message || 'Failed to toggle like.');
    }
  };

  // Wishlist toggle
  const handleToggleWishlist = async (courseId: string) => {
    try {
      await api.courses.toggleWishlist(courseId);
      const isWish = currentUser.wishlist?.includes(courseId);
      showToast(isWish ? 'Removed from wishlist' : 'Added to wishlist');
      window.dispatchEvent(new Event('profile-update'));
      window.dispatchEvent(new Event('db-update'));
    } catch (err: any) {
      showToast(err.message || 'Failed to update wishlist.');
    }
  };

  // Register Event checkout trigger
  const handleRegisterEventTrigger = (evt: any) => {
    if (evt.seatsAvailable <= 0) return;
    setPayTarget({ amount: evt.fees, name: evt.title, type: 'event', id: evt.id });
    setPayModalOpen(true);
  };

  // Purchase Course checkout trigger
  const handlePurchaseCourseTrigger = (crs: any) => {
    setPayTarget({ amount: crs.price, name: crs.title, type: 'course', id: crs.id });
    setPayModalOpen(true);
  };

  // Payment Success Callbacks
  const handlePaymentSuccess = async (method: string, amount: number) => {
    if (!payTarget) return;
    try {
      if (payTarget.type === 'event') {
        await api.events.register(payTarget.id, amount, method);
        showToast(`Successfully registered for: ${payTarget.name}! Download ticket below.`);
      } else {
        await api.courses.enroll(payTarget.id, amount, method);
        showToast(`Successfully enrolled in: ${payTarget.name}!`);
      }
      window.dispatchEvent(new Event('db-update'));
    } catch (err: any) {
      showToast(err.message || 'Payment failed.');
    } finally {
      setPayTarget(null);
    }
  };

  const handleCancelRegistration = async (regId: string, _eventId: string) => {
    if (!window.confirm('Are you sure you want to cancel your event registration?')) return;
    try {
      await api.events.cancelRegistration(regId);
      showToast('Registration cancelled. Refund initiated to source account.');
      window.dispatchEvent(new Event('db-update'));
    } catch (err: any) {
      showToast(err.message || 'Cancellation failed.');
    }
  };

  // Video progress check-offs
  const handleMarkVideoCompleted = async (courseId: string, videoId: string, enrollId: string) => {
    try {
      const updatedEnr = await api.courses.updateProgress(enrollId, videoId, courseId);
      
      const prevEnr = enrollments.find(e => e.id === enrollId);
      const wasCompleted = prevEnr?.completedLessons.includes(videoId);

      if (updatedEnr.progress === 100 && !wasCompleted) {
        import('canvas-confetti').then((confetti) => {
          confetti.default({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        }).catch(() => {});
        showToast('Congratulations! You completed the course and earned a certificate.');
      }
      
      window.dispatchEvent(new Event('db-update'));
    } catch (err: any) {
      showToast(err.message || 'Failed to update lesson progress.');
    }
  };

  // Certificate PDF/Image Exporter
  const handleExportCertificate = (certId: string, courseTitle: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw Certificate Border/Frame
    ctx.fillStyle = '#0f172a'; // dark backdrop
    ctx.fillRect(0, 0, 800, 600);

    // Inner Frame
    ctx.strokeStyle = '#2563eb'; // Blue border
    ctx.lineWidth = 15;
    ctx.strokeRect(30, 30, 740, 540);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(45, 45, 710, 510);

    // Decorative Stars / Seals
    ctx.fillStyle = '#3b82f6';
    ctx.font = '30px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText('🏆', 400, 110);

    // Certificate text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText('CERTIFICATE OF COMPLETION', 400, 180);

    ctx.fillStyle = '#9ca3af';
    ctx.font = 'italic 16px serif';
    ctx.fillText('This credential verifies that', 400, 240);

    ctx.fillStyle = '#a78bfa';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText(currentUser.name.toUpperCase(), 400, 290);

    ctx.fillStyle = '#9ca3af';
    ctx.font = '16px sans-serif';
    ctx.fillText('has successfully completed all lecture modules for the course', 400, 340);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(`"${courseTitle}"`, 400, 390);

    ctx.fillStyle = '#6b7280';
    ctx.font = '12px sans-serif';
    ctx.fillText('Issued by: COMMUNITY.VA Educational Board', 400, 440);

    ctx.fillStyle = '#a78bfa';
    ctx.font = 'bold 14px monospace';
    ctx.fillText(`VERIFIABLE ID: ${certId}`, 400, 490);

    // Generate Download Link
    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `Certificate_${courseTitle.replace(/\s+/g, '_')}.png`;
    link.href = image;
    link.click();
  };

  // Ticket Generator Image Export
  const handleExportTicket = (evt: any) => {
    const canvas = document.createElement('canvas');
    canvas.width = 500;
    canvas.height = 250;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Ticket Base
    ctx.fillStyle = '#000000'; // Black background
    ctx.fillRect(0, 0, 500, 250);

    // Border
    ctx.strokeStyle = '#ef4444'; // Red border
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, 480, 230);

    // Circle cutouts (Simulating physical ticket notch)
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.beginPath();
    ctx.arc(380, 0, 20, 0, Math.PI * 2);
    ctx.arc(380, 250, 20, 0, Math.PI * 2);
    ctx.fill();

    // Divider Line (dashed)
    ctx.strokeStyle = '#4338ca';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(380, 20);
    ctx.lineTo(380, 230);
    ctx.stroke();
    ctx.setLineDash([]); // reset

    // Content Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('COMMUNITY.VA', 30, 45);

    ctx.fillStyle = '#c4b5fd';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(evt.title.length > 25 ? evt.title.substring(0, 25) + '...' : evt.title, 30, 95);

    ctx.fillStyle = '#9ca3af';
    ctx.font = '12px sans-serif';
    ctx.fillText(`Date: ${evt.date}`, 30, 135);
    ctx.fillText(`Venue: ${evt.venue.substring(0, 35)}`, 30, 160);
    ctx.fillText(`Attendee: ${currentUser.name}`, 30, 185);

    // Ticket Stub info
    ctx.save();
    ctx.translate(450, 125);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#a78bfa';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('EVENT PASS', 0, 0);
    ctx.restore();

    // QR Code Simulation
    const qrImg = new Image();
    qrImg.crossOrigin = 'anonymous';
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=TKT-${evt.id}-${currentUser.id}`;
    qrImg.onload = () => {
      ctx.drawImage(qrImg, 280, 40, 80, 80);
      
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `Ticket_${evt.title.replace(/\s+/g, '_')}.png`;
      link.href = image;
      link.click();
    };
  };

  // Calculated Stats
  const activeEnrollments = enrollments.filter(e => e.userId === currentUser.id);
  const earnedCerts = activeEnrollments.filter(e => e.certificateStatus === 'earned');
  const userRegs = registrations.filter(r => r.userId === currentUser.id);
  const userPayments = payments.filter(p => p.userId === currentUser.id);

  // Filters logic
  const filteredCourses = courses.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(courseSearch.toLowerCase());
    const matchesCategory = courseCategory === 'All' || c.category === courseCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredEvents = events.filter(e => {
    return eventCategory === 'All' || e.category === eventCategory;
  });

  const filteredThreads = forum.filter(t => {
    return forumCategory === 'All' || t.category === forumCategory;
  });

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      
      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 border-r border-slate-200/50 dark:border-slate-850 bg-white dark:bg-slate-900 transition-transform duration-300 md:translate-x-0 ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('landing')}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-brand-600 to-red-500 text-white font-black text-sm">VA</div>
            <span className="font-extrabold text-slate-800 dark:text-white">COMMUNITY.VA</span>
          </div>
          <button className="md:hidden p-1 text-slate-500" onClick={() => setMobileMenuOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Mini Profile Card */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
          <div className="flex items-center gap-3">
            <img src={currentUser.profilePhoto} alt={currentUser.name} className="h-10 w-10 rounded-full object-cover ring-2 ring-brand-500/20" />
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold text-slate-800 dark:text-white truncate">{currentUser.name}</h4>
              <span className="inline-flex items-center gap-1 rounded bg-brand-100 dark:bg-brand-950/40 px-1.5 py-0.5 text-[9px] font-extrabold text-brand-700 dark:text-brand-400 capitalize">
                Student Account
              </span>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          <button
            onClick={() => { setActiveTab('overview'); setMobileMenuOpen(false); }}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition ${
              activeTab === 'overview' 
                ? 'bg-brand-50 dark:bg-brand-950/20 text-brand-600 dark:text-brand-400' 
                : 'text-slate-550 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <LayoutDashboard className="h-4.5 w-4.5" />
            Overview
          </button>
          <button
            onClick={() => { setActiveTab('events'); setMobileMenuOpen(false); }}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition ${
              activeTab === 'events' 
                ? 'bg-brand-50 dark:bg-brand-950/20 text-brand-600 dark:text-brand-400' 
                : 'text-slate-550 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <Calendar className="h-4.5 w-4.5" />
            Events & Seminars
          </button>
          <button
            onClick={() => { setActiveTab('courses'); setMobileMenuOpen(false); }}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition ${
              activeTab === 'courses' 
                ? 'bg-brand-50 dark:bg-brand-950/20 text-brand-600 dark:text-brand-400' 
                : 'text-slate-550 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <BookOpen className="h-4.5 w-4.5" />
            Courses Workspace
          </button>
          <button
            onClick={() => { setActiveTab('forum'); setMobileMenuOpen(false); }}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition ${
              activeTab === 'forum' 
                ? 'bg-brand-50 dark:bg-brand-950/20 text-brand-600 dark:text-brand-400' 
                : 'text-slate-550 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <MessageSquare className="h-4.5 w-4.5" />
            Discussion Space
          </button>
          <button
            onClick={() => { setActiveTab('profile'); setMobileMenuOpen(false); }}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition ${
              activeTab === 'profile' 
                ? 'bg-brand-50 dark:bg-brand-950/20 text-brand-600 dark:text-brand-400' 
                : 'text-slate-550 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <UserIcon className="h-4.5 w-4.5" />
            Account & Security
          </button>
        </nav>

        <div className="absolute bottom-4 left-0 w-full px-4">
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50/15 dark:hover:bg-red-950/10 transition"
          >
            <LogOut className="h-4.5 w-4.5" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        
        {/* Top Header bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200/50 dark:border-slate-850 bg-white/80 dark:bg-slate-950/80 backdrop-blur px-6">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-1.5 rounded-lg border dark:border-slate-800" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="h-5 w-5 text-slate-650" />
            </button>
            <h1 className="text-lg font-black text-slate-850 dark:text-white capitalize">{activeTab}</h1>
          </div>
          <div className="flex items-center gap-4">
            {currentUser.role === 'admin' && (
              <button 
                onClick={() => onNavigate('admin')}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-brand-600 text-white font-bold text-xs py-2 px-3 shadow transition hover:bg-brand-700"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Admin Dashboard
              </button>
            )}
            <ThemeToggle />
          </div>
        </header>

        {/* Dynamic Success Toast */}
        {successToast && (
          <div className="fixed top-20 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-850 px-4 py-3 text-xs text-white shadow-xl animate-fade-in-up">
            <CheckCircle className="h-4.5 w-4.5 text-green-400 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Scroll Container */}
        <main className="flex-1 p-6 overflow-y-auto">

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Welcome card */}
              <div className="rounded-3xl bg-gradient-to-tr from-brand-600 to-red-500 p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
                <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-white/10 blur-xl"></div>
                <h2 className="text-2xl sm:text-3xl font-extrabold">Welcome back, {currentUser.name}!</h2>
                <p className="mt-2 text-xs sm:text-sm text-brand-100 max-w-lg leading-relaxed">
                  Ready to develop your skills? You have completed {earnedCerts.length} of your {activeEnrollments.length} active courses. Look at your progress dials below.
                </p>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-slate-200/50 dark:border-slate-850 bg-white dark:bg-slate-900 p-5 shadow-sm">
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Courses In-Progress</span>
                  <p className="text-3xl font-black mt-2 text-slate-850 dark:text-white">{activeEnrollments.length}</p>
                </div>
                <div className="rounded-2xl border border-slate-200/50 dark:border-slate-850 bg-white dark:bg-slate-900 p-5 shadow-sm">
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Certificates Earned</span>
                  <p className="text-3xl font-black mt-2 text-brand-600 dark:text-brand-400">{earnedCerts.length}</p>
                </div>
                <div className="rounded-2xl border border-slate-200/50 dark:border-slate-850 bg-white dark:bg-slate-900 p-5 shadow-sm">
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Seminars Registered</span>
                  <p className="text-3xl font-black mt-2 text-red-500 dark:text-red-400">{userRegs.length}</p>
                </div>
                <div className="rounded-2xl border border-slate-200/50 dark:border-slate-850 bg-white dark:bg-slate-900 p-5 shadow-sm">
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Profile Status</span>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xl font-black text-slate-850 dark:text-white">{calculateProfileCompletion()}%</span>
                    <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-green-550 rounded-full" style={{ width: `${calculateProfileCompletion()}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sub-Layout: Enrolled Courses & Upcoming Events */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Course progress columns */}
                <div className="lg:col-span-2 rounded-2xl border border-slate-200/50 dark:border-slate-850 bg-white dark:bg-slate-900 p-6 shadow-sm">
                  <h3 className="font-extrabold text-slate-850 dark:text-white mb-4">Purchased Courses Progress</h3>
                  {activeEnrollments.length === 0 ? (
                    <div className="text-center py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                      <p className="text-sm text-slate-400 dark:text-slate-500">You haven't enrolled in any courses yet.</p>
                      <button 
                        onClick={() => setActiveTab('courses')}
                        className="mt-3 text-xs bg-brand-600 text-white font-bold py-1.5 px-3 rounded-lg hover:bg-brand-700 transition"
                      >
                        Explore Curriculum
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activeEnrollments.map((enr) => {
                        const crs = courses.find(c => c.id === enr.courseId);
                        if (!crs) return null;
                        return (
                          <div 
                            key={enr.id} 
                            onClick={() => { setSelectedCourse(crs); setActiveTab('courses'); }}
                            className="group p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950/40 cursor-pointer transition"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-bold text-sm text-slate-800 dark:text-white line-clamp-1 group-hover:text-brand-600 transition">{crs.title}</h4>
                              <span className="text-xs font-semibold text-slate-400">{enr.progress}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-brand-500" style={{ width: `${enr.progress}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Calendar widgets events */}
                <div className="rounded-2xl border border-slate-200/50 dark:border-slate-850 bg-white dark:bg-slate-900 p-6 shadow-sm">
                  <h3 className="font-extrabold text-slate-850 dark:text-white mb-4">Registered Seminars</h3>
                  {userRegs.length === 0 ? (
                    <div className="text-center py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                      <p className="text-sm text-slate-400 dark:text-slate-500">No upcoming events registered.</p>
                      <button 
                        onClick={() => setActiveTab('events')}
                        className="mt-3 text-xs bg-brand-600 text-white font-bold py-1.5 px-3 rounded-lg hover:bg-brand-700 transition"
                      >
                        Browse Calendar
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {userRegs.map((reg) => {
                        const evt = events.find(e => e.id === reg.eventId);
                        if (!evt) return null;
                        return (
                          <div key={reg.id} className="p-3 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/20">
                            <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40 px-2 py-0.5 rounded">{evt.category}</span>
                            <h4 className="font-bold text-xs text-slate-800 dark:text-white mt-1.5 line-clamp-1">{evt.title}</h4>
                            <p className="text-[10px] text-slate-400 mt-1">{evt.date} | {evt.time}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: EVENTS MODULE */}
          {activeTab === 'events' && (
            <div className="space-y-6">
              {/* Category selector */}
              <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                {['All', 'Career Prep', 'Networking', 'Public Speaking'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setEventCategory(cat)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition ${
                      eventCategory === cat 
                        ? 'bg-slate-800 border-slate-800 text-white dark:bg-slate-100 dark:border-slate-100 dark:text-slate-900' 
                        : 'border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Detail Overlay View if selected */}
              {selectedEvent ? (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm animate-fade-in-up">
                  <div className="h-64 overflow-hidden relative">
                    <img src={selectedEvent.banner} alt={selectedEvent.title} className="h-full w-full object-cover" />
                    <button 
                      onClick={() => setSelectedEvent(null)}
                      className="absolute top-4 left-4 p-2 rounded-xl bg-black/60 text-white hover:bg-black/80 transition"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="p-6">
                    <span className="text-xs font-bold uppercase text-brand-650 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40 px-2.5 py-1 rounded-full">{selectedEvent.category}</span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-850 dark:text-white mt-3">{selectedEvent.title}</h2>
                    <p className="text-xs text-slate-400 mt-1">{selectedEvent.date} | {selectedEvent.time}</p>
                    <p className="text-sm text-slate-550 dark:text-slate-355 mt-4 leading-relaxed">{selectedEvent.description}</p>

                    <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-4 text-center">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Price</span>
                        <span className="font-extrabold text-slate-850 dark:text-white">{selectedEvent.fees === 0 ? 'Free' : `$${selectedEvent.fees}`}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Venue</span>
                        <span className="font-extrabold text-slate-850 dark:text-white truncate max-w-full block">{selectedEvent.venue.split(',')[0]}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Seats Left</span>
                        <span className="font-extrabold text-slate-850 dark:text-white">{selectedEvent.seatsAvailable} / {selectedEvent.seatsTotal}</span>
                      </div>
                    </div>

                    <div className="mt-8 flex gap-3">
                      {registrations.some(r => r.eventId === selectedEvent.id && r.userId === currentUser.id) ? (
                        <>
                          <button
                            onClick={() => {
                              const r = registrations.find(r => r.eventId === selectedEvent.id && r.userId === currentUser.id);
                              if (r) handleCancelRegistration(r.id, selectedEvent.id);
                            }}
                            className="flex-1 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 py-3 text-center text-sm font-bold hover:bg-red-500/20 transition"
                          >
                            Cancel Seat
                          </button>
                          <button
                            onClick={() => handleExportTicket(selectedEvent)}
                            className="flex-1 rounded-xl bg-slate-800 hover:bg-slate-700 dark:bg-slate-850 py-3 text-center text-sm font-bold text-white transition flex items-center justify-center gap-1.5"
                          >
                            <Download className="h-4 w-4" />
                            Download Pass
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleRegisterEventTrigger(selectedEvent)}
                          disabled={selectedEvent.seatsAvailable <= 0}
                          className="flex-1 rounded-xl bg-brand-600 hover:bg-brand-700 py-3 text-center text-sm font-bold text-white transition disabled:bg-slate-300"
                        >
                          {selectedEvent.seatsAvailable <= 0 ? 'Fully Booked' : 'Reserve Spot'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* Grid view and tabs */
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {filteredEvents.map((evt) => {
                    const isRegistered = registrations.some(r => r.eventId === evt.id && r.userId === currentUser.id);
                    const matchedReg = registrations.find(r => r.eventId === evt.id && r.userId === currentUser.id);

                    return (
                      <div 
                        key={evt.id} 
                        className="flex flex-col border border-slate-200/50 dark:border-slate-850 bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition duration-200"
                      >
                        <div className="h-40 overflow-hidden cursor-pointer" onClick={() => setSelectedEvent(evt)}>
                          <img src={evt.banner} alt={evt.title} className="h-full w-full object-cover" />
                        </div>
                        <div className="flex flex-1 flex-col p-5">
                          <span className="self-start text-[9px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40 px-2 py-0.5 rounded mb-2">
                            {evt.category}
                          </span>
                          <h3 
                            onClick={() => setSelectedEvent(evt)}
                            className="font-bold text-sm text-slate-850 dark:text-white line-clamp-1 cursor-pointer hover:text-brand-600 transition"
                          >
                            {evt.title}
                          </h3>
                          <p className="text-[10px] text-slate-400 mt-1">{evt.date} | {evt.time}</p>
                          <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs font-semibold flex-1">
                            <span className="text-slate-400 dark:text-slate-500">{evt.seatsAvailable} seats left</span>
                            <span className="text-slate-800 dark:text-white font-bold">{evt.fees === 0 ? 'Free' : `$${evt.fees}`}</span>
                          </div>

                          <div className="mt-4 flex gap-2">
                            {isRegistered ? (
                              <>
                                <button
                                  onClick={() => handleExportTicket(evt)}
                                  className="flex-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-white py-1.5 text-center text-xs font-bold transition flex items-center justify-center gap-1"
                                >
                                  <Download className="h-3.5 w-3.5" />
                                  Ticket
                                </button>
                                <button
                                  onClick={() => matchedReg && handleCancelRegistration(matchedReg.id, evt.id)}
                                  className="rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 px-2 py-1.5 text-center text-xs font-bold transition"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleRegisterEventTrigger(evt)}
                                disabled={evt.seatsAvailable <= 0}
                                className="w-full rounded-lg bg-brand-600 hover:bg-brand-700 py-2 text-center text-xs font-bold text-white transition disabled:bg-slate-300"
                              >
                                {evt.seatsAvailable <= 0 ? 'Full' : 'Register'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: COURSES MODULE */}
          {activeTab === 'courses' && (
            <div className="space-y-6">
              
              {/* Explorer Search / Filters Bar (only when not inside player view) */}
              {!selectedCourse && (
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search courses..."
                      value={courseSearch}
                      onChange={(e) => setCourseSearch(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-900 py-1.5 pl-9 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                    />
                  </div>
                  <div className="flex gap-1.5 self-start sm:self-center overflow-x-auto w-full sm:w-auto">
                    {['All', 'Public Speaking', 'Career Prep', 'Leadership', 'Personal Development'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setCourseCategory(cat)}
                        className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border transition whitespace-nowrap ${
                          courseCategory === cat 
                            ? 'bg-slate-800 border-slate-800 text-white dark:bg-slate-100 dark:border-slate-100 dark:text-slate-900' 
                            : 'border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Course Detail / player Workspace */}
              {selectedCourse ? (
                (() => {
                  const enrollRecord = enrollments.find(e => e.courseId === selectedCourse.id && e.userId === currentUser.id);
                  const isEnrolled = !!enrollRecord;

                  return (
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 overflow-hidden shadow-sm animate-fade-in-up">
                      
                      {/* Back nav & Header */}
                      <div className="border-b border-slate-100 dark:border-slate-800/80 px-6 py-4 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/20">
                        <button 
                          onClick={() => { setSelectedCourse(null); setPlayingVideoId(null); }}
                          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          Back to Catalog
                        </button>
                        {isEnrolled && (
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Progress</span>
                            <div className="w-24 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-brand-500" style={{ width: `${enrollRecord.progress}%` }}></div>
                            </div>
                            <span className="text-xs font-bold text-slate-650 dark:text-slate-300">{enrollRecord.progress}%</span>
                          </div>
                        )}
                      </div>

                      {/* Content Columns: Player View vs Landing details */}
                      {isEnrolled ? (
                        <div className="grid grid-cols-1 lg:grid-cols-3">
                          {/* Left: Video Player */}
                          <div className="lg:col-span-2 p-6 border-r border-slate-100 dark:border-slate-800 space-y-4">
                            <div className="aspect-video rounded-xl bg-slate-950 overflow-hidden relative border border-slate-800 shadow-inner">
                              {/* Video element mock */}
                              <video
                                key={playingVideoId || selectedCourse.videos[0].id}
                                controls
                                className="w-full h-full object-contain"
                              >
                                <source src={selectedCourse.videos.find((v: any) => v.id === playingVideoId)?.videoUrl || selectedCourse.videos[0].videoUrl} type="video/mp4" />
                                Your browser does not support video playback.
                              </video>
                            </div>
                            <div>
                              <h3 className="font-extrabold text-slate-850 dark:text-white text-base">
                                {selectedCourse.videos.find((v: any) => v.id === playingVideoId)?.title || selectedCourse.videos[0].title}
                              </h3>
                              <p className="text-xs text-slate-400 mt-1">{selectedCourse.instructor} | Course Curriculum Module</p>
                            </div>

                            {/* Resources list */}
                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">Available Resources</h4>
                              <div className="flex flex-wrap gap-2">
                                {selectedCourse.resources.map((res: any, idx: number) => (
                                  <a
                                    key={idx}
                                    href="#"
                                    onClick={(e) => { e.preventDefault(); showToast(`Downloading: ${res.name}`); }}
                                    className="flex items-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 px-3 py-2 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-850 transition"
                                  >
                                    <Download className="h-4 w-4 text-brand-600" />
                                    <span>{res.name}</span>
                                    <span className="text-[9px] text-slate-400">({res.type})</span>
                                  </a>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Right: Chapter list & Complete switch */}
                          <div className="p-6 space-y-4 bg-slate-50/20 dark:bg-slate-950/10">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-bold text-sm text-slate-800 dark:text-white">Course Syllabus</h4>
                              {enrollRecord.certificateStatus === 'earned' && (
                                <button
                                  onClick={() => handleExportCertificate(enrollRecord.certificateId || 'CERT', selectedCourse.title)}
                                  className="flex items-center gap-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white py-1 px-2.5 text-[10px] font-bold shadow transition"
                                >
                                  <Award className="h-3.5 w-3.5" />
                                  Certificate
                                </button>
                              )}
                            </div>
                            <div className="space-y-2">
                              {selectedCourse.videos.map((vid: any) => {
                                const checked = enrollRecord.completedLessons.includes(vid.id);
                                return (
                                  <div 
                                    key={vid.id}
                                    className={`flex items-center justify-between p-3 rounded-xl border transition ${
                                      playingVideoId === vid.id 
                                        ? 'border-brand-500 bg-brand-50/10 dark:bg-brand-900/10' 
                                        : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950/20'
                                    }`}
                                  >
                                    <button 
                                      onClick={() => setPlayingVideoId(vid.id)}
                                      className="flex items-center gap-2 min-w-0 flex-1 text-left"
                                    >
                                      <Play className="h-3.5 w-3.5 text-brand-600 shrink-0" />
                                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{vid.title}</span>
                                    </button>
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={() => handleMarkVideoCompleted(selectedCourse.id, vid.id, enrollRecord.id)}
                                      className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointerml-2"
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Course Catalog Preview Page */
                        <div className="p-6">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="md:col-span-2 space-y-6">
                              <div>
                                <span className="text-xs font-bold uppercase text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40 px-2.5 py-1 rounded-full">{selectedCourse.category}</span>
                                <h2 className="text-2xl font-black text-slate-850 dark:text-white mt-3">{selectedCourse.title}</h2>
                                <p className="text-xs text-slate-400 mt-1">Led by: <span className="font-bold text-slate-650 dark:text-slate-350">{selectedCourse.instructor}</span></p>
                              </div>
                              <div>
                                <h3 className="font-bold text-slate-800 dark:text-white text-sm mb-2">Description</h3>
                                <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">{selectedCourse.description}</p>
                              </div>
                              <div>
                                <h3 className="font-bold text-slate-800 dark:text-white text-sm mb-2">Curriculum Preview ({selectedCourse.videos.length} Lectures)</h3>
                                <div className="space-y-2">
                                  {selectedCourse.videos.map((v: any, idx: number) => (
                                    <div key={v.id} className="flex items-center gap-3 p-3 border border-slate-100 dark:border-slate-800 rounded-xl">
                                      <span className="text-xs font-bold text-slate-400">{idx + 1}</span>
                                      <Play className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex-1 truncate">{v.title}</span>
                                      <span className="text-[10px] text-slate-400">{v.duration}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div className="rounded-2xl border border-slate-150 dark:border-slate-800 p-5 bg-slate-50/50 dark:bg-slate-950/20 text-center">
                                <span className="text-xs text-slate-450 uppercase block mb-1">Tuition Fee</span>
                                <span className="text-3xl font-black text-brand-600 dark:text-brand-400">${selectedCourse.price}</span>
                                <button
                                  onClick={() => handlePurchaseCourseTrigger(selectedCourse)}
                                  className="w-full mt-4 rounded-xl bg-brand-600 hover:bg-brand-700 py-3 text-center text-sm font-bold text-white shadow-md shadow-brand-500/10 transition"
                                >
                                  Buy Now Securely
                                </button>
                                <button
                                  onClick={() => handleToggleWishlist(selectedCourse.id)}
                                  className="w-full mt-2.5 rounded-xl border border-slate-200 dark:border-slate-800 py-2.5 text-center text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 transition flex items-center justify-center gap-1.5"
                                >
                                  <Heart className={`h-4 w-4 ${currentUser.wishlist?.includes(selectedCourse.id) ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
                                  {currentUser.wishlist?.includes(selectedCourse.id) ? 'Wishlisted' : 'Add to Wishlist'}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                    </div>
                  );
                })()
              ) : (
                /* Course Catalog Grid */
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {filteredCourses.map((crs) => {
                    const isEnrolled = enrollments.some(e => e.courseId === crs.id && e.userId === currentUser.id);
                    const matchedEnr = enrollments.find(e => e.courseId === crs.id && e.userId === currentUser.id);

                    return (
                      <div 
                        key={crs.id} 
                        className="flex flex-col border border-slate-200/50 dark:border-slate-850 bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition duration-200"
                      >
                        <div className="h-40 overflow-hidden cursor-pointer" onClick={() => setSelectedCourse(crs)}>
                          <img src={crs.thumbnail} alt={crs.title} className="h-full w-full object-cover" />
                        </div>
                        <div className="flex flex-1 flex-col p-5">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40 px-2 py-0.5 rounded">
                              {crs.category}
                            </span>
                            <div className="flex items-center gap-0.5 text-xs text-amber-500 font-bold">
                              <Star className="h-3.5 w-3.5 fill-current" />
                              {crs.rating}
                            </div>
                          </div>
                          <h3 
                            onClick={() => setSelectedCourse(crs)}
                            className="font-bold text-sm text-slate-850 dark:text-white line-clamp-1 cursor-pointer hover:text-brand-600 transition"
                          >
                            {crs.title}
                          </h3>
                          <p className="text-[10px] text-slate-400 mt-1">Instructor: {crs.instructor}</p>

                          <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs font-semibold flex-1">
                            {isEnrolled ? (
                              <div className="flex items-center gap-2 w-full">
                                <span className="text-[9px] text-slate-400">Progress: {matchedEnr?.progress}%</span>
                                <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                  <div className="h-full bg-brand-500" style={{ width: `${matchedEnr?.progress || 0}%` }}></div>
                                </div>
                              </div>
                            ) : (
                              <>
                                <span className="text-slate-400 dark:text-slate-500">{crs.videos.length} lectures</span>
                                <span className="text-brand-650 dark:text-brand-400 font-bold">${crs.price}</span>
                              </>
                            )}
                          </div>

                          <div className="mt-4 flex gap-2">
                            <button
                              onClick={() => setSelectedCourse(crs)}
                              className="flex-1 rounded-lg bg-brand-600 hover:bg-brand-700 py-2 text-center text-xs font-bold text-white transition"
                            >
                              {isEnrolled ? 'Open Course' : 'View Syllabus'}
                            </button>
                            <button
                              onClick={() => handleToggleWishlist(crs.id)}
                              className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-slate-500 transition hover:bg-slate-50 dark:hover:bg-slate-800"
                            >
                              <Heart className={`h-4 w-4 ${currentUser.wishlist?.includes(crs.id) ? 'fill-red-500 text-red-500' : ''}`} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: DISCUSSION FORUM */}
          {activeTab === 'forum' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Thread Lists */}
              <div className="lg:col-span-2 space-y-4">
                
                {/* Category filters */}
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {['All', 'General Discussion', 'Public Speaking', 'Resume Workshop', 'Leadership Prep'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setForumCategory(cat)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition whitespace-nowrap ${
                        forumCategory === cat 
                          ? 'bg-slate-800 border-slate-800 text-white dark:bg-slate-100 dark:border-slate-100 dark:text-slate-900' 
                          : 'border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-450 hover:bg-slate-100 dark:hover:bg-slate-900'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Selected Thread detail view */}
                {selectedThreadId ? (
                  (() => {
                    const th = forum.find(t => t.id === selectedThreadId);
                    if (!th) return null;
                    return (
                      <div className="rounded-2xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4 animate-fade-in-up">
                        <button 
                          onClick={() => setSelectedThreadId(null)}
                          className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-700 transition"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          Back to Threads
                        </button>

                        <div className="flex gap-3">
                          <img src={th.userAvatar} alt={th.userName} className="h-9 w-9 rounded-full object-cover" />
                          <div>
                            <h3 className="font-extrabold text-sm text-slate-850 dark:text-white leading-snug">{th.title}</h3>
                            <span className="text-[10px] text-slate-400 mt-1 block">Posted by {th.userName} | {new Date(th.date).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed border-b border-slate-100 dark:border-slate-800 pb-4">
                          {th.content}
                        </p>

                        {/* Reply list */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-extrabold text-slate-500">Comments ({th.replies.length})</h4>
                          {th.replies.map((rep) => (
                            <div key={rep.id} className="flex gap-3 p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl">
                              <img src={rep.userAvatar} alt={rep.userName} className="h-8 w-8 rounded-full object-cover" />
                              <div className="min-w-0 flex-1">
                                <div className="flex justify-between items-center">
                                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{rep.userName}</span>
                                  <span className="text-[9px] text-slate-400">{new Date(rep.date).toLocaleDateString()}</span>
                                </div>
                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{rep.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Comment input form */}
                        <form onSubmit={handleAddReply} className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                          <input
                            type="text"
                            required
                            placeholder="Add a comment..."
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            className="flex-1 rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                          />
                          <button
                            type="submit"
                            className="rounded-xl bg-brand-600 hover:bg-brand-700 text-white px-4 text-xs font-bold transition"
                          >
                            Comment
                          </button>
                        </form>
                      </div>
                    );
                  })()
                ) : (
                  /* Thread lists catalog */
                  <div className="space-y-3">
                    {filteredThreads.map((t) => (
                      <div 
                        key={t.id}
                        className="p-4 rounded-xl border border-slate-200/50 dark:border-slate-850 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition cursor-pointer"
                        onClick={() => setSelectedThreadId(t.id)}
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-[8px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 dark:bg-brand-950/40 px-2 py-0.5 rounded">
                            {t.category}
                          </span>
                          <span className="text-[9px] text-slate-400">{new Date(t.date).toLocaleDateString()}</span>
                        </div>
                        <h4 className="font-extrabold text-sm text-slate-850 dark:text-white mt-2 hover:text-brand-600 transition">{t.title}</h4>
                        <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">{t.content}</p>
                        
                        <div className="flex gap-4 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[10px] text-slate-450 font-bold">
                          <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleLikeThread(t.id); }}
                            className={`flex items-center gap-1 hover:text-brand-600 transition ${t.likes.includes(currentUser.id) ? 'text-brand-600' : ''}`}
                          >
                            <Heart className={`h-3.5 w-3.5 ${t.likes.includes(currentUser.id) ? 'fill-current text-brand-600' : ''}`} />
                            {t.likes.length} Likes
                          </button>
                          <span>💬 {t.replies.length} Comments</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Post Thread Form */}
              <div className="rounded-2xl border border-slate-200/50 dark:border-slate-850 bg-white dark:bg-slate-900 p-5 shadow-sm h-fit">
                <h3 className="font-extrabold text-slate-800 dark:text-white text-sm mb-4">Post a Question</h3>
                <form onSubmit={handleCreateThread} className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Thread Title</label>
                    <input
                      type="text"
                      required
                      placeholder="Ask the community..."
                      value={newThread.title}
                      onChange={(e) => setNewThread({ ...newThread, title: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-900 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Topic Category</label>
                    <select
                      value={newThread.category}
                      onChange={(e) => setNewThread({ ...newThread, category: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-900 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                    >
                      <option value="General Discussion">General Discussion</option>
                      <option value="Public Speaking">Public Speaking</option>
                      <option value="Resume Workshop">Resume Workshop</option>
                      <option value="Leadership Prep">Leadership Prep</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Body Text</label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Write details here..."
                      value={newThread.content}
                      onChange={(e) => setNewThread({ ...newThread, content: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-900 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-brand-600 hover:bg-brand-700 py-2.5 text-center text-xs font-bold text-white transition shadow"
                  >
                    Publish Post
                  </button>
                </form>
              </div>

            </div>
          )}

          {/* TAB 5: PROFILE & SECURITY */}
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Edit Details Forms */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Form fields */}
                <div className="rounded-2xl border border-slate-200/50 dark:border-slate-850 bg-white dark:bg-slate-900 p-6 shadow-sm">
                  <h3 className="font-extrabold text-slate-850 dark:text-white text-base mb-4">Edit Student Profile</h3>
                  <form onSubmit={handleProfileSave} className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4 items-center mb-2 bg-slate-50/50 dark:bg-slate-950/20 p-4 rounded-xl">
                      <img src={profileForm.photo} alt="Avatar Preview" className="h-16 w-16 rounded-full object-cover border" />
                      <div className="flex-1 space-y-1">
                        <label className="block text-xs font-bold text-slate-450 uppercase">Profile Photo URL</label>
                        <input
                          type="text"
                          value={profileForm.photo}
                          onChange={(e) => setProfileForm({ ...profileForm, photo: e.target.value })}
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Full Name</label>
                        <input
                          type="text"
                          required
                          value={profileForm.name}
                          onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Phone Number</label>
                        <input
                          type="text"
                          required
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Personal Bio</label>
                      <textarea
                        rows={3}
                        value={profileForm.bio}
                        onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                      />
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                      <h4 className="font-bold text-xs text-slate-800 dark:text-white mb-2">Change Password</h4>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">New Password</label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          value={profileForm.newPassword}
                          onChange={(e) => setProfileForm({ ...profileForm, newPassword: e.target.value })}
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="rounded-xl bg-brand-600 hover:bg-brand-700 px-4 py-2 text-xs font-bold text-white transition shadow"
                    >
                      Save Changes
                    </button>
                  </form>
                </div>

              </div>

              {/* Transactions & Billing lists */}
              <div className="space-y-6">
                
                {/* Billing ledger */}
                <div className="rounded-2xl border border-slate-200/50 dark:border-slate-850 bg-white dark:bg-slate-900 p-5 shadow-sm">
                  <div className="flex items-center gap-1.5 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                    <Receipt className="h-4.5 w-4.5 text-slate-400" />
                    <h3 className="font-extrabold text-slate-850 dark:text-white text-sm">Billing Receipts</h3>
                  </div>

                  {userPayments.length === 0 ? (
                    <p className="text-center py-6 text-xs text-slate-400">No transaction logs available.</p>
                  ) : (
                    <div className="space-y-3">
                      {userPayments.map((pay) => (
                        <div key={pay.id} className="p-3 border border-slate-100 dark:border-slate-800 rounded-xl text-xs space-y-1 bg-slate-50/50 dark:bg-slate-950/20">
                          <div className="flex justify-between items-start font-bold">
                            <span className="text-slate-700 dark:text-slate-300 truncate max-w-[70%]">{pay.itemName}</span>
                            <span className={pay.status === 'success' ? 'text-green-600' : 'text-red-500'}>
                              {pay.status === 'success' ? `+$${pay.amount}` : `-$${pay.amount} Ref`}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                            <span>{pay.paymentMethod}</span>
                            <span>{new Date(pay.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

        </main>
      </div>

      {/* Global Payment Overlay Component */}
      {payModalOpen && payTarget && (
        <PaymentModal
          isOpen={payModalOpen}
          onClose={() => { setPayModalOpen(false); setPayTarget(null); }}
          onSuccess={handlePaymentSuccess}
          amount={payTarget.amount}
          itemName={payTarget.name}
          itemType={payTarget.type}
        />
      )}

    </div>
  );
}
