import { useState, useEffect } from 'react';
import { Zap, Check, Crown, Sparkles, X, ArrowRight, Star } from 'lucide-react';

export default function PlanSelectorModal({ currentPlan, onClose }) {
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [error, setError] = useState('');
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
  const defaultPlans = [
    {
      id: 'free',
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-300',
      cardBorder: 'border-slate-200 hover:border-slate-300',
      btnColor: 'bg-slate-800 hover:bg-slate-700 border-b-4 border-slate-900 text-white',
      description: 'Perfect for trying out the platform and gathering basic feedback.',
      icon: <Star size={28} className="text-slate-500" />,
      features: [
        '1 Review Campaign',
        'Star Ratings & Text',
        'Standard Support'
      ]
    },
    {
      id: 'starter',
      badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-300',
      cardBorder: 'border-slate-200 hover:border-emerald-300',
      btnColor: 'bg-emerald-500 hover:bg-emerald-400 border-b-4 border-emerald-700 text-white',
      description: 'Great for getting started and launching your first review campaigns.',
      icon: <Zap size={28} className="text-emerald-500" />,
      features: [
        'Up to 5 Review Campaigns',
        'Rating & Text Feedback',
        'Instant Email Alerts',
        'Custom Brand Colors',
        'Basic Dashboard Analytics'
      ]
    },
    {
      id: 'growth',
      popular: true,
      badgeColor: 'bg-purple-100 text-purple-700 border-purple-300',
      cardBorder: 'border-purple-300 bg-purple-50/40 shadow-md',
      btnColor: 'btn-3d-purple',
      description: 'The ultimate toolkit with email capture, webhook integrations, and CSV exports.',
      icon: <Sparkles size={28} className="text-purple-500" />,
      features: [
        'Unlimited Review Campaigns',
        'Capture Customer Emails',
        'Slack & Discord Webhooks',
        'CSV Export & Analytics Hub',
        'Daily/Weekly Email Reports',
        'QuickApron Watermark Removed'
      ]
    },
    {
      id: 'enterprise',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
      cardBorder: 'border-slate-200 hover:border-amber-300',
      btnColor: 'bg-amber-500 hover:bg-amber-400 border-b-4 border-amber-700 text-white',
      description: 'Maximum power with priority response handling and multi-webhook routing.',
      icon: <Crown size={28} className="text-amber-500" />,
      features: [
        'Everything in Growth (Pro)',
        'Priority Response Processing',
        'Unlimited Responses',
        'Multi-Webhook Routing',
        '24/7 Dedicated Support',
        'Advanced Styling Controls'
      ]
    }
  ];

  const plans = defaultPlans.map(dp => {
    const backendPlan = plansConfig?.find(p => p.id === dp.id) || {};
    return {
      ...dp,
      name: backendPlan.name || dp.id.toUpperCase(),
      price: plansConfig 
        ? formatPrice(isAnnual ? backendPlan.annualAmount : backendPlan.monthlyAmount) 
        : '...',
      period: isAnnual ? '/ year' : '/ month',
    };
  });

  const handleSubscribe = async (planId) => {
    setError('');
    setLoadingPlan(planId);

    try {
      const res = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType: planId, isAnnual })
      });

      const data = await res.json();

      if (res.ok && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        setError(data.error || 'Unable to initiate Squad checkout.');
        setLoadingPlan(null);
      }
    } catch (err) {
      console.error(err);
      setError('Network error connecting to Squad gateway.');
      setLoadingPlan(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-[100] flex items-start justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-[2.5rem] border-4 border-slate-200 border-b-8 p-6 md:p-10 max-w-5xl w-full animate-bounce-pop shadow-2xl mt-8 mb-8 sm:mt-12 relative">
        
        {/* Top Right Chunky Close Button */}
        {onClose && (
          <button 
            type="button" 
            onClick={onClose}
            className="absolute top-6 right-6 w-11 h-11 rounded-2xl bg-slate-100 border-2 border-slate-300 border-b-4 text-slate-500 hover:bg-slate-200 active:border-b-2 active:translate-y-[2px] flex items-center justify-center font-black transition-all cursor-pointer"
          >
            <X size={22} strokeWidth={3} />
          </button>
        )}

        <div className="text-center max-w-xl mx-auto mb-8">
          <div className="w-16 h-16 bg-purple-100 rounded-full border-4 border-purple-300 flex items-center justify-center mx-auto mb-4 animate-float shadow-sm">
            <Zap size={32} className="text-purple-600" />
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 uppercase tracking-tight">
            Select Your Plan
          </h2>
          <p className="text-slate-500 font-bold mt-2 text-base">
            Choose a package to unlock campaigns and customer review tools.
          </p>

          <div className="flex justify-center items-center gap-4 mt-6">
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

        {error && (
          <div className="max-w-md mx-auto mb-6 p-4 bg-red-100 text-red-600 font-bold rounded-2xl border-2 border-red-200 text-center text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {plans.map((plan) => {
            const isCurrent = currentPlan?.toLowerCase() === plan.id;
            const isLoading = loadingPlan === plan.id;

            return (
              <div 
                key={plan.id}
                className={`relative flex flex-col justify-between rounded-[2rem] p-6 border-2 border-b-6 transition-all ${
                  plan.cardBorder
                } ${plan.popular ? 'border-b-8 md:-translate-y-2' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-500 text-white font-black text-xs px-4 py-1 rounded-full uppercase tracking-widest border-2 border-purple-700 shadow-sm">
                    MOST POPULAR
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-white border-2 border-slate-200 border-b-4 flex items-center justify-center shadow-sm">
                      {plan.icon}
                    </div>
                    <span className={`px-3 py-1 rounded-2xl font-black text-xs uppercase tracking-wider border-2 ${plan.badgeColor}`}>
                      {plan.name}
                    </span>
                  </div>

                  <div className="mb-4">
                    <span className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">{plan.price}</span>
                    <span className="text-slate-400 font-bold text-sm ml-1">{plan.period}</span>
                  </div>

                  <p className="text-xs text-slate-500 font-bold mb-6 leading-relaxed">
                    {plan.description}
                  </p>

                  <div className="border-t-2 border-slate-200/80 pt-4 mb-6 space-y-3">
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs font-extrabold text-slate-700">
                        <div className="mt-0.5 w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-300">
                          <Check size={12} strokeWidth={4} />
                        </div>
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  {isCurrent ? (
                    <div className="w-full py-3.5 text-center font-black text-emerald-600 bg-emerald-50 rounded-2xl border-2 border-emerald-300 border-b-4 text-sm uppercase tracking-wider">
                      ✓ CURRENT PLAN
                    </div>
                  ) : plan.id === 'free' ? (
                    <div className="w-full py-3.5 text-center font-black text-slate-500 bg-slate-50 rounded-2xl border-2 border-slate-200 border-b-4 text-sm uppercase tracking-wider">
                      FREE DEFAULT
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={loadingPlan !== null}
                      onClick={() => handleSubscribe(plan.id)}
                      className={`w-full py-3.5 px-4 rounded-2xl font-black text-base transition-all select-none cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2 ${plan.btnColor}`}
                    >
                      {isLoading ? 'CONNECTING...' : 'SELECT PLAN'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Action Footer with Cancel / Later Button */}
        <div className="pt-6 border-t-2 border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs font-bold text-slate-400">
            🔒 Secured by Squad Payment Gateway
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="btn-3d-gray py-2.5 px-8 text-sm uppercase font-black tracking-wider w-full sm:w-auto"
            >
              CANCEL / DO THIS LATER
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
