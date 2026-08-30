import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Star, Target, ShoppingBag } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Feedback() {
  const { slug } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  const [answers, setAnswers] = useState([]);
  const [hoverRating, setHoverRating] = useState(0);
  
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch(`/api/campaigns/${slug}`)
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        setCampaign(data);
        // Initialize answers based on questions format. Support both old format {q1, q2} and new array
        let initialAnswers = [];
        if (Array.isArray(data.questions)) {
          initialAnswers = data.questions.map(q => ({ type: q.type, value: q.type === 'rating' ? 0 : '' }));
        } else {
          initialAnswers = [
            { type: 'rating', value: 0, label: data.questions.q1 },
            { type: 'text', value: '', label: data.questions.q2 }
          ];
          data.questions = [
            { type: 'rating', label: data.questions.q1 },
            { type: 'text', label: data.questions.q2 }
          ];
        }
        setAnswers(initialAnswers);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [slug]);

  const updateAnswer = (index, value) => {
    const updated = [...answers];
    updated[index].value = value;
    setAnswers(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (campaign?.questions) {
      for (let i = 0; i < campaign.questions.length; i++) {
        const q = campaign.questions[i];
        const a = answers[i];
        if (q.type === 'rating' && (!a || !a.value)) {
          return alert(`Please select a rating for "${q.label || 'Rating'}"!`);
        }
        if (q.type === 'email' && q.required && (!a || !a.value || !a.value.trim())) {
          return alert('Please provide your email address!');
        }
      }
    }

    try {
      const res = await fetch(`/api/responses/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
      });
      if (res.ok) {
        setSubmitted(true);
        fireConfetti();
      }
    } catch (err) {
      alert('Failed to submit feedback');
    }
  };

  const fireConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }
      const particleCount = 50 * (timeLeft / duration);
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: Math.random(), y: Math.random() - 0.2 } }));
    }, 250);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 font-bold text-xl text-slate-400">Loading Campaign...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center bg-slate-50 font-extrabold text-2xl text-red-500">Campaign Not Found</div>;

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-400 p-6 flex-col">
        <div className="bg-white rounded-[2rem] border-b-8 border-green-600 p-12 text-center max-w-md w-full animate-bounce-pop shadow-xl">
          <div className="w-24 h-24 bg-green-500 rounded-full border-4 border-green-700 flex items-center justify-center mx-auto mb-6 shadow-md animate-float">
            <Target size={48} className="text-white" />
          </div>
          <h2 className="text-4xl font-extrabold mb-4 text-slate-800 uppercase tracking-tight">Review Submitted!</h2>
          <p className="text-lg font-bold text-slate-500 mb-8">Thank you for sharing your feedback.</p>
          <button onClick={() => window.location.reload()} className="w-full text-center py-4 px-6 rounded-2xl font-bold text-lg text-white bg-green-500 border-b-4 border-green-700 active:border-b-0 active:translate-y-1 transition-all select-none cursor-pointer">
            DONE
          </button>

          <div className="mt-10 pt-6 border-t-2 border-slate-100">
            <p className="text-sm font-bold text-slate-400">
              Want to create your own feedback campaigns? <a href="/" className="text-purple-500 hover:underline">Get started with Loopy</a>
            </p>
            <p className="text-xs font-bold text-slate-400 mt-2">
              A product of <a href="https://quickapron.com/store" target="_blank" rel="noopener noreferrer" className="hover:text-slate-600 transition-colors underline decoration-slate-300 underline-offset-2">QuickApron</a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  const primaryColor = campaign.brand_color || '#a855f7';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-6 font-sans">
      <div className="w-full max-w-xl animate-bounce-pop">
        
        {/* Progress Bar (Visual only for Gamification) */}
        <div className="w-full bg-slate-200 rounded-full h-4 mb-8 overflow-hidden border-2 border-slate-300">
          <div className="bg-green-400 h-full w-1/2 rounded-full relative" style={{backgroundColor: primaryColor}}>
            <div className="absolute top-1 left-2 right-2 h-1 bg-white/30 rounded-full"></div>
          </div>
        </div>

        <div className={`bg-white rounded-[2.5rem] p-8 md:p-10 border-2 border-slate-200 shadow-sm border-b-8 relative ${campaign.logo_data ? 'mt-20' : 'mt-4'}`}>
          {campaign.logo_data && (
            <div className="absolute -top-16 left-1/2 -translate-x-1/2">
              <div className="w-24 h-24 bg-white rounded-[2rem] border-4 border-slate-200 shadow-lg flex items-center justify-center p-2 overflow-hidden rotate-[-3deg] hover:rotate-0 transition-transform cursor-pointer">
                <img src={campaign.logo_data} alt="Brand Logo" className="w-full h-full object-contain" />
              </div>
            </div>
          )}
          <h1 className={`text-3xl font-extrabold text-center mb-8 uppercase tracking-tight ${campaign.logo_data ? 'mt-8' : ''}`} style={{ color: primaryColor }}>{campaign.title}</h1>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            {campaign.questions.map((q, index) => (
              <div key={index} className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-200">
                <label className="block text-xl font-extrabold mb-6 text-slate-700 text-center">{q.label}</label>
                
                {q.type === 'rating' ? (
                  <div className="flex gap-2 sm:gap-4 justify-center">
                    {[1,2,3,4,5].map(num => (
                      <button
                        type="button"
                        key={num}
                        className="transition-all outline-none"
                        style={{ 
                          transform: num <= (hoverRating || answers[index]?.value) ? 'scale(1.2)' : 'scale(1)',
                        }}
                        onMouseEnter={() => setHoverRating(num)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => updateAnswer(index, num)}
                      >
                        <Star 
                          size={48} 
                          className={`drop-shadow-md ${num <= (hoverRating || answers[index]?.value) ? 'text-yellow-400' : 'text-slate-300'}`} 
                          fill={num <= (hoverRating || answers[index]?.value) ? '#facc15' : 'transparent'} 
                          strokeWidth={2.5}
                        />
                      </button>
                    ))}
                  </div>
                ) : q.type === 'email' ? (
                  <input 
                    type="email"
                    required={q.required} 
                    value={answers[index]?.value || ''} 
                    onChange={e => updateAnswer(index, e.target.value)} 
                    className="w-full p-4 rounded-2xl border-[3px] border-slate-200 focus:border-purple-500 outline-none transition-all text-lg font-medium bg-white"
                    style={{ '--tw-ring-color': primaryColor + '40' }}
                    placeholder="name@example.com"
                  />
                ) : (
                  <textarea 
                    required={q.required !== false} 
                    value={answers[index]?.value || ''} 
                    onChange={e => updateAnswer(index, e.target.value)} 
                    className="w-full p-4 rounded-2xl border-[3px] border-slate-200 focus:border-purple-500 outline-none min-h-[140px] transition-all text-lg font-medium resize-none bg-white"
                    style={{ '--tw-ring-color': primaryColor + '40' }}
                    placeholder="Type your answer here..."
                  />
                )}
              </div>
            ))}
            
            <button 
              type="submit" 
              className="w-full text-center py-5 px-6 rounded-[2rem] font-extrabold text-xl text-white border-b-[6px] active:border-b-0 active:translate-y-[6px] transition-all select-none cursor-pointer uppercase tracking-wider"
              style={{ 
                backgroundColor: primaryColor, 
                borderColor: `${primaryColor}99`
              }}
            >
              SUBMIT REVIEW
            </button>
          </form>
        </div>

        {campaign.plan_type === 'free' && (
          <div className="mt-8">
            <a 
              href="https://quickapron.com/" 
              target="_blank" 
              rel="noreferrer"
              className="block bg-gradient-to-r from-emerald-600 to-green-500 rounded-[2rem] p-6 text-center text-white font-bold border-b-[6px] border-emerald-800 hover:translate-y-1 hover:border-b-2 active:border-b-0 active:translate-y-[6px] transition-all shadow-lg overflow-hidden relative group"
            >
              <div className="absolute top-0 left-0 w-full h-full bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <div className="flex items-center justify-center gap-3 mb-2">
                <ShoppingBag size={28} />
                <span className="text-2xl font-extrabold tracking-tight uppercase">QuickApron</span>
              </div>
              <p className="text-emerald-100 font-medium">Your Favorite Groceries Delivered to Your Door</p>
              <div className="mt-4 text-xs font-black tracking-widest text-emerald-800 bg-white px-4 py-1.5 rounded-full inline-block">
                POWERED BY QUICKAPRON
              </div>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
