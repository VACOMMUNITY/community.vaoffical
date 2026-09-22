import React, { useState, useEffect } from 'react';
import { 
  X, Calendar, Clock, MapPin, CheckCircle, Upload, AlertCircle, 
  Sparkles, ShieldCheck, User, Mail, 
  Phone, GraduationCap, Building2, BookOpen, ArrowLeft,
  QrCode, Check
} from 'lucide-react';
import { type Event as EventType, db } from '../data/mockDatabase';
import { api } from '../data/api';

interface EventRegistrationModalProps {
  isOpen: boolean;
  event: EventType | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EventRegistrationModal({
  isOpen,
  event,
  onClose,
  onSuccess
}: EventRegistrationModalProps) {
  const currentUser = db.getCurrentUser();

  // Tier selection
  const [selectedTier, setSelectedTier] = useState<'earlyBird' | 'regular' | 'spotEntry'>('regular');
  
  // Student details
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [branch, setBranch] = useState('');
  const [year, setYear] = useState('3rd Year');

  // Payment proof
  const [screenshotBase64, setScreenshotBase64] = useState<string>('');
  const [screenshotFileName, setScreenshotFileName] = useState<string>('');
  const [confirmedPayment, setConfirmedPayment] = useState(false);

  // States
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [registeredId, setRegisteredId] = useState('');

  // Prefill when opened
  useEffect(() => {
    if (isOpen && event) {
      if (currentUser) {
        setFullName(currentUser.name || '');
        setEmail(currentUser.email || '');
        setPhone(currentUser.phone || '');
      }
      // Determine default tier
      if (event.feesTier && event.feesTier.earlyBird !== undefined && event.feesTier.earlyBird > 0) {
        setSelectedTier('earlyBird');
      } else {
        setSelectedTier('regular');
      }
      setScreenshotBase64('');
      setScreenshotFileName('');
      setConfirmedPayment(event.fees === 0);
      setErrorMessage('');
      setSubmitted(false);
    }
  }, [isOpen, event, currentUser]);

  if (!isOpen || !event) return null;

  // Calculate amount based on tier
  const getAmount = () => {
    if (event.fees === 0 && (!event.feesTier || event.feesTier.regular === 0)) return 0;
    if (event.feesTier) {
      if (selectedTier === 'earlyBird' && event.feesTier.earlyBird !== undefined) {
        return event.feesTier.earlyBird;
      }
      if (selectedTier === 'spotEntry' && event.feesTier.spotEntry !== undefined) {
        return event.feesTier.spotEntry;
      }
      if (event.feesTier.regular !== undefined) {
        return event.feesTier.regular;
      }
    }
    return event.fees;
  };

  const finalAmount = getAmount();
  const isFree = finalAmount === 0;

  // Handle screenshot upload
  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('File size must be under 5 MB.');
      return;
    }

    setScreenshotFileName(file.name);
    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      if (loadEvt.target?.result) {
        setScreenshotBase64(loadEvt.target.result as string);
        setErrorMessage('');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }
    if (!phone.trim()) {
      setErrorMessage('Please enter your active WhatsApp or phone number.');
      return;
    }
    if (!collegeName.trim()) {
      setErrorMessage('Please enter your college or institution name.');
      return;
    }
    if (!branch.trim()) {
      setErrorMessage('Please specify your academic branch or major.');
      return;
    }

    if (!isFree) {
      if (!screenshotBase64) {
        setErrorMessage('Please upload your payment screenshot to verify the transaction.');
        return;
      }
      if (!confirmedPayment) {
        setErrorMessage('Please tick the confirmation checkbox to verify you completed payment.');
        return;
      }
    }

    setSubmitting(true);

    try {
      const tierName = selectedTier === 'earlyBird' ? 'Early Bird' : selectedTier === 'spotEntry' ? 'Spot Entry' : 'Regular';
      const result = await api.events.register({
        eventId: event.id,
        amount: finalAmount,
        paymentMethod: isFree ? 'Free Pass' : 'UPI QR Screenshot',
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        collegeName: collegeName.trim(),
        branch: branch.trim(),
        year: year,
        selectedTier: tierName,
        paymentScreenshot: screenshotBase64,
        confirmedPayment: true
      });

      setSubmitting(false);
      setSubmitted(true);
      setRegisteredId(result?.registration?.id || `reg_${Date.now()}`);
      onSuccess();
      window.dispatchEvent(new Event('db-update'));
    } catch (err: any) {
      setSubmitting(false);
      setErrorMessage(err.message || 'Registration failed. Please try again.');
    }
  };

  // Default QR code if none uploaded by admin
  const qrDisplayUrl = event.qrCode || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=communityva@razorpay%26pn=COMMUNITY.VA%26am=${finalAmount}%26cu=INR`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950 text-white min-h-screen flex flex-col animate-fade-in">
      
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-slate-950/90 backdrop-blur-md px-4 sm:px-8 py-3.5 shadow-md">
        <button
          onClick={onClose}
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 px-3.5 py-1.5 text-xs font-bold text-slate-200 hover:text-white transition cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Events</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
            COMMUNITY.VA <span className="text-blue-400">• Event Registration</span>
          </span>
        </div>

        <button
          onClick={onClose}
          disabled={submitting}
          className="rounded-xl p-2 text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          title="Close Form"
        >
          <X className="h-5 w-5" />
        </button>
      </header>

      {/* Main Form Content */}
      <div className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        
        {/* AFTER SUBMISSION VIEW */}
        {submitted ? (
          <div className="max-w-2xl mx-auto my-8 p-6 sm:p-10 rounded-3xl bg-slate-900/90 border border-emerald-500/40 shadow-2xl text-center space-y-6 animate-scale-up">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 shadow-xl">
              <CheckCircle className="h-10 w-10" />
            </div>

            <div className="space-y-3">
              <span className="inline-block px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Registration Confirmed
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Registration Received
              </h2>
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 max-w-lg mx-auto">
                <p className="text-sm sm:text-base font-bold text-emerald-300 leading-relaxed">
                  Registration received. We'll verify your payment and confirm your seat through WhatsApp and Email.
                </p>
              </div>
            </div>

            {/* Registration Summary Card */}
            <div className="rounded-2xl bg-black/40 border border-white/10 p-5 text-left text-xs space-y-3 max-w-lg mx-auto">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-slate-400 font-medium">Event</span>
                <span className="font-bold text-white text-right truncate max-w-[240px]">{event.title}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-slate-400 font-medium">Participant Name</span>
                <span className="font-bold text-white">{fullName}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-slate-400 font-medium">Email Address</span>
                <span className="font-semibold text-slate-300">{email}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-slate-400 font-medium">WhatsApp / Phone</span>
                <span className="font-semibold text-slate-300">{phone}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-slate-400 font-medium">Pass Tier</span>
                <span className="font-bold text-blue-400">
                  {selectedTier === 'earlyBird' ? 'Early Bird' : selectedTier === 'spotEntry' ? 'Spot Entry' : 'Regular'}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-slate-400 font-medium">Amount Paid</span>
                <span className="font-extrabold text-emerald-400 text-sm">
                  {isFree ? 'Free Entry' : `₹${finalAmount}`}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Registration ID</span>
                <span className="font-mono text-slate-400 text-[11px]">{registeredId}</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Our coordinators will verify the payment screenshot against the transaction record and dispatch your confirmed QR pass.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-8 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 transition cursor-pointer"
              >
                Back to All Events
              </button>
            </div>
          </div>
        ) : (
          /* FULL SCREEN FORM VIEW */
          <div className="space-y-8">
            
            {/* 1. TOP EVENT DETAILS: BANNER, NAME, DATE, TIME, VENUE, ENTRY FEE */}
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 shadow-2xl backdrop-blur-xl">
              {/* Event Banner */}
              <div className="relative h-48 sm:h-64 w-full overflow-hidden bg-slate-800">
                <img
                  src={event.banner || 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=1200'}
                  alt={event.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>
                
                {/* Category & Deadline Badge */}
                <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
                  <span className="rounded-lg bg-blue-600/90 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-white shadow backdrop-blur-sm">
                    {event.category || 'Live Workshop'}
                  </span>
                  {event.deadline && (
                    <span className="rounded-lg bg-amber-500/80 px-3 py-1 text-[11px] font-extrabold text-white shadow backdrop-blur-sm flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Deadline: {event.deadline}
                    </span>
                  )}
                </div>

                <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-6">
                  <h1 className="text-xl sm:text-3xl font-black text-white leading-tight drop-shadow-md">
                    {event.title}
                  </h1>
                </div>
              </div>

              {/* Event Metadata: Date, Time, Venue, Entry Fee */}
              <div className="p-4 sm:p-6 grid grid-cols-2 md:grid-cols-4 gap-3 border-t border-white/10 bg-white/[0.02]">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                  <Calendar className="h-5 w-5 text-blue-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Date</p>
                    <p className="text-xs font-bold text-white truncate">{event.date}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                  <Clock className="h-5 w-5 text-indigo-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Time</p>
                    <p className="text-xs font-bold text-white truncate">{event.time}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                  <MapPin className="h-5 w-5 text-purple-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Venue</p>
                    <p className="text-xs font-bold text-white truncate">{event.venue}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                  <Sparkles className="h-5 w-5 text-emerald-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Entry Fee</p>
                    <p className="text-xs font-black text-emerald-400 truncate">
                      {isFree ? 'Free Registration' : `₹${finalAmount}`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Error banner if validation fails */}
            {errorMessage && (
              <div className="rounded-2xl bg-red-500/10 border border-red-500/30 p-4 text-xs text-red-300 flex items-start gap-3 animate-fade-in">
                <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold text-red-200">Please complete the required fields:</p>
                  <p className="mt-0.5">{errorMessage}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">

              {/* Multi-tier fee selection if configured */}
              {event.feesTier && (
                <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-5 sm:p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-extrabold uppercase tracking-wider text-white">Select Entry Pass Tier</h3>
                      <p className="text-xs text-slate-400">Choose your preferred pass option.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    {/* Early Bird */}
                    {event.feesTier.earlyBird !== undefined && event.feesTier.earlyBird > 0 && (
                      <div
                        onClick={() => setSelectedTier('earlyBird')}
                        className={`cursor-pointer rounded-2xl p-4 border transition ${
                          selectedTier === 'earlyBird'
                            ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10'
                            : 'border-white/10 bg-white/5 hover:border-white/20'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-400">Early Bird</span>
                          {selectedTier === 'earlyBird' && <CheckCircle className="h-4 w-4 text-blue-400" />}
                        </div>
                        <p className="text-lg font-black text-white">₹{event.feesTier.earlyBird}</p>
                        <p className="text-[10px] text-slate-400 mt-1">Limited early reservation pass</p>
                      </div>
                    )}

                    {/* Regular Entry */}
                    <div
                      onClick={() => setSelectedTier('regular')}
                      className={`cursor-pointer rounded-2xl p-4 border transition ${
                        selectedTier === 'regular'
                          ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/10'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-400">Standard Pass</span>
                        {selectedTier === 'regular' && <CheckCircle className="h-4 w-4 text-indigo-400" />}
                      </div>
                      <p className="text-lg font-black text-white">
                        {event.feesTier.regular ? `₹${event.feesTier.regular}` : (event.fees === 0 ? 'Free' : `₹${event.fees}`)}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">Standard full-access attendee pass</p>
                    </div>

                    {/* Spot Entry */}
                    {event.feesTier.spotEntry !== undefined && event.feesTier.spotEntry > 0 && (
                      <div
                        onClick={() => setSelectedTier('spotEntry')}
                        className={`cursor-pointer rounded-2xl p-4 border transition ${
                          selectedTier === 'spotEntry'
                            ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/10'
                            : 'border-white/10 bg-white/5 hover:border-white/20'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-400">Spot Entry</span>
                          {selectedTier === 'spotEntry' && <CheckCircle className="h-4 w-4 text-purple-400" />}
                        </div>
                        <p className="text-lg font-black text-white">₹{event.feesTier.spotEntry}</p>
                        <p className="text-[10px] text-slate-400 mt-1">Late admission / spot booking pass</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 2. STUDENT DETAILS: FULL NAME, EMAIL, PHONE, COLLEGE NAME, BRANCH, YEAR */}
              <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-5 sm:p-6 space-y-4">
                <div>
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-white">Student Details</h3>
                  <p className="text-xs text-slate-400">Provide your information for attendee roll and certificate issuance.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Full Name <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rahul Sharma"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Email Address <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                      <input
                        type="email"
                        required
                        placeholder="e.g. rahul@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Phone Number (WhatsApp) <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 7416201359"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* College Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      College Name <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. JNTU Hyderabad / Osmania University"
                        value={collegeName}
                        onChange={(e) => setCollegeName(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Branch */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Branch <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <BookOpen className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. CSE, ECE, IT, Mechanical, MBA"
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Year */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Year <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                      <select
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-slate-900 py-2.5 pl-10 pr-3.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year / Final Year</option>
                        <option value="Post Graduate">Post Graduate / Masters</option>
                        <option value="Recent Graduate">Recent Graduate</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. PAYMENT SECTION (UPI QR CODE + PAYMENT AMOUNT + UPLOAD SCREENSHOT + CONFIRMATION CHECKBOX) */}
              {!isFree && (
                <div className="rounded-3xl border border-blue-500/30 bg-gradient-to-b from-slate-900 to-slate-950 p-5 sm:p-8 space-y-6 shadow-2xl">
                  
                  {/* Header & Payment Amount */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/10 pb-5">
                    <div>
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30 mb-1">
                        UPI Payment
                      </span>
                      <h3 className="text-base sm:text-lg font-black text-white">Event Payment</h3>
                      <p className="text-xs text-slate-400">Scan using GPay, PhonePe, Paytm or any UPI app.</p>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 text-right shrink-0">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Payment Amount</span>
                      <span className="text-2xl font-black text-emerald-400">₹{finalAmount}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    {/* UPI QR Code box */}
                    <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white/5 border border-white/10 text-center">
                      <div className="relative p-3 bg-white rounded-2xl shadow-xl">
                        <img
                          src={qrDisplayUrl}
                          alt="Event UPI QR Code"
                          className="h-48 w-48 object-contain rounded-xl"
                        />
                      </div>
                      <p className="text-xs font-bold text-slate-200 mt-3 flex items-center gap-1.5">
                        <QrCode className="h-4 w-4 text-blue-400" />
                        Scan to pay ₹{finalAmount}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">UPI QR for {event.title}</p>
                    </div>

                    {/* Screenshot Upload and Checkbox */}
                    <div className="space-y-4">
                      
                      {/* Upload Payment Screenshot Field */}
                      <div>
                        <label className="block text-xs font-bold text-slate-200 mb-1.5">
                          Upload Payment Screenshot <span className="text-red-400">*</span>
                        </label>
                        
                        {screenshotBase64 ? (
                          <div className="relative flex items-center justify-between p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/40">
                            <div className="flex items-center gap-3 min-w-0">
                              <img
                                src={screenshotBase64}
                                alt="Screenshot Preview"
                                className="h-12 w-12 rounded-xl object-cover border border-emerald-500/50"
                              />
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-white truncate max-w-[200px]">
                                  {screenshotFileName || 'receipt.png'}
                                </p>
                                <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                                  <Check className="h-3 w-3" /> Receipt uploaded
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setScreenshotBase64('');
                                setScreenshotFileName('');
                              }}
                              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
                              title="Remove screenshot"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed border-white/20 hover:border-blue-500/60 bg-white/5 hover:bg-white/10 transition cursor-pointer">
                            <Upload className="h-6 w-6 text-blue-400 mb-2" />
                            <span className="text-xs font-bold text-white">Click to Upload Payment Screenshot</span>
                            <span className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, JPEG, WEBP (Max 5MB)</span>
                            <input
                              type="file"
                              accept="image/*"
                              required
                              onChange={handleScreenshotChange}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>

                      {/* Required Checkbox: I have completed the payment */}
                      <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition cursor-pointer select-none">
                        <input
                          type="checkbox"
                          required
                          checked={confirmedPayment}
                          onChange={(e) => setConfirmedPayment(e.target.checked)}
                          className="mt-0.5 h-4 w-4 rounded border-white/20 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900 cursor-pointer"
                        />
                        <span className="text-xs font-bold text-slate-200 leading-snug">
                          I have completed the payment.
                          <span className="block font-normal text-[11px] text-slate-400 mt-0.5">
                            I verify that ₹{finalAmount} was paid via UPI and the uploaded screenshot is accurate.
                          </span>
                        </span>
                      </label>

                    </div>
                  </div>
                </div>
              )}

              {/* Free event notice */}
              {isFree && (
                <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-5 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-400" />
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-300">Free Registration</h4>
                  </div>
                  <p className="text-xs text-slate-300">
                    This is a free workshop. No payment is required to confirm your seat.
                  </p>
                </div>
              )}

              {/* Submit & Cancel Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="w-full sm:w-1/3 rounded-2xl border border-white/10 hover:bg-white/5 py-3.5 text-xs font-bold text-slate-300 transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-2/3 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-indigo-500 py-3.5 text-xs font-extrabold text-white shadow-xl shadow-indigo-500/30 transition cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      <span>Submitting Registration...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      <span>
                        {isFree ? 'Confirm Free Registration' : `Submit Registration & Verify (₹${finalAmount})`}
                      </span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        )}

      </div>
    </div>
  );
}
