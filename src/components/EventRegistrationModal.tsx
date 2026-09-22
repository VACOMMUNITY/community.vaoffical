import React, { useState, useEffect } from 'react';
import { 
  X, Calendar, Clock, MapPin, CheckCircle, Upload, AlertCircle, 
  Sparkles, ShieldCheck, ChevronRight, User, Mail, 
  Phone, GraduationCap, Building2, BookOpen
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl my-6 overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl transition-all">
        
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-700 via-indigo-600 to-brand-600 px-6 py-5 text-white">
          <div className="flex items-start justify-between">
            <div className="space-y-1 pr-6">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5 text-yellow-300" />
                Dynamic Event Registration
              </span>
              <h2 className="text-xl sm:text-2xl font-black leading-tight text-white line-clamp-1">
                {event.title}
              </h2>
            </div>
            <button 
              onClick={onClose} 
              disabled={submitting}
              className="rounded-full p-1.5 text-white/80 hover:bg-white/20 hover:text-white transition"
              title="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Event Metadata Ribbon */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-white/90">
            <div className="flex items-center gap-1.5 bg-black/20 rounded-lg px-2.5 py-1.5 backdrop-blur-sm">
              <Calendar className="h-3.5 w-3.5 text-blue-200 flex-shrink-0" />
              <span className="truncate">{event.date}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/20 rounded-lg px-2.5 py-1.5 backdrop-blur-sm">
              <Clock className="h-3.5 w-3.5 text-blue-200 flex-shrink-0" />
              <span className="truncate">{event.time}</span>
            </div>
            <div className="col-span-2 sm:col-span-1 flex items-center gap-1.5 bg-black/20 rounded-lg px-2.5 py-1.5 backdrop-blur-sm">
              <MapPin className="h-3.5 w-3.5 text-blue-200 flex-shrink-0" />
              <span className="truncate">{event.venue}</span>
            </div>
          </div>

          {event.deadline && (
            <div className="mt-2 text-[11px] font-medium text-amber-200 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Registration Deadline: {event.deadline}
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="max-h-[75vh] overflow-y-auto p-5 sm:p-6">
          {submitted ? (
            /* Success confirmation */
            <div className="py-8 text-center space-y-4">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500 text-emerald-500 shadow-lg animate-bounce">
                <CheckCircle className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                Registration Submitted Successfully!
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                Thank you, <span className="font-semibold text-slate-900 dark:text-white">{fullName}</span>. Your registration for <span className="font-semibold text-brand-600 dark:text-brand-400">{event.title}</span> has been submitted.
              </p>
              
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-4 max-w-md mx-auto border border-slate-200 dark:border-slate-700 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Registration ID:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{registeredId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Verification Status:</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 font-semibold">
                    Pending Admin Verification
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tier Selected:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {selectedTier === 'earlyBird' ? 'Early Bird' : selectedTier === 'spotEntry' ? 'Spot Entry' : 'Regular'} (₹{finalAmount})
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                The COMMUNITY.VA Admin team will inspect your payment screenshot and confirm your pass shortly.
              </p>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-brand-700 shadow-md transition"
                >
                  Done & Back to Events
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {errorMessage && (
                <div className="rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 p-3 text-xs text-red-600 dark:text-red-400 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* 1. Fee Tier Selection */}
              {event.feesTier && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Select Entry Pass Tier
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {/* Early Bird */}
                    {event.feesTier.earlyBird !== undefined && (
                      <button
                        type="button"
                        onClick={() => setSelectedTier('earlyBird')}
                        className={`flex flex-col p-3 rounded-xl border text-left transition ${
                          selectedTier === 'earlyBird'
                            ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/30 ring-2 ring-blue-500'
                            : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                            Early Bird
                          </span>
                          <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                            ₹{event.feesTier.earlyBird}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 mt-1">Limited Early Access</span>
                      </button>
                    )}

                    {/* Regular */}
                    <button
                      type="button"
                      onClick={() => setSelectedTier('regular')}
                      className={`flex flex-col p-3 rounded-xl border text-left transition ${
                        selectedTier === 'regular'
                          ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/30 ring-2 ring-blue-500'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                          Regular Pass
                        </span>
                        <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                          ₹{event.feesTier.regular ?? event.fees}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 mt-1">Standard Admission</span>
                    </button>

                    {/* Spot Entry */}
                    {event.feesTier.spotEntry !== undefined && (
                      <button
                        type="button"
                        onClick={() => setSelectedTier('spotEntry')}
                        className={`flex flex-col p-3 rounded-xl border text-left transition ${
                          selectedTier === 'spotEntry'
                            ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/30 ring-2 ring-blue-500'
                            : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wide">
                            Spot Entry
                          </span>
                          <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                            ₹{event.feesTier.spotEntry}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 mt-1">Late / On-Day Entry</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* 2. Student Registration Form */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-brand-600" />
                  Student Details
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rahul Sharma"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        placeholder="student@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      WhatsApp / Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      College / University Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Osmania University, JNTUH"
                        value={collegeName}
                        onChange={(e) => setCollegeName(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Branch / Specialization <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <BookOpen className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. CSE, IT, ECE, Mechanical, BBA, B.Com"
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Year of Study <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <select
                        required
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                      >
                        <option value="1st Year">1st Year (Freshman)</option>
                        <option value="2nd Year">2nd Year (Sophomore)</option>
                        <option value="3rd Year">3rd Year (Junior)</option>
                        <option value="4th Year">4th Year (Senior / Final Year)</option>
                        <option value="Graduate / Alumni">Graduate / Working Professional</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Payment & UPI QR Code Section */}
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4 border border-slate-200 dark:border-slate-700/60 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Payable</span>
                    <h5 className="text-xl font-extrabold text-slate-900 dark:text-white">
                      {isFree ? 'Free Admission' : `₹${finalAmount.toFixed(2)}`}
                    </h5>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 dark:bg-blue-900/40 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Verified Event Gateway
                  </span>
                </div>

                {!isFree && (
                  <>
                    <div className="flex flex-col sm:flex-row items-center gap-5 pt-1">
                      {/* UPI QR Code Container */}
                      <div className="flex flex-col items-center">
                        <div className="p-2 bg-white rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
                          <img 
                            src={qrDisplayUrl} 
                            alt="Event UPI QR Code" 
                            className="w-36 h-36 object-contain rounded-lg"
                          />
                        </div>
                        <span className="text-[11px] text-slate-500 mt-1 font-mono">Scan via GPay / PhonePe / Paytm</span>
                      </div>

                      {/* Payment Instructions */}
                      <div className="flex-1 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                        <p className="font-semibold text-slate-800 dark:text-slate-200">
                          Follow these simple steps:
                        </p>
                        <ol className="list-decimal pl-4 space-y-1 text-slate-500 dark:text-slate-400">
                          <li>Open any UPI App and scan the QR code above.</li>
                          <li>Pay the exact amount of <span className="font-bold text-slate-900 dark:text-white">₹{finalAmount}</span>.</li>
                          <li>Take a screenshot of the successful payment receipt.</li>
                          <li>Upload the screenshot below to verify your seat.</li>
                        </ol>
                        <div className="pt-1 text-[11px] text-brand-600 dark:text-brand-400 font-mono font-bold">
                          UPI ID: communityva@razorpay
                        </div>
                      </div>
                    </div>

                    {/* Screenshot Upload Field */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Upload Payment Screenshot <span className="text-red-500">*</span>
                      </label>
                      <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 text-center hover:border-brand-500 transition bg-white/50 dark:bg-slate-900/50">
                        <input
                          type="file"
                          accept="image/*"
                          required
                          onChange={handleScreenshotChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        {screenshotBase64 ? (
                          <div className="flex items-center justify-center gap-3">
                            <img 
                              src={screenshotBase64} 
                              alt="Screenshot Preview" 
                              className="h-16 w-16 object-cover rounded-lg border border-slate-300 dark:border-slate-600"
                            />
                            <div className="text-left">
                              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                                {screenshotFileName || 'Payment_receipt.png'}
                              </p>
                              <span className="text-[11px] text-emerald-600 font-medium">Screenshot attached ✓</span>
                              <p className="text-[10px] text-slate-400">Click or drag another image to replace</p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <Upload className="mx-auto h-7 w-7 text-slate-400" />
                            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                              Click to select screenshot or drag and drop
                            </p>
                            <p className="text-[11px] text-slate-400">PNG, JPG, JPEG, WEBP up to 5MB</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Confirmation Checkbox */}
                    <div className="flex items-start gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="confirmPayment"
                        required
                        checked={confirmedPayment}
                        onChange={(e) => setConfirmedPayment(e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                      />
                      <label htmlFor="confirmPayment" className="text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
                        I have completed the payment of <span className="font-bold text-slate-900 dark:text-white">₹{finalAmount}</span> and attached the genuine transaction screenshot. <span className="text-red-500">*</span>
                      </label>
                    </div>
                  </>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-brand-600 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.99] transition disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Submitting Registration...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Event Registration</span>
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
