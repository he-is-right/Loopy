import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const ref = searchParams.get('ref') || searchParams.get('reference');
  const mockSuccess = searchParams.get('mock_success');

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [planType, setPlanType] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!ref) {
      setErrorMsg('No payment transaction reference detected.');
      setLoading(false);
      return;
    }

    const verify = async () => {
      try {
        const query = mockSuccess ? `?mock_success=true` : '';
        const res = await fetch(`/api/payment/verify/${ref}${query}`);
        const data = await res.json();

        if (res.ok && data.success) {
          setSuccess(true);
          setPlanType(data.planType);
          fireConfetti();
        } else {
          setErrorMsg(data.error || 'Payment verification was unsuccessful.');
        }
      } catch (err) {
        setErrorMsg('Network error verifying payment with Squad.');
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [ref, mockSuccess]);

  const fireConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="min-h-screen bg-purple-50 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] border-2 border-slate-200 border-b-8 shadow-xl p-8 text-center animate-bounce-pop">
        
        {loading ? (
          <div className="py-12 space-y-4">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <h2 className="text-2xl font-extrabold text-slate-800 uppercase tracking-tight">Verifying Payment...</h2>
            <p className="text-sm font-bold text-slate-400">Confirming transaction with Squad Gateway</p>
          </div>
        ) : success ? (
          <div className="py-6 space-y-6">
            <div className="w-20 h-20 bg-emerald-100 rounded-full border-4 border-emerald-300 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 size={44} className="text-emerald-500" />
            </div>

            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-700 font-extrabold text-xs uppercase tracking-widest mb-3 border border-purple-200">
                <Zap size={14} fill="currentColor" /> {planType.toUpperCase()} ACTIVATED
              </span>
              <h2 className="text-3xl font-extrabold text-slate-800 uppercase tracking-tight">Payment Successful!</h2>
              <p className="text-slate-500 font-bold text-sm mt-2">
                Your account has been upgraded. You now have access to all features under your subscription.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-200 text-left text-xs space-y-1 font-bold text-slate-600">
              <div className="flex justify-between">
                <span>Reference:</span>
                <span className="font-mono text-slate-800">{ref}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="text-emerald-600">Verified & Active</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/dashboard')}
              className="w-full btn-3d-purple flex items-center justify-center gap-2"
            >
              GO TO DASHBOARD <ArrowRight size={18} />
            </button>
          </div>
        ) : (
          <div className="py-6 space-y-6">
            <div className="w-20 h-20 bg-red-100 rounded-full border-4 border-red-300 flex items-center justify-center mx-auto shadow-md">
              <XCircle size={44} className="text-red-500" />
            </div>

            <div>
              <h2 className="text-3xl font-extrabold text-slate-800 uppercase tracking-tight">Payment Incomplete</h2>
              <p className="text-slate-500 font-bold text-sm mt-2">
                {errorMsg}
              </p>
            </div>

            <button
              onClick={() => navigate('/dashboard')}
              className="w-full btn-3d-gray"
            >
              RETURN TO DASHBOARD
            </button>
          </div>
        )}

        <div className="pt-6 border-t-2 border-slate-100 flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-400">
          <ShieldCheck size={14} className="text-purple-500" />
          <span>Processed by Squad (HabariPay / GTCO)</span>
        </div>
      </div>
    </div>
  );
}
