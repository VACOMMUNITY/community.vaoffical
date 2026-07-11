import { useState } from 'react';
import { db } from '../data/mockDatabase';
import ThemeToggle from '../components/ThemeToggle';
import { Calendar, BookOpen, Users, ArrowRight, Star, Send, Shield, Award, MessageCircle, Heart, Sparkles } from 'lucide-react';

interface LandingPageProps {
  onNavigate: (view: 'landing' | 'login' | 'register' | 'client' | 'admin') => void;
  currentUser: any;
  onLogout: () => void;
}

export default function LandingPage({ onNavigate, currentUser, onLogout }: LandingPageProps) {
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const events = db.getEvents().slice(0, 3);
  const courses = db.getCourses().slice(0, 3);

  const testimonials = [
    {
      name: 'Aditya Sen',
      role: 'Student, DU',
      comment: 'The salary negotiation workshop helped me secure an internship offer that was 20% higher than their initial quote! Highly recommend COMMUNITY.VA.',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=100',
      rating: 5
    },
    {
      name: 'Rohan Sharma',
      role: 'Associate PM, TechCorp',
      comment: 'Conquering public speaking was a blocker for my career. The structured videos and Toastmaster strategies on this platform gave me immediate confidence.',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=100',
      rating: 5
    },
    {
      name: 'Pooja Hegde',
      role: 'Business Analyst',
      comment: 'The ATS compliance checklist in the Resume building course is gold. I went from zero interview calls to three callbacks in a single week.',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100',
      rating: 5
    }
  ];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setContactForm({ name: '', email: '', subject: '', message: '' });
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Sticky Header Navigation */}
      <header className="sticky top-0 z-30 w-full border-b border-slate-200/50 dark:border-slate-800/50 bg-white/85 dark:bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('landing')}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-red-500 shadow-md">
              <span className="text-lg font-extrabold text-white">VA</span>
            </div>
            <span className="text-xl font-black tracking-tight text-slate-800 dark:text-white">
              COMMUNITY<span className="text-brand-600">.VA</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <a href="#about" className="hover:text-brand-600 dark:hover:text-brand-450 transition">About</a>
            <a href="#events" className="hover:text-brand-600 dark:hover:text-brand-450 transition">Events</a>
            <a href="#courses" className="hover:text-brand-600 dark:hover:text-brand-450 transition">Courses</a>
            <a href="#testimonials" className="hover:text-brand-600 dark:hover:text-brand-450 transition">Testimonials</a>
            <a href="#contact" className="hover:text-brand-600 dark:hover:text-brand-450 transition">Contact</a>
          </nav>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            {currentUser ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onNavigate(currentUser.role === 'admin' ? 'admin' : 'client')}
                  className="rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-4 py-2 text-sm font-bold text-slate-800 dark:text-white transition"
                >
                  Dashboard
                </button>
                <button
                  onClick={onLogout}
                  className="hidden sm:inline-block text-xs font-semibold text-slate-500 dark:text-slate-450 hover:text-red-500 transition"
                >
                  Log out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('login')}
                  className="text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-brand-600 px-3 py-2 transition"
                >
                  Login
                </button>
                <button
                  onClick={() => onNavigate('register')}
                  className="rounded-xl bg-brand-600 hover:bg-brand-700 px-4 py-2 text-sm font-bold text-white shadow-md shadow-brand-500/10 hover:shadow-brand-500/20 transition hover:scale-102"
                >
                  Join Us
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        {/* Animated Background blobs */}
        <div className="absolute top-1/4 left-1/10 h-72 w-72 rounded-full bg-brand-400/10 dark:bg-brand-500/5 blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/10 h-96 w-96 rounded-full bg-red-400/10 dark:bg-red-500/5 blur-3xl animate-float [animation-delay:2s]"></div>

        <div className="mx-auto max-w-7xl px-6 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-brand-200/50 dark:border-brand-800/30 bg-brand-50/50 dark:bg-brand-950/20 px-4 py-1.5 text-xs font-bold text-brand-700 dark:text-brand-400 mb-6 animate-pulse-slow">
            <Sparkles className="h-3.5 w-3.5" />
            Developing Tomorrow's Leaders
          </div>

          <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl md:text-6xl lg:text-7xl leading-tight">
            Empowering Students with Essential{' '}
            <span className="bg-gradient-to-r from-brand-600 to-red-500 bg-clip-text text-transparent">
              Non-Technical Skills
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-slate-500 dark:text-slate-400">
            Go beyond the code. Build the communication, leadership, career readiness, and networking capabilities crucial to thrive in the professional world.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('register')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-700 px-8 py-4 text-base font-bold text-white shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30 transition hover:scale-103 duration-200"
            >
              Get Started for Free
              <ArrowRight className="h-5 w-5" />
            </button>
            <a
              href="#courses"
              className="w-full sm:w-auto flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/50 backdrop-blur px-8 py-4 text-base font-bold text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              Explore Courses
            </a>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="border-y border-slate-200/50 dark:border-slate-850 bg-white dark:bg-slate-900/40 py-12 transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 text-center">
            <div className="flex flex-col items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 mb-4">
                <Users className="h-6 w-6" />
              </div>
              <span className="text-4xl font-extrabold text-slate-950 dark:text-white">1,200+</span>
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">Active Community Members</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 mb-4">
                <Calendar className="h-6 w-6" />
              </div>
              <span className="text-4xl font-extrabold text-slate-950 dark:text-white">45+</span>
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">Workshops conducted</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-950/40 text-red-650 dark:text-red-400 mb-4">
                <BookOpen className="h-6 w-6" />
              </div>
              <span className="text-4xl font-extrabold text-slate-950 dark:text-white">12+</span>
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">Professional Courses</span>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 lg:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">Who We Are</span>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl mt-2">
                Bridging the Gap Between Technical Education and Professional Success
              </h2>
              <p className="mt-6 text-slate-500 dark:text-slate-400 leading-relaxed">
                Most academic programs focus heavily on hard technical capabilities, leaving young graduates under-prepared for the human element of corporate life. 
                COMMUNITY.VA was created to empower students and young professionals with key interpersonal toolkits.
              </p>
              
              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400">
                    <Shield className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white text-sm">Action-Backed Training</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">No dry theories. Every course offers downloadable frameworks, checklist PDFs, and practical speaking triggers.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400">
                    <Award className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white text-sm">Verified Credentials</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Earn verifiable certificates upon 100% course completions, instantly exportable for LinkedIn.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/50 text-red-650 dark:text-red-400">
                    <MessageCircle className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white text-sm">Vibrant Peer Forum</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Ask questions, share advice, and practice networking directly in our collaborative community boards.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              {/* Image with decorative border */}
              <div className="aspect-[4/3] rounded-2xl bg-gradient-to-tr from-brand-600 to-red-500 p-1 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800"
                  alt="About COMMUNITY.VA"
                  className="h-full w-full object-cover rounded-2xl"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 rounded-2xl glass-card p-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-650 text-white">
                  <Heart className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Join Rating</p>
                  <p className="font-extrabold text-slate-800 dark:text-white">4.9/5 Student Reviews</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section id="events" className="py-20 bg-white dark:bg-slate-900 transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">Interactive Learning</span>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl mt-2">Upcoming Events & Workshops</h2>
            </div>
            <button 
              onClick={() => onNavigate('register')}
              className="mt-4 sm:mt-0 flex items-center gap-1 text-sm font-bold text-brand-600 hover:text-brand-700 transition group"
            >
              View All Events
              <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {events.map((e) => (
              <div 
                key={e.id} 
                className="flex flex-col overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 shadow-sm hover:shadow-lg transition duration-300 hover:scale-101"
              >
                <div className="h-48 overflow-hidden">
                  <img src={e.banner} alt={e.title} className="h-full w-full object-cover" />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <span className="self-start text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40 px-2.5 py-1 rounded-full mb-3">
                    {e.category}
                  </span>
                  <h3 className="font-extrabold text-slate-900 dark:text-white line-clamp-1 mb-2 hover:text-brand-650 transition cursor-pointer">
                    {e.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed flex-1 mb-4">
                    {e.description}
                  </p>
                  <div className="border-t border-slate-200/50 dark:border-slate-800 pt-4 flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-400 dark:text-slate-500">{e.date}</span>
                    <span className="text-slate-900 dark:text-white font-bold">{e.fees === 0 ? 'Free' : `$${e.fees}`}</span>
                  </div>
                  <button
                    onClick={() => onNavigate('register')}
                    className="w-full mt-4 rounded-xl bg-slate-800 hover:bg-slate-700 dark:bg-slate-850 dark:hover:bg-slate-800 py-2.5 text-center text-xs font-bold text-white transition"
                  >
                    Register Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Courses Section */}
      <section id="courses" className="py-20 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">Curriculum</span>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl mt-2">Popular Courses</h2>
            </div>
            <button 
              onClick={() => onNavigate('register')}
              className="mt-4 sm:mt-0 flex items-center gap-1 text-sm font-bold text-brand-600 hover:text-brand-700 transition group"
            >
              Browse All Courses
              <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {courses.map((c) => (
              <div 
                key={c.id} 
                className="flex flex-col overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-lg transition duration-300 hover:scale-101"
              >
                <div className="h-48 overflow-hidden">
                  <img src={c.thumbnail} alt={c.title} className="h-full w-full object-cover" />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40 px-2.5 py-1 rounded-full">
                      {c.category}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      {c.rating}
                    </div>
                  </div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white line-clamp-1 mb-2">
                    {c.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed flex-1 mb-4">
                    {c.description}
                  </p>
                  <div className="border-t border-slate-200/50 dark:border-slate-800 pt-4 flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-400 dark:text-slate-500">{c.instructor}</span>
                    <span className="text-brand-600 dark:text-brand-400 font-bold text-sm">${c.price}</span>
                  </div>
                  <button
                    onClick={() => onNavigate('register')}
                    className="w-full mt-4 rounded-xl bg-brand-600 hover:bg-brand-700 py-2.5 text-center text-xs font-bold text-white transition"
                  >
                    Enroll Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white dark:bg-slate-900 transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">Success Stories</span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl mt-2">What Our Members Say</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, idx) => (
              <div key={idx} className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-6 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="flex gap-1 mb-4">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="h-4.5 w-4.5 text-amber-500 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm italic text-slate-600 dark:text-slate-355 leading-relaxed">
                    "{t.comment}"
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-3 pt-4 border-t border-slate-200/40 dark:border-slate-850">
                  <img src={t.avatar} alt={t.name} className="h-10 w-10 rounded-full object-cover" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white">{t.name}</h4>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <div className="mx-auto max-w-4xl px-6">
          <div className="rounded-3xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 sm:p-12 shadow-xl">
            <div className="text-center mb-8">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">Get in Touch</span>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl mt-1">Have Questions? Reach Out!</h2>
              <p className="text-xs text-slate-450 mt-1">Our support staff usually responds in 24 hours.</p>
            </div>

            {formSubmitted ? (
              <div className="flex flex-col items-center justify-center py-10 text-center animate-fade-in-up">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-150 text-green-600 dark:bg-green-950/30 dark:text-green-400 mb-4">
                  <Send className="h-6 w-6" />
                </div>
                <h4 className="font-extrabold text-slate-850 dark:text-white text-lg">Message Sent Successfully!</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Thank you for contacting us. We will get back to you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                      placeholder="e.g. John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                      placeholder="e.g. john@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                    placeholder="How can we help you?"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Your Message</label>
                  <textarea
                    rows={4}
                    required
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                    placeholder="Type your message here..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-700 py-3.5 text-center text-sm font-bold text-white transition"
                >
                  Send Message
                  <Send className="h-4 w-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/50 dark:border-slate-850 bg-white dark:bg-slate-900 py-12 text-slate-500 dark:text-slate-400 transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-brand-600 to-red-500 text-white font-extrabold text-sm">
                  VA
                </div>
                <span className="text-lg font-black tracking-tight text-slate-800 dark:text-white">
                  COMMUNITY.VA
                </span>
              </div>
              <p className="text-xs leading-relaxed">
                Empowering the youth with communication, resume crafting, public speaking, and EQ capabilities. Let's make career growth accessible together.
              </p>
            </div>
            
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Quick Links</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#about" className="hover:text-brand-600 transition">About Us</a></li>
                <li><a href="#events" className="hover:text-brand-600 transition">Upcoming Workshops</a></li>
                <li><a href="#courses" className="hover:text-brand-600 transition">Self-Paced Courses</a></li>
                <li><a href="#testimonials" className="hover:text-brand-600 transition">Testimonials</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Resources</h4>
              <ul className="space-y-2 text-xs">
                <li><span className="hover:text-brand-600 transition cursor-pointer" onClick={() => onNavigate('login')}>Blog Section</span></li>
                <li><span className="hover:text-brand-600 transition cursor-pointer" onClick={() => onNavigate('login')}>Discussion Forum</span></li>
                <li><span className="hover:text-brand-600 transition cursor-pointer" onClick={() => onNavigate('login')}>Student Support</span></li>
                <li><span className="hover:text-brand-600 transition cursor-pointer" onClick={() => onNavigate('login')}>Privacy & Terms</span></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Connect With Us</h4>
              <div className="flex gap-3 text-xs mb-4">
                <a href="#" className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350 hover:bg-brand-100 dark:hover:bg-brand-950/40 hover:text-brand-600 transition">Tw</a>
                <a href="#" className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350 hover:bg-brand-100 dark:hover:bg-brand-950/40 hover:text-brand-600 transition">Ln</a>
                <a href="#" className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350 hover:bg-brand-100 dark:hover:bg-brand-950/40 hover:text-brand-600 transition">Ig</a>
                <a href="#" className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350 hover:bg-brand-100 dark:hover:bg-brand-950/40 hover:text-brand-600 transition">Yt</a>
              </div>
              <p className="text-[10px] text-slate-400">© 2026 COMMUNITY.VA. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
