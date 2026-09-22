import React, { useState, useEffect } from 'react';
import { useDatabase } from '../hooks/useDatabase';
import { db, type Registration, type EventCategory, type CampusAmbassador } from '../data/mockDatabase';
import { api } from '../data/api';
import { 
  Users as UsersIcon, Calendar, BookOpen, DollarSign, Plus, Edit, Trash2, 
  Search, ShieldAlert, ArrowLeft, Send, Ban, Check, Download, Landmark, FileText, X, Menu,
  Ticket, Eye, CheckCircle2, XCircle, Image as ImageIcon, ExternalLink,
  Tags, UserCheck, Award, Megaphone, FileSpreadsheet, Settings, Share2, Copy,
  GraduationCap, MapPin, AlertCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts';

interface AdminDashboardProps {
  onLogout: () => void;
  onNavigate: (view: any) => void;
}

export type AdminTab = 
  | 'overview' 
  | 'events' 
  | 'categories' 
  | 'registrations' 
  | 'payments' 
  | 'attendance' 
  | 'certificates' 
  | 'courses' 
  | 'users' 
  | 'ambassadors' 
  | 'marketing' 
  | 'notifications' 
  | 'reports' 
  | 'settings';

export default function AdminDashboard({ onLogout, onNavigate }: AdminDashboardProps) {
  const { currentUser, users, courses, events, enrollments, payments } = useDatabase();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // ----------------------------------------------------
  // Dynamic Categories State
  // ----------------------------------------------------
  const [categories, setCategories] = useState<EventCategory[]>(() => db.getCategories());
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const [newCategoryForm, setNewCategoryForm] = useState({
    name: '',
    description: '',
    icon: 'Sparkles',
    color: '#8b5cf6'
  });

  // ----------------------------------------------------
  // Registrations Management State
  // ----------------------------------------------------
  const [registrations, setRegistrations] = useState<Registration[]>(() => db.getRegistrations());
  const [selectedRegEventId, setSelectedRegEventId] = useState<string>('all');
  const [regSearchTerm, setRegSearchTerm] = useState('');
  const [regStatusFilter, setRegStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [previewScreenshotUrl, setPreviewScreenshotUrl] = useState<string | null>(null);

  // ----------------------------------------------------
  // Attendance State
  // ----------------------------------------------------
  const [attendanceEventId, setAttendanceEventId] = useState<string>('all');
  const [checkInCodeInput, setCheckInCodeInput] = useState('');
  const [checkInFeedback, setCheckInFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // ----------------------------------------------------
  // Certificates State
  // ----------------------------------------------------
  const [certEventId, setCertEventId] = useState<string>('all');

  // ----------------------------------------------------
  // Campus Ambassadors State
  // ----------------------------------------------------
  const [ambassadors, setAmbassadors] = useState<CampusAmbassador[]>(() => db.getAmbassadors());
  const [showAmbassadorModal, setShowAmbassadorModal] = useState(false);
  const [ambassadorSearch, setAmbassadorSearch] = useState('');
  const [newAmbassadorForm, setNewAmbassadorForm] = useState({
    name: '',
    college: '',
    city: 'Hyderabad',
    tier: 'Gold' as 'Gold' | 'Platinum' | 'Diamond',
    points: 1500,
    referralsCount: 10
  });

  // ----------------------------------------------------
  // Marketing State
  // ----------------------------------------------------
  const [marketingEventId, setMarketingEventId] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);

  // ----------------------------------------------------
  // Settings State
  // ----------------------------------------------------
  const [settingsForm, setSettingsForm] = useState({
    orgName: 'COMMUNITY.VA',
    supportEmail: 'community.va01@gmail.com',
    supportPhone: '+91 7416201359',
    upiId: 'padimarriabhiram@oksbi',
    payeeName: 'Abhi Ram',
    upiQrUrl: '/upi-qr.jpg',
    currency: 'INR (₹)',
    autoApproveFreeEvents: true
  });

  // ----------------------------------------------------
  // User Management State
  // ----------------------------------------------------
  const [userSearch, setUserSearch] = useState('');

  // ----------------------------------------------------
  // Event Form State
  // ----------------------------------------------------
  const [eventForm, setEventForm] = useState({
    id: '', 
    title: '', 
    description: '', 
    date: '', 
    time: '18:00 - 20:00', 
    venue: '', 
    fees: 199,
    earlyBirdFee: 149,
    regularFee: 199,
    spotEntryFee: 299,
    qrCode: '/upi-qr.jpg',
    deadline: '',
    seatsTotal: 50, 
    category: 'Workshops', 
    banner: '',
    eventType: 'offline' as 'online' | 'offline' | 'hybrid',
    status: 'published' as 'draft' | 'published' | 'closed'
  });
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventSearch, setEventSearch] = useState('');
  const [eventStatusFilter, setEventStatusFilter] = useState<'all' | 'published' | 'draft' | 'closed'>('all');
  const [eventTypeFilter, setEventTypeFilter] = useState<'all' | 'online' | 'offline' | 'hybrid'>('all');
  const [eventCatFilter, setEventCatFilter] = useState<string>('all');

  // ----------------------------------------------------
  // Course Form State
  // ----------------------------------------------------
  const [courseForm, setCourseForm] = useState({
    id: '', title: '', description: '', price: 29, instructor: '', category: 'Career Prep', thumbnail: '', videoTitle: '', videoDuration: '', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4'
  });
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [showCourseForm, setShowCourseForm] = useState(false);

  // ----------------------------------------------------
  // Notification Broadcast State
  // ----------------------------------------------------
  const [notificationMsg, setNotificationMsg] = useState({ title: '', body: '', target: 'all' });
  const [broadcastLog, setBroadcastLog] = useState<{ id: string; title: string; body: string; date: string; target: string }[]>([
    { id: 'bc_1', title: 'Welcome to COMMUNITY.VA', body: 'Registration is live for all upcoming hackathons and career workshops.', date: new Date().toLocaleDateString(), target: 'All Members' }
  ]);

  // Synchronize on global database events
  useEffect(() => {
    const handleDbSync = () => {
      setRegistrations(db.getRegistrations());
      setCategories(db.getCategories());
      setAmbassadors(db.getAmbassadors());
    };
    window.addEventListener('db-update', handleDbSync);
    return () => window.removeEventListener('db-update', handleDbSync);
  }, []);

  // Set default event for marketing and attendance once loaded
  useEffect(() => {
    if (events.length > 0) {
      if (!marketingEventId) setMarketingEventId(events[0].id);
      if (attendanceEventId === 'all') setAttendanceEventId(events[0].id);
      if (certEventId === 'all') setCertEventId(events[0].id);
    }
  }, [events]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

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

  // ----------------------------------------------------
  // Calculations for Analytics & Reporting
  // ----------------------------------------------------
  const totalUsers = users.length;
  const totalEvents = events.length;
  const activePayments = payments.filter(p => p.status === 'success');
  const totalRevenue = activePayments.reduce((sum, p) => sum + p.amount, 0);
  const totalRegistrations = registrations.length;
  const pendingRegistrationsCount = registrations.filter(r => r.status === 'pending').length;
  const totalAttended = registrations.filter(r => r.attended).length;

  // Chart data: mock revenue timeline
  const revenueChartData = [
    { name: 'Jan', revenue: 1250 },
    { name: 'Feb', revenue: 2320 },
    { name: 'Mar', revenue: 3480 },
    { name: 'Apr', revenue: 4790 },
    { name: 'May', revenue: 6200 },
    { name: 'Jun', revenue: totalRevenue > 0 ? totalRevenue : 7500 },
  ];

  // Sales by Category Chart data
  const salesByCategoryData = categories.slice(0, 6).map(cat => ({
    name: cat.name.length > 10 ? cat.name.substring(0, 10) + '..' : cat.name,
    count: registrations.filter(r => {
      const ev = events.find(e => e.id === r.eventId);
      return ev?.category === cat.name;
    }).length
  }));

  // ----------------------------------------------------
  // User Operations
  // ----------------------------------------------------
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

  // ----------------------------------------------------
  // Event Operations
  // ----------------------------------------------------
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const regularFee = Number(eventForm.regularFee || eventForm.fees || 0);
      const earlyBirdFee = Number(eventForm.earlyBirdFee || 0);
      const spotEntryFee = Number(eventForm.spotEntryFee || 0);

      const eventData = {
        title: eventForm.title,
        description: eventForm.description,
        date: eventForm.date,
        time: eventForm.time,
        venue: eventForm.venue,
        fees: regularFee,
        feesTier: {
          earlyBird: earlyBirdFee,
          regular: regularFee,
          spotEntry: spotEntryFee
        },
        qrCode: eventForm.qrCode || '/upi-qr.jpg',
        deadline: eventForm.deadline || '',
        seatsTotal: Number(eventForm.seatsTotal) || 50,
        category: eventForm.category || 'Workshops',
        banner: eventForm.banner || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800',
        eventType: eventForm.eventType || 'offline',
        status: eventForm.status || 'published'
      };

      if (editingEventId) {
        await api.events.update(editingEventId, eventData);
        triggerToast('Event updated successfully!');
        setEditingEventId(null);
      } else {
        const added = await api.events.add(eventData);
        const currentEvts = db.getEvents();
        if (!currentEvts.some((e: any) => e.id === added.id)) {
          db.saveEvents([added, ...currentEvts]);
        }
        triggerToast('New Event created successfully!');
      }
      window.dispatchEvent(new Event('db-update'));
      setEventForm({ 
        id: '', title: '', description: '', date: '', time: '18:00 - 20:00', venue: '', 
        fees: 199, earlyBirdFee: 149, regularFee: 199, spotEntryFee: 299, 
        qrCode: '/upi-qr.jpg', deadline: '', seatsTotal: 50, category: 'Workshops', banner: '',
        eventType: 'offline', status: 'published'
      });
      setShowEventForm(false);
    } catch (err: any) {
      triggerToast(err.message || 'Failed to save event.');
    }
  };

  const handleEditEventTrigger = (evt: any) => {
    setEventForm({
      id: evt.id, 
      title: evt.title, 
      description: evt.description, 
      date: evt.date, 
      time: evt.time, 
      venue: evt.venue, 
      fees: evt.fees || (evt.feesTier?.regular ?? 0),
      earlyBirdFee: evt.feesTier?.earlyBird ?? 0,
      regularFee: evt.feesTier?.regular ?? evt.fees ?? 0,
      spotEntryFee: evt.feesTier?.spotEntry ?? 0,
      qrCode: evt.qrCode || '/upi-qr.jpg',
      deadline: evt.deadline || '',
      seatsTotal: evt.seatsTotal, 
      category: evt.category, 
      banner: evt.banner || '',
      eventType: evt.eventType || 'offline',
      status: evt.status || 'published'
    });
    setEditingEventId(evt.id);
    setShowEventForm(true);
  };

  const handleDeleteEvent = async (eventId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await api.events.delete(eventId);
      triggerToast(`Event "${title}" deleted.`);
      window.dispatchEvent(new Event('db-update'));
    } catch (err: any) {
      triggerToast(err.message || 'Failed to delete event.');
    }
  };

  // ----------------------------------------------------
  // Category Operations
  // ----------------------------------------------------
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryForm.name.trim()) return;
    try {
      await api.categories.add({
        name: newCategoryForm.name.trim(),
        description: newCategoryForm.description.trim() || 'Exciting events hosted by COMMUNITY.VA',
        icon: newCategoryForm.icon || 'Sparkles',
        color: newCategoryForm.color || '#8b5cf6'
      });
      setCategories(db.getCategories());
      triggerToast(`Category "${newCategoryForm.name}" created!`);
      setNewCategoryForm({ name: '', description: '', icon: 'Sparkles', color: '#8b5cf6' });
      setShowCategoryModal(false);
      window.dispatchEvent(new Event('db-update'));
    } catch (err: any) {
      triggerToast(err.message || 'Failed to add category.');
    }
  };

  const handleDeleteCategory = async (catId: string, catName: string) => {
    if (!window.confirm(`Delete category "${catName}"?`)) return;
    try {
      await api.categories.delete(catId);
      setCategories(db.getCategories());
      triggerToast(`Category "${catName}" removed.`);
      window.dispatchEvent(new Event('db-update'));
    } catch (err: any) {
      triggerToast(err.message || 'Failed to delete category.');
    }
  };

  // ----------------------------------------------------
  // Registration Operations
  // ----------------------------------------------------
  const handleApproveRegistration = async (regId: string) => {
    try {
      await api.events.updateRegistrationStatus(regId, 'approved');
      triggerToast('Registration approved! Seat confirmed.');
      setRegistrations(db.getRegistrations());
      window.dispatchEvent(new Event('db-update'));
    } catch (err: any) {
      triggerToast(err.message || 'Failed to approve registration.');
    }
  };

  const handleRejectRegistration = async (regId: string) => {
    if (!window.confirm('Are you sure you want to reject this registration?')) return;
    try {
      await api.events.updateRegistrationStatus(regId, 'rejected');
      triggerToast('Registration rejected.');
      setRegistrations(db.getRegistrations());
      window.dispatchEvent(new Event('db-update'));
    } catch (err: any) {
      triggerToast(err.message || 'Failed to reject registration.');
    }
  };

  const handleExportRegistrationsCSV = () => {
    const listToExport = registrations.filter(r => {
      if (selectedRegEventId !== 'all' && r.eventId !== selectedRegEventId) return false;
      if (regStatusFilter !== 'all' && r.status !== regStatusFilter) return false;
      if (regSearchTerm) {
        const q = regSearchTerm.toLowerCase();
        return (
          (r.fullName && r.fullName.toLowerCase().includes(q)) ||
          (r.email && r.email.toLowerCase().includes(q)) ||
          (r.phone && r.phone.toLowerCase().includes(q)) ||
          (r.collegeName && r.collegeName.toLowerCase().includes(q)) ||
          (r.branch && r.branch.toLowerCase().includes(q))
        );
      }
      return true;
    });

    if (listToExport.length === 0) {
      alert('No registrations available to export with the current filter.');
      return;
    }

    const targetEvent = selectedRegEventId !== 'all' ? events.find(e => e.id === selectedRegEventId) : null;
    const targetTitle = targetEvent ? targetEvent.title : 'All_Events';

    const headers = [
      'Registration ID',
      'Event Title',
      'Student Name',
      'Email',
      'Phone',
      'College Name',
      'Branch',
      'Year of Study',
      'Pass Tier',
      'Amount Paid (INR)',
      'Status',
      'Attended',
      'Certificate Issued',
      'Registered At'
    ];

    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n";
    listToExport.forEach(r => {
      const evt = events.find(e => e.id === r.eventId);
      const row = [
        `"${r.id}"`,
        `"${(evt ? evt.title : 'N/A').replace(/"/g, '""')}"`,
        `"${(r.fullName || '').replace(/"/g, '""')}"`,
        `"${(r.email || '').replace(/"/g, '""')}"`,
        `"${(r.phone || '').replace(/"/g, '""')}"`,
        `"${(r.collegeName || '').replace(/"/g, '""')}"`,
        `"${(r.branch || '').replace(/"/g, '""')}"`,
        `"${(r.year || '').replace(/"/g, '""')}"`,
        `"${r.passTier || 'Regular'}"`,
        `"${r.amountPaid || 0}"`,
        `"${r.status}"`,
        `"${r.attended ? 'YES' : 'NO'}"`,
        `"${r.certificateIssued ? 'YES' : 'NO'}"`,
        `"${new Date(r.registeredAt).toLocaleDateString()}"`
      ];
      csvContent += row.join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `COMMUNITY_VA_Registrations_${targetTitle.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('Registrations exported to CSV!');
  };

  // ----------------------------------------------------
  // Attendance Operations
  // ----------------------------------------------------
  const handleQuickCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkInCodeInput.trim()) return;
    try {
      const matched = await api.events.checkInByCode(checkInCodeInput.trim());
      setRegistrations(db.getRegistrations());
      setCheckInFeedback({
        message: `Success! ${matched.fullName || 'Attendee'} checked in successfully.`,
        type: 'success'
      });
      setCheckInCodeInput('');
      triggerToast('Attendee checked in!');
      window.dispatchEvent(new Event('db-update'));
      setTimeout(() => setCheckInFeedback(null), 5000);
    } catch (err: any) {
      setCheckInFeedback({
        message: err.message || 'Check-in failed. Please verify code or phone.',
        type: 'error'
      });
      setTimeout(() => setCheckInFeedback(null), 5000);
    }
  };

  const handleToggleAttendance = async (regId: string, currentStatus: boolean) => {
    try {
      await api.events.toggleAttendance(regId, !currentStatus);
      setRegistrations(db.getRegistrations());
      triggerToast(!currentStatus ? 'Marked as Present!' : 'Marked as Absent.');
      window.dispatchEvent(new Event('db-update'));
    } catch (err: any) {
      triggerToast(err.message || 'Failed to update attendance.');
    }
  };

  const handleExportAttendanceCSV = () => {
    const list = registrations.filter(r => attendanceEventId === 'all' || r.eventId === attendanceEventId);
    if (list.length === 0) {
      alert('No attendees found for this event.');
      return;
    }
    const targetEvent = attendanceEventId !== 'all' ? events.find(e => e.id === attendanceEventId) : null;
    const title = targetEvent ? targetEvent.title : 'All_Events';

    let csvContent = "data:text/csv;charset=utf-8,Student Name,Email,Phone,College,Branch,Status,Check-In Time\n";
    list.forEach(r => {
      csvContent += `"${r.fullName}","${r.email}","${r.phone}","${r.collegeName}","${r.branch}","${r.attended ? 'PRESENT' : 'ABSENT'}","${r.attendedAt ? new Date(r.attendedAt).toLocaleString() : 'N/A'}"\n`;
    });
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `Attendance_${title.replace(/\s+/g, '_')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('Attendance sheet exported!');
  };

  // ----------------------------------------------------
  // Certificates Operations
  // ----------------------------------------------------
  const handleIssueSingleCert = async (regId: string) => {
    try {
      const res = await api.events.issueCertificate(regId);
      setRegistrations(db.getRegistrations());
      triggerToast(`Certificate issued! ID: ${res.certificateId}`);
      window.dispatchEvent(new Event('db-update'));
    } catch (err: any) {
      triggerToast(err.message || 'Failed to issue certificate.');
    }
  };

  const handleBatchIssueCertificates = async () => {
    if (certEventId === 'all') {
      alert('Please select a specific event from the dropdown to batch issue certificates.');
      return;
    }
    try {
      const count = await api.events.issueBatchCertificates(certEventId);
      setRegistrations(db.getRegistrations());
      triggerToast(`Batch complete! Issued ${count} new certificates.`);
      window.dispatchEvent(new Event('db-update'));
    } catch (err: any) {
      triggerToast(err.message || 'Batch issue failed.');
    }
  };

  const handleDownloadCertificateCanvas = (cert: { studentName: string; eventTitle: string; date: string; certId: string }) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 1200, 800);

    // Decorative Borders
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 12;
    ctx.strokeRect(30, 30, 1140, 740);

    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 2;
    ctx.strokeRect(45, 45, 1110, 710);

    // Header Badge
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('COMMUNITY.VA', 600, 130);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px sans-serif';
    ctx.fillText('OFFICIAL ACCREDITATION & PARTICIPATION CREDENTIAL', 600, 160);

    // Main Certificate Title
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 46px sans-serif';
    ctx.fillText('CERTIFICATE OF RECOGNITION', 600, 240);

    // Presentation text
    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'italic 18px sans-serif';
    ctx.fillText('This certificate is proudly awarded to', 600, 310);

    // Recipient Name
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 44px sans-serif';
    ctx.fillText(cert.studentName.toUpperCase(), 600, 380);

    // Event description
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '20px sans-serif';
    ctx.fillText('for exceptional participation and successful completion of', 600, 440);

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText(`"${cert.eventTitle}"`, 600, 490);

    // Date & Verification ID
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px sans-serif';
    ctx.fillText(`Presented on: ${cert.date}  |  Verification Code: ${cert.certId}`, 600, 560);

    // Signatures
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(250, 680);
    ctx.lineTo(450, 680);
    ctx.moveTo(750, 680);
    ctx.lineTo(950, 680);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('Abhi Ram', 350, 705);
    ctx.fillText('COMMUNITY.VA Council', 850, 705);

    ctx.fillStyle = '#64748b';
    ctx.font = '12px sans-serif';
    ctx.fillText('Director & Founder', 350, 725);
    ctx.fillText('Official Verification Seal', 850, 725);

    const img = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `Certificate_${cert.studentName.replace(/\s+/g, '_')}_${cert.certId}.png`;
    link.href = img;
    link.click();
    triggerToast('Certificate downloaded as PNG!');
  };

  // ----------------------------------------------------
  // Campus Ambassador Operations
  // ----------------------------------------------------
  const handleAddAmbassador = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAmbassadorForm.name.trim() || !newAmbassadorForm.college.trim()) return;
    const newAmb: CampusAmbassador = {
      id: `amb_${Date.now()}`,
      name: newAmbassadorForm.name.trim(),
      college: newAmbassadorForm.college.trim(),
      city: newAmbassadorForm.city.trim(),
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      points: Number(newAmbassadorForm.points) || 1000,
      referralsCount: Number(newAmbassadorForm.referralsCount) || 5,
      tier: newAmbassadorForm.tier,
      joinedAt: new Date().toISOString().split('T')[0],
      status: 'active'
    };
    const updated = [newAmb, ...ambassadors];
    setAmbassadors(updated);
    db.saveAmbassadors(updated);
    setShowAmbassadorModal(false);
    setNewAmbassadorForm({ name: '', college: '', city: 'Hyderabad', tier: 'Gold', points: 1500, referralsCount: 10 });
    triggerToast('New Campus Ambassador added!');
    window.dispatchEvent(new Event('db-update'));
  };

  const handleExportAmbassadorCSV = () => {
    let csv = "data:text/csv;charset=utf-8,Name,College,City,Tier,Points,Referrals,Status\n";
    ambassadors.forEach(a => {
      csv += `"${a.name}","${a.college}","${a.city}","${a.tier}","${a.points}","${a.referralsCount}","${a.status}"\n`;
    });
    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = `Campus_Ambassadors_Leaderboard.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('Ambassadors exported!');
  };

  // ----------------------------------------------------
  // Course Operations
  // ----------------------------------------------------
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
        triggerToast('New Course created!');
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
      triggerToast('Video module added to course!');
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

  // ----------------------------------------------------
  // Payment Operations & Invoice Export
  // ----------------------------------------------------
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

  const handleExportInvoice = (pay: any) => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 700;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 600, 700);

    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 10;
    ctx.strokeRect(10, 10, 580, 680);

    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(20, 20, 560, 100);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('COMMUNITY.VA INVOICE', 40, 75);

    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(`Receipt ID: ${pay.id}`, 40, 170);
    ctx.fillText(`Date: ${new Date(pay.date).toLocaleDateString()}`, 40, 195);
    ctx.fillText(`Billed To: ${pay.userName}`, 40, 220);
    ctx.fillText(`Email: ${pay.userEmail}`, 40, 240);

    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(40, 280, 520, 30);
    ctx.fillStyle = '#475569';
    ctx.fillText('Description', 50, 300);
    ctx.fillText('Amount', 480, 300);

    ctx.fillStyle = '#0f172a';
    ctx.fillText((pay.itemName || 'COMMUNITY.VA Event Pass').substring(0, 40), 50, 350);
    ctx.fillText(`INR ${pay.amount}`, 480, 350);

    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(40, 380); ctx.lineTo(560, 380); ctx.stroke();

    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('Total Paid:', 380, 420);
    ctx.fillText(`INR ${pay.amount}`, 480, 420);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px sans-serif';
    ctx.fillText('Thank you for choosing COMMUNITY.VA! For support: community.va01@gmail.com | +91 7416201359', 40, 620);
    ctx.fillText('Official payment confirmation receipt.', 40, 640);

    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `Invoice_${pay.id}.png`;
    link.href = image;
    link.click();
    triggerToast('Invoice downloaded.');
  };

  // ----------------------------------------------------
  // Broadcast Operations
  // ----------------------------------------------------
  const handleSendAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notificationMsg.title || !notificationMsg.body) return;

    const newLog = {
      id: `bc_${Date.now()}`,
      title: notificationMsg.title,
      body: notificationMsg.body,
      date: new Date().toLocaleString(),
      target: notificationMsg.target === 'all' ? 'All Members' : (notificationMsg.target === 'events' ? 'Event Attendees' : 'Ambassadors')
    };
    setBroadcastLog([newLog, ...broadcastLog]);
    setNotificationMsg({ title: '', body: '', target: 'all' });
    triggerToast('Broadcast announcement sent to all active sessions!');
  };

  // ----------------------------------------------------
  // Sidebar Menu Items Definition (14 SaaS Tabs)
  // ----------------------------------------------------
  const menuItems: { id: AdminTab; label: string; icon: any; badge?: number }[] = [
    { id: 'overview', label: 'Dashboard', icon: Landmark },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'categories', label: 'Event Categories', icon: Tags },
    { id: 'registrations', label: 'Registrations', icon: Ticket, badge: pendingRegistrationsCount },
    { id: 'payments', label: 'Payments', icon: DollarSign },
    { id: 'attendance', label: 'Attendance', icon: UserCheck },
    { id: 'certificates', label: 'Certificates', icon: Award },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'users', label: 'Users', icon: UsersIcon },
    { id: 'ambassadors', label: 'Campus Ambassadors', icon: GraduationCap },
    { id: 'marketing', label: 'Marketing', icon: Megaphone },
    { id: 'notifications', label: 'Notifications', icon: Send },
    { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // ----------------------------------------------------
  // Filtered Lists
  // ----------------------------------------------------
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredEventsList = events.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(eventSearch.toLowerCase()) || e.venue.toLowerCase().includes(eventSearch.toLowerCase());
    const matchesStatus = eventStatusFilter === 'all' || e.status === eventStatusFilter;
    const matchesType = eventTypeFilter === 'all' || e.eventType === eventTypeFilter;
    const matchesCat = eventCatFilter === 'all' || e.category === eventCatFilter;
    return matchesSearch && matchesStatus && matchesType && matchesCat;
  });

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
    (c.description ? c.description.toLowerCase().includes(categorySearch.toLowerCase()) : false)
  );

  const filteredAmbassadors = ambassadors.filter(a =>
    a.name.toLowerCase().includes(ambassadorSearch.toLowerCase()) ||
    a.college.toLowerCase().includes(ambassadorSearch.toLowerCase()) ||
    a.city.toLowerCase().includes(ambassadorSearch.toLowerCase())
  );

  const activeMarketingEvent = events.find(e => e.id === marketingEventId) || events[0];

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      
      {/* ==================================================== */}
      {/* 14-Tab Admin Sidebar Navigation                      */}
      {/* ==================================================== */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 border-r border-slate-200/60 dark:border-slate-850 bg-white dark:bg-slate-900 transition-transform duration-300 md:translate-x-0 flex flex-col h-full ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Brand Header */}
        <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800 gap-2">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('landing')}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-brand-600 to-red-500 text-white font-black text-sm">VA</div>
            <span className="font-extrabold text-slate-850 dark:text-white">Admin Console</span>
          </div>
          <button className="md:hidden p-1 text-slate-500 hover:text-slate-700" onClick={() => setMobileMenuOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Admin Identity Card */}
        <div className="p-3.5 shrink-0 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
          <div className="flex items-center gap-3">
            <img src={currentUser.profilePhoto} alt={currentUser.name} className="h-9 w-9 rounded-full object-cover ring-2 ring-brand-500/20" />
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate">{currentUser.name}</h4>
              <span className="inline-flex items-center gap-1 rounded bg-brand-100 dark:bg-brand-950/40 px-1.5 py-0.5 text-[9px] font-extrabold text-brand-700 dark:text-brand-400 capitalize">
                Super Admin
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable 14-Module Navigation */}
        <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition ${
                  isActive 
                    ? 'bg-brand-50 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400 shadow-sm border border-brand-200 dark:border-brand-900/50' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="ml-2 rounded-full bg-amber-500 px-1.5 py-0.5 text-[9px] font-extrabold text-white animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Exit Links */}
        <div className="shrink-0 p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
          <button
            onClick={() => { onNavigate('client'); setMobileMenuOpen(false); }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Student Portal
          </button>
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50/20 dark:hover:bg-red-950/10 transition"
          >
            <Ban className="h-4 w-4" />
            Log Out
          </button>
        </div>
      </aside>

      {/* ==================================================== */}
      {/* Main Viewport Content                                */}
      {/* ==================================================== */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        
        {/* Top Header Toolbar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200/50 dark:border-slate-850 bg-white/80 dark:bg-slate-950/80 backdrop-blur px-6">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-1.5 rounded-lg border dark:border-slate-800" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="h-5 w-5 text-slate-650" />
            </button>
            <h2 className="text-base font-black text-slate-900 dark:text-white capitalize flex items-center gap-2">
              <span className="text-brand-600 font-extrabold">ADMIN /</span>
              <span>{menuItems.find(m => m.id === activeTab)?.label || activeTab}</span>
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('events')}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-1.5 px-3 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition flex items-center gap-1.5"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Live Site
            </button>
          </div>
        </header>

        {/* Dynamic Success Toast */}
        {toastMessage && (
          <div className="fixed top-20 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-850 px-4 py-3 text-xs text-white shadow-2xl animate-fade-in-up">
            <Check className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Scrollable Container Content */}
        <main className="flex-1 p-6 overflow-y-auto">

          {/* ==================================================== */}
          {/* TAB 1: DASHBOARD OVERVIEW                            */}
          {/* ==================================================== */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              {/* Metrics cards grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="rounded-2xl border border-slate-200/60 dark:border-slate-850 bg-white dark:bg-slate-900 p-4 shadow-sm">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Members</span>
                  <p className="text-2xl font-black mt-1 text-slate-900 dark:text-white">{totalUsers}</p>
                </div>
                <div className="rounded-2xl border border-slate-200/60 dark:border-slate-850 bg-white dark:bg-slate-900 p-4 shadow-sm">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Events</span>
                  <p className="text-2xl font-black mt-1 text-slate-900 dark:text-white">{totalEvents}</p>
                </div>
                <div className="rounded-2xl border border-slate-200/60 dark:border-slate-850 bg-white dark:bg-slate-900 p-4 shadow-sm">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Registrations</span>
                  <p className="text-2xl font-black mt-1 text-slate-900 dark:text-white">{totalRegistrations}</p>
                </div>
                <div className="rounded-2xl border border-slate-200/60 dark:border-slate-850 bg-white dark:bg-slate-900 p-4 shadow-sm">
                  <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider block">Pending Review</span>
                  <p className="text-2xl font-black mt-1 text-amber-500">{pendingRegistrationsCount}</p>
                </div>
                <div className="rounded-2xl border border-slate-200/60 dark:border-slate-850 bg-white dark:bg-slate-900 p-4 shadow-sm">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Checked In</span>
                  <p className="text-2xl font-black mt-1 text-emerald-500">{totalAttended}</p>
                </div>
                <div className="rounded-2xl border border-slate-200/60 dark:border-slate-850 bg-white dark:bg-slate-900 p-4 shadow-sm">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Revenue</span>
                  <p className="text-2xl font-black mt-1 text-brand-600 dark:text-brand-400">₹{totalRevenue.toFixed(0)}</p>
                </div>
              </div>

              {/* Graphical Insights */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-slate-200/60 dark:border-slate-850 bg-white dark:bg-slate-900 p-5 shadow-sm">
                  <h3 className="font-extrabold text-slate-800 dark:text-white text-sm mb-4">Revenue Growth (₹)</h3>
                  <div className="h-60">
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

                <div className="rounded-2xl border border-slate-200/60 dark:border-slate-850 bg-white dark:bg-slate-900 p-5 shadow-sm">
                  <h3 className="font-extrabold text-slate-800 dark:text-white text-sm mb-4">Registrations by Category</h3>
                  <div className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={salesByCategoryData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                        <XAxis dataKey="name" stroke="#6b7280" fontSize={10} />
                        <YAxis stroke="#6b7280" fontSize={11} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Quick Action Hub */}
              <div className="rounded-2xl border border-slate-200/60 dark:border-slate-850 bg-white dark:bg-slate-900 p-5 shadow-sm">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-3">Quick Navigation Hub</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button 
                    onClick={() => { setShowEventForm(true); setActiveTab('events'); }}
                    className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-850 hover:border-brand-500 transition text-left text-xs font-bold"
                  >
                    <Plus className="h-4 w-4 text-brand-600" />
                    <span>Create Event</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('registrations')}
                    className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-850 hover:border-brand-500 transition text-left text-xs font-bold"
                  >
                    <Ticket className="h-4 w-4 text-amber-500" />
                    <span>Review Registrations ({pendingRegistrationsCount})</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('attendance')}
                    className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-850 hover:border-brand-500 transition text-left text-xs font-bold"
                  >
                    <UserCheck className="h-4 w-4 text-emerald-500" />
                    <span>QR Attendance Check-In</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('categories')}
                    className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-850 hover:border-brand-500 transition text-left text-xs font-bold"
                  >
                    <Tags className="h-4 w-4 text-violet-500" />
                    <span>Manage Categories ({categories.length})</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 2: EVENTS CONSTRUCTOR & MANAGEMENT               */}
          {/* ==================================================== */}
          {activeTab === 'events' && (
            <div className="space-y-5 animate-fade-in">
              {/* Header and Controls */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Event Constructor</h3>
                  <p className="text-xs text-slate-400">Create, edit, organize categories and configure multi-tier ticketing.</p>
                </div>
                <button
                  onClick={() => {
                    setEditingEventId(null);
                    setEventForm({
                      id: '', title: '', description: '', date: '', time: '18:00 - 20:00', venue: '', 
                      fees: 199, earlyBirdFee: 149, regularFee: 199, spotEntryFee: 299, 
                      qrCode: '/upi-qr.jpg', deadline: '', seatsTotal: 50, category: 'Workshops', banner: '',
                      eventType: 'offline', status: 'published'
                    });
                    setShowEventForm(true);
                  }}
                  className="flex items-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs py-2.5 px-4 shadow transition"
                >
                  <Plus className="h-4 w-4" />
                  Create New Event
                </button>
              </div>

              {/* Filters Toolbar */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-850 shadow-sm">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search events..."
                    value={eventSearch}
                    onChange={(e) => setEventSearch(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-850 py-2 pl-9 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                  />
                </div>
                <div>
                  <select
                    value={eventCatFilter}
                    onChange={(e) => setEventCatFilter(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-850 py-2 px-3 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="all">All Categories ({categories.length})</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <select
                    value={eventTypeFilter}
                    onChange={(e) => setEventTypeFilter(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-850 py-2 px-3 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="all">All Types (Online/Offline)</option>
                    <option value="offline">Offline Events</option>
                    <option value="online">Online Events</option>
                    <option value="hybrid">Hybrid Events</option>
                  </select>
                </div>
                <div>
                  <select
                    value={eventStatusFilter}
                    onChange={(e) => setEventStatusFilter(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-850 py-2 px-3 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              {/* Event Creation & Edit Modal */}
              {showEventForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                  <div className="relative max-w-2xl w-full bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-850 overflow-y-auto max-h-[90vh]">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                      <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                        {editingEventId ? 'Edit Event Details' : 'Construct New Event'}
                      </h4>
                      <button onClick={() => setShowEventForm(false)} className="p-1 text-slate-400 hover:text-white">
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveEvent} className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Event Name</label>
                        <input
                          type="text"
                          required
                          value={eventForm.title}
                          onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-900 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                          placeholder="e.g. Masterclass on AI & Technical Leadership"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Category</label>
                          <select
                            value={eventForm.category}
                            onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                            className="w-full rounded-lg border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-900 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                          >
                            {categories.map(c => (
                              <option key={c.id} value={c.name}>{c.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Event Type</label>
                          <select
                            value={eventForm.eventType}
                            onChange={(e) => setEventForm({ ...eventForm, eventType: e.target.value as any })}
                            className="w-full rounded-lg border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-900 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                          >
                            <option value="offline">Offline (In-Person)</option>
                            <option value="online">Online (Virtual)</option>
                            <option value="hybrid">Hybrid</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Publish Status</label>
                          <select
                            value={eventForm.status}
                            onChange={(e) => setEventForm({ ...eventForm, status: e.target.value as any })}
                            className="w-full rounded-lg border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-900 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                          >
                            <option value="published">Published (Live)</option>
                            <option value="draft">Draft (Hidden)</option>
                            <option value="closed">Closed (Sold Out)</option>
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
                          placeholder="Comprehensive details about agenda, eligibility, and learning outcomes..."
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Venue / Platform</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Tech Hub Auditorium or Google Meet"
                            value={eventForm.venue}
                            onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                            className="w-full rounded-lg border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-900 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Max Seats</label>
                            <input
                              type="number"
                              required
                              min="1"
                              value={eventForm.seatsTotal}
                              onChange={(e) => setEventForm({ ...eventForm, seatsTotal: Number(e.target.value) })}
                              className="w-full rounded-lg border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-900 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Reg. Deadline</label>
                            <input
                              type="date"
                              value={eventForm.deadline}
                              onChange={(e) => setEventForm({ ...eventForm, deadline: e.target.value })}
                              className="w-full rounded-lg border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-900 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Entry Fee Tiers */}
                      <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-950/20">
                        <span className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Entry Fee Tiers (₹ INR)</span>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Early Bird Fee</label>
                            <input
                              type="number"
                              min="0"
                              value={eventForm.earlyBirdFee}
                              onChange={(e) => setEventForm({ ...eventForm, earlyBirdFee: Number(e.target.value) })}
                              className="w-full rounded-lg border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-900 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Regular Fee (Standard)</label>
                            <input
                              type="number"
                              min="0"
                              required
                              value={eventForm.regularFee}
                              onChange={(e) => setEventForm({ ...eventForm, regularFee: Number(e.target.value), fees: Number(e.target.value) })}
                              className="w-full rounded-lg border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-900 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Spot Entry Fee</label>
                            <input
                              type="number"
                              min="0"
                              value={eventForm.spotEntryFee}
                              onChange={(e) => setEventForm({ ...eventForm, spotEntryFee: Number(e.target.value) })}
                              className="w-full rounded-lg border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-900 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Banner & UPI QR URL */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Event Banner Image URL</label>
                          <input
                            type="text"
                            placeholder="https://images.unsplash.com/..."
                            value={eventForm.banner}
                            onChange={(e) => setEventForm({ ...eventForm, banner: e.target.value })}
                            className="w-full rounded-lg border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-900 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">UPI QR Code Image (Default: Abhi Ram GPay)</label>
                          <input
                            type="text"
                            value={eventForm.qrCode}
                            onChange={(e) => setEventForm({ ...eventForm, qrCode: e.target.value })}
                            className="w-full rounded-lg border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-900 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={() => setShowEventForm(false)}
                          className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2 px-4 text-xs font-bold transition hover:bg-slate-100"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="rounded-xl bg-brand-600 hover:bg-brand-700 py-2 px-5 text-xs font-bold text-white transition shadow"
                        >
                          {editingEventId ? 'Save Edits' : 'Publish Event'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Event Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredEventsList.map(evt => {
                  const regCount = registrations.filter(r => r.eventId === evt.id).length;
                  const fillPercent = Math.min(100, Math.round((regCount / (evt.seatsTotal || 50)) * 100));

                  return (
                    <div key={evt.id} className="rounded-2xl border border-slate-200/60 dark:border-slate-850 bg-white dark:bg-slate-900 overflow-hidden shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="relative h-36 w-full bg-slate-800 overflow-hidden">
                          <img src={evt.banner} alt={evt.title} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                          <div className="absolute top-2 left-2 flex gap-1.5 flex-wrap">
                            <span className="rounded-lg bg-black/60 backdrop-blur px-2 py-0.5 text-[10px] font-bold text-white">
                              {evt.category}
                            </span>
                            <span className={`rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase ${
                              evt.status === 'published' ? 'bg-emerald-500/90 text-white' : (evt.status === 'draft' ? 'bg-amber-500/90 text-white' : 'bg-slate-700 text-slate-300')
                            }`}>
                              {evt.status || 'published'}
                            </span>
                          </div>
                          <span className="absolute top-2 right-2 rounded-lg bg-brand-600/90 px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                            {evt.eventType || 'offline'}
                          </span>
                          <div className="absolute bottom-2 left-3 right-3">
                            <h4 className="font-extrabold text-sm text-white truncate">{evt.title}</h4>
                            <p className="text-[10px] text-slate-300 flex items-center gap-1 mt-0.5">
                              <Calendar className="h-3 w-3" /> {new Date(evt.date).toLocaleDateString()} • {evt.time}
                            </p>
                          </div>
                        </div>

                        <div className="p-4 space-y-3">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400 flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> {evt.venue}
                            </span>
                            <span className="font-extrabold text-brand-600 dark:text-brand-400">
                              ₹{evt.feesTier?.regular || evt.fees || 0}
                            </span>
                          </div>

                          {/* Capacity fill meter */}
                          <div>
                            <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1">
                              <span>Seats: {regCount} / {evt.seatsTotal} filled</span>
                              <span>{fillPercent}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: `${fillPercent}%` }} />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between gap-2 mt-2">
                        <div className="flex gap-1">
                          <button
                            onClick={() => { setSelectedRegEventId(evt.id); setActiveTab('registrations'); }}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold flex items-center gap-1"
                            title="View Registrations"
                          >
                            <Ticket className="h-3.5 w-3.5" />
                            <span>{regCount}</span>
                          </button>
                          <button
                            onClick={() => { setMarketingEventId(evt.id); setActiveTab('marketing'); }}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold flex items-center gap-1"
                            title="Share & Marketing"
                          >
                            <Share2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleEditEventTrigger(evt)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200"
                            title="Edit Event"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(evt.id, evt.title)}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500"
                            title="Delete Event"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 3: EVENT CATEGORIES (17+ Categories & Custom)     */}
          {/* ==================================================== */}
          {activeTab === 'categories' && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Event Categories ({categories.length})</h3>
                  <p className="text-xs text-slate-400">All 17 standard operational categories plus custom categories created by admin.</p>
                </div>
                <button
                  onClick={() => setShowCategoryModal(true)}
                  className="flex items-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs py-2.5 px-4 shadow transition"
                >
                  <Plus className="h-4 w-4" />
                  Add Custom Category
                </button>
              </div>

              {/* Category Search */}
              <div className="max-w-md relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-900 py-2 pl-9 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                />
              </div>

              {/* Add Category Modal */}
              {showCategoryModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                  <div className="relative max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-850">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Create New Event Category</h4>
                      <button onClick={() => setShowCategoryModal(false)} className="p-1 text-slate-400 hover:text-white">
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <form onSubmit={handleAddCategory} className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Category Name</label>
                        <input
                          type="text"
                          required
                          value={newCategoryForm.name}
                          onChange={(e) => setNewCategoryForm({ ...newCategoryForm, name: e.target.value })}
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-900 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                          placeholder="e.g. AI Hackathons"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Description</label>
                        <textarea
                          rows={2}
                          value={newCategoryForm.description}
                          onChange={(e) => setNewCategoryForm({ ...newCategoryForm, description: e.target.value })}
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-900 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                          placeholder="Brief description of events in this category..."
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Icon Style</label>
                          <select
                            value={newCategoryForm.icon}
                            onChange={(e) => setNewCategoryForm({ ...newCategoryForm, icon: e.target.value })}
                            className="w-full rounded-lg border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-900 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                          >
                            <option value="Sparkles">Sparkles ✨</option>
                            <option value="Users">Users 👥</option>
                            <option value="Trophy">Trophy 🏆</option>
                            <option value="Calendar">Calendar 📅</option>
                            <option value="Rocket">Rocket 🚀</option>
                            <option value="Briefcase">Briefcase 💼</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Color Theme</label>
                          <select
                            value={newCategoryForm.color}
                            onChange={(e) => setNewCategoryForm({ ...newCategoryForm, color: e.target.value })}
                            className="w-full rounded-lg border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-900 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                          >
                            <option value="#8b5cf6">Purple / Violet</option>
                            <option value="#3b82f6">Blue</option>
                            <option value="#10b981">Emerald Green</option>
                            <option value="#f59e0b">Amber Gold</option>
                            <option value="#ef4444">Rose Red</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex gap-2 justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={() => setShowCategoryModal(false)}
                          className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2 px-4 text-xs font-bold transition hover:bg-slate-100"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="rounded-xl bg-brand-600 hover:bg-brand-700 py-2 px-4 text-xs font-bold text-white transition shadow"
                        >
                          Save Category
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Categories Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
                {filteredCategories.map(cat => {
                  const eventCount = events.filter(e => e.category === cat.name).length;

                  return (
                    <div 
                      key={cat.id} 
                      className="rounded-2xl border border-slate-200/60 dark:border-slate-850 bg-white dark:bg-slate-900 p-4 shadow-sm flex flex-col justify-between hover:border-brand-500/50 transition group"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div 
                            className="h-8 w-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm"
                            style={{ backgroundColor: cat.color || '#8b5cf6' }}
                          >
                            <Tags className="h-4 w-4" />
                          </div>
                          <div className="flex items-center gap-1">
                            {cat.isCustom ? (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500">
                                Custom
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400">
                                Official
                              </span>
                            )}
                            {cat.isCustom && (
                              <button
                                onClick={() => handleDeleteCategory(cat.id, cat.name)}
                                className="p-1 text-slate-400 hover:text-red-500 transition"
                                title="Delete Custom Category"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-brand-600 transition">
                          {cat.name}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                          {cat.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                        <span className="text-slate-500 text-[10px] font-bold">
                          {eventCount} {eventCount === 1 ? 'Event' : 'Events'}
                        </span>
                        <button
                          onClick={() => {
                            setEventForm({
                              ...eventForm,
                              category: cat.name
                            });
                            setActiveTab('events');
                            setShowEventForm(true);
                          }}
                          className="text-[10px] font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                        >
                          + New Event
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 4: REGISTRATIONS MANAGEMENT                     */}
          {/* ==================================================== */}
          {activeTab === 'registrations' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Registrations Review</h3>
                  <p className="text-xs text-slate-400">Verify student UPI payment receipts, confirm ticket passes, or reject invalid entries.</p>
                </div>
                <button
                  onClick={handleExportRegistrationsCSV}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2 px-3.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition shadow-sm"
                >
                  <Download className="h-3.5 w-3.5" />
                  Export Roster (CSV)
                </button>
              </div>

              {/* Status Counters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div 
                  onClick={() => setRegStatusFilter('all')}
                  className={`cursor-pointer rounded-xl border p-3 transition ${regStatusFilter === 'all' ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/20' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'}`}
                >
                  <p className="text-[10px] font-bold uppercase text-slate-400">Total Entries</p>
                  <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                    {registrations.filter(r => selectedRegEventId === 'all' || r.eventId === selectedRegEventId).length}
                  </p>
                </div>
                <div 
                  onClick={() => setRegStatusFilter('pending')}
                  className={`cursor-pointer rounded-xl border p-3 transition ${regStatusFilter === 'pending' ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'}`}
                >
                  <p className="text-[10px] font-bold uppercase text-amber-500">Pending Review</p>
                  <p className="text-lg font-black text-amber-600 dark:text-amber-400 mt-0.5">
                    {registrations.filter(r => (selectedRegEventId === 'all' || r.eventId === selectedRegEventId) && r.status === 'pending').length}
                  </p>
                </div>
                <div 
                  onClick={() => setRegStatusFilter('approved')}
                  className={`cursor-pointer rounded-xl border p-3 transition ${regStatusFilter === 'approved' ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'}`}
                >
                  <p className="text-[10px] font-bold uppercase text-emerald-500">Approved</p>
                  <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {registrations.filter(r => (selectedRegEventId === 'all' || r.eventId === selectedRegEventId) && r.status === 'approved').length}
                  </p>
                </div>
                <div 
                  onClick={() => setRegStatusFilter('rejected')}
                  className={`cursor-pointer rounded-xl border p-3 transition ${regStatusFilter === 'rejected' ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'}`}
                >
                  <p className="text-[10px] font-bold uppercase text-rose-500">Rejected</p>
                  <p className="text-lg font-black text-rose-600 dark:text-rose-400 mt-0.5">
                    {registrations.filter(r => (selectedRegEventId === 'all' || r.eventId === selectedRegEventId) && r.status === 'rejected').length}
                  </p>
                </div>
              </div>

              {/* Filters Bar: Event Select + Search */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-850 shadow-sm">
                <div className="flex flex-1 flex-col sm:flex-row items-center gap-3">
                  <div className="w-full sm:w-64">
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Filter by Event</label>
                    <select
                      value={selectedRegEventId}
                      onChange={(e) => setSelectedRegEventId(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-850 py-2 px-3 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      <option value="all">All Events ({registrations.length})</option>
                      {events.map((evt) => {
                        const count = registrations.filter(r => r.eventId === evt.id).length;
                        return (
                          <option key={evt.id} value={evt.id}>
                            {evt.title} ({count})
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="w-full sm:flex-1">
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Search Registrant</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search student name, email, phone, college..."
                        value={regSearchTerm}
                        onChange={(e) => setRegSearchTerm(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-850 py-2 pl-9 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 pt-2 md:pt-4 overflow-x-auto">
                  {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setRegStatusFilter(status)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition ${
                        regStatusFilter === status
                          ? 'bg-brand-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Registrations Table */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950/40 text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800">
                        <th className="p-4">Student Details</th>
                        <th className="p-4">College & Branch</th>
                        <th className="p-4">Event</th>
                        <th className="p-4">Pass & Fee</th>
                        <th className="p-4">Receipt Proof</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const filtered = registrations.filter(r => {
                          if (selectedRegEventId !== 'all' && r.eventId !== selectedRegEventId) return false;
                          if (regStatusFilter !== 'all' && r.status !== regStatusFilter) return false;
                          if (regSearchTerm) {
                            const q = regSearchTerm.toLowerCase();
                            return (
                              (r.fullName && r.fullName.toLowerCase().includes(q)) ||
                              (r.email && r.email.toLowerCase().includes(q)) ||
                              (r.phone && r.phone.toLowerCase().includes(q)) ||
                              (r.collegeName && r.collegeName.toLowerCase().includes(q)) ||
                              (r.branch && r.branch.toLowerCase().includes(q))
                            );
                          }
                          return true;
                        });

                        if (filtered.length === 0) {
                          return (
                            <tr>
                              <td colSpan={7} className="p-8 text-center text-slate-400">
                                <Ticket className="h-8 w-8 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
                                <p className="font-semibold">No registrations found</p>
                                <p className="text-[11px] mt-0.5">Try clearing filters or search criteria.</p>
                              </td>
                            </tr>
                          );
                        }

                        return filtered.map((reg) => {
                          const evt = events.find(e => e.id === reg.eventId);
                          return (
                            <tr key={reg.id} className="border-b border-slate-100 dark:border-slate-800/80 hover:bg-slate-50/40 dark:hover:bg-slate-950/10">
                              <td className="p-4">
                                <p className="font-bold text-slate-900 dark:text-white">{reg.fullName || 'Anonymous'}</p>
                                <p className="text-[11px] text-slate-500">{reg.email}</p>
                                <p className="text-[10px] text-slate-400">{reg.phone || 'No phone'}</p>
                              </td>
                              <td className="p-4">
                                <p className="font-semibold text-slate-800 dark:text-slate-200">{reg.collegeName || 'N/A'}</p>
                                <p className="text-[10px] text-slate-400">{reg.branch || 'Branch'} • Year {reg.year || 'N/A'}</p>
                              </td>
                              <td className="p-4 max-w-xs">
                                <p className="font-bold text-slate-850 dark:text-slate-200 truncate">{evt ? evt.title : 'Event ID: ' + reg.eventId}</p>
                                <p className="text-[10px] text-slate-400">{evt ? `${new Date(evt.date).toLocaleDateString()}` : ''}</p>
                              </td>
                              <td className="p-4">
                                <span className="inline-block rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:text-slate-300 capitalize mb-0.5">
                                  {reg.passTier || 'Regular'}
                                </span>
                                <p className="font-black text-brand-600 dark:text-brand-400 text-xs">₹{reg.amountPaid || 0}</p>
                              </td>
                              <td className="p-4">
                                {reg.paymentScreenshot ? (
                                  <button
                                    onClick={() => setPreviewScreenshotUrl(reg.paymentScreenshot || null)}
                                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-750 px-2.5 py-1 text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:bg-brand-50/50 dark:hover:bg-brand-950/30 transition"
                                  >
                                    <Eye className="h-3.5 w-3.5" />
                                    <span>View Proof</span>
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-slate-400 italic">No upload</span>
                                )}
                              </td>
                              <td className="p-4">
                                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold capitalize ${
                                  reg.status === 'approved'
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-950/20'
                                    : reg.status === 'rejected'
                                    ? 'bg-rose-500/10 text-rose-500 dark:bg-rose-950/20'
                                    : 'bg-amber-500/10 text-amber-500 dark:bg-amber-950/20 animate-pulse'
                                }`}>
                                  {reg.status}
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {reg.status !== 'approved' && (
                                    <button
                                      onClick={() => handleApproveRegistration(reg.id)}
                                      className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white p-1.5 font-bold transition"
                                      title="Approve & Confirm Seat"
                                    >
                                      <CheckCircle2 className="h-4 w-4" />
                                    </button>
                                  )}
                                  {reg.status !== 'rejected' && (
                                    <button
                                      onClick={() => handleRejectRegistration(reg.id)}
                                      className="rounded-lg bg-rose-500/10 hover:bg-rose-500/25 text-rose-500 p-1.5 font-bold transition"
                                      title="Reject Registration"
                                    >
                                      <XCircle className="h-4 w-4" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 5: BILLING & LEDGER (Payments)                   */}
          {/* ==================================================== */}
          {activeTab === 'payments' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Payments & Ledger</h3>
                  <p className="text-xs text-slate-400">Real-time payment logs, simulated Razorpay receipts, and instant refund processing.</p>
                </div>
              </div>

              {/* Revenue Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-2xl border border-slate-200/60 dark:border-slate-850 bg-white dark:bg-slate-900 p-4 shadow-sm">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Total Confirmed Revenue</p>
                  <p className="text-2xl font-black text-brand-600 dark:text-brand-400 mt-1">₹{totalRevenue.toFixed(2)}</p>
                </div>
                <div className="rounded-2xl border border-slate-200/60 dark:border-slate-850 bg-white dark:bg-slate-900 p-4 shadow-sm">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Successful Transactions</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{activePayments.length}</p>
                </div>
                <div className="rounded-2xl border border-slate-200/60 dark:border-slate-850 bg-white dark:bg-slate-900 p-4 shadow-sm">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Default UPI Beneficiary</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white mt-1">padimarriabhiram@oksbi</p>
                  <span className="text-[10px] text-emerald-500 font-bold">Abhi Ram (Google Pay Verified)</span>
                </div>
              </div>

              {/* Transactions Ledger Table */}
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
                        <td className="p-4 font-bold text-slate-900 dark:text-white">₹{p.amount}</td>
                        <td className="p-4">{p.paymentMethod}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-extrabold capitalize ${
                            p.status === 'success' 
                              ? 'bg-green-500/10 text-green-600 dark:bg-green-950/20' 
                              : (p.status === 'pending' ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500 dark:bg-red-950/20')
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

          {/* ==================================================== */}
          {/* TAB 6: ATTENDANCE MANAGEMENT (QR & Manual Check-in)  */}
          {/* ==================================================== */}
          {activeTab === 'attendance' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Attendance System</h3>
                  <p className="text-xs text-slate-400">Scan event ticket QR codes, search ticket ID, and toggle student presence in real time.</p>
                </div>
                <button
                  onClick={handleExportAttendanceCSV}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2 px-3.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition shadow-sm"
                >
                  <Download className="h-3.5 w-3.5" />
                  Export Attendance Sheet
                </button>
              </div>

              {/* Event Selector & Live Check-In Form */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-1 rounded-2xl border border-slate-200/60 dark:border-slate-850 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Select Event</label>
                    <select
                      value={attendanceEventId}
                      onChange={(e) => setAttendanceEventId(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-850 py-2.5 px-3 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      <option value="all">All Events</option>
                      {events.map(e => (
                        <option key={e.id} value={e.id}>{e.title}</option>
                      ))}
                    </select>
                  </div>

                  {/* Real-time event statistics */}
                  {(() => {
                    const attendees = registrations.filter(r => attendanceEventId === 'all' || r.eventId === attendanceEventId);
                    const present = attendees.filter(r => r.attended).length;
                    const percent = attendees.length > 0 ? Math.round((present / attendees.length) * 100) : 0;

                    return (
                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-500">Attendance Rate</span>
                          <span className="font-black text-emerald-500">{percent}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${percent}%` }} />
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400 font-bold pt-1">
                          <span>Total Confirmed: {attendees.length}</span>
                          <span>Present: {present}</span>
                          <span>Absent: {attendees.length - present}</span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Quick Check-In Input Box */}
                  <form onSubmit={handleQuickCheckIn} className="space-y-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase">
                      Ticket ID / Phone / QR Code Check-In
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Scan or enter ID (e.g. reg_... or phone)"
                        value={checkInCodeInput}
                        onChange={(e) => setCheckInCodeInput(e.target.value)}
                        className="flex-1 rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-850 py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                      />
                      <button
                        type="submit"
                        className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 shadow transition"
                      >
                        Check In
                      </button>
                    </div>

                    {checkInFeedback && (
                      <div className={`p-2.5 rounded-lg text-xs font-bold flex items-center gap-2 ${
                        checkInFeedback.type === 'success' 
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                          : 'bg-red-500/10 text-red-500 border border-red-500/20'
                      }`}>
                        {checkInFeedback.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                        <span>{checkInFeedback.message}</span>
                      </div>
                    )}
                  </form>
                </div>

                {/* Attendee Roster with Real-Time Toggles */}
                <div className="lg:col-span-2 rounded-2xl border border-slate-200/60 dark:border-slate-850 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Live Attendee Roster</h4>
                    <span className="text-[10px] text-slate-400 font-bold">
                      Click switch to toggle Present / Absent
                    </span>
                  </div>

                  <div className="overflow-x-auto max-h-[500px]">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="sticky top-0 bg-slate-50 dark:bg-slate-950 text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800">
                        <tr>
                          <th className="p-3.5">Attendee</th>
                          <th className="p-3.5">College</th>
                          <th className="p-3.5">Ticket Code</th>
                          <th className="p-3.5">Status</th>
                          <th className="p-3.5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const attendees = registrations.filter(r => attendanceEventId === 'all' || r.eventId === attendanceEventId);
                          if (attendees.length === 0) {
                            return (
                              <tr>
                                <td colSpan={5} className="p-8 text-center text-slate-400">
                                  No attendees registered for this event yet.
                                </td>
                              </tr>
                            );
                          }

                          return attendees.map(att => (
                            <tr key={att.id} className="border-b border-slate-100 dark:border-slate-800/70 hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                              <td className="p-3.5 font-bold">
                                {att.fullName}
                                <span className="block text-[10px] text-slate-400 font-normal">{att.email}</span>
                              </td>
                              <td className="p-3.5 text-slate-600 dark:text-slate-300">
                                {att.collegeName || 'N/A'}
                                <span className="block text-[10px] text-slate-400">{att.branch}</span>
                              </td>
                              <td className="p-3.5 font-mono text-[11px] text-brand-600 dark:text-brand-400">
                                {att.checkInCode || att.id.substring(0, 10)}
                              </td>
                              <td className="p-3.5">
                                {att.attended ? (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:bg-emerald-950/30 px-2 py-0.5 text-[10px] font-bold">
                                    <Check className="h-3 w-3" /> Present
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 px-2 py-0.5 text-[10px] font-bold">
                                    Absent
                                  </span>
                                )}
                              </td>
                              <td className="p-3.5 text-right">
                                <button
                                  onClick={() => handleToggleAttendance(att.id, !!att.attended)}
                                  className={`rounded-xl px-3 py-1 text-xs font-bold transition shadow-sm ${
                                    att.attended 
                                      ? 'bg-slate-100 dark:bg-slate-800 hover:bg-red-50 text-slate-700 dark:text-slate-300 hover:text-red-600' 
                                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                  }`}
                                >
                                  {att.attended ? 'Mark Absent' : 'Mark Present'}
                                </button>
                              </td>
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 7: CERTIFICATES STUDIO & ISSUANCE               */}
          {/* ==================================================== */}
          {activeTab === 'certificates' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Certificates Studio</h3>
                  <p className="text-xs text-slate-400">Issue official branded credentials to attendees and generate high-resolution PNGs.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleBatchIssueCertificates}
                    className="flex items-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs py-2 px-4 shadow transition"
                  >
                    <Award className="h-4 w-4" />
                    Batch Issue All Present
                  </button>
                </div>
              </div>

              {/* Event Filter & Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-850 shadow-sm">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Select Event to Issue Certificates</label>
                  <select
                    value={certEventId}
                    onChange={(e) => setCertEventId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-850 py-2 px-3 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="all">Select an Event...</option>
                    {events.map(e => (
                      <option key={e.id} value={e.id}>{e.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Total Issued</p>
                  <p className="text-xl font-black text-emerald-500 mt-1">
                    {registrations.filter(r => (certEventId === 'all' || r.eventId === certEventId) && r.certificateIssued).length}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Pending Eligible</p>
                  <p className="text-xl font-black text-amber-500 mt-1">
                    {registrations.filter(r => (certEventId === 'all' || r.eventId === certEventId) && r.attended && !r.certificateIssued).length}
                  </p>
                </div>
              </div>

              {/* Certificate Table */}
              <div className="rounded-2xl border border-slate-200/50 dark:border-slate-850 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950/40 text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800">
                        <th className="p-4">Student</th>
                        <th className="p-4">College</th>
                        <th className="p-4">Attended?</th>
                        <th className="p-4">Certificate ID</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const targetList = registrations.filter(r => certEventId === 'all' || r.eventId === certEventId);
                        if (targetList.length === 0) {
                          return (
                            <tr>
                              <td colSpan={6} className="p-8 text-center text-slate-400">
                                Please select an event to manage certificates.
                              </td>
                            </tr>
                          );
                        }

                        return targetList.map(r => {
                          const evt = events.find(e => e.id === r.eventId);
                          const title = evt ? evt.title : 'COMMUNITY.VA Event';
                          const date = evt ? new Date(evt.date).toLocaleDateString() : '2026';

                          return (
                            <tr key={r.id} className="border-b border-slate-100 dark:border-slate-800/80 hover:bg-slate-50/40 dark:hover:bg-slate-950/10">
                              <td className="p-4 font-bold">
                                {r.fullName}
                                <span className="block text-[10px] text-slate-400 font-normal">{r.email}</span>
                              </td>
                              <td className="p-4 text-slate-600 dark:text-slate-300">{r.collegeName || 'N/A'}</td>
                              <td className="p-4">
                                {r.attended ? (
                                  <span className="text-emerald-500 font-bold">Yes (Present)</span>
                                ) : (
                                  <span className="text-slate-400">No</span>
                                )}
                              </td>
                              <td className="p-4 font-mono text-[11px] text-brand-600 dark:text-brand-400">
                                {r.certificateId || '—'}
                              </td>
                              <td className="p-4">
                                {r.certificateIssued ? (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:bg-emerald-950/30 px-2.5 py-0.5 text-[10px] font-bold">
                                    <Check className="h-3 w-3" /> Issued
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-400">Not Issued</span>
                                )}
                              </td>
                              <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                                {!r.certificateIssued ? (
                                  <button
                                    onClick={() => handleIssueSingleCert(r.id)}
                                    className="rounded-lg bg-brand-600 hover:bg-brand-700 text-white px-2.5 py-1 text-xs font-bold shadow transition"
                                  >
                                    Issue
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleDownloadCertificateCanvas({
                                      studentName: r.fullName || 'Student',
                                      eventTitle: title,
                                      date,
                                      certId: r.certificateId || 'CVA-CERT-001'
                                    })}
                                    className="rounded-lg border border-slate-200 dark:border-slate-750 px-2.5 py-1 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition inline-flex items-center gap-1"
                                    title="Download PNG Certificate"
                                  >
                                    <Download className="h-3.5 w-3.5" />
                                    <span>Download</span>
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 8: COURSE BUILDER                                */}
          {/* ==================================================== */}
          {activeTab === 'courses' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Curriculum & Course Builder</h3>
                  <p className="text-xs text-slate-400">Manage course catalogs, video lessons, and interactive learning tracks.</p>
                </div>
                <button
                  onClick={() => {
                    setEditingCourseId(null);
                    setCourseForm({
                      id: '', title: '', description: '', price: 29, instructor: '', category: 'Career Prep', thumbnail: '', videoTitle: '', videoDuration: '', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4'
                    });
                    setShowCourseForm(true);
                  }}
                  className="flex items-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs py-2.5 px-4 shadow transition"
                >
                  <Plus className="h-4 w-4" />
                  Create Course
                </button>
              </div>

              {/* Course creation form */}
              {showCourseForm && (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 p-6 shadow-sm max-w-2xl">
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

              {/* Course List */}
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

                        {/* Add Video Chapter Mini Form */}
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

          {/* ==================================================== */}
          {/* TAB 9: USERS MANAGEMENT                             */}
          {/* ==================================================== */}
          {activeTab === 'users' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Registered Members ({users.length})</h3>
                <div className="flex gap-2 items-center max-w-xs">
                  <Search className="h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search name or email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="rounded-xl border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-900 py-1.5 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                  />
                </div>
              </div>

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
                        <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleAdminRole(u.id)}
                            className="rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 px-2.5 py-1 text-xs font-bold"
                          >
                            {u.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                          </button>
                          <button
                            onClick={() => handleToggleBlockUser(u.id)}
                            className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                              u.isBlocked ? 'bg-green-500/10 text-green-600' : 'bg-amber-500/10 text-amber-500'
                            }`}
                          >
                            {u.isBlocked ? 'Unblock' : 'Block'}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="rounded-lg bg-red-500/10 hover:bg-red-500/25 text-red-500 px-2 py-1 text-xs font-bold"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 10: CAMPUS AMBASSADORS                          */}
          {/* ==================================================== */}
          {activeTab === 'ambassadors' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Campus Ambassador Program</h3>
                  <p className="text-xs text-slate-400">Manage student leaders across engineering & business colleges driving registrations.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportAmbassadorCSV}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2 px-3 text-xs font-bold hover:bg-slate-100 transition shadow-sm"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Export Leaderboard
                  </button>
                  <button
                    onClick={() => setShowAmbassadorModal(true)}
                    className="flex items-center gap-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs py-2 px-3.5 shadow transition"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Ambassador
                  </button>
                </div>
              </div>

              {/* Ambassador Search */}
              <div className="max-w-md relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search ambassadors by name, college, city..."
                  value={ambassadorSearch}
                  onChange={(e) => setAmbassadorSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-900 py-2 pl-9 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                />
              </div>

              {/* Add Ambassador Modal */}
              {showAmbassadorModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                  <div className="relative max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-850">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Add Student Campus Partner</h4>
                      <button onClick={() => setShowAmbassadorModal(false)} className="p-1 text-slate-400 hover:text-white">
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <form onSubmit={handleAddAmbassador} className="space-y-3.5">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Student Name</label>
                        <input
                          type="text"
                          required
                          value={newAmbassadorForm.name}
                          onChange={(e) => setNewAmbassadorForm({ ...newAmbassadorForm, name: e.target.value })}
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-900 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                          placeholder="e.g. Vikram Reddy"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">College / University</label>
                        <input
                          type="text"
                          required
                          value={newAmbassadorForm.college}
                          onChange={(e) => setNewAmbassadorForm({ ...newAmbassadorForm, college: e.target.value })}
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-900 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                          placeholder="e.g. VNR VJIET"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">City</label>
                          <input
                            type="text"
                            value={newAmbassadorForm.city}
                            onChange={(e) => setNewAmbassadorForm({ ...newAmbassadorForm, city: e.target.value })}
                            className="w-full rounded-lg border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-900 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Tier</label>
                          <select
                            value={newAmbassadorForm.tier}
                            onChange={(e) => setNewAmbassadorForm({ ...newAmbassadorForm, tier: e.target.value as any })}
                            className="w-full rounded-lg border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-900 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                          >
                            <option value="Gold">Gold</option>
                            <option value="Platinum">Platinum</option>
                            <option value="Diamond">Diamond</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex gap-2 justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={() => setShowAmbassadorModal(false)}
                          className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2 px-4 text-xs font-bold transition hover:bg-slate-100"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="rounded-xl bg-brand-600 hover:bg-brand-700 py-2 px-4 text-xs font-bold text-white transition shadow"
                        >
                          Enroll Ambassador
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Ambassador Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {filteredAmbassadors.map(amb => (
                  <div key={amb.id} className="rounded-2xl border border-slate-200/60 dark:border-slate-850 bg-white dark:bg-slate-900 p-4 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center gap-3">
                      <img src={amb.avatar} alt={amb.name} className="h-10 w-10 rounded-full object-cover ring-2 ring-brand-500/20" />
                      <div>
                        <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">{amb.name}</h4>
                        <span className={`inline-block text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                          amb.tier === 'Diamond' ? 'bg-cyan-500/10 text-cyan-500' : (amb.tier === 'Platinum' ? 'bg-purple-500/10 text-purple-500' : 'bg-amber-500/10 text-amber-500')
                        }`}>
                          {amb.tier} Tier
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 space-y-1 text-xs">
                      <p className="font-semibold text-slate-700 dark:text-slate-300 truncate">{amb.college}</p>
                      <p className="text-[10px] text-slate-400">{amb.city}</p>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">Referrals</span>
                        <span className="font-black text-slate-900 dark:text-white">{amb.referralsCount}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block font-bold">Points</span>
                        <span className="font-black text-brand-600 dark:text-brand-400">{amb.points}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 11: MARKETING & SOCIAL SHARING                  */}
          {/* ==================================================== */}
          {activeTab === 'marketing' && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Marketing Campaign Suite</h3>
                <p className="text-xs text-slate-400">Generate direct registration links, downloadable promotional QR codes, and 1-click WhatsApp/LinkedIn social shares.</p>
              </div>

              {/* Event Selector */}
              <div className="rounded-2xl border border-slate-200/60 dark:border-slate-850 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
                <div className="max-w-md">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Select Event to Market</label>
                  <select
                    value={marketingEventId}
                    onChange={(e) => setMarketingEventId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-850 py-2.5 px-3 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {events.map(e => (
                      <option key={e.id} value={e.id}>{e.title}</option>
                    ))}
                  </select>
                </div>

                {activeMarketingEvent && (() => {
                  const shareUrl = `${window.location.origin}/?event=${activeMarketingEvent.id}`;
                  const promoText = `🚀 Join "${activeMarketingEvent.title}" by COMMUNITY.VA!\n📅 Date: ${new Date(activeMarketingEvent.date).toLocaleDateString()}\n📍 Venue: ${activeMarketingEvent.venue}\n🎟️ Passes start at ₹${activeMarketingEvent.feesTier?.regular || activeMarketingEvent.fees || 0}\n\nRegister instantly: ${shareUrl}`;

                  return (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
                      {/* Left: Dynamic Link & QR Code */}
                      <div className="space-y-4 lg:col-span-1">
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 space-y-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">Direct Registration URL</span>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              readOnly
                              value={shareUrl}
                              className="flex-1 rounded-lg border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-900 p-2 text-[11px] font-mono select-all dark:text-white"
                            />
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(shareUrl);
                                setCopiedLink(true);
                                triggerToast('Link copied to clipboard!');
                                setTimeout(() => setCopiedLink(false), 3000);
                              }}
                              className="rounded-lg bg-brand-600 hover:bg-brand-700 text-white p-2 transition"
                              title="Copy Link"
                            >
                              {copiedLink ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Promotional QR Preview */}
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 text-center space-y-3">
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">Promotional Scan QR</span>
                          <div className="flex justify-center">
                            <div className="h-36 w-36 bg-white p-2 rounded-xl shadow border border-slate-200 flex items-center justify-center">
                              <img
                                src={activeMarketingEvent.qrCode || '/upi-qr.jpg'}
                                alt="Event QR"
                                className="max-h-full max-w-full object-contain"
                              />
                            </div>
                          </div>
                          <a
                            href={activeMarketingEvent.qrCode || '/upi-qr.jpg'}
                            download={`Promo_QR_${activeMarketingEvent.title.replace(/\s+/g, '_')}.jpg`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-900 py-1.5 px-3 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition shadow-sm"
                          >
                            <Download className="h-3.5 w-3.5" />
                            Download QR Asset
                          </a>
                        </div>
                      </div>

                      {/* Right: Social Share Actions & Templates */}
                      <div className="space-y-4 lg:col-span-2">
                        {/* 1-Click Social Buttons */}
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 space-y-2.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">1-Click Social Broadcast</span>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            <a
                              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(promoText)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow transition"
                            >
                              <span>Share on WhatsApp</span>
                            </a>
                            <a
                              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow transition"
                            >
                              <span>Share on LinkedIn</span>
                            </a>
                            <a
                              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(promoText)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold shadow transition"
                            >
                              <span>Share on X / Twitter</span>
                            </a>
                          </div>
                        </div>

                        {/* Copy-Paste Templates */}
                        <div className="space-y-3">
                          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-slate-800 dark:text-white">WhatsApp & College Group Announcement Text</span>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(promoText);
                                  triggerToast('WhatsApp announcement template copied!');
                                }}
                                className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                              >
                                <Copy className="h-3 w-3" /> Copy
                              </button>
                            </div>
                            <pre className="text-[11px] bg-slate-50 dark:bg-slate-950 p-3 rounded-lg text-slate-700 dark:text-slate-300 font-mono whitespace-pre-wrap">
                              {promoText}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 12: NOTIFICATIONS BROADCASTER                    */}
          {/* ==================================================== */}
          {activeTab === 'notifications' && (
            <div className="space-y-6 animate-fade-in max-w-2xl">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Global Alerts Broadcaster</h3>
                <p className="text-xs text-slate-400">Send real-time alerts or event reminders directly to student browser sessions.</p>
              </div>

              <div className="rounded-2xl border border-slate-200/50 dark:border-slate-850 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
                <form onSubmit={handleSendAnnouncement} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Target Audience</label>
                    <select
                      value={notificationMsg.target}
                      onChange={(e) => setNotificationMsg({ ...notificationMsg, target: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-900 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                    >
                      <option value="all">All Registered Students</option>
                      <option value="events">Event Pass Holders</option>
                      <option value="ambassadors">Campus Ambassadors</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Broadcast Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Workshop Starting in 30 Minutes!"
                      value={notificationMsg.title}
                      onChange={(e) => setNotificationMsg({ ...notificationMsg, title: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-900 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Message Body</label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Enter detailed alert announcement here..."
                      value={notificationMsg.body}
                      onChange={(e) => setNotificationMsg({ ...notificationMsg, body: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-900 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                    />
                  </div>
                  <button
                    type="submit"
                    className="rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs py-2.5 px-5 shadow transition"
                  >
                    Send Broadcast Notice
                  </button>
                </form>
              </div>

              {/* History Log */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Broadcast Logs</span>
                <div className="space-y-2">
                  {broadcastLog.map(log => (
                    <div key={log.id} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-slate-900 dark:text-white">{log.title}</span>
                        <span className="text-[10px] text-slate-400">{log.date}</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-[11px]">{log.body}</p>
                      <span className="inline-block mt-2 text-[9px] font-bold px-1.5 py-0.5 rounded bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400">
                        Sent to: {log.target}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 13: ANALYTICAL REPORTS                           */}
          {/* ==================================================== */}
          {activeTab === 'reports' && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Multi-Dimensional Analytics & Reports</h3>
                  <p className="text-xs text-slate-400">Attendance percentages, capacity fill rates, and college participation rankings.</p>
                </div>
                <button
                  onClick={handleExportRegistrationsCSV}
                  className="flex items-center gap-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs py-2 px-3.5 shadow transition"
                >
                  <Download className="h-3.5 w-3.5" />
                  Export Full System Report
                </button>
              </div>

              {/* Event Capacity Fill Rates */}
              <div className="rounded-2xl border border-slate-200/60 dark:border-slate-850 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Event Capacity & Fill Rate Breakdown</h4>
                <div className="space-y-3">
                  {events.map(evt => {
                    const regCount = registrations.filter(r => r.eventId === evt.id).length;
                    const fillPct = Math.min(100, Math.round((regCount / (evt.seatsTotal || 50)) * 100));
                    const presentCount = registrations.filter(r => r.eventId === evt.id && r.attended).length;

                    return (
                      <div key={evt.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                          <span className="font-bold text-slate-850 dark:text-white">{evt.title}</span>
                          <span className="text-[11px] text-slate-400">
                            {regCount} / {evt.seatsTotal} Seats Filled ({fillPct}%) • {presentCount} Attended
                          </span>
                        </div>
                        <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all ${
                              fillPct >= 90 ? 'bg-red-500' : (fillPct >= 60 ? 'bg-amber-500' : 'bg-brand-500')
                            }`}
                            style={{ width: `${fillPct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* College Participation Ranking */}
              <div className="rounded-2xl border border-slate-200/60 dark:border-slate-850 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3">
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Top Participating Colleges</h4>
                {(() => {
                  const counts: Record<string, number> = {};
                  registrations.forEach(r => {
                    if (r.collegeName) {
                      counts[r.collegeName] = (counts[r.collegeName] || 0) + 1;
                    }
                  });
                  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);

                  if (sorted.length === 0) {
                    return <p className="text-xs text-slate-400">No college data accumulated yet.</p>;
                  }

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {sorted.map(([college, cnt], idx) => (
                        <div key={college} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="h-6 w-6 rounded-full bg-brand-600/10 text-brand-600 font-black text-xs flex items-center justify-center">
                              #{idx + 1}
                            </span>
                            <span className="font-bold text-xs text-slate-800 dark:text-white truncate max-w-[150px]">{college}</span>
                          </div>
                          <span className="text-xs font-black text-brand-600 dark:text-brand-400">{cnt} Students</span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 14: PLATFORM SETTINGS                            */}
          {/* ==================================================== */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-fade-in max-w-2xl">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Platform Settings & Credentials</h3>
                <p className="text-xs text-slate-400">Configure default UPI payment credentials, organizational details, and branding.</p>
              </div>

              <div className="rounded-2xl border border-slate-200/60 dark:border-slate-850 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    triggerToast('Settings updated successfully!');
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Organization Name</label>
                      <input
                        type="text"
                        value={settingsForm.orgName}
                        onChange={(e) => setSettingsForm({ ...settingsForm, orgName: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-900 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Support Email</label>
                      <input
                        type="email"
                        value={settingsForm.supportEmail}
                        onChange={(e) => setSettingsForm({ ...settingsForm, supportEmail: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-900 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Support Phone / WhatsApp</label>
                      <input
                        type="text"
                        value={settingsForm.supportPhone}
                        onChange={(e) => setSettingsForm({ ...settingsForm, supportPhone: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-900 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Currency</label>
                      <input
                        type="text"
                        disabled
                        value={settingsForm.currency}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-750 bg-slate-100 dark:bg-slate-800 p-2.5 text-xs text-slate-500"
                      />
                    </div>
                  </div>

                  {/* Payment Gateway UPI Settings */}
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-950/20 space-y-3">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Primary UPI Collection Profile</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">UPI ID (Google Pay / SBI)</label>
                        <input
                          type="text"
                          value={settingsForm.upiId}
                          onChange={(e) => setSettingsForm({ ...settingsForm, upiId: e.target.value })}
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-900 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Payee Name</label>
                        <input
                          type="text"
                          value={settingsForm.payeeName}
                          onChange={(e) => setSettingsForm({ ...settingsForm, payeeName: e.target.value })}
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-900 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white font-bold"
                        />
                      </div>
                    </div>

                    {/* QR Code preview inside settings */}
                    <div className="flex items-center gap-3 pt-2">
                      <div className="h-16 w-16 bg-white rounded-lg p-1 border shadow-sm shrink-0 flex items-center justify-center">
                        <img src={settingsForm.upiQrUrl} alt="Active QR" className="max-h-full max-w-full object-contain" />
                      </div>
                      <div className="text-xs">
                        <p className="font-bold text-slate-900 dark:text-white">Active Payment QR Code</p>
                        <p className="text-[10px] text-emerald-500 font-semibold">Verified Abhi Ram GPay QR ({settingsForm.upiId})</p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs py-2.5 px-5 shadow transition"
                  >
                    Save System Settings
                  </button>
                </form>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ==================================================== */}
      {/* Lightbox Screenshot Modal (Payment Proofs)           */}
      {/* ==================================================== */}
      {previewScreenshotUrl && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setPreviewScreenshotUrl(null)}
        >
          <div 
            className="relative max-w-2xl w-full bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-brand-600" />
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">UPI Payment Receipt Proof</h4>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewScreenshotUrl}
                  download="payment_proof.png"
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  title="Open / Download Full Image"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
                <button
                  onClick={() => setPreviewScreenshotUrl(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-750 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  title="Close Preview"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="max-h-[75vh] overflow-auto flex items-center justify-center bg-slate-950/40 rounded-xl p-2 border border-slate-100 dark:border-slate-800">
              <img
                src={previewScreenshotUrl}
                alt="Payment Screenshot Preview"
                className="max-h-[70vh] w-auto max-w-full object-contain rounded-lg shadow-md"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
