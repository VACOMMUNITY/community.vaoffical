import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: Date;
}

export default function AIChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'ai',
      text: 'Hello! I am your COMMUNITY.VA Coach. Ask me anything about Resume Building, Public Speaking, Leadership, Networking, or our upcoming workshops and discount codes!',
      timestamp: new Date()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const getAIResponse = (text: string): string => {
    const q = text.toLowerCase();
    
    if (q.includes('hello') || q.includes('hi') || q.includes('hey')) {
      return 'Hey there! How can I help you level up your non-technical skills today?';
    }
    
    if (q.includes('resume') || q.includes('cv') || q.includes('ats')) {
      return 'For resumes, remember: 1. Avoid graphical layouts or text columns (they break ATS parsers). 2. Use action verbs (e.g., "Spearheaded", "Optimized"). 3. Quantify achievements (e.g., "increased sales by 15%"). Check out our Course "Resume Building & High-Impact Interview Strategy" for template downloads!';
    }
    
    if (q.includes('public speaking') || q.includes('presentation') || q.includes('stage fright')) {
      return 'Conquering stage fright starts with your breathing. Try Box Breathing (4 seconds inhale, 4 seconds hold, 4 seconds exhale, 4 seconds hold). Also, record yourself speaking for 2 minutes to evaluate filler words. Our "Public Speaking & Influential Presentation Mastery" course goes into detail on structural design!';
    }
    
    if (q.includes('leader') || q.includes('leadership') || q.includes('empathy') || q.includes('team')) {
      return 'True leadership is rooted in Active Listening. Seek first to understand, then to be understood. If you want to develop leadership competencies, we highly recommend our "Emotional Intelligence & Leadership Foundations" course.';
    }

    if (q.includes('network') || q.includes('linkedin') || q.includes('pitch')) {
      return 'To network effectively on LinkedIn, optimize your headline to show your VALUE rather than just a job title. When cold-messaging, keep it under 100 words, ask for a brief 10-minute informational interview, and never pitch a sale on your first touchpoint!';
    }

    if (q.includes('coupon') || q.includes('discount') || q.includes('code') || q.includes('offer')) {
      return 'You can use the coupon code "WELCOME50" during checkout to save 50% on any of our skill development courses!';
    }

    if (q.includes('event') || q.includes('workshop') || q.includes('register')) {
      return 'To attend our interactive workshops (like "The Art of Negotiating Your First Salary"), simply log into your student dashboard, navigate to the "Events" tab, click Register, and complete the check-out!';
    }

    if (q.includes('price') || q.includes('cost') || q.includes('free')) {
      return 'Our workshops range from Free to $49. Courses are priced between $19 and $49 (before discount). Make sure to apply a coupon code like WELCOME50 for half off!';
    }

    return "That is a great question! Developing non-technical skills (or 'human skills') is the ultimate accelerator for career growth. Could you tell me more about what specific goal you are trying to achieve (e.g., drafting a resume, pitching a project, or leading a team)?";
  };

  const handleSend = (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI thinking and typing delay
    setTimeout(() => {
      setIsTyping(false);
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: getAIResponse(textToSend),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
    }, 1000);
  };

  const quickPrompts = [
    { label: 'Resume Tips', query: 'Give me tips for an ATS friendly resume' },
    { label: 'Public Speaking', query: 'How do I overcome stage fright?' },
    { label: 'Discount Code', query: 'Are there any discount codes?' },
    { label: 'Workshops', query: 'How do I register for an event?' }
  ];

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg hover:bg-brand-700 hover:scale-105 transition-all duration-300 ring-4 ring-brand-500/10 focus:outline-none"
        >
          <MessageSquare className="h-6 w-6" />
        </button>
      )}

      {/* Chat Box */}
      {isOpen && (
        <div className="flex h-[500px] w-[calc(100vw-2rem)] sm:w-[360px] flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl transition-all duration-300 animate-fade-in-up">
          {/* Header */}
          <div className="flex items-center justify-between rounded-t-2xl bg-brand-600 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm">COMMUNITY.VA Coach</h4>
                <div className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse"></span>
                  <span className="text-[10px] text-brand-100">AI Active</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 hover:bg-brand-700 transition text-white/80 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages View */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 max-w-[85%] ${m.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                    m.sender === 'ai' ? 'bg-brand-100 text-brand-700' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {m.sender === 'ai' ? <Bot className="h-3 w-3" /> : <User className="h-3 w-3" />}
                </div>
                <div
                  className={`rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    m.sender === 'ai'
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none'
                      : 'bg-brand-600 text-white rounded-tr-none'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2.5 max-w-[85%]">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                  <Bot className="h-3 w-3" />
                </div>
                <div className="rounded-2xl rounded-tl-none bg-slate-100 dark:bg-slate-800 px-4 py-2.5 text-sm">
                  <div className="flex gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400"></span>
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:0.2s]"></span>
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:0.4s]"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Action Helpers */}
          {messages.length === 1 && (
            <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800/80">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Quick Prompts</span>
              <div className="flex flex-wrap gap-1.5">
                {quickPrompts.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => handleSend(p.query)}
                    className="text-xs bg-white dark:bg-slate-800 hover:bg-brand-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 transition"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Footer */}
          <div className="border-t border-slate-200 dark:border-slate-800 p-3 bg-white dark:bg-slate-900 rounded-b-2xl">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ask your coach..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
                className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
              />
              <button
                onClick={() => handleSend(input)}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white hover:bg-brand-700 transition"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
