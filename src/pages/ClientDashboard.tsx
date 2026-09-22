import { useState, useEffect } from 'react';
import { useDatabase } from '../hooks/useDatabase';
import { api } from '../data/api';
import PaymentModal from '../components/PaymentModal';
import EventRegistrationModal from '../components/EventRegistrationModal';
import ThemeToggle from '../components/ThemeToggle';
import { 
  User as UserIcon, Calendar, Receipt, BookOpen, Award, Bell,
  Menu, X, CheckCircle, Download, Sparkles, ArrowLeft,
  LogOut, Play, Search, Eye, CheckCircle2, ShieldCheck
} from 'lucide-react';

interface ClientDashboardProps {
  onLogout: () => void;
  onNavigate: (view: any) => void;
}

export type ClientTab = 'profile' | 'events' | 'payments' | 'courses' | 'certificates' | 'notifications';

export default function ClientDashboard({ onLogout, onNavigate }: ClientDashboardProps) {
  const { currentUser, courses, events, enrollments, registrations, payments } = useDatabase();
  const [activeTab, setActiveTab] = useState<ClientTab>('profile');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Search & Filter states
  const [courseSearch, setCourseSearch] = useState('');
  const [courseCategory, setCourseCategory] = useState('All');
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [eventsSubTab, setEventsSubTab] = useState<'registered' | 'explore'>('registered');

  // Full-screen Dynamic Event Registration Modal
  const [selectedRegEvent, setSelectedRegEvent] = useState<any | null>(null);

  // Modal Payments State
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [payTarget, setPayTarget] = useState<{ amount: number; name: string; type: 'course' | 'event'; id: string } | null>(null);

  // Screenshot Lightbox Modal
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  // Form states for My Profile
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
    bio: currentUser?.bio || '',
    photo: currentUser?.profilePhoto || '',
    college: '',
    branch: '',
    year: '',
    newPassword: ''
  });

  const [notificationsRead, setNotificationsRead] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  // Sync profile form once currentUser is loaded
  useEffect(() => {
    if (currentUser) {
      setProfileForm(prev => ({
        ...prev,
        name: currentUser.name || '',
        phone: currentUser.phone || '',
        bio: currentUser.bio || '',
        photo: currentUser.profilePhoto || ''
      }));
    }
  }, [currentUser?.id, currentUser?.name, currentUser?.phone, currentUser?.bio, currentUser?.profilePhoto]);

  if (!currentUser) return null;

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  // User-specific data collections
  const userRegs = registrations.filter(r => 
    r.userId === currentUser.id || (r.email && r.email.toLowerCase() === currentUser.email?.toLowerCase())
  );

  const userPayments = payments.filter(p => 
    p.userId === currentUser.id || (p.userEmail && p.userEmail.toLowerCase() === currentUser.email?.toLowerCase())
  );

  const activeEnrollments = enrollments.filter(e => e.userId === currentUser.id);

  // Earned Certificates: Course (progress === 100 or certified) + Events (certificateIssued === true)
  const courseCerts = activeEnrollments.filter(e => e.certificateStatus === 'earned' || e.progress === 100);
  const eventCerts = userRegs.filter(r => r.certificateIssued);
  const totalCertsCount = courseCerts.length + eventCerts.length;

  // Calculate Profile Completion %
  const calculateProfileCompletion = () => {
    let completed = 25; // Registered base
    if (currentUser.name) completed += 25;
    if (currentUser.phone) completed += 25;
    if (currentUser.bio && currentUser.bio !== 'Member of COMMUNITY.VA learning cohort.') completed += 25;
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

  const handleRegisterEventTrigger = (evt: any) => {
    if (evt.seatsAvailable <= 0) {
      showToast('Sorry, this workshop is currently fully booked.');
      return;
    }
    setSelectedRegEvent(evt);
  };

  const handlePurchaseCourseTrigger = (crs: any) => {
    setPayTarget({ amount: crs.price, name: crs.title, type: 'course', id: crs.id });
    setPayModalOpen(true);
  };

  const handlePaymentSuccess = async (method: string, amount: number) => {
    if (!payTarget) return;
    try {
      if (payTarget.type === 'event') {
        await api.events.register(payTarget.id, amount, method);
        showToast(`Successfully registered for: ${payTarget.name}!`);
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

  const handleCancelRegistration = async (regId: string) => {
    if (!window.confirm('Are you sure you want to cancel this event registration?')) return;
    try {
      await api.events.cancelRegistration(regId);
      showToast('Registration cancelled.');
      window.dispatchEvent(new Event('db-update'));
    } catch (err: any) {
      showToast(err.message || 'Cancellation failed.');
    }
  };

  const handleMarkVideoCompleted = async (courseId: string, videoId: string, enrollId: string) => {
    try {
      const updatedEnr = await api.courses.updateProgress(enrollId, videoId, courseId);
      const prevEnr = enrollments.find(e => e.id === enrollId);
      const wasCompleted = Array.isArray(prevEnr?.completedLessons) ? prevEnr.completedLessons.includes(videoId) : false;

      if (updatedEnr && updatedEnr.progress === 100 && !wasCompleted) {
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

  // Certificate Generator & Download
  const handleExportCertificate = (certId: string, title: string, type: 'course' | 'event' = 'course') => {
    const canvas = document.createElement('canvas');
    canvas.width = 900;
    canvas.height = 640;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dark Background with Gold Accent Border
    ctx.fillStyle = '#070A12';
    ctx.fillRect(0, 0, 900, 640);

    // Outer Border
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 14;
    ctx.strokeRect(30, 30, 840, 580);

    // Inner Border
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 2;
    ctx.strokeRect(45, 45, 810, 550);

    // Seal icon
    ctx.fillStyle = '#60a5fa';
    ctx.font = '36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🎓', 450, 110);

    // Brand
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('COMMUNITY.VA • OFFICIAL CREDENTIAL', 450, 145);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText(
      type === 'course' ? 'CERTIFICATE OF COMPLETION' : 'CERTIFICATE OF PARTICIPATION',
      450,
      195
    );

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'italic 16px serif';
    ctx.fillText('This credential verifies that', 450, 245);

    // Student Name
    ctx.fillStyle = '#818cf8';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText(currentUser.name.toUpperCase(), 450, 295);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '15px sans-serif';
    ctx.fillText(
      type === 'course' 
        ? 'has successfully completed all lecture modules and masterclasses for'
        : 'has actively participated and completed the workshop on',
      450,
      345
    );

    // Course/Event Name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(`"${title}"`, 450, 395);

    ctx.fillStyle = '#64748b';
    ctx.font = '13px sans-serif';
    ctx.fillText(`Issued on ${new Date().toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })} • Authorized by Academic Council`, 450, 460);

    // Verification ID
    ctx.fillStyle = '#a5b4fc';
    ctx.font = 'bold 14px monospace';
    ctx.fillText(`VERIFIABLE CREDENTIAL ID: ${certId}`, 450, 520);

    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `COMMUNITY_VA_Certificate_${title.replace(/\s+/g, '_')}.png`;
    link.href = image;
    link.click();
    showToast('Certificate downloaded successfully!');
  };

  // Ticket Generator
  const handleExportTicket = (evt: any, reg?: any) => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 600, 300);

    ctx.strokeStyle = '#4f46e5';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, 580, 280);

    // Cutouts
    ctx.fillStyle = '#070A12';
    ctx.beginPath();
    ctx.arc(430, 0, 20, 0, Math.PI * 2);
    ctx.arc(430, 300, 20, 0, Math.PI * 2);
    ctx.fill();

    // Dashed divider
    ctx.strokeStyle = '#334155';
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(430, 20);
    ctx.lineTo(430, 280);
    ctx.stroke();
    ctx.setLineDash([]);

    // Brand
    ctx.fillStyle = '#818cf8';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('COMMUNITY.VA • EVENT ENTRY PASS', 30, 45);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(evt.title.substring(0, 35), 30, 80);

    // Date & Venue
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px sans-serif';
    ctx.fillText(`Date: ${evt.date} | Time: ${evt.time}`, 30, 115);
    ctx.fillText(`Venue: ${evt.venue}`, 30, 138);

    // Attendee
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(`Attendee: ${currentUser.name}`, 30, 185);
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(`Pass Tier: ${reg?.selectedTier || 'Regular'} • Status: Confirmed`, 30, 210);

    // Check-in code
    const code = reg?.checkInCode || (reg?.id ? reg.id.slice(-6).toUpperCase() : 'PASS');
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(`Check-in Code: ${code}`, 30, 245);

    // Right stub
    ctx.fillStyle = '#a5b4fc';
    ctx.font = 'bold 14px monospace';
    ctx.fillText('ADMIT ONE', 465, 120);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px monospace';
    ctx.fillText(code, 465, 160);

    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `EventPass_${evt.title.replace(/\s+/g, '_')}.png`;
    link.href = image;
    link.click();
    showToast('Event pass downloaded!');
  };

  const filteredCourses = courses.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(courseSearch.toLowerCase());
    const matchesCategory = courseCategory === 'All' || c.category === courseCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#070A12] text-slate-800 dark:text-slate-100 transition-colors duration-300">
      
      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 border-r border-slate-200/70 dark:border-white/10 bg-white dark:bg-slate-900/90 backdrop-blur-xl transition-transform duration-300 md:translate-x-0 ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('landing')}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white font-black text-xs shadow-md">
              VA
            </div>
            <span className="font-extrabold text-slate-900 dark:text-white tracking-tight">COMMUNITY.VA</span>
          </div>
          <button className="md:hidden p-1 text-slate-500" onClick={() => setMobileMenuOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Mini Profile Card */}
        <div className="p-4 border-b border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/5">
          <div className="flex items-center gap-3">
            <img src={currentUser.profilePhoto} alt={currentUser.name} className="h-10 w-10 rounded-full object-cover ring-2 ring-indigo-500/30" />
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{currentUser.name}</h4>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400 truncate block">
                {currentUser.email}
              </span>
            </div>
          </div>
        </div>

        {/* Sidebar Nav: 6 Core User Dashboard Sections */}
        <nav className="p-3 space-y-1">
          <button
            onClick={() => { setActiveTab('profile'); setMobileMenuOpen(false); }}
            className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold transition cursor-pointer ${
              activeTab === 'profile' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <UserIcon className="h-4 w-4" />
            <span>My Profile</span>
          </button>

          <button
            onClick={() => { setActiveTab('events'); setMobileMenuOpen(false); }}
            className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition cursor-pointer ${
              activeTab === 'events' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4" />
              <span>My Event Registrations</span>
            </div>
            {userRegs.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === 'events' ? 'bg-white/20 text-white' : 'bg-indigo-500/20 text-indigo-400'}`}>
                {userRegs.length}
              </span>
            )}
          </button>

          <button
            onClick={() => { setActiveTab('payments'); setMobileMenuOpen(false); }}
            className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition cursor-pointer ${
              activeTab === 'payments' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <Receipt className="h-4 w-4" />
              <span>Payment Status</span>
            </div>
            {userPayments.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === 'payments' ? 'bg-white/20 text-white' : 'bg-indigo-500/20 text-indigo-400'}`}>
                {userPayments.length}
              </span>
            )}
          </button>

          <button
            onClick={() => { setActiveTab('courses'); setMobileMenuOpen(false); }}
            className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold transition cursor-pointer ${
              activeTab === 'courses' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>My Courses</span>
          </button>

          <button
            onClick={() => { setActiveTab('certificates'); setMobileMenuOpen(false); }}
            className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition cursor-pointer ${
              activeTab === 'certificates' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <Award className="h-4 w-4" />
              <span>Certificates</span>
            </div>
            {totalCertsCount > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === 'certificates' ? 'bg-white/20 text-white' : 'bg-emerald-500/20 text-emerald-400'}`}>
                {totalCertsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => { setActiveTab('notifications'); setMobileMenuOpen(false); }}
            className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition cursor-pointer ${
              activeTab === 'notifications' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <Bell className="h-4 w-4" />
              <span>Notifications</span>
            </div>
            {!notificationsRead && (
              <span className="h-2 w-2 rounded-full bg-blue-500"></span>
            )}
          </button>
        </nav>

        {/* Bottom Actions */}
        <div className="absolute bottom-4 left-0 w-full px-4 space-y-2">
          {currentUser.role === 'admin' && (
            <button
              onClick={() => onNavigate('admin')}
              className="flex w-full items-center gap-2.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-2.5 text-xs font-bold text-indigo-400 hover:bg-indigo-500/20 transition cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              <span>Admin Dashboard</span>
            </button>
          )}

          <button
            onClick={onLogout}
            className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-bold text-red-400 hover:bg-red-500/10 transition cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200/70 dark:border-white/10 bg-white/80 dark:bg-[#070A12]/80 backdrop-blur-xl px-6">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-1.5 rounded-lg border dark:border-white/10" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="h-5 w-5 text-slate-400" />
            </button>
            <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              {activeTab === 'profile' && 'My Profile'}
              {activeTab === 'events' && 'My Event Registrations'}
              {activeTab === 'payments' && 'Payment Status'}
              {activeTab === 'courses' && 'My Courses'}
              {activeTab === 'certificates' && 'Certificates & Credentials'}
              {activeTab === 'notifications' && 'Notifications'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </header>

        {/* Toast Alert */}
        {successToast && (
          <div className="fixed top-20 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 border border-white/20 px-4 py-3 text-xs text-white shadow-2xl animate-fade-in-up">
            <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Scrollable Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">

          {/* 1. MY PROFILE */}
          {activeTab === 'profile' && (
            <div className="max-w-4xl space-y-6">
              
              {/* Profile Card Header */}
              <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
                  <img 
                    src={currentUser.profilePhoto} 
                    alt={currentUser.name} 
                    className="h-24 w-24 rounded-2xl object-cover ring-4 ring-indigo-500/20 shadow-xl"
                  />
                  <div className="flex-1 text-center sm:text-left space-y-1.5">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <h2 className="text-2xl font-black text-white">{currentUser.name}</h2>
                      <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                        Active Student
                      </span>
                      {currentUser.role === 'admin' && (
                        <span className="rounded-full bg-indigo-500/20 border border-indigo-500/30 px-2.5 py-0.5 text-[10px] font-bold text-indigo-400">
                          Administrator
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">{currentUser.email}</p>
                    <p className="text-xs text-slate-300 mt-2 max-w-xl">{currentUser.bio || 'Passionate student advancing non-technical & leadership skills.'}</p>
                  </div>

                  <div className="shrink-0 w-full sm:w-48 bg-white/5 rounded-2xl p-4 border border-white/10 text-center sm:text-left">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Profile Strength</span>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl font-black text-white">{calculateProfileCompletion()}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${calculateProfileCompletion()}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Edit Profile Form */}
              <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <UserIcon className="h-5 w-5 text-indigo-400" />
                  <span>Personal Information</span>
                </h3>

                <form onSubmit={handleProfileSave} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
                      <input
                        type="text"
                        required
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-3.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address (Verified)</label>
                      <input
                        type="email"
                        disabled
                        value={currentUser.email}
                        className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-3.5 text-xs text-slate-400 cursor-not-allowed opacity-75"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Phone Number</label>
                      <input
                        type="tel"
                        required
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-3.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Profile Photo URL</label>
                      <input
                        type="text"
                        value={profileForm.photo}
                        onChange={(e) => setProfileForm({ ...profileForm, photo: e.target.value })}
                        className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-3.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Personal Bio</label>
                    <textarea
                      rows={3}
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                      placeholder="Tell us about your learning goals and career aspirations..."
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-3.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="pt-4 border-t border-white/10 flex justify-end">
                    <button
                      type="submit"
                      className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 transition cursor-pointer"
                    >
                      Save Profile Changes
                    </button>
                  </div>
                </form>
              </div>

            </div>
          )}

          {/* 2. MY EVENT REGISTRATIONS */}
          {activeTab === 'events' && (
            <div className="space-y-6 max-w-6xl">
              
              {/* Header Navigation Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-xl font-black text-white">Event Registrations</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Track your registered workshop seats, entry passes, and check-in codes.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEventsSubTab('registered')}
                    className={`rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
                      eventsSubTab === 'registered'
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                        : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    My Registrations ({userRegs.length})
                  </button>
                  <button
                    onClick={() => setEventsSubTab('explore')}
                    className={`rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
                      eventsSubTab === 'explore'
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                        : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    Explore All Events
                  </button>
                </div>
              </div>

              {/* View 1: Student's Own Registrations */}
              {eventsSubTab === 'registered' && (
                <div>
                  {userRegs.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 p-12 text-center max-w-xl mx-auto space-y-4">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400">
                        <Calendar className="h-7 w-7" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white">No Event Registrations Yet</h3>
                        <p className="text-xs text-slate-400 mt-1">
                          You haven't reserved any workshop or webinar seats yet. Check out the upcoming events schedule!
                        </p>
                      </div>
                      <button
                        onClick={() => setEventsSubTab('explore')}
                        className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/25 transition cursor-pointer"
                      >
                        Browse Available Events
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {userRegs.map((reg) => {
                        const evt = events.find(e => e.id === reg.eventId);
                        if (!evt) return null;
                        const isApproved = reg.status === 'approved';
                        const isPending = reg.status === 'pending';

                        return (
                          <div 
                            key={reg.id}
                            className="rounded-3xl border border-white/10 bg-slate-900/70 backdrop-blur-xl overflow-hidden shadow-xl flex flex-col justify-between"
                          >
                            <div className="relative h-44 overflow-hidden">
                              <img src={evt.banner} alt={evt.title} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                              <span className="absolute top-3 left-3 rounded-full bg-slate-900/80 backdrop-blur border border-white/10 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-indigo-300">
                                {evt.category}
                              </span>
                              <span className={`absolute top-3 right-3 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${
                                isApproved 
                                  ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300' 
                                  : isPending 
                                  ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                                  : 'bg-red-500/20 border border-red-500/40 text-red-300'
                              }`}>
                                {isApproved ? 'Seat Confirmed' : isPending ? 'Pending Verification' : 'Rejected'}
                              </span>
                            </div>

                            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                              <div>
                                <h3 className="font-extrabold text-base text-white line-clamp-1">{evt.title}</h3>
                                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                                  <span>📅 {evt.date} • {evt.time}</span>
                                </p>
                                <p className="text-xs text-slate-400 mt-0.5">
                                  📍 {evt.venue}
                                </p>
                              </div>

                              <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Pass Tier</span>
                                  <span className="font-bold text-white">{reg.selectedTier || 'Regular'}</span>
                                </div>
                                <div>
                                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Fee Paid</span>
                                  <span className="font-bold text-emerald-400">₹{reg.amountPaid || evt.fees}</span>
                                </div>
                                <div>
                                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Check-in Code</span>
                                  <span className="font-mono font-bold text-indigo-300">{reg.checkInCode || reg.id.slice(-6).toUpperCase()}</span>
                                </div>
                                <div>
                                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Attendance</span>
                                  <span className="font-bold text-slate-300">{reg.attended ? '✅ Checked-in' : '⏳ Awaiting Event'}</span>
                                </div>
                              </div>

                              <div className="flex gap-2 pt-2">
                                <button
                                  onClick={() => handleExportTicket(evt, reg)}
                                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 transition cursor-pointer"
                                >
                                  <Download className="h-4 w-4" />
                                  <span>Download Pass</span>
                                </button>
                                {isPending && (
                                  <button
                                    onClick={() => handleCancelRegistration(reg.id)}
                                    className="rounded-xl border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 px-3 py-2.5 text-xs font-bold text-red-400 transition cursor-pointer"
                                  >
                                    Cancel
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

              {/* View 2: Browse All Events */}
              {eventsSubTab === 'explore' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {events.map((evt) => {
                    const isRegistered = userRegs.some(r => r.eventId === evt.id);
                    return (
                      <div 
                        key={evt.id} 
                        className="rounded-3xl border border-white/10 bg-slate-900/60 overflow-hidden shadow-xl flex flex-col justify-between"
                      >
                        <div className="h-44 overflow-hidden relative">
                          <img src={evt.banner} alt={evt.title} className="w-full h-full object-cover" />
                          <span className="absolute top-3 left-3 rounded-full bg-slate-900/80 backdrop-blur border border-white/10 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-indigo-300">
                            {evt.category}
                          </span>
                        </div>
                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                          <div>
                            <h3 className="font-bold text-sm text-white line-clamp-1">{evt.title}</h3>
                            <p className="text-xs text-slate-400 mt-1">{evt.date} • {evt.time}</p>
                            <p className="text-xs text-slate-400 mt-0.5 truncate">{evt.venue}</p>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-white/10">
                            <span className="text-sm font-extrabold text-white">
                              {evt.fees === 0 ? 'Free' : `₹${evt.fees}`}
                            </span>
                            {isRegistered ? (
                              <span className="rounded-xl bg-emerald-500/20 border border-emerald-500/30 px-3 py-1.5 text-xs font-bold text-emerald-400">
                                ✓ Registered
                              </span>
                            ) : (
                              <button
                                onClick={() => handleRegisterEventTrigger(evt)}
                                className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-1.5 text-xs font-bold text-white transition cursor-pointer"
                              >
                                Register Now
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

          {/* 3. PAYMENT STATUS */}
          {activeTab === 'payments' && (
            <div className="space-y-6 max-w-6xl">
              <div>
                <h2 className="text-xl font-black text-white">Payment Status & Billing History</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  View and verify all payments, fee tiers, and transaction receipts.
                </p>
              </div>

              {/* KPI metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Spend</span>
                  <p className="text-2xl font-black text-white mt-1">
                    ₹{userPayments.reduce((acc, p) => acc + (p.status === 'success' ? p.amount : 0), 0) +
                       userRegs.reduce((acc, r) => acc + (r.amountPaid || 0), 0)}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Verified Transactions</span>
                  <p className="text-2xl font-black text-emerald-400 mt-1">
                    {userPayments.filter(p => p.status === 'success').length + userRegs.filter(r => r.status === 'approved').length}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">In Verification</span>
                  <p className="text-2xl font-black text-amber-400 mt-1">
                    {userRegs.filter(r => r.status === 'pending').length}
                  </p>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl overflow-hidden shadow-xl">
                <div className="p-5 border-b border-white/10 flex items-center justify-between">
                  <h3 className="font-bold text-sm text-white">Recent Transactions</h3>
                  <span className="text-xs text-slate-400">{userRegs.length + userPayments.length} entries</span>
                </div>

                {userRegs.length === 0 && userPayments.length === 0 ? (
                  <div className="p-12 text-center text-xs text-slate-400">
                    No payment records found. When you register for events or enroll in courses, your receipts will appear here.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-white/5 text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/10">
                        <tr>
                          <th className="py-3 px-4">Item / Event</th>
                          <th className="py-3 px-4">Category</th>
                          <th className="py-3 px-4">Amount</th>
                          <th className="py-3 px-4">Date</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4">Receipt / Screenshot</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {userRegs.map((reg) => {
                          const evt = events.find(e => e.id === reg.eventId);
                          return (
                            <tr key={reg.id} className="hover:bg-white/5 transition">
                              <td className="py-3.5 px-4 font-bold text-white">
                                {evt?.title || 'Workshop Registration'}
                              </td>
                              <td className="py-3.5 px-4 text-slate-400">Event Pass</td>
                              <td className="py-3.5 px-4 font-bold text-white">₹{reg.amountPaid || evt?.fees || 0}</td>
                              <td className="py-3.5 px-4 text-slate-400">{new Date(reg.registeredAt).toLocaleDateString()}</td>
                              <td className="py-3.5 px-4">
                                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                  reg.status === 'approved'
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : reg.status === 'pending'
                                    ? 'bg-amber-500/20 text-amber-400'
                                    : 'bg-red-500/20 text-red-400'
                                }`}>
                                  {reg.status === 'approved' ? '✓ Verified' : reg.status === 'pending' ? '⏳ Under Review' : 'Rejected'}
                                </span>
                              </td>
                              <td className="py-3.5 px-4">
                                {reg.paymentScreenshot ? (
                                  <button
                                    onClick={() => setLightboxImg(reg.paymentScreenshot || null)}
                                    className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-400 hover:text-indigo-300 transition cursor-pointer"
                                  >
                                    <Eye className="h-3.5 w-3.5" />
                                    <span>View Proof</span>
                                  </button>
                                ) : (
                                  <span className="text-slate-500">Direct Entry</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}

                        {userPayments.map((p) => (
                          <tr key={p.id} className="hover:bg-white/5 transition">
                            <td className="py-3.5 px-4 font-bold text-white">{p.itemName}</td>
                            <td className="py-3.5 px-4 text-slate-400 capitalize">{p.itemType}</td>
                            <td className="py-3.5 px-4 font-bold text-white">₹{p.amount}</td>
                            <td className="py-3.5 px-4 text-slate-400">{new Date(p.date).toLocaleDateString()}</td>
                            <td className="py-3.5 px-4">
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                                ✓ Verified
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-400 font-mono text-[10px]">
                              {p.paymentMethod}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* 4. MY COURSES */}
          {activeTab === 'courses' && (
            <div className="space-y-6 max-w-6xl">
              <div>
                <h2 className="text-xl font-black text-white">My Courses & Curriculum</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Learn through practical corporate modules, track lecture completion, and earn verifiable certificates.
                </p>
              </div>

              {selectedCourse ? (
                <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 backdrop-blur-xl space-y-6">
                  <button
                    onClick={() => setSelectedCourse(null)}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition cursor-pointer"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to Courses</span>
                  </button>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                      <div className="rounded-2xl overflow-hidden bg-black aspect-video relative flex items-center justify-center border border-white/10">
                        <Play className="h-16 w-16 text-white/50" />
                        <span className="absolute bottom-3 left-4 text-xs font-bold text-white bg-black/60 px-3 py-1 rounded-lg">
                          Interactive Video Player
                        </span>
                      </div>
                      <h3 className="text-xl font-black text-white">{selectedCourse.title}</h3>
                      <p className="text-xs text-slate-300 leading-relaxed">{selectedCourse.description}</p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Lecture Modules</h4>
                      <div className="space-y-2">
                        {selectedCourse.videos?.map((vid: any, i: number) => {
                          const enr = enrollments.find(e => e.courseId === selectedCourse.id && e.userId === currentUser.id);
                          const isDone = Array.isArray(enr?.completedLessons) && enr.completedLessons.includes(vid.id);

                          return (
                            <div 
                              key={vid.id}
                              onClick={() => enr && handleMarkVideoCompleted(selectedCourse.id, vid.id, enr.id)}
                              className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between text-xs ${
                                isDone 
                                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' 
                                  : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[10px] text-slate-500">#{i + 1}</span>
                                <span className="font-semibold line-clamp-1">{vid.title}</span>
                              </div>
                              <span className="text-[10px] font-bold">{isDone ? '✓ Completed' : vid.duration}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Search and Category filters */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Search courses and masterclasses..."
                        value={courseSearch}
                        onChange={(e) => setCourseSearch(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {['All', 'Career Preparation', 'Leadership', 'Communication'].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setCourseCategory(cat)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition cursor-pointer ${
                            courseCategory === cat
                              ? 'bg-indigo-600 border-indigo-600 text-white'
                              : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {filteredCourses.map((crs) => {
                      const enr = enrollments.find(e => e.courseId === crs.id && e.userId === currentUser.id);
                      return (
                        <div 
                          key={crs.id} 
                          className="rounded-3xl border border-white/10 bg-slate-900/60 overflow-hidden shadow-xl flex flex-col justify-between"
                        >
                          <div className="h-44 overflow-hidden relative">
                            <img src={crs.thumbnail} alt={crs.title} className="w-full h-full object-cover" />
                            <span className="absolute top-3 left-3 rounded-full bg-slate-900/80 backdrop-blur border border-white/10 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-indigo-300">
                              {crs.category}
                            </span>
                          </div>

                          <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                            <div>
                              <h3 className="font-bold text-sm text-white line-clamp-1">{crs.title}</h3>
                              <p className="text-xs text-slate-400 mt-1 line-clamp-2">{crs.description}</p>
                            </div>

                            {enr ? (
                              <div className="space-y-2 pt-2 border-t border-white/10">
                                <div className="flex justify-between text-xs font-bold">
                                  <span className="text-slate-400">Progress</span>
                                  <span className="text-indigo-400">{enr.progress}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${enr.progress}%` }}></div>
                                </div>
                                <button
                                  onClick={() => setSelectedCourse(crs)}
                                  className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 py-2 text-xs font-bold text-white transition cursor-pointer"
                                >
                                  Resume Course
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                                <span className="text-sm font-extrabold text-white">₹{crs.price}</span>
                                <button
                                  onClick={() => handlePurchaseCourseTrigger(crs)}
                                  className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-1.5 text-xs font-bold text-white transition cursor-pointer"
                                >
                                  Enroll Now
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* 5. CERTIFICATES */}
          {activeTab === 'certificates' && (
            <div className="space-y-6 max-w-6xl">
              <div>
                <h2 className="text-xl font-black text-white">Certificates & Verified Credentials</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Official certificates issued for workshop participation and course completion.
                </p>
              </div>

              {totalCertsCount === 0 ? (
                <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 p-12 text-center max-w-xl mx-auto space-y-4">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400">
                    <Award className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">No Certificates Earned Yet</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      You receive official verifiable certificates upon completing any enrolled course or attending verified COMMUNITY.VA workshops!
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('events')}
                    className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/25 transition cursor-pointer"
                  >
                    View Upcoming Workshops
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Course Certificates */}
                  {courseCerts.map((enr) => {
                    const crs = courses.find(c => c.id === enr.courseId);
                    if (!crs) return null;
                    const certId = enr.certificateId || `CERT-CRS-${enr.id.slice(-6).toUpperCase()}`;

                    return (
                      <div 
                        key={enr.id}
                        className="rounded-3xl border border-indigo-500/20 bg-slate-900/80 p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between space-y-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                              <Award className="h-6 w-6" />
                            </div>
                            <div>
                              <span className="text-[10px] font-extrabold uppercase text-indigo-400 tracking-wider">
                                Course Completion Certificate
                              </span>
                              <h3 className="font-extrabold text-base text-white mt-0.5">{crs.title}</h3>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 text-xs space-y-1">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Recipient:</span>
                            <span className="font-bold text-white">{currentUser.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Verifiable ID:</span>
                            <span className="font-mono text-indigo-300 font-bold">{certId}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Status:</span>
                            <span className="font-bold text-emerald-400">Official & Verified</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleExportCertificate(certId, crs.title, 'course')}
                          className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-600/25 transition cursor-pointer"
                        >
                          <Download className="h-4 w-4" />
                          <span>Download High-Res Certificate (PNG)</span>
                        </button>
                      </div>
                    );
                  })}

                  {/* Event Certificates */}
                  {eventCerts.map((reg) => {
                    const evt = events.find(e => e.id === reg.eventId);
                    if (!evt) return null;
                    const certId = reg.certificateId || `CERT-EVT-${reg.id.slice(-6).toUpperCase()}`;

                    return (
                      <div 
                        key={reg.id}
                        className="rounded-3xl border border-purple-500/20 bg-slate-900/80 p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between space-y-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                              <Award className="h-6 w-6" />
                            </div>
                            <div>
                              <span className="text-[10px] font-extrabold uppercase text-purple-400 tracking-wider">
                                Event Participation Certificate
                              </span>
                              <h3 className="font-extrabold text-base text-white mt-0.5">{evt.title}</h3>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 text-xs space-y-1">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Recipient:</span>
                            <span className="font-bold text-white">{currentUser.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Verifiable ID:</span>
                            <span className="font-mono text-purple-300 font-bold">{certId}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Attendance:</span>
                            <span className="font-bold text-emerald-400">Verified Present</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleExportCertificate(certId, evt.title, 'event')}
                          className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 py-3 text-xs font-bold text-white shadow-lg shadow-purple-600/25 transition cursor-pointer"
                        >
                          <Download className="h-4 w-4" />
                          <span>Download High-Res Certificate (PNG)</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

          {/* 6. NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="space-y-6 max-w-4xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-xl font-black text-white">Notifications & Activity Feed</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Live updates on registrations, payment confirmations, and community alerts.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setNotificationsRead(true);
                    showToast('All notifications marked as read.');
                  }}
                  className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3.5 py-1.5 text-xs font-bold text-slate-300 transition cursor-pointer"
                >
                  Mark All as Read
                </button>
              </div>

              <div className="space-y-3">
                {/* Simulated live notification queue based on student's actual account records */}
                <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl flex items-start gap-3.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold text-white">Account Authentication Activated</h4>
                      <span className="text-[10px] text-slate-500">Recent</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Welcome to COMMUNITY.VA! Your student session has been verified and authenticated securely.
                    </p>
                  </div>
                </div>

                {userRegs.map((reg) => {
                  const evt = events.find(e => e.id === reg.eventId);
                  return (
                    <div key={reg.id} className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl flex items-start gap-3.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <h4 className="text-xs font-bold text-white">Registration Status: {reg.status === 'approved' ? 'Confirmed' : 'Received'}</h4>
                          <span className="text-[10px] text-slate-500">{new Date(reg.registeredAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          Your pass for <span className="font-semibold text-slate-200">"{evt?.title || 'Event'}"</span> has been logged with Pass Code: <span className="font-mono text-indigo-300 font-bold">{reg.checkInCode || 'PASS'}</span>.
                        </p>
                      </div>
                    </div>
                  );
                })}

                <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl flex items-start gap-3.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                    <Bell className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold text-white">Executive Soft Skills Cohort 2026</h4>
                      <span className="text-[10px] text-slate-500">System Broadcast</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Don't miss our upcoming weekend masterclasses in Hyderabad. Stay tuned to the Events section for date releases.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}

        </main>
      </div>

      {/* Full-screen Dynamic Event Registration Modal */}
      {selectedRegEvent && (
        <EventRegistrationModal
          isOpen={!!selectedRegEvent}
          event={selectedRegEvent}
          onClose={() => setSelectedRegEvent(null)}
          onSuccess={() => {
            setSelectedRegEvent(null);
            showToast('Registration received! We will verify payment and confirm your seat.');
            window.dispatchEvent(new Event('db-update'));
          }}
        />
      )}

      {/* Global Payment Overlay Component (Courses) */}
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

      {/* Lightbox Screenshot Viewer Modal */}
      {lightboxImg && (
        <div 
          onClick={() => setLightboxImg(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-2xl max-h-[85vh] rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
            <img src={lightboxImg} alt="Payment Proof" className="w-full h-full object-contain" />
            <button 
              onClick={() => setLightboxImg(null)}
              className="absolute top-3 right-3 p-2 rounded-xl bg-black/60 text-white hover:bg-black/80 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
