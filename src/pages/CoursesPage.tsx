import { useState } from 'react';
import { 
  BookOpen, Star, PlayCircle, FileText, CheckCircle, 
  ArrowRight, Search, Clock, Award
} from 'lucide-react';
import { db, type Course } from '../data/mockDatabase';
import PaymentModal from '../components/PaymentModal';
import type { NavPage } from '../components/Navbar';

interface CoursesPageProps {
  onNavigate: (page: NavPage) => void;
  currentUser: any;
}

export default function CoursesPage({ onNavigate, currentUser }: CoursesPageProps) {
  const courses: Course[] = db.getCourses();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Enrollments
  const enrollments = db.getEnrollments();
  const userEnrolledCourseIds = currentUser 
    ? enrollments.filter(e => e.userId === currentUser.id).map(e => e.courseId)
    : [];

  // Payment State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentTarget, setPaymentTarget] = useState<Course | null>(null);

  const categories = ['All', 'Career Prep', 'Communication', 'Leadership'];

  const filteredCourses = courses.filter(crs => {
    const matchesCat = selectedCategory === 'All' || crs.category === selectedCategory;
    const matchesSearch = crs.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          crs.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          crs.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleEnrollClick = (course: Course) => {
    if (!currentUser) {
      onNavigate('login');
      return;
    }
    setPaymentTarget(course);
    setPaymentModalOpen(true);
  };

  const handlePaymentSuccess = (method: string, finalAmount: number) => {
    if (!paymentTarget || !currentUser) return;

    // Create enrollment
    const newEnrollment = {
      id: `enr_${Date.now()}`,
      userId: currentUser.id,
      courseId: paymentTarget.id,
      progress: 0,
      completedLessons: [],
      certificateStatus: 'not_earned' as const,
      enrolledAt: new Date().toISOString()
    };
    db.saveEnrollments([newEnrollment, ...enrollments]);

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
      itemType: 'course' as const,
      itemId: paymentTarget.id,
      itemName: paymentTarget.title
    };
    db.savePayments([newPayment, ...currentPayments]);

    // Navigate to student dashboard
    onNavigate('client');
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1 text-xs font-bold text-purple-400 mb-3">
            <BookOpen className="h-3.5 w-3.5" />
            <span>Self-Paced Career Readiness Curricula</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Career-Accelerating Non-Technical Courses
          </h1>
          <p className="text-sm sm:text-base text-slate-400 mt-3 leading-relaxed">
            Bite-sized, high-yield frameworks designed for college students and young professionals. Unlock verifiable certificates, downloadable templates, and lifetime video access.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 bg-slate-900/60 border border-white/10 p-3.5 rounded-2xl backdrop-blur-xl">
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedCategory === cat 
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md' 
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
              placeholder="Search course title or mentor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map(crs => {
            const isEnrolled = userEnrolledCourseIds.includes(crs.id);

            return (
              <div 
                key={crs.id}
                className="group relative flex flex-col justify-between h-full rounded-2xl border border-white/10 bg-slate-900/60 hover:bg-slate-900/90 backdrop-blur-xl p-5 shadow-xl transition-all duration-300 hover:border-purple-500/40 hover:shadow-2xl hover:-translate-y-1"
              >
                {/* Course Thumbnail */}
                <div className="relative h-44 w-full overflow-hidden rounded-xl bg-slate-800 shrink-0">
                  <img 
                    src={crs.thumbnail} 
                    alt={crs.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80"></div>
                  <div className="absolute top-3 left-3">
                    <span className="rounded-lg bg-purple-600/90 backdrop-blur-md px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white shadow">
                      {crs.category}
                    </span>
                  </div>
                  {isEnrolled && (
                    <div className="absolute top-3 right-3">
                      <span className="rounded-lg bg-green-500/90 backdrop-blur-md px-2 py-0.5 text-[10px] font-extrabold uppercase text-slate-950 flex items-center gap-1 shadow">
                        <CheckCircle className="h-3 w-3" /> Enrolled
                      </span>
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-semibold text-slate-300">
                    <span className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md text-amber-400">
                      <Star className="h-3 w-3 fill-current" />
                      {crs.rating} ({crs.reviewsCount})
                    </span>
                    <span className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md text-white font-bold">
                      ₹{crs.price}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col pt-4">
                  <span className="text-[11px] font-semibold text-purple-400">Instructor: {crs.instructor}</span>
                  <h3 className="font-extrabold text-base text-white mt-1 group-hover:text-purple-400 transition leading-snug line-clamp-2 min-h-[2.75rem]">
                    {crs.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed line-clamp-2 min-h-[2.5rem]">
                    {crs.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <PlayCircle className="h-3.5 w-3.5 text-purple-400" />
                      {crs.videos.length} Video Lessons
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5 text-blue-400" />
                      {crs.resources.length} PDF Guides
                    </span>
                    <span className="flex items-center gap-1">
                      <Award className="h-3.5 w-3.5 text-amber-400" />
                      Certificate
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="mt-auto pt-4 border-t border-white/10 flex items-center gap-2">
                    <button
                      onClick={() => setSelectedCourse(crs)}
                      className="flex-1 rounded-xl border border-white/10 hover:bg-white/5 py-2.5 text-center text-xs font-bold text-slate-300 hover:text-white transition cursor-pointer"
                    >
                      Syllabus
                    </button>
                    {isEnrolled ? (
                      <button
                        onClick={() => onNavigate('client')}
                        className="flex-1 rounded-xl bg-green-500/20 border border-green-500/30 hover:bg-green-500/30 py-2.5 text-center text-xs font-bold text-green-300 transition cursor-pointer"
                      >
                        Resume Lessons
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEnrollClick(crs)}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 py-2.5 text-center text-xs font-bold text-white shadow-md shadow-purple-500/20 transition cursor-pointer"
                      >
                        <span>Enroll Now</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Syllabus Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/15 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="rounded-lg bg-purple-500/20 px-2.5 py-1 text-xs font-bold text-purple-400 uppercase">
                  {selectedCourse.category}
                </span>
                <h3 className="text-xl font-black text-white mt-2">{selectedCourse.title}</h3>
                <span className="text-xs text-slate-400">Taught by {selectedCourse.instructor}</span>
              </div>
              <button
                onClick={() => setSelectedCourse(null)}
                className="rounded-lg p-1 text-slate-400 hover:text-white transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{selectedCourse.description}</p>

            {/* Curriculum Breakdown */}
            <div className="space-y-2">
              <span className="text-xs font-extrabold text-white uppercase tracking-wider block">
                Course Curriculum ({selectedCourse.videos.length} Modules)
              </span>
              <div className="space-y-2">
                {selectedCourse.videos.map((vid, idx) => (
                  <div key={vid.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-purple-500/20 text-[11px] font-bold text-purple-400">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-slate-200">{vid.title}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {vid.duration}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Downloadable Resources */}
            {selectedCourse.resources.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-white/10">
                <span className="text-xs font-extrabold text-white uppercase tracking-wider block">
                  Included Downloadable Handouts
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedCourse.resources.map((res, i) => (
                    <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
                      <FileText className="h-4 w-4 shrink-0" />
                      <span className="truncate font-medium">{res.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-white/10 flex gap-3">
              <button
                onClick={() => setSelectedCourse(null)}
                className="flex-1 rounded-xl border border-white/10 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/5 transition cursor-pointer"
              >
                Close
              </button>
              {userEnrolledCourseIds.includes(selectedCourse.id) ? (
                <button
                  onClick={() => onNavigate('client')}
                  className="flex-1 rounded-xl bg-green-500 hover:bg-green-400 py-2.5 text-xs font-bold text-slate-950 transition cursor-pointer"
                >
                  Continue in Dashboard
                </button>
              ) : (
                <button
                  onClick={() => {
                    const target = selectedCourse;
                    setSelectedCourse(null);
                    handleEnrollClick(target);
                  }}
                  className="flex-1 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-500/25 transition cursor-pointer"
                >
                  Enroll for ₹{selectedCourse.price}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {paymentTarget && (
        <PaymentModal
          isOpen={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          onSuccess={handlePaymentSuccess}
          amount={paymentTarget.price}
          itemName={paymentTarget.title}
          itemType="course"
        />
      )}

    </div>
  );
}
