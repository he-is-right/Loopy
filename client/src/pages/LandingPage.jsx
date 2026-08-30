import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Zap, MessageSquare, BarChart3, Bell, QrCode, Shield, ArrowRight, ChevronDown, Flame, Crown, Sparkles, Check, Users, TrendingUp, Target, Utensils, Scissors, ShoppingBag, Truck, Hotel, Tent, PartyPopper } from 'lucide-react';

export default function LandingPage({ user }) {
  const navigate = useNavigate();
  const [demoRating, setDemoRating] = useState(0);
  const [demoHover, setDemoHover] = useState(0);
  const [demoText, setDemoText] = useState('');
  const [demoSubmitted, setDemoSubmitted] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [visibleSections, setVisibleSections] = useState({});
  const sectionRefs = useRef({});
  const [isAnnual, setIsAnnual] = useState(false);
  const [plansConfig, setPlansConfig] = useState(null);

  useEffect(() => {
    fetch('/api/payment/plans')
      .then(res => res.json())
      .then(data => {
        if (data.success) setPlansConfig(data.plans);
      })
      .catch(err => console.error(err));
  }, []);

  const formatPrice = (amount) => amount === undefined ? '...' : `₦${amount.toLocaleString()}`;

  // Simplified: removed scroll-reveal to ensure content is always visible



  const handleDemoSubmit = () => {
    if (demoRating > 0) setDemoSubmitted(true);
  };

  const faqs = [
    { q: 'How quickly can I set up my first campaign?', a: 'Under 5 minutes. Create an account, name your campaign, add your questions, and share the generated link or QR code with customers instantly.' },
    { q: 'Do my customers need to create an account?', a: 'No. Customers simply open the link or scan the QR code and submit their feedback — no sign-up, no login, no friction.' },
    { q: 'What payment methods do you accept?', a: 'We process payments through Squad (powered by GTCO / HabariPay), supporting bank transfers, cards, and USSD payments across Nigeria.' },
    { q: 'Can I export my feedback data?', a: 'Yes! Growth and Enterprise plans include one-click CSV export of all your campaign responses for offline analysis.' },
    { q: 'How are notifications delivered?', a: 'You can receive instant email alerts, daily/weekly/monthly digests, plus real-time Slack and Discord webhook notifications on Growth plans and above.' },
  ];

  const useCases = [
    { icon: <Utensils size={40} className="text-orange-500" />, title: 'Restaurants & Cafes', desc: 'QR codes on tables and receipts. Know exactly what customers think before they leave a bad Google review.' },
    { icon: <Scissors size={40} className="text-pink-500" />, title: 'Salons & Spas', desc: 'Post-appointment feedback links via WhatsApp. Track stylist performance and client satisfaction trends.' },
    { icon: <ShoppingBag size={40} className="text-purple-500" />, title: 'Retail & E-Commerce', desc: 'In-package QR codes and post-purchase emails. Identify product issues before they become returns.' },
    { icon: <Truck size={40} className="text-blue-500" />, title: 'Logistics & Delivery', desc: 'Post-delivery SMS/WhatsApp feedback. Pinpoint service failures and route-specific complaints.' },
    { icon: <Hotel size={40} className="text-teal-500" />, title: 'Hotels & Hospitality', desc: 'Room QR codes and checkout follow-ups. Resolve guest issues in real-time, not after checkout.' },
    { icon: <Tent size={40} className="text-emerald-500" />, title: 'Events & Venues', desc: 'Post-event feedback campaigns. Measure attendee satisfaction and improve future planning.' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans overflow-x-hidden">

      {/* ─── STICKY NAVIGATION ─── */}
      <nav className="sticky top-0 bg-white/95 backdrop-blur-sm border-b-2 border-slate-200 z-50 px-6 md:px-12 xl:px-16 py-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-2xl font-extrabold text-purple-500 tracking-tight flex items-center gap-2">
            <div className="w-9 h-9 bg-purple-500 rounded-full border-2 border-purple-700 shadow-sm flex items-center justify-center text-white text-lg font-black">L</div>
            LOOPY
          </div>

          <div className="hidden md:flex items-center gap-6 text-sm font-bold text-slate-500">
            <a href="#features" className="hover:text-purple-500 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-purple-500 transition-colors">How It Works</a>
            <a href="#pricing" className="hover:text-purple-500 transition-colors">Pricing</a>
            <a href="#use-cases" className="hover:text-purple-500 transition-colors">Use Cases</a>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <button onClick={() => navigate('/dashboard')} className="btn-3d-purple text-sm !py-2.5 !px-6">
                DASHBOARD
              </button>
            ) : (
              <>
                <button onClick={() => navigate('/login')} className="text-sm font-bold text-slate-500 hover:text-purple-500 transition-colors hidden sm:block whitespace-nowrap">
                  Log In
                </button>
                <button onClick={() => navigate('/signup')} className="btn-3d-purple text-sm !py-2.5 !px-6">
                  GET STARTED
                </button>
              </>
            )}
          </div>
        </div>
      </nav>


      {/* ─── HERO SECTION ─── */}
      <section className="relative pt-16 pb-12 md:pt-24 md:pb-16 px-6 md:px-12 xl:px-16">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          
          {/* Left — Copy */}
          <div className="max-w-xl">

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-800 leading-[1.1] tracking-tight mb-6">
              Turn Customer Feedback Into{' '}
              <span className="text-purple-600">
                Business Growth
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed mb-8 max-w-md">
              Create branded review pages, collect customer ratings, and get instant alerts. Understand what your customers are really saying — and take action.
            </p>
            <div className="flex flex-wrap gap-4">
              <button onClick={() => navigate('/signup')} className="btn-3d-purple text-base !py-4 !px-8 flex items-center gap-2">
                GET STARTED FREE <ArrowRight size={18} strokeWidth={3} />
              </button>
            </div>
            <div className="flex items-center gap-6 mt-8 text-sm font-bold text-slate-400">
              <span className="flex items-center gap-1.5"><Check size={16} className="text-emerald-500" /> No credit card required</span>
              <span className="flex items-center gap-1.5"><Check size={16} className="text-emerald-500" /> 5-minute setup</span>
            </div>
          </div>

          {/* Right — Interactive Demo Card */}
          <div id="demo" className="relative">
            <div className="absolute -inset-4 bg-purple-100/30 rounded-[3rem] blur-xl"></div>
            <div className="relative bg-white rounded-[2.5rem] border-4 border-slate-200 border-b-8 p-8 shadow-xl max-w-md mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-purple-500 border-2 border-purple-700 border-b-4 flex items-center justify-center text-white text-xl font-black">L</div>
                <div>
                  <p className="font-black text-slate-800 text-lg">Loopy Restaurant</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Customer Feedback</p>
                </div>
              </div>

              {!demoSubmitted ? (
                <>
                  <p className="font-extrabold text-slate-700 text-sm mb-3 uppercase tracking-wider">How was your experience?</p>
                  <div className="flex gap-2 mb-6">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setDemoHover(star)}
                        onMouseLeave={() => setDemoHover(0)}
                        onClick={() => setDemoRating(star)}
                        className="transition-all duration-150 hover:scale-125 active:scale-95 cursor-pointer"
                      >
                        <Star
                          size={36}
                          fill={(demoHover || demoRating) >= star ? '#facc15' : 'none'}
                          stroke={(demoHover || demoRating) >= star ? '#eab308' : '#cbd5e1'}
                          strokeWidth={2}
                        />
                      </button>
                    ))}
                  </div>

                  <p className="font-extrabold text-slate-700 text-sm mb-3 uppercase tracking-wider">Any additional feedback?</p>
                  <textarea
                    className="w-full p-4 rounded-2xl border-2 border-slate-200 bg-slate-50 text-sm font-medium text-slate-600 resize-none focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all"
                    rows={3}
                    placeholder="Tell us what you think..."
                    value={demoText}
                    onChange={(e) => setDemoText(e.target.value)}
                  ></textarea>

                  <button
                    onClick={handleDemoSubmit}
                    disabled={demoRating === 0}
                    className={`w-full mt-5 py-3.5 rounded-2xl font-black text-base uppercase tracking-wider transition-all ${
                      demoRating > 0
                        ? 'btn-3d-purple'
                        : 'bg-slate-200 text-slate-400 border-b-4 border-slate-300 cursor-not-allowed'
                    }`}
                  >
                    SUBMIT FEEDBACK
                  </button>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="mb-4 animate-bounce flex justify-center text-emerald-500">
                    <PartyPopper size={64} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 mb-2">Thank You!</h3>
                  <p className="text-slate-500 font-bold text-sm">Your feedback helps us improve.</p>
                  <button onClick={() => { setDemoSubmitted(false); setDemoRating(0); }} className="mt-6 text-purple-500 font-bold text-sm hover:underline cursor-pointer">
                    Try again ↺
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>


      {/* ─── SOCIAL PROOF BAR ─── */}
      <section className="py-8 bg-white border-y-2 border-slate-100">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 px-6 md:px-12 xl:px-16 text-center">
          {[
            { value: '5 min', label: 'To Launch Campaign' },
            { value: '0', label: 'Customer Login Required' },
            { value: '24/7', label: 'Real-Time Alerts' },
            { value: '100%', label: 'Mobile Friendly' },
          ].map((stat, i) => (
            <div key={i}>
              <p className="text-3xl md:text-4xl font-black text-purple-500">{stat.value}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>


      {/* ─── THE FEEDBACK LOOP ─── */}
      <section
        id="how-it-works"
        className="pt-12 pb-16 md:pt-16 md:pb-20 px-6 md:px-12 xl:px-16"
      >
        <div className="max-w-5xl mx-auto text-center">

          <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-4">
            From Feedback to Action in 5 Steps
          </h2>
          <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto mb-14">
            Loopy isn't just a form builder. It's a complete feedback-to-action engine designed to close the loop between your customers and your business.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            {[
              { step: '1', icon: <MessageSquare size={28} />, title: 'Collect', desc: 'Branded review pages, QR codes, and shareable links.', color: 'bg-purple-100 text-purple-600 border-purple-300' },
              { step: '2', icon: <BarChart3 size={28} />, title: 'Understand', desc: 'Ratings, trends, and analytics on your dashboard.', color: 'bg-blue-100 text-blue-600 border-blue-300' },
              { step: '3', icon: <Bell size={28} />, title: 'Alert', desc: 'Instant email, Slack, and Discord notifications.', color: 'bg-amber-100 text-amber-600 border-amber-300' },
              { step: '4', icon: <Target size={28} />, title: 'Act', desc: 'Triage, resolve, and assign customer feedback.', color: 'bg-emerald-100 text-emerald-600 border-emerald-300' },
              { step: '5', icon: <TrendingUp size={28} />, title: 'Improve', desc: 'Track satisfaction gains over time.', color: 'bg-pink-100 text-pink-600 border-pink-300' },
            ].map((item, i) => (
              <div key={i} className="relative flex flex-col items-center">
                <div className={`w-16 h-16 rounded-2xl border-2 border-b-4 flex items-center justify-center mb-3 ${item.color}`}>
                  {item.icon}
                </div>
                <h3 className="font-black text-slate-800 text-base mb-1">{item.title}</h3>
                <p className="text-xs font-medium text-slate-500 leading-relaxed">{item.desc}</p>
                {i < 4 && (
                  <ArrowRight size={18} className="hidden sm:block absolute -right-3 top-7 text-slate-300" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ─── FEATURES ─── */}
      <section
        id="features"
        className="py-16 md:py-20 px-6 md:px-12 xl:px-16 bg-white"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">

            <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-4">
              Everything You Need to Listen & Act
            </h2>
            <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">
              Purpose-built tools for businesses that want to stop guessing and start understanding what their customers actually think.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <Star size={24} />, color: 'bg-yellow-100 text-yellow-600 border-yellow-300', title: 'Star Ratings & Reviews', desc: 'Collect 1–5 star ratings paired with open-ended text feedback for rich customer insight.' },
              { icon: <QrCode size={24} />, color: 'bg-purple-100 text-purple-600 border-purple-300', title: 'QR Code Generator', desc: 'Print QR codes for tables, packaging, receipts, and storefronts. Customers scan and rate in seconds.' },
              { icon: <Bell size={24} />, color: 'bg-red-100 text-red-600 border-red-300', title: 'Instant & Digest Alerts', desc: 'Real-time alerts for critical feedback, plus daily/weekly/monthly summaries delivered to your inbox.' },
              { icon: <BarChart3 size={24} />, color: 'bg-blue-100 text-blue-600 border-blue-300', title: 'Analytics Dashboard', desc: 'Track rating averages, response trends, and campaign performance at a glance.' },
              { icon: <MessageSquare size={24} />, color: 'bg-emerald-100 text-emerald-600 border-emerald-300', title: 'Slack & Discord Webhooks', desc: 'Get instant customer feedback posted straight to your team communication channels.' },
              { icon: <Flame size={24} />, color: 'bg-orange-100 text-orange-600 border-orange-300', title: 'Gamified Engagement', desc: 'XP rewards and daily streaks encourage you to consistently check, respond to, and act on feedback.' },
              { icon: <Shield size={24} />, color: 'bg-indigo-100 text-indigo-600 border-indigo-300', title: 'Custom Brand Colors', desc: 'Every feedback page matches your brand identity — your colors, your logo, your voice.' },
              { icon: <Users size={24} />, color: 'bg-pink-100 text-pink-600 border-pink-300', title: 'Customer Email Capture', desc: 'Optionally collect customer emails to follow up, build relationships, and close the feedback loop.' },
              { icon: <Target size={24} />, color: 'bg-teal-100 text-teal-600 border-teal-300', title: 'Resolution Tracking', desc: 'Mark feedback as New, Reviewing, or Resolved — track how your team responds to customer issues.' },
            ].map((feat, i) => (
              <div key={i} className="bg-slate-50 rounded-[2rem] border-2 border-slate-200 border-b-4 p-6 hover:border-purple-300 transition-all group">
                <div className={`w-12 h-12 rounded-2xl border-2 border-b-4 flex items-center justify-center mb-4 ${feat.color}`}>
                  {feat.icon}
                </div>
                <h3 className="font-black text-slate-800 text-lg mb-2">{feat.title}</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ─── USE CASES ─── */}
      <section
        id="use-cases"
        className="py-16 md:py-20 px-6 md:px-12 xl:px-16"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">

            <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-4">
              Who Uses Loopy?
            </h2>
            <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">
              Any business that serves customers and wants to know what they really think.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {useCases.map((uc, i) => (
              <div key={i} className="bg-white rounded-[2rem] border-2 border-slate-200 border-b-4 p-6 hover:border-purple-300 transition-all">
                <div className="mb-6">{uc.icon}</div>
                <h3 className="font-black text-slate-800 text-lg mb-2">{uc.title}</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">{uc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ─── PRICING ─── */}
      <section
        id="pricing"
        className="py-16 md:py-20 px-6 md:px-12 xl:px-16 bg-white"
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">

            <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-4">
              Plans That Grow With You
            </h2>
            <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto mb-8">
              Start small, scale up. Every plan includes our core feedback collection engine. No hidden fees.
            </p>

            <div className="flex justify-center items-center gap-4 mb-14">
              <span className={`font-bold text-sm transition-colors ${!isAnnual ? 'text-slate-800' : 'text-slate-400'}`}>Monthly</span>
              <button 
                onClick={() => setIsAnnual(!isAnnual)}
                className="relative w-16 h-8 rounded-full bg-purple-200 border-2 border-purple-300 p-1 transition-colors flex items-center cursor-pointer"
              >
                <div className={`w-5 h-5 rounded-full bg-purple-500 shadow-sm transition-transform duration-300 ${isAnnual ? 'translate-x-8' : 'translate-x-0'}`}></div>
              </button>
              <span className={`font-bold text-sm flex items-center gap-2 transition-colors ${isAnnual ? 'text-slate-800' : 'text-slate-400'}`}>
                Annually
                <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">Save 20%</span>
              </span>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                id: 'free',
                badge: 'bg-slate-100 text-slate-700 border-slate-300',
                btn: 'bg-slate-800 hover:bg-slate-700 border-b-4 border-slate-900 text-white',
                border: 'border-slate-200 hover:border-slate-300',
                icon: <Star size={24} className="text-slate-500" />,
                desc: 'Perfect for trying out the platform and gathering basic feedback.',
                features: ['1 Campaign', 'Star Ratings & Text', 'Standard Support']
              },
              {
                id: 'starter',
                badge: 'bg-emerald-100 text-emerald-700 border-emerald-300',
                btn: 'bg-emerald-500 hover:bg-emerald-400 border-b-4 border-emerald-700 text-white',
                border: 'border-slate-200 hover:border-emerald-300',
                icon: <Zap size={24} className="text-emerald-500" />,
                desc: 'Perfect for solo entrepreneurs launching their first feedback campaign.',
                features: ['Up to 5 Campaigns', 'Star Ratings & Text', 'Instant Email Alerts', 'Custom Brand Colors', 'Basic Analytics']
              },
              {
                id: 'growth',
                popular: true,
                badge: 'bg-purple-100 text-purple-700 border-purple-300',
                btn: 'btn-3d-purple',
                border: 'border-purple-300 bg-purple-50/40',
                icon: <Sparkles size={24} className="text-purple-500" />,
                desc: 'The full toolkit for growing businesses ready to act on customer intelligence.',
                features: ['Unlimited Campaigns', 'Email Capture', 'Slack/Discord Webhooks', 'CSV Export & Analytics', 'Custom Alert Schedules', 'Watermark Removed']
              },
              {
                id: 'enterprise',
                badge: 'bg-amber-100 text-amber-800 border-amber-300',
                btn: 'bg-amber-500 hover:bg-amber-400 border-b-4 border-amber-700 text-white',
                border: 'border-slate-200 hover:border-amber-300',
                icon: <Crown size={24} className="text-amber-500" />,
                desc: 'Maximum power for multi-location businesses and enterprise teams.',
                features: ['Everything in Growth', 'Priority Processing', 'Unlimited Responses', 'Multi-Webhook Routing', '24/7 Dedicated Support', 'Advanced Brand Controls']
              },
            ].map((plan, i) => {
              const backendPlan = plansConfig?.find(p => p.id === plan.id) || {};
              const price = plansConfig 
                ? formatPrice(isAnnual ? backendPlan.annualAmount : backendPlan.monthlyAmount) 
                : '...';
              const name = backendPlan.name || plan.id.toUpperCase();
              
              return (
              <div key={i} className={`relative flex flex-col justify-between rounded-[2rem] border-2 border-b-6 p-6 transition-all ${plan.border} ${plan.popular ? 'border-b-8 md:-translate-y-3 shadow-lg' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-500 text-white font-black text-xs px-5 py-1.5 rounded-full uppercase tracking-widest border-2 border-purple-700 shadow-sm whitespace-nowrap">
                    MOST POPULAR
                  </div>
                )}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-2xl bg-white border-2 border-slate-200 border-b-4 flex items-center justify-center shadow-sm">
                      {plan.icon}
                    </div>
                    <span className={`px-3 py-1 rounded-2xl font-black text-xs uppercase tracking-wider border-2 ${plan.badge}`}>{name}</span>
                  </div>
                  <div className="mb-4">
                    <span className="text-3xl md:text-4xl font-black text-slate-800">{price}</span>
                    <span className="text-slate-400 font-bold text-sm ml-1">{isAnnual ? '/ year' : '/ month'}</span>
                  </div>
                  <p className="text-xs text-slate-500 font-bold mb-6 leading-relaxed">{plan.desc}</p>
                  <div className="border-t-2 border-slate-200/80 pt-4 mb-6 space-y-3">
                    {plan.features.map((f, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs font-extrabold text-slate-700">
                        <div className="mt-0.5 w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-300">
                          <Check size={12} strokeWidth={4} />
                        </div>
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <button onClick={() => navigate('/signup')} className={`w-full py-3.5 px-4 rounded-2xl font-black text-base transition-all select-none cursor-pointer uppercase tracking-wider ${plan.btn}`}>
                  GET STARTED
                </button>
              </div>
            );
            })}
          </div>
        </div>
      </section>


      {/* ─── FAQ ─── */}
      <section
        id="faq"
        className="py-16 md:py-20 px-6 md:px-12 xl:px-16"
      >
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl border-2 border-slate-200 border-b-4 overflow-hidden">
                <button
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left cursor-pointer"
                >
                  <span className="font-black text-slate-700 text-sm pr-4">{faq.q}</span>
                  <ChevronDown size={20} className={`text-slate-400 shrink-0 transition-transform duration-200 ${activeFaq === i ? 'rotate-180' : ''}`} />
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${activeFaq === i ? 'max-h-40 pb-5 px-5' : 'max-h-0'}`}>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ─── CTA SECTION ─── */}
      <section className="py-16 md:py-20 px-6 md:px-12 xl:px-16 bg-slate-900">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
            Ready to Hear What Your Customers Think?
          </h2>
          <p className="text-slate-400 font-medium text-lg mb-8 max-w-xl mx-auto">
            Create your first branded review campaign in under 5 minutes. No credit card required to get started.
          </p>
          <button onClick={() => navigate('/signup')} className="btn-3d-purple text-base !py-4 !px-10 uppercase tracking-wider cursor-pointer text-white">
            CREATE YOUR FIRST CAMPAIGN <ArrowRight size={18} className="inline ml-2" />
          </button>
        </div>
      </section>


      {/* ─── FOOTER ─── */}
      <footer className="bg-slate-800 text-slate-400 py-12 px-6 md:px-12 xl:px-16">
        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-purple-500 rounded-full border-2 border-purple-700 flex items-center justify-center text-white text-sm font-black">L</div>
              LOOPY
            </div>
            <p className="text-sm font-medium leading-relaxed">
              The customer feedback platform that helps businesses collect, understand, and act on what customers really think.
            </p>
          </div>

          <div>
            <h4 className="font-black text-white text-sm uppercase tracking-wider mb-4">Product</h4>
            <ul className="space-y-2 text-sm font-medium">
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#use-cases" className="hover:text-white transition-colors">Use Cases</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-white text-sm uppercase tracking-wider mb-4">Company</h4>
            <ul className="space-y-2 text-sm font-medium">
              <li><span className="text-slate-500">About (Coming Soon)</span></li>
              <li><span className="text-slate-500">Blog (Coming Soon)</span></li>
              <li><span className="text-slate-500">Careers (Coming Soon)</span></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-white text-sm uppercase tracking-wider mb-4">Legal</h4>
            <ul className="space-y-2 text-sm font-medium">
              <li><span className="text-slate-500">Privacy Policy</span></li>
              <li><span className="text-slate-500">Terms of Service</span></li>
            </ul>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-10 pt-8 border-t border-slate-700 flex justify-center items-center">
          <p className="text-xs font-bold text-slate-500">© {new Date().getFullYear()} Loopy by QuickApron. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
