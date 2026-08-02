import React, { useState } from 'react';
import { useDatabase } from '../hooks/useDatabase';
import { api } from '../data/api';
import { 
  Users as UsersIcon, Calendar, BookOpen, DollarSign, Plus, Edit, Trash2, 
  Search, ShieldAlert, ArrowLeft, Send, Ban, Check, Download, Landmark, FileText, X, Menu
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts';

interface AdminDashboardProps {
  onLogout: () => void;
  onNavigate: (view: 'landing' | 'login' | 'register' | 'client' | 'admin') => void;
}

export default function AdminDashboard({ onLogout, onNavigate }: AdminDashboardProps) {
  const { currentUser, users, courses, events, enrollments, payments } = useDatabase();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'events' | 'courses' | 'payments' | 'notifications'>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Notification form
  const [notificationMsg, setNotificationMsg] = useState({ title: '', body: '', target: 'all' });

  // User management search/edit
  const [userSearch, setUserSearch] = useState('');
  
  // Event Form states
  const [eventForm, setEventForm] = useState({
    id: '', title: '', description: '', date: '', time: '', venue: '', fees: 0, seatsTotal: 50, category: 'Career Prep', banner: ''
  });
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedEventAttendees, setSelectedEventAttendees] = useState<any[] | null>(null);

  // Course Form states
  const [courseForm, setCourseForm] = useState({
    id: '', title: '', description: '', price: 29, instructor: '', category: 'Career Prep', thumbnail: '', videoTitle: '', videoDuration: '', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4'
  });
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [showCourseForm, setShowCourseForm] = useState(false);

  // Toast alert
  const [toastMessage, setToastMessage] = useState('');

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-white p-6 text-center">
        <ShieldAlert className="h-16 w-16 text-red-500 animate-pulse" />
        <h2 className="text-2xl font-black mt-4">Access Denied</h2>
        <p className="text-slate-400 mt-2 max-w-md">You do not have administrative privileges to access this area.</p>
        <button 
          onClick={() => onNavigate('client')}
          className="mt-6 rounded-xl bg-brand-600 px-5 py-2.5 font-bold text-sm"
        >
          Return to Student Portal
        </button>
      </div>
    );
  }

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // --- Calculations for Analytics ---
  const totalUsers = users.length;
  const totalEvents = events.length;
  
  // Filter active payments (not refunded)
  const activePayments = payments.filter(p => p.status === 'success');
  const totalRevenue = activePayments.reduce((sum, p) => sum + p.amount, 0);
  const totalSales = activePayments.length;

  // Chart data: mock revenue timeline
  const revenueChartData = [
    { name: 'Jan', revenue: 150 },
    { name: 'Feb', revenue: 320 },
    { name: 'Mar', revenue: 480 },
    { name: 'Apr', revenue: 790 },
    { name: 'May', revenue: 1200 },
    { name: 'Jun', revenue: totalRevenue }, // dynamic current value
  ];

  // Chart data: sales by category
  const salesByCategoryData = [
    { name: 'Career Prep', sales: activePayments.filter(p => p.itemName.includes('Negotiating') || p.itemName.includes('Resume')).length },
    { name: 'Public Speaking', sales: activePayments.filter(p => p.itemName.includes('Speaking') || p.itemName.includes('Conquering')).length },
    { name: 'Leadership', sales: activePayments.filter(p => p.itemName.includes('Leadership') || p.itemName.includes('Intelligence')).length },
    { name: 'Networking', sales: activePayments.filter(p => p.itemName.includes('Networking') || p.itemName.includes('LinkedIn')).length },
  ];

  // --- User Operations ---
  const handleToggleBlockUser = async (userId: string) => {
    try {
      await api.admin.toggleBlockUser(userId);
      triggerToast('User account status updated successfully!');
      window.dispatchEvent(new Event('db-update'));
    } catch (err: any) {
      triggerToast(err.message || 'Failed to toggle block status.');
    }
  };

  const handleToggleAdminRole = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    try {
      await api.admin.changeRole(userId, newRole);
      triggerToast('User role changed successfully!');
      window.dispatchEvent(new Event('db-update'));
    } catch (err: any) {
      triggerToast(err.message || 'Failed to change user role.');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === currentUser.id) {
      alert("You cannot delete your own admin account!");
      return;
    }
    if (!window.confirm('Are you sure you want to delete this user? All progress will be removed.')) return;
    try {
      await api.admin.deleteUser(userId);
      triggerToast('User account deleted.');
      window.dispatchEvent(new Event('db-update'));
    } catch (err: any) {
      triggerToast(err.message || 'Failed to delete user.');
    }
  };

  // --- Event Operations ---
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const eventData = {
        title: eventForm.title,
        description: eventForm.description,
        date: eventForm.date,
        time: eventForm.time,
        venue: eventForm.venue,
        fees: Number(eventForm.fees),
        seatsTotal: Number(eventForm.seatsTotal),
        category: eventForm.category,
        banner: eventForm.banner || 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800'
      };

      if (editingEventId) {
        await api.events.update(editingEventId, eventData);
        triggerToast('Workshop updated successfully!');
        setEditingEventId(null);
      } else {
        await api.events.add(eventData);
        triggerToast('New Workshop created successfully!');
      }
      window.dispatchEvent(new Event('db-update'));
      setEventForm({ id: '', title: '', description: '', date: '', time: '', venue: '', fees: 0, seatsTotal: 50, category: 'Career Prep', banner: '' });
      setShowEventForm(false);
    } catch (err: any) {
      triggerToast(err.message || 'Failed to save workshop.');
    }
  };

  const handleEditEventTrigger = (evt: any) => {
    setEventForm({
      id: evt.id, title: evt.title, description: evt.description, date: evt.date, time: evt.time, venue: evt.venue, fees: evt.fees, seatsTotal: evt.seatsTotal, category: evt.category, banner: evt.banner
    });
    setEditingEventId(evt.id);
    setShowEventForm(true);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!window.confirm('Delete this event? Registrations associated with it will be cleared.')) return;
    try {
      await api.events.delete(eventId);
      triggerToast('Workshop removed.');
      window.dispatchEvent(new Event('db-update'));
    } catch (err: any) {
      triggerToast(err.message || 'Failed to delete event.');
    }
  };

  const handleShowAttendees = async (eventId: string) => {
    try {
      const attendees = await api.events.getAttendees(eventId);
      const details = attendees.map((a: any) => ({
        regId: a.reg_id,
        name: a.name,
        email: a.email,
        phone: a.phone || 'N/A',
        registeredAt: a.registered_at
      }));
      setSelectedEventAttendees(details);
    } catch (err: any) {
      triggerToast(err.message || 'Failed to fetch attendees.');
    }
  };

  const handleExportAttendeeCSV = (eventTitle: string) => {
    if (!selectedEventAttendees) return;
    let csvContent = "data:text/csv;charset=utf-8,Attendee Name,Email,Phone,Registration Date\n";
    selectedEventAttendees.forEach(a => {
      csvContent += `"${a.name}","${a.email}","${a.phone}","${new Date(a.registeredAt).toLocaleDateString()}"\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Attendees_${eventTitle.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('CSV list exported successfully.');
  };

  // --- Course Operations ---
  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const courseData = {
        title: courseForm.title,
        description: courseForm.description,
        price: Number(courseForm.price),
        instructor: courseForm.instructor,
        category: courseForm.category,
        thumbnail: courseForm.thumbnail || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=600'
      };

      if (editingCourseId) {
        await api.courses.update(editingCourseId, courseData);
        triggerToast('Course updated!');
        setEditingCourseId(null);
      } else {
        await api.courses.add(courseData);
        triggerToast('New Course created! You can now edit it to add chapters.');
      }
      window.dispatchEvent(new Event('db-update'));
      setCourseForm({
        id: '', title: '', description: '', price: 29, instructor: '', category: 'Career Prep', thumbnail: '', videoTitle: '', videoDuration: '', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4'
      });
      setShowCourseForm(false);
    } catch (err: any) {
      triggerToast(err.message || 'Failed to save course.');
    }
  };

  const handleAddVideoToCourse = async (courseId: string) => {
    if (!courseForm.videoTitle || !courseForm.videoDuration) {
      alert('Please fill video title and duration first!');
      return;
    }
    try {
      await api.courses.addVideo(courseId, {
        title: courseForm.videoTitle,
        duration: courseForm.videoDuration,
        videoUrl: courseForm.videoUrl || 'https://www.w3schools.com/html/mov_bbb.mp4'
      });
      setCourseForm({ ...courseForm, videoTitle: '', videoDuration: '' });
      triggerToast('Chapter module added to course!');
      window.dispatchEvent(new Event('db-update'));
    } catch (err: any) {
      triggerToast(err.message || 'Failed to add video.');
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!window.confirm('Delete this course? Enrollments associated with it will be removed.')) return;
    try {
      await api.courses.delete(courseId);
      triggerToast('Course deleted.');
      window.dispatchEvent(new Event('db-update'));
    } catch (err: any) {
      triggerToast(err.message || 'Failed to delete course.');
    }
  };

  // --- Payment & Refund Operations ---
  const handleRefundTransaction = async (payId: string) => {
    if (!window.confirm('Process full refund for this transaction?')) return;
    try {
      await api.admin.refundPayment(payId);
      triggerToast('Transaction successfully refunded. User access revoked.');
      window.dispatchEvent(new Event('db-update'));
    } catch (err: any) {
      triggerToast(err.message || 'Failed to refund transaction.');
    }
  };

  // Simulated Invoice generation
  const handleExportInvoice = (pay: any) => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 700;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 600, 700);

    // Border
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 10;
    ctx.strokeRect(10, 10, 580, 680);

    // Invoice Header
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(20, 20, 560, 100);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('COMMUNITY.VA INVOICE', 40, 75);

    // Invoice Meta
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(`Receipt ID: ${pay.id}`, 40, 170);
    ctx.fillText(`Date: ${new Date(pay.date).toLocaleDateString()}`, 40, 195);
    ctx.fillText(`Billed To: ${pay.userName}`, 40, 220);
    ctx.fillText(`Email: ${pay.userEmail}`, 40, 240);

    // Table Header
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(40, 280, 520, 30);
    ctx.fillStyle = '#475569';
    ctx.fillText('Description', 50, 300);
    ctx.fillText('Amount', 480, 300);

    // Table content
    ctx.fillStyle = '#0f172a';
    ctx.fillText(pay.itemName.substring(0, 40), 50, 350);
    ctx.fillText(`INR ${pay.amount}`, 480, 350);

    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(40, 380); ctx.lineTo(560, 380); ctx.stroke();

    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('Total Paid:', 380, 420);
    ctx.fillText(`INR ${pay.amount}`, 480, 420);

    // Terms
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px sans-serif';
    ctx.fillText('Thank you for choosing COMMUNITY.VA! For support, email help@communityva.com', 40, 620);
    ctx.fillText('Secure Transaction simulated via Razorpay APIs.', 40, 640);

    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `Invoice_${pay.id}.png`;
    link.href = image;
    link.click();
    triggerToast('Invoice downloaded.');
  };

  // Send Broadcast Announcements
  const handleSendAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notificationMsg.title || !notificationMsg.body) return;

    // In a real app we'd dispatch database notices.
    // For mock, we simply trigger browser native alerts/notices
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notificationMsg.title, { body: notificationMsg.body });
    } else {
      alert(`[BROADCAST]: ${notificationMsg.title} - ${notificationMsg.body}`);
    }

    setNotificationMsg({ title: '', body: '', target: 'all' });
    triggerToast('Broadcast announcement sent to all active sessions!');
  };

  // --- Filtering Tables ---
  const filteredUsers = users.filter(u => {
    return u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase());
  });

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      
      {/* Admin Side navigation bar */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 border-r border-slate-200/50 dark:border-slate-850 bg-white dark:bg-slate-900 transition-transform duration-300 md:translate-x-0 ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800 gap-2">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('landing')}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-brand-600 to-red-500 text-white font-black text-sm">VA</div>
            <span className="font-extrabold text-slate-850 dark:text-white">Admin Console</span>
          </div>
          <button className="md:hidden p-1 text-slate-500 hover:text-slate-700" onClick={() => setMobileMenuOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
          <div className="flex items-center gap-3">
            <img src={currentUser.profilePhoto} alt={currentUser.name} className="h-10 w-10 rounded-full object-cover ring-2 ring-brand-500/20" />
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold text-slate-800 dark:text-white truncate">{currentUser.name}</h4>
              <span className="inline-flex items-center gap-1 rounded bg-brand-100 dark:bg-brand-950/40 px-1.5 py-0.5 text-[9px] font-extrabold text-brand-700 dark:text-brand-400 capitalize">
                System Admin
              </span>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          <button
            onClick={() => { setActiveTab('overview'); setMobileMenuOpen(false); }}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition ${
              activeTab === 'overview' ? 'bg-brand-50 dark:bg-brand-950/20 text-brand-650 dark:text-brand-400' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <Landmark className="h-4.5 w-4.5" />
            Analytics Overview
          </button>
          <button
            onClick={() => { setActiveTab('users'); setMobileMenuOpen(false); }}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition ${
              activeTab === 'users' ? 'bg-brand-50 dark:bg-brand-950/20 text-brand-650 dark:text-brand-400' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <UsersIcon className="h-4.5 w-4.5" />
            User Manager
          </button>
          <button
            onClick={() => { setActiveTab('events'); setMobileMenuOpen(false); }}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition ${
              activeTab === 'events' ? 'bg-brand-50 dark:bg-brand-950/20 text-brand-650 dark:text-brand-400' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <Calendar className="h-4.5 w-4.5" />
            Event Constructor
          </button>
          <button
            onClick={() => { setActiveTab('courses'); setMobileMenuOpen(false); }}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition ${
              activeTab === 'courses' ? 'bg-brand-50 dark:bg-brand-950/20 text-brand-650 dark:text-brand-400' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <BookOpen className="h-4.5 w-4.5" />
            Course Builder
          </button>
          <button
            onClick={() => { setActiveTab('payments'); setMobileMenuOpen(false); }}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition ${
              activeTab === 'payments' ? 'bg-brand-50 dark:bg-brand-950/20 text-brand-650 dark:text-brand-400' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <DollarSign className="h-4.5 w-4.5" />
            Billing & Ledger
          </button>
          <button
            onClick={() => { setActiveTab('notifications'); setMobileMenuOpen(false); }}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition ${
              activeTab === 'notifications' ? 'bg-brand-50 dark:bg-brand-950/20 text-brand-650 dark:text-brand-400' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <Send className="h-4.5 w-4.5" />
            Broadcaster
          </button>
        </nav>

        <div className="absolute bottom-4 left-0 w-full px-4">
          <button
            onClick={() => { onNavigate('client'); setMobileMenuOpen(false); }}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition mb-2"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
            Student Portal
          </button>
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50/15 dark:hover:bg-red-950/10 transition"
          >
            <Ban className="h-4.5 w-4.5" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Panel Viewport */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        
        {/* Header toolbar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200/50 dark:border-slate-850 bg-white/80 dark:bg-slate-950/80 backdrop-blur px-6">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-1.5 rounded-lg border dark:border-slate-800" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="h-5 w-5 text-slate-650" />
            </button>
            <h2 className="text-lg font-black text-slate-850 dark:text-white capitalize">Admin: {activeTab}</h2>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('client')}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-1.5 px-3.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition"
            >
              Back to Student Dashboard
            </button>
          </div>
        </header>

        {/* Dynamic Success Toast */}
        {toastMessage && (
          <div className="fixed top-20 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-850 px-4 py-3 text-xs text-white shadow-xl animate-fade-in-up">
            <Check className="h-4.5 w-4.5 text-green-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Scrolling container content */}
        <main className="flex-1 p-6 overflow-y-auto">

          {/* TAB 1: ANALYTICS OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Metrics cards grid */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-slate-250/50 dark:border-slate-850 bg-white dark:bg-slate-900 p-5 shadow-sm">
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Total Members</span>
                  <p className="text-3xl font-black mt-2 text-slate-850 dark:text-white">{totalUsers}</p>
                </div>
                <div className="rounded-2xl border border-slate-250/50 dark:border-slate-850 bg-white dark:bg-slate-900 p-5 shadow-sm">
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Total Workshops</span>
                  <p className="text-3xl font-black mt-2 text-slate-850 dark:text-white">{totalEvents}</p>
                </div>
                <div className="rounded-2xl border border-slate-250/50 dark:border-slate-850 bg-white dark:bg-slate-900 p-5 shadow-sm">
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Course Sales</span>
                  <p className="text-3xl font-black mt-2 text-slate-850 dark:text-white">{totalSales}</p>
                </div>
                <div className="rounded-2xl border border-slate-250/50 dark:border-slate-850 bg-white dark:bg-slate-900 p-5 shadow-sm">
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Total Revenue</span>
                  <p className="text-3xl font-black mt-2 text-brand-600 dark:text-brand-400">₹{totalRevenue.toFixed(2)}</p>
                </div>
              </div>

              {/* Recharts Graphics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue growth Chart */}
                <div className="rounded-2xl border border-slate-200/50 dark:border-slate-850 bg-white dark:bg-slate-900 p-5 shadow-sm">
                  <h3 className="font-extrabold text-slate-800 dark:text-white text-sm mb-4">Revenue Growth Over Time (₹)</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueChartData}>
                        <defs>
                          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                        <XAxis dataKey="name" stroke="#6b7280" fontSize={11} />
                        <YAxis stroke="#6b7280" fontSize={11} />
                        <Tooltip />
                        <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Sales by category */}
                <div className="rounded-2xl border border-slate-200/50 dark:border-slate-850 bg-white dark:bg-slate-900 p-5 shadow-sm">
                  <h3 className="font-extrabold text-slate-800 dark:text-white text-sm mb-4">Sales Enrollments by Topic</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={salesByCategoryData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                        <XAxis dataKey="name" stroke="#6b7280" fontSize={10} />
                        <YAxis stroke="#6b7280" fontSize={11} />
                        <Tooltip />
                        <Bar dataKey="sales" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: USER MANAGEMENT */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex gap-2 items-center max-w-xs">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search user email or name..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-900 py-1.5 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                />
              </div>

              {/* Users table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200/50 dark:border-slate-850 bg-white dark:bg-slate-900">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950/40 text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800">
                      <th className="p-4">User</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Registered On</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="border-b border-slate-100 dark:border-slate-800/80 hover:bg-slate-50/40 dark:hover:bg-slate-950/10">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img src={u.profilePhoto} alt={u.name} className="h-8 w-8 rounded-full object-cover" />
                            <div>
                              <span className="font-bold block">{u.name}</span>
                              <span className="text-[10px] text-slate-400 block">{u.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 capitalize">{u.role}</td>
                        <td className="p-4">{new Date(u.registeredAt).toLocaleDateString()}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            u.isBlocked 
                              ? 'bg-red-500/10 text-red-500 dark:bg-red-950/20' 
                              : 'bg-green-500/10 text-green-600 dark:bg-green-950/20'
                          }`}>
                            {u.isBlocked ? 'Blocked' : 'Active'}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-1.5">
                          <button
                            onClick={() => handleToggleBlockUser(u.id)}
                            className="rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 px-2.5 py-1.5 font-bold"
                          >
                            {u.isBlocked ? 'Unblock' : 'Block'}
                          </button>
                          <button
                            onClick={() => handleToggleAdminRole(u.id)}
                            className="rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 px-2.5 py-1.5 font-bold"
                          >
                            Role Change
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="rounded-lg bg-red-500/10 hover:bg-red-500/25 text-red-500 px-2 py-1.5 font-bold"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: EVENT MANAGEMENT */}
          {activeTab === 'events' && (
            <div className="space-y-6">
              
              <div className="flex justify-between items-center">
                <h3 className="font-extrabold text-sm text-slate-500 uppercase tracking-wider">Scheduled Seminars</h3>
                <button
                  onClick={() => { setShowEventForm(!showEventForm); setEditingEventId(null); }}
                  className="flex items-center gap-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs py-2 px-3 shadow transition"
                >
                  <Plus className="h-4 w-4" />
                  Add New Event
                </button>
              </div>

              {/* Event builder form */}
              {showEventForm && (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 p-6 shadow-sm animate-fade-in-up max-w-2xl">
                  <h4 className="font-bold text-slate-800 dark:text-white mb-4">{editingEventId ? 'Edit Event' : 'Create New Event'}</h4>
                  <form onSubmit={handleSaveEvent} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Title</label>
                        <input
                          type="text"
                          required
                          value={eventForm.title}
                          onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-900 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Category</label>
                        <select
                          value={eventForm.category}
                          onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-900 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                        >
                          <option value="Career Prep">Career Prep</option>
                          <option value="Networking">Networking</option>
                          <option value="Public Speaking">Public Speaking</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Description</label>
                      <textarea
                        rows={3}
                        required
                        value={eventForm.description}
                        onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-900 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Date</label>
                        <input
                          type="date"
                          required
                          value={eventForm.date}
                          onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-900 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Time</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 18:00 - 20:00"
                          value={eventForm.time}
                          onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-900 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Venue</label>
                        <input
                          type="text"
                          required
                          value={eventForm.venue}
                          onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-900 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Seats Total</label>
                        <input
                          type="number"
                          required
                          value={eventForm.seatsTotal}
                          onChange={(e) => setEventForm({ ...eventForm, seatsTotal: Number(e.target.value) })}
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-900 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Fees (₹)</label>
                        <input
                          type="number"
                          required
                          value={eventForm.fees}
                          onChange={(e) => setEventForm({ ...eventForm, fees: Number(e.target.value) })}
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-900 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Banner Image URL</label>
                      <input
                        type="text"
                        value={eventForm.banner}
                        onChange={(e) => setEventForm({ ...eventForm, banner: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-900 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                      />
                    </div>

                    <div className="flex gap-2 justify-end pt-3">
                      <button
                        type="button"
                        onClick={() => setShowEventForm(false)}
                        className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2 px-4 text-xs font-bold transition hover:bg-slate-100"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="rounded-xl bg-brand-600 hover:bg-brand-700 py-2 px-4 text-xs font-bold text-white transition shadow"
                      >
                        {editingEventId ? 'Save Edits' : 'Create Event'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Event tables */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200/50 dark:border-slate-850 bg-white dark:bg-slate-900">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950/40 text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800">
                      <th className="p-4">Event Topic</th>
                      <th className="p-4">Date / Time</th>
                      <th className="p-4">Seats Details</th>
                      <th className="p-4">Fees</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((evt) => (
                      <tr key={evt.id} className="border-b border-slate-100 dark:border-slate-800/80 hover:bg-slate-50/40 dark:hover:bg-slate-950/10">
                        <td className="p-4 font-bold text-slate-900 dark:text-white">{evt.title}</td>
                        <td className="p-4">{evt.date} | {evt.time}</td>
                        <td className="p-4">{evt.seatsAvailable} / {evt.seatsTotal} available</td>
                        <td className="p-4">{evt.fees === 0 ? 'Free' : `₹${evt.fees}`}</td>
                        <td className="p-4 text-right space-x-1.5">
                          <button
                            onClick={() => handleShowAttendees(evt.id)}
                            className="rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 px-2.5 py-1.5 font-bold"
                          >
                            Attendees
                          </button>
                          <button
                            onClick={() => handleEditEventTrigger(evt)}
                            className="rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 px-2.5 py-1.5 font-bold"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(evt.id)}
                            className="rounded-lg bg-red-500/10 hover:bg-red-500/25 text-red-500 px-2 py-1.5 font-bold"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Attendee overlay section if chosen */}
              {selectedEventAttendees && (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 p-5 shadow-sm animate-fade-in-up">
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
                    <h4 className="font-extrabold text-sm text-slate-850 dark:text-white">Attendee Roster</h4>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleExportAttendeeCSV('Event')}
                        className="flex items-center gap-1 text-xs font-bold text-brand-650 hover:text-brand-700 transition"
                      >
                        <Download className="h-4 w-4" />
                        Export CSV
                      </button>
                      <button onClick={() => setSelectedEventAttendees(null)} className="p-1 text-slate-400 hover:text-slate-650">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  {selectedEventAttendees.length === 0 ? (
                    <p className="text-center py-6 text-xs text-slate-400">No attendees have registered for this workshop yet.</p>
                  ) : (
                    <div className="space-y-2.5">
                      {selectedEventAttendees.map((att) => (
                        <div key={att.regId} className="flex justify-between items-center text-xs p-2.5 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800 rounded-xl">
                          <div>
                            <span className="font-bold text-slate-800 dark:text-white block">{att.name}</span>
                            <span className="text-[10px] text-slate-450 block">{att.email} | {att.phone}</span>
                          </div>
                          <span className="text-[10px] text-slate-400">{new Date(att.registeredAt).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: COURSE BUILDER */}
          {activeTab === 'courses' && (
            <div className="space-y-6">
              
              <div className="flex justify-between items-center">
                <h3 className="font-extrabold text-sm text-slate-500 uppercase tracking-wider">Curriculum Catalog</h3>
                <button
                  onClick={() => { setShowCourseForm(!showCourseForm); setEditingCourseId(null); }}
                  className="flex items-center gap-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs py-2 px-3 shadow transition"
                >
                  <Plus className="h-4 w-4" />
                  Add New Course
                </button>
              </div>

              {/* Course creation form */}
              {showCourseForm && (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 p-6 shadow-sm animate-fade-in-up max-w-2xl">
                  <h4 className="font-bold text-slate-800 dark:text-white mb-4">{editingCourseId ? 'Edit Course Catalog Info' : 'Create Course'}</h4>
                  <form onSubmit={handleSaveCourse} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Title</label>
                        <input
                          type="text"
                          required
                          value={courseForm.title}
                          onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-900 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Category</label>
                        <select
                          value={courseForm.category}
                          onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-900 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                        >
                          <option value="Career Prep">Career Prep</option>
                          <option value="Public Speaking">Public Speaking</option>
                          <option value="Leadership">Leadership</option>
                          <option value="Personal Development">Personal Development</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Instructor</label>
                        <input
                          type="text"
                          required
                          value={courseForm.instructor}
                          onChange={(e) => setCourseForm({ ...courseForm, instructor: e.target.value })}
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-900 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Price (₹)</label>
                        <input
                          type="number"
                          required
                          value={courseForm.price}
                          onChange={(e) => setCourseForm({ ...courseForm, price: Number(e.target.value) })}
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-900 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Description</label>
                      <textarea
                        rows={3}
                        required
                        value={courseForm.description}
                        onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-900 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Thumbnail URL</label>
                      <input
                        type="text"
                        value={courseForm.thumbnail}
                        onChange={(e) => setCourseForm({ ...courseForm, thumbnail: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-900 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                      />
                    </div>

                    <div className="flex gap-2 justify-end pt-3">
                      <button
                        type="button"
                        onClick={() => setShowCourseForm(false)}
                        className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2 px-4 text-xs font-bold transition hover:bg-slate-100"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="rounded-xl bg-brand-600 hover:bg-brand-700 py-2 px-4 text-xs font-bold text-white transition shadow"
                      >
                        {editingCourseId ? 'Save Edits' : 'Create Course'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Course List & Chapter Manager */}
              <div className="space-y-4">
                {courses.map((crs) => {
                  const enrollCount = enrollments.filter(e => e.courseId === crs.id).length;
                  return (
                    <div 
                      key={crs.id} 
                      className="rounded-2xl border border-slate-200/50 dark:border-slate-850 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                        <div>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 dark:bg-brand-950/40 px-2 py-0.5 rounded">
                            {crs.category}
                          </span>
                          <h4 className="font-extrabold text-sm text-slate-850 dark:text-white mt-1.5">{crs.title}</h4>
                          <p className="text-[10px] text-slate-400 mt-1">Instructor: {crs.instructor} | Price: ₹{crs.price} | Enrollments: {enrollCount}</p>
                        </div>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => {
                              setCourseForm({
                                id: crs.id, title: crs.title, description: crs.description, price: crs.price, instructor: crs.instructor, category: crs.category, thumbnail: crs.thumbnail, videoTitle: '', videoDuration: '', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4'
                              });
                              setEditingCourseId(crs.id);
                              setShowCourseForm(true);
                            }}
                            className="rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 px-2.5 py-1.5 font-bold"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCourse(crs.id)}
                            className="rounded-lg bg-red-500/10 hover:bg-red-500/25 text-red-500 px-2 py-1.5 font-bold"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Video Chapters section inside */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Video Lessons ({crs.videos.length})</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {crs.videos.map((vid: any, idx: number) => (
                            <div key={vid.id} className="flex justify-between items-center p-2 border border-slate-100 dark:border-slate-800 rounded-xl text-xs bg-slate-50/50 dark:bg-slate-950/20">
                              <span className="truncate max-w-[80%] font-semibold text-slate-700 dark:text-slate-350">{idx + 1}. {vid.title}</span>
                              <span className="text-[10px] text-slate-400">{vid.duration}</span>
                            </div>
                          ))}
                        </div>

                        {/* Add Video Mini Form inline */}
                        <div className="mt-3 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800 p-3.5 rounded-xl space-y-2 max-w-xl">
                          <span className="text-[10px] font-bold text-slate-500 uppercase block">➕ Add Video Chapter Module</span>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <input
                              type="text"
                              placeholder="e.g. 1. Introduction"
                              value={courseForm.videoTitle}
                              onChange={(e) => setCourseForm({ ...courseForm, videoTitle: e.target.value })}
                              className="col-span-2 rounded-lg border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-900 p-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 dark:text-white"
                            />
                            <input
                              type="text"
                              placeholder="e.g. 10:15"
                              value={courseForm.videoDuration}
                              onChange={(e) => setCourseForm({ ...courseForm, videoDuration: e.target.value })}
                              className="rounded-lg border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-900 p-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 dark:text-white"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAddVideoToCourse(crs.id)}
                            className="rounded-lg bg-slate-800 dark:bg-slate-750 text-white font-bold py-1 px-3 text-xs"
                          >
                            Add Module
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* TAB 5: BILLING & LEDGER */}
          {activeTab === 'payments' && (
            <div className="space-y-4">
              <h3 className="font-extrabold text-sm text-slate-500 uppercase tracking-wider">Transaction History Log</h3>
              
              <div className="overflow-x-auto rounded-2xl border border-slate-200/50 dark:border-slate-850 bg-white dark:bg-slate-900">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950/40 text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800">
                      <th className="p-4">User Details</th>
                      <th className="p-4">Purchased Item</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Method</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p.id} className="border-b border-slate-100 dark:border-slate-800/80 hover:bg-slate-50/40 dark:hover:bg-slate-950/10">
                        <td className="p-4 font-bold">
                          {p.userName}
                          <span className="text-[10px] text-slate-400 font-normal block">{p.userEmail}</span>
                        </td>
                        <td className="p-4">
                          <span className="font-semibold block">{p.itemName}</span>
                          <span className="text-[10px] text-slate-400 block capitalize">{p.itemType} | {new Date(p.date).toLocaleDateString()}</span>
                        </td>
                        <td className="p-4 font-bold">₹{p.amount}</td>
                        <td className="p-4">{p.paymentMethod}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-extrabold ${
                            p.status === 'success' 
                              ? 'bg-green-500/10 text-green-600 dark:bg-green-950/20' 
                              : 'bg-red-500/10 text-red-500 dark:bg-red-950/20'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => handleExportInvoice(p)}
                            className="rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 p-1.5 font-bold"
                            title="Download Invoice"
                          >
                            <FileText className="h-3.5 w-3.5" />
                          </button>
                          {p.status === 'success' && (
                            <button
                              onClick={() => handleRefundTransaction(p.id)}
                              className="rounded-lg bg-red-500/10 hover:bg-red-500/25 text-red-500 px-2.5 py-1.5 font-bold"
                            >
                              Refund
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: BROADCASTER */}
          {activeTab === 'notifications' && (
            <div className="rounded-2xl border border-slate-200/50 dark:border-slate-850 bg-white dark:bg-slate-900 p-6 shadow-sm max-w-xl space-y-4">
              <h3 className="font-extrabold text-sm text-slate-500 uppercase tracking-wider mb-2">Compose Global Alert</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Send real-time alerts or reminders directly to student browser sessions.
              </p>
              
              <form onSubmit={handleSendAnnouncement} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Broadcast Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. System Maintenance or Event starting soon!"
                    value={notificationMsg.title}
                    onChange={(e) => setNotificationMsg({ ...notificationMsg, title: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-900 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Notification Body</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Enter message details here..."
                    value={notificationMsg.body}
                    onChange={(e) => setNotificationMsg({ ...notificationMsg, body: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-900 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs py-2.5 px-4 shadow transition"
                >
                  Send Broadcast Notice
                </button>
              </form>
            </div>
          )}

        </main>
      </div>

    </div>
  );
}
