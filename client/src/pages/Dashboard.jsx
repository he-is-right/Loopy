import { useState, useEffect, useRef } from 'react';
import { LogOut, Flame, Star, Zap, Settings, ShieldCheck, Crown, Sparkles, QrCode, Download, X, Eye, ImagePlus, UploadCloud, BarChart3, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { HexColorPicker } from "react-colorful";
import { QRCodeSVG } from 'qrcode.react';
import PlanSelectorModal from '../components/PlanSelectorModal';
import { convertToWebP } from '../utils/imageUtils';

export default function Dashboard({ user, onLogout }) {
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [responses, setResponses] = useState([]);
  
  const [newCamp, setNewCamp] = useState({ title: '', brandColor: '#a855f7', logoData: null });
  const [questions, setQuestions] = useState([
    { id: 1, type: 'rating', label: '' },
    { id: 2, type: 'text', label: '' }
  ]);
  const [captureEmail, setCaptureEmail] = useState(false);
  const [emailRequired, setEmailRequired] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [showPlanSelector, setShowPlanSelector] = useState(false);
  const [isCustomColor, setIsCustomColor] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [showMobileForm, setShowMobileForm] = useState(false);
  const [activeTab, setActiveTab] = useState('responses');
  const [showQrModal, setShowQrModal] = useState(false);
  const qrRef = useRef(null);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  
  const currentPlan = (user.planType || 'free').toLowerCase();
  const hasActivePlan = ['starter', 'growth', 'enterprise', 'pro'].includes(currentPlan);
  const isGrowthOrAbove = ['growth', 'enterprise', 'pro'].includes(currentPlan);
  const [hasAutoRenew, setHasAutoRenew] = useState(user.hasAutoRenew || false);
  
  const [notifFreq, setNotifFreq] = useState(user.notificationFrequency || 'immediate');
  const [savingSettings, setSavingSettings] = useState(false);
  
  // Real XP and Streak from Backend
  const [localXP, setLocalXP] = useState(user.xp || 0);
  const streakDays = user.streakDays || 1;

  useEffect(() => {
    fetch('/api/campaigns')
      .then(res => res.json())
      .then(data => setCampaigns(data));
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    onLogout();
  };

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [customAlert, setCustomAlert] = useState(null); // { message: string, type: 'success' | 'error' }

  const showAlert = (message, type = 'error') => {
    setCustomAlert({ message, type });
  };

  const saveSettings = async () => {
    setSavingSettings(true);
    try {
      const res = await fetch('/api/auth/me/frequency', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ frequency: notifFreq })
      });
      if (!res.ok) {
        showAlert('Failed to save settings');
      } else {
        showAlert('Settings saved successfully', 'success');
      }
    } catch(err) {
      showAlert('Network error');
    }
    setTimeout(() => setSavingSettings(false), 800);
  };

  const handleCancelSubscription = async () => {
    setShowCancelConfirm(false);
    setSavingSettings(true);
    try {
      const res = await fetch('/api/payment/cancel-subscription', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        showAlert(data.message, 'success');
        setHasAutoRenew(false);
      } else {
        showAlert(data.error || 'Failed to cancel subscription.');
      }
    } catch(err) {
      showAlert('Network error');
    }
    setSavingSettings(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    if (currentPlan === 'free' && campaigns.length >= 1) {
      setShowPlanSelector(true);
      return;
    }
    if (currentPlan === 'starter' && campaigns.length >= 5) {
      setShowPlanSelector(true);
      return;
    }

    const finalQuestions = [...questions];
    if (captureEmail && isGrowthOrAbove) {
      finalQuestions.push({ id: 'email', type: 'email', label: 'Email Address', required: emailRequired });
    }

    const res = await fetch('/api/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newCamp.title,
        brandColor: newCamp.brandColor,
        logoData: newCamp.logoData,
        questions: finalQuestions,
        webhookUrl: isGrowthOrAbove ? webhookUrl : null
      })
    });
    if (res.ok) {
      const created = await res.json();
      setCampaigns([created, ...campaigns]);
      setNewCamp({ title: '', brandColor: '#a855f7', logoData: null });
      setQuestions([
        { id: 1, type: 'rating', label: '' },
        { id: 2, type: 'text', label: '' }
      ]);
      setCaptureEmail(false);
      setEmailRequired(false);
      setWebhookUrl('');
      setShowMobileForm(false);
      // Optimistically update XP in UI
      setLocalXP(prev => prev + 50);
    } else {
      const errorData = await res.json();
      if (errorData.error === 'SUBSCRIPTION_REQUIRED' || errorData.error === 'UPGRADE_REQUIRED') {
        setShowPlanSelector(true);
      } else {
        showAlert(errorData.message || 'Failed to create campaign');
      }
    }
  };

  const loadResponses = async (camp) => {
    setSelectedCampaign(camp);
    setActiveTab('responses');
    const res = await fetch(`/api/responses/campaign/${camp.id}`);
    const data = await res.json();
    setResponses(data);
    setShowQrModal(false);
    setAnalytics(null);
  };

  const fetchAnalytics = async (campaignId) => {
    setAnalyticsLoading(true);
    try {
      const res = await fetch(`/api/responses/campaign/${campaignId}/analytics`);
      const data = await res.json();
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    }
    setAnalyticsLoading(false);
  };

  const exportCSV = () => {
    if (!responses.length) return;
    
    const headers = ['Date'];
    if (selectedCampaign?.questions && Array.isArray(selectedCampaign.questions)) {
      selectedCampaign.questions.forEach((q, i) => headers.push(q.label || `Question ${i+1}`));
    } else if (selectedCampaign?.questions && typeof selectedCampaign.questions === 'object') {
      // Legacy object format { q1: '...', q2: '...' }
      headers.push(selectedCampaign.questions.q1 || 'Question 1');
      headers.push(selectedCampaign.questions.q2 || 'Question 2');
    } else if (responses.length > 0) {
      // Fallback if questions are missing from state (e.g. before refresh)
      const first = responses[0];
      if (Array.isArray(first.answers)) {
        first.answers.forEach((_, i) => headers.push(`Question ${i+1}`));
      } else {
        headers.push('Rating', 'Feedback');
      }
    }
    
    const rows = responses.map(r => {
      const row = [new Date(r.created_at).toLocaleString()];
      if (Array.isArray(r.answers)) {
        r.answers.forEach(a => row.push(`"${String(a.value).replace(/"/g, '""')}"`));
      } else {
        row.push(`"${r.answers.rating}"`);
        row.push(`"${String(r.answers.text).replace(/"/g, '""')}"`);
      }
      return row.join(',');
    });
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${selectedCampaign.slug}_responses.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      
      {/* Top Gamified Nav bar */}
      <nav className="sticky top-0 bg-white border-b-2 border-slate-200 z-50 px-4 md:px-8 py-3 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <div className="text-2xl font-extrabold text-purple-500 tracking-tight flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-500 rounded-full border-2 border-purple-700 shadow-sm flex items-center justify-center text-white text-lg">L</div>
            LOOPY
          </div>
          
          <div className="hidden md:flex items-center gap-4 bg-slate-100 px-4 py-2 rounded-2xl border-2 border-slate-200">
            <div className="flex items-center gap-1 font-bold text-orange-500">
              <Flame size={20} fill="currentColor" /> {streakDays}
            </div>
            <div className="w-px h-6 bg-slate-300"></div>
            <div className="flex items-center gap-1 font-bold text-blue-500">
              <Zap size={20} fill="currentColor" /> {localXP} XP
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div 
            onClick={() => setShowPlanSelector(true)}
            className={`px-3.5 py-1.5 rounded-full font-black text-xs tracking-wider border-2 cursor-pointer transition-all hover:scale-105 select-none ${
              currentPlan === 'enterprise' 
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-white border-amber-600 shadow-sm'
                : currentPlan === 'growth' || currentPlan === 'pro'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-700 shadow-sm'
                : currentPlan === 'starter'
                ? 'bg-emerald-500 text-white border-emerald-700 shadow-sm'
                : 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse'
            }`}
          >
            {currentPlan === 'enterprise' ? '👑 ENTERPRISE' : currentPlan === 'growth' || currentPlan === 'pro' ? '✨ GROWTH (PRO)' : currentPlan === 'starter' ? '⚡ STARTER' : '⚡ CHOOSE PLAN'}
          </div>
          <div className="w-10 h-10 rounded-full bg-purple-100 border-2 border-purple-300 flex items-center justify-center font-bold text-purple-700 uppercase">
            {user.firstName ? user.firstName[0] : user.email[0]}
          </div>
          <button onClick={handleLogout} className="text-slate-400 hover:text-slate-600 font-bold uppercase text-sm tracking-wider transition-colors">
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        
        {/* Mobile Screen Button to Open Create Campaign Form */}
        <div className="lg:hidden mb-6">
          <button 
            type="button"
            onClick={() => setShowMobileForm(!showMobileForm)}
            className={`w-full py-4 px-6 rounded-2xl font-black text-lg transition-all border-b-4 select-none cursor-pointer flex items-center justify-center gap-2 ${
              showMobileForm 
                ? 'bg-slate-200 text-slate-700 border-slate-400 active:border-b-0 active:translate-y-1' 
                : 'btn-3d-purple'
            }`}
          >
            {showMobileForm ? '✕ CLOSE CAMPAIGN BUILDER' : '+ CREATE REVIEW CAMPAIGN'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Create Campaign Form */}
          <div className={`lg:col-span-4 ${showMobileForm ? 'block' : 'hidden lg:block'}`}>
            <div className="gamified-card animate-bounce-pop sticky top-24">
              <h3 className="text-xl font-extrabold text-slate-800 mb-6 uppercase tracking-wide">Customer Review Campaign</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-500 mb-1 ml-2 uppercase">Campaign Title</label>
                <input type="text" required value={newCamp.title} onChange={e => setNewCamp({...newCamp, title: e.target.value})} className="gamified-input text-lg" placeholder="e.g. Q3 Survey" />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-500 mb-1 ml-2 uppercase">Brand Color</label>
                <div className="relative">
                  <div className="flex flex-wrap gap-3 mt-2 items-center">
                    {['#a855f7', '#3b82f6', '#22c55e', '#eab308', '#ef4444', '#f97316'].map(color => (
                      <div 
                        key={color}
                        onClick={() => { setIsCustomColor(false); setShowPicker(false); setNewCamp({...newCamp, brandColor: color}); }}
                        className={`w-10 h-10 rounded-full cursor-pointer transition-all border-b-4 active:border-b-0 active:translate-y-1 ${!isCustomColor && newCamp.brandColor === color ? 'ring-4 ring-slate-300 scale-110' : 'hover:scale-110'}`}
                        style={{ backgroundColor: color, borderColor: `${color}99` }}
                      />
                    ))}
                    
                    <div className="relative">
                      <div 
                        onClick={() => { setIsCustomColor(true); setShowPicker(!showPicker); }}
                        className={`h-10 px-4 flex items-center justify-center rounded-2xl cursor-pointer transition-all border-b-4 active:border-b-0 active:translate-y-1 border-slate-300 bg-slate-100 ${isCustomColor ? 'ring-4 ring-slate-300 scale-110' : 'hover:scale-105'}`}
                      >
                        <span className="text-xl font-bold text-slate-400 mr-2">+</span>
                        {isCustomColor ? (
                          <div className="w-6 h-6 rounded-full border-2 border-black/10" style={{ backgroundColor: newCamp.brandColor }}></div>
                        ) : (
                          <span className="font-bold text-slate-700">Custom</span>
                        )}
                      </div>
                      
                      {isCustomColor && showPicker && (
                        <div className="absolute top-14 left-0 z-[60] p-4 bg-white rounded-3xl shadow-xl border-2 border-slate-200">
                          <HexColorPicker color={newCamp.brandColor} onChange={(c) => setNewCamp({...newCamp, brandColor: c})} />
                          <input 
                            type="text"
                            value={newCamp.brandColor}
                            onChange={(e) => setNewCamp({...newCamp, brandColor: e.target.value})}
                            className="w-full mt-4 px-3 py-2 bg-slate-100 border-2 border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-purple-500 text-center uppercase tracking-widest"
                          />
                          <button 
                            type="button" 
                            onClick={(e) => { e.stopPropagation(); setShowPicker(false); }}
                            className="w-full mt-3 bg-purple-500 text-white font-extrabold py-2 rounded-xl hover:bg-purple-400 border-b-4 border-purple-700 active:border-b-0 active:translate-y-1 transition-all uppercase tracking-wide"
                          >
                            Select
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-500 mb-1 ml-2 uppercase">Business Logo (Optional)</label>
                <div className="flex items-center gap-4 mt-2">
                  {newCamp.logoData ? (
                    <div className="relative group">
                      <img src={newCamp.logoData} alt="Logo Preview" className="w-16 h-16 object-contain rounded-xl border-2 border-slate-200 bg-white" />
                      <button 
                        type="button" 
                        onClick={() => setNewCamp({...newCamp, logoData: null})}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                      >
                        <X size={12} strokeWidth={3} />
                      </button>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center">
                      <ImagePlus size={24} className="text-slate-400 opacity-80" />
                    </div>
                  )}
                  <div className="flex-1">
                    <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2 px-4 rounded-xl border-2 border-slate-300 border-b-4 active:border-b-2 active:translate-y-[2px] transition-all inline-flex items-center gap-2 text-sm uppercase tracking-wide">
                      <UploadCloud size={16} className="text-slate-500" />
                      Upload Logo
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const webpBase64 = await convertToWebP(file);
                              setNewCamp({...newCamp, logoData: webpBase64});
                            } catch (err) {
                              showAlert('Error converting image: ' + err.message);
                            }
                          }
                        }} 
                      />
                    </label>
                    <p className="text-xs font-bold text-slate-400 mt-2">Auto-converts to optimized WebP format.</p>
                  </div>
                </div>
              </div>
              
              {questions.map((q, index) => (
                <div key={q.id} className="relative">
                  <label className="block text-sm font-bold text-slate-500 mb-1 ml-2 uppercase">
                    {q.type === 'rating' ? 'Rating Question' : `Text Question ${index}`}
                  </label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      required 
                      value={q.label} 
                      onChange={e => {
                        const updated = [...questions];
                        updated[index].label = e.target.value;
                        setQuestions(updated);
                      }} 
                      className="gamified-input" 
                      placeholder={q.type === 'rating' ? "Rate our service" : "What can we improve?"} 
                    />
                    {q.type === 'text' && index > 1 && (
                      <button 
                        type="button" 
                        onClick={() => setQuestions(questions.filter(quest => quest.id !== q.id))}
                        className="bg-red-100 text-red-500 px-4 rounded-2xl font-bold border-2 border-red-200 border-b-4 active:border-b-2 active:translate-y-[2px]"
                      >
                        X
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              <div className="pt-2">
                <button 
                  type="button"
                  onClick={() => setQuestions([...questions, { id: Date.now(), type: 'text', label: '' }])}
                  className="w-full py-2 border-2 border-dashed border-purple-300 text-purple-500 font-bold rounded-2xl hover:bg-purple-50 transition-colors uppercase text-sm tracking-wider"
                >
                  + Add Text Question
                </button>
              </div>

              <div className="mt-4 bg-purple-50 p-4 rounded-2xl border-2 border-purple-100">
                <div className="flex items-start justify-between">
                  <div className="pr-4">
                    <div className="flex items-center gap-2">
                      <label className="block text-sm font-bold text-slate-700 uppercase">Capture Email?</label>
                      {!isGrowthOrAbove && (
                        <span className="text-[10px] bg-purple-200 text-purple-800 font-black px-2 py-0.5 rounded-full uppercase">Growth+</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-1">Ask respondents for their email address</p>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => {
                      if (!isGrowthOrAbove) {
                        setShowPlanSelector(true);
                      } else {
                        setCaptureEmail(!captureEmail);
                      }
                    }} 
                    className={`shrink-0 w-12 h-6 rounded-full relative transition-colors mt-1 ${captureEmail && isGrowthOrAbove ? 'bg-purple-500' : 'bg-slate-300'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${captureEmail && isGrowthOrAbove ? 'left-7' : 'left-1'}`}></div>
                  </button>
                </div>
                {captureEmail && isGrowthOrAbove && (
                  <div className="pt-3 mt-3 border-t-2 border-purple-200/50">
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-600 cursor-pointer w-fit">
                      <input type="checkbox" checked={emailRequired} onChange={e => setEmailRequired(e.target.checked)} className="w-4 h-4 accent-purple-500" />
                      Make this field required
                    </label>
                  </div>
                )}
              </div>
              
              {isGrowthOrAbove && (
                <div className="mt-4 bg-amber-50 p-4 rounded-2xl border-2 border-amber-100">
                  <label className="block text-sm font-bold text-amber-700 uppercase mb-1">Webhook URL (Slack / Discord)</label>
                  <p className="text-xs text-amber-600 font-medium mb-3">Instantly receive feedback in Slack or Discord</p>
                  <input type="url" value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)} className="w-full bg-white border-2 border-amber-200 rounded-xl px-4 py-2 outline-none focus:border-amber-400 font-medium text-slate-700" placeholder="https://hooks.slack.com/services/..." />
                </div>
              )}
              
              <div className="pt-4">
                <button type="submit" className="btn-3d-purple">CREATE CAMPAIGN</button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Path & Responses */}
        <div className="lg:col-span-8 space-y-8">
          
          <div className="flex flex-col gap-6">
            <h3 className="text-2xl font-extrabold text-slate-800 uppercase tracking-wide px-2">Your Campaigns</h3>
            
            {campaigns.length === 0 ? (
              <div className="text-center p-10 border-4 border-dashed border-slate-300 rounded-[2rem] bg-slate-100">
                <p className="text-lg font-bold text-slate-500 mb-4">You haven't created any campaigns yet.</p>
                <p className="text-slate-400">Click the button above or use the form to create your first review campaign!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {campaigns.map(c => (
                  <div 
                    key={c.id} 
                    onClick={() => loadResponses(c)} 
                    className={`relative p-6 rounded-[2rem] border-b-4 cursor-pointer transition-all ${
                      selectedCampaign?.id === c.id 
                      ? 'bg-purple-100 border-2 border-purple-500 border-b-[6px] transform -translate-y-1' 
                      : 'bg-white border-2 border-slate-200 border-b-[6px] hover:bg-slate-50 active:translate-y-1 active:border-b-2'
                    }`}
                  >
                    <div className="absolute top-4 right-4 w-10 h-10 rounded-full border-2 border-white/50 shadow-sm" style={{backgroundColor: c.brand_color}}></div>
                    <h4 className="font-extrabold text-xl text-slate-800 mb-1 w-3/4">{c.title}</h4>
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Active Campaign</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedCampaign && (
            <div className="gamified-card animate-bounce-pop mt-8 bg-purple-50 border-purple-200">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h3 className="text-2xl font-extrabold text-purple-900 uppercase">Campaign: {selectedCampaign.title}</h3>
                
                <div className="flex gap-2 flex-wrap justify-end">
                  {isGrowthOrAbove && (
                    <button onClick={exportCSV} className="bg-white border-2 border-slate-200 border-b-4 px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-50 active:border-b-2 active:translate-y-[2px] transition-all flex items-center gap-2">
                      CSV
                    </button>
                  )}
                  <button onClick={() => setShowQrModal(true)} className="bg-white border-2 border-slate-200 border-b-4 px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-50 active:border-b-2 active:translate-y-[2px] transition-all flex items-center gap-2 cursor-pointer">
                    <QrCode size={16} /> QR CODE
                  </button>
                  <a href={`/f/${selectedCampaign.slug}`} target="_blank" rel="noreferrer" className="bg-white border-2 border-slate-200 border-b-4 px-4 py-2 rounded-xl font-bold text-purple-600 hover:bg-purple-50 active:border-b-2 active:translate-y-[2px] transition-all flex items-center gap-2">
                    <Eye size={16} /> SHARE LINK
                  </a>
                </div>
              </div>
              
              {/* Tabs */}
              {isGrowthOrAbove && (
                <div className="flex gap-4 mb-6 border-b-2 border-purple-200/50 pb-2">
                  <button onClick={() => setActiveTab('responses')} className={`font-extrabold uppercase tracking-wide px-2 py-1 transition-colors ${activeTab === 'responses' ? 'text-purple-600 border-b-4 border-purple-500' : 'text-slate-400 hover:text-purple-400'}`}>Responses</button>
                  <button onClick={() => { setActiveTab('analytics'); if (!analytics || analytics._campaignId !== selectedCampaign.id) fetchAnalytics(selectedCampaign.id); }} className={`font-extrabold uppercase tracking-wide px-2 py-1 transition-colors flex items-center gap-1 ${activeTab === 'analytics' ? 'text-purple-600 border-b-4 border-purple-500' : 'text-slate-400 hover:text-purple-400'}`}><BarChart3 size={16} /> Analytics</button>
                  <button onClick={() => setActiveTab('settings')} className={`font-extrabold uppercase tracking-wide px-2 py-1 transition-colors flex items-center gap-1 ${activeTab === 'settings' ? 'text-purple-600 border-b-4 border-purple-500' : 'text-slate-400 hover:text-purple-400'}`}><Settings size={16}/> Config</button>
                </div>
              )}

              <div className="space-y-4">
                {activeTab === 'analytics' && isGrowthOrAbove ? (
                  analyticsLoading ? (
                    <div className="text-center py-12">
                      <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="font-bold text-slate-400">Loading analytics...</p>
                    </div>
                  ) : analytics ? (
                    <div className="space-y-6">
                      {/* Volume Metrics */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white p-5 rounded-3xl border-2 border-slate-200 shadow-sm text-center">
                          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-1">Today</p>
                          <p className="text-4xl font-black text-slate-700">{analytics.todayCount}</p>
                        </div>
                        <div className="bg-white p-5 rounded-3xl border-2 border-slate-200 shadow-sm text-center">
                          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-1">This Week</p>
                          <p className="text-4xl font-black text-blue-500">{analytics.weekCount}</p>
                        </div>
                        <div className="bg-white p-5 rounded-3xl border-2 border-slate-200 shadow-sm text-center">
                          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-1">This Month</p>
                          <p className="text-4xl font-black text-purple-500">{analytics.monthCount}</p>
                        </div>
                        <div className="bg-white p-5 rounded-3xl border-2 border-slate-200 shadow-sm text-center">
                          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-1">All Time</p>
                          <p className="text-4xl font-black text-slate-700">{analytics.total}</p>
                        </div>
                      </div>

                      {/* Average Rating + Star Breakdown */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 shadow-sm text-center">
                          <p className="text-slate-400 font-bold uppercase tracking-widest text-sm mb-3">Average Rating</p>
                          <p className="text-6xl font-black text-yellow-500 flex items-center justify-center gap-2">
                            {analytics.averageRating}
                            <Star size={40} fill="currentColor" className="drop-shadow-sm" />
                          </p>
                          <div className="mt-3 flex items-center justify-center gap-1 text-sm font-bold">
                            {analytics.total > 0 && analytics.weeklyTrend.length >= 2 ? (() => {
                              const recent = analytics.weeklyTrend[analytics.weeklyTrend.length - 1];
                              const prev = analytics.weeklyTrend[analytics.weeklyTrend.length - 2];
                              if (recent.avgRating && prev.avgRating) {
                                const diff = (Number(recent.avgRating) - Number(prev.avgRating)).toFixed(1);
                                if (diff > 0) return <span className="text-emerald-500 flex items-center gap-1"><TrendingUp size={16} /> +{diff} vs last week</span>;
                                if (diff < 0) return <span className="text-red-500 flex items-center gap-1"><TrendingDown size={16} /> {diff} vs last week</span>;
                                return <span className="text-slate-400 flex items-center gap-1"><Minus size={16} /> No change</span>;
                              }
                              return null;
                            })() : null}
                          </div>
                        </div>

                        <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 shadow-sm">
                          <p className="text-slate-400 font-bold uppercase tracking-widest text-sm mb-4">Star Breakdown</p>
                          <div className="space-y-3">
                            {[5, 4, 3, 2, 1].map(star => {
                              const count = analytics.starCounts[star] || 0;
                              const maxCount = Math.max(...Object.values(analytics.starCounts), 1);
                              const percentage = analytics.total > 0 ? Math.round((count / analytics.total) * 100) : 0;
                              return (
                                <div key={star} className="flex items-center gap-3">
                                  <span className="text-sm font-black text-slate-600 w-6 text-right">{star}</span>
                                  <Star size={14} fill="#facc15" className="text-yellow-400 shrink-0" />
                                  <div className="flex-1 bg-slate-100 rounded-full h-5 border border-slate-200 overflow-hidden">
                                    <div 
                                      className={`h-full rounded-full transition-all duration-500 ${star >= 4 ? 'bg-emerald-400' : star === 3 ? 'bg-yellow-400' : 'bg-red-400'}`}
                                      style={{ width: `${maxCount > 0 ? (count / maxCount) * 100 : 0}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-xs font-black text-slate-500 w-16 text-right">{count} ({percentage}%)</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Weekly Trend Chart */}
                      <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 shadow-sm">
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-sm mb-6">8-Week Response Trend</p>
                        <div className="flex items-end gap-2 h-40">
                          {analytics.weeklyTrend.map((week, idx) => {
                            const maxResponses = Math.max(...analytics.weeklyTrend.map(w => w.responses), 1);
                            const barHeight = maxResponses > 0 ? (week.responses / maxResponses) * 100 : 0;
                            return (
                              <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                                <span className="text-[10px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                  {week.responses} {week.avgRating ? `(${week.avgRating}★)` : ''}
                                </span>
                                <div className="w-full relative" style={{ height: '120px' }}>
                                  <div 
                                    className="absolute bottom-0 w-full rounded-t-lg bg-purple-400 hover:bg-purple-500 transition-all cursor-pointer border-2 border-purple-500"
                                    style={{ height: `${Math.max(barHeight, 4)}%` }}
                                  ></div>
                                </div>
                                <span className="text-[9px] font-bold text-slate-400 leading-tight text-center">{week.label}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-8 bg-white/50 rounded-3xl border-2 border-purple-100">
                      <p className="text-lg font-bold text-slate-500">No analytics data available.</p>
                    </div>
                  )
                ) : activeTab === 'settings' && isGrowthOrAbove ? (
                  <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 shadow-sm">
                    <h4 className="text-xl font-extrabold text-slate-800 uppercase tracking-wide mb-4">Account Configuration</h4>
                    
                    <div className="mb-6 max-w-md">
                      <label className="block text-sm font-bold text-slate-500 mb-1 ml-2 uppercase">Email Notification Frequency</label>
                      <select 
                        value={notifFreq} 
                        onChange={e => setNotifFreq(e.target.value)}
                        className="gamified-input appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_1rem_center] bg-[length:12px_12px]"
                      >
                        <option value="immediate">Immediate (Real-time)</option>
                        <option value="daily">Daily Summary</option>
                        <option value="weekly">Weekly Summary</option>
                        <option value="monthly">Monthly Summary</option>
                      </select>
                      <p className="text-xs text-slate-500 font-medium mt-2 ml-2">
                        Select how often you want to receive email reports for new feedback. Webhooks are always fired immediately.
                      </p>
                    </div>
                    
                    <button 
                      onClick={saveSettings} 
                      disabled={savingSettings}
                      className="btn-3d-purple max-w-[200px]"
                    >
                      {savingSettings ? 'SAVING...' : 'SAVE CONFIG'}
                    </button>

                    {hasAutoRenew && (
                      <div className="mt-8 pt-6 border-t-2 border-slate-100 flex flex-col gap-2">
                        <h5 className="font-bold text-slate-600 text-sm uppercase">Subscription Management</h5>
                        <button 
                          onClick={() => setShowCancelConfirm(true)} 
                          className="text-xs text-slate-400 font-bold hover:text-red-500 hover:underline w-fit transition-colors"
                        >
                          Cancel Auto-Renewal
                        </button>
                      </div>
                    )}
                  </div>
                ) : responses.length === 0 ? (
                  <div className="text-center p-8 bg-white/50 rounded-3xl border-2 border-purple-100">
                    <p className="text-lg font-bold text-slate-500">No one has submitted feedback for this campaign yet.</p>
                  </div>
                ) : (
                  responses.map(r => {
                    const statusColors = {
                      new: 'bg-blue-100 text-blue-700 border-blue-300',
                      reviewing: 'bg-amber-100 text-amber-700 border-amber-300',
                      resolved: 'bg-emerald-100 text-emerald-700 border-emerald-300'
                    };
                    const statusLabels = { new: 'NEW', reviewing: 'REVIEWING', resolved: 'RESOLVED' };
                    const currentStatus = r.status || 'new';

                    const handleStatusChange = async (newStatus) => {
                      try {
                        const res = await fetch(`/api/responses/${r.id}/status`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ status: newStatus })
                        });
                        if (res.ok) {
                          setResponses(prev => prev.map(item => item.id === r.id ? { ...item, status: newStatus } : item));
                          if (newStatus === 'resolved') setLocalXP(prev => prev + 25);
                        }
                      } catch (err) { console.error(err); }
                    };

                    return (
                    <div key={r.id} className="bg-white p-5 rounded-3xl border-2 border-slate-200 shadow-sm">
                      <div className="flex justify-between items-start mb-3 flex-wrap gap-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-3 py-1 rounded-full">{new Date(r.created_at).toLocaleDateString()}</span>
                        <div className="flex gap-1.5">
                          {['new', 'reviewing', 'resolved'].map((s) => (
                            <button
                              key={s}
                              onClick={() => handleStatusChange(s)}
                              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border-2 transition-all cursor-pointer ${
                                currentStatus === s
                                  ? statusColors[s] + ' border-b-4'
                                  : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {statusLabels[s]}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {Array.isArray(r.answers) ? (
                        <div className="space-y-4">
                          {r.answers.map((ans, idx) => (
                            <div key={idx} className={ans.type === 'rating' ? 'border-b border-slate-100 pb-3' : ''}>
                              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">
                                {selectedCampaign.questions[idx]?.label || `Question ${idx + 1}`}
                              </p>
                              {ans.type === 'rating' ? (
                                <span className="inline-flex bg-yellow-400 text-yellow-900 border-b-4 border-yellow-500 px-4 py-2 rounded-2xl text-sm font-extrabold items-center gap-1">
                                  <Star size={16} fill="currentColor" /> {ans.value} / 5
                                </span>
                              ) : (
                                <p className="text-slate-700 font-medium text-lg leading-relaxed">{ans.value}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <>
                          <span className="inline-flex mb-3 bg-yellow-400 text-yellow-900 border-b-4 border-yellow-500 px-4 py-2 rounded-2xl text-sm font-extrabold items-center gap-1">
                            <Star size={16} fill="currentColor" /> {r.answers.rating} / 5
                          </span>
                          <p className="text-slate-700 font-medium text-lg leading-relaxed">{r.answers.text}</p>
                        </>
                      )}
                    </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>

      {/* Squad Plan Selector Modal */}
      {showPlanSelector && (
        <PlanSelectorModal 
          currentPlan={currentPlan}
          onClose={() => setShowPlanSelector(false)}
        />
      )}

      {/* QR Code Modal */}
      {showQrModal && selectedCampaign && (
        <div className="fixed inset-0 bg-slate-900/60 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] border-4 border-slate-200 border-b-8 p-8 max-w-sm w-full animate-bounce-pop shadow-2xl relative text-center">
            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="absolute top-5 right-5 w-10 h-10 rounded-2xl bg-slate-100 border-2 border-slate-300 border-b-4 text-slate-500 hover:bg-slate-200 active:border-b-2 active:translate-y-[2px] flex items-center justify-center font-black transition-all cursor-pointer"
            >
              <X size={20} strokeWidth={3} />
            </button>

            <div className="w-14 h-14 bg-purple-100 rounded-full border-4 border-purple-300 flex items-center justify-center mx-auto mb-4">
              <QrCode size={28} className="text-purple-600" />
            </div>
            <h3 className="text-xl font-black text-slate-800 uppercase mb-2">{selectedCampaign.title}</h3>
            <p className="text-xs font-bold text-slate-400 mb-6">Scan this QR code to open the feedback page</p>

            <div ref={qrRef} className="bg-white p-6 rounded-2xl border-2 border-slate-200 inline-block mb-6">
              <QRCodeSVG
                value={`${window.location.origin}/f/${selectedCampaign.slug}`}
                size={200}
                level="H"
                fgColor="#1e293b"
                includeMargin={false}
              />
            </div>

            <div className="text-xs font-bold text-slate-400 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 mb-6 break-all">
              {window.location.origin}/f/{selectedCampaign.slug}
            </div>

            <button
              onClick={() => {
                const svg = qrRef.current?.querySelector('svg');
                if (!svg) return;
                const svgData = new XMLSerializer().serializeToString(svg);
                const canvas = document.createElement('canvas');
                canvas.width = 400; canvas.height = 400;
                const ctx = canvas.getContext('2d');
                const img = new Image();
                img.onload = () => {
                  ctx.fillStyle = '#ffffff';
                  ctx.fillRect(0, 0, 400, 400);
                  ctx.drawImage(img, 0, 0, 400, 400);
                  const pngUrl = canvas.toDataURL('image/png');
                  const dl = document.createElement('a');
                  dl.download = `${selectedCampaign.slug}-qr-code.png`;
                  dl.href = pngUrl;
                  dl.click();
                };
                img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
              }}
              className="btn-3d-purple w-full flex items-center justify-center gap-2"
            >
              <Download size={18} /> DOWNLOAD QR CODE
            </button>
          </div>
        </div>
      )}

      {/* Cancel Subscription Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] border-4 border-slate-200 border-b-8 p-8 max-w-sm w-full animate-bounce-pop shadow-2xl relative text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full border-4 border-red-200 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck size={32} className="text-red-500" />
            </div>
            
            <h3 className="text-xl font-black text-slate-800 uppercase mb-2">Cancel Subscription?</h3>
            <p className="text-sm font-medium text-slate-500 mb-6">
              Are you sure you want to cancel your subscription auto-renewal? You will stay on your current plan until it expires, but you will not be billed again.
            </p>

            <div className="flex gap-4">
              <button 
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-600 bg-slate-100 border-2 border-slate-200 hover:bg-slate-200 active:border-b-0 active:translate-y-1 border-b-4 transition-all"
              >
                KEEP IT
              </button>
              <button 
                onClick={handleCancelSubscription}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-red-500 border-2 border-red-600 hover:bg-red-400 active:border-b-0 active:translate-y-1 border-b-4 transition-all"
              >
                YES, CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Alert Modal */}
      {customAlert && (
        <div className="fixed inset-0 bg-slate-900/60 z-[110] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] border-4 border-slate-200 border-b-8 p-8 max-w-sm w-full animate-bounce-pop shadow-2xl relative text-center">
            <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center mx-auto mb-4 ${customAlert.type === 'success' ? 'bg-emerald-100 border-emerald-200 text-emerald-500' : 'bg-red-100 border-red-200 text-red-500'}`}>
              {customAlert.type === 'success' ? <Star size={32} /> : <ShieldCheck size={32} />}
            </div>
            
            <h3 className="text-xl font-black text-slate-800 uppercase mb-2">
              {customAlert.type === 'success' ? 'Success!' : 'Notice'}
            </h3>
            <p className="text-sm font-medium text-slate-500 mb-6">
              {customAlert.message}
            </p>

            <button 
              onClick={() => setCustomAlert(null)}
              className={`w-full py-3 px-4 rounded-xl font-bold text-white border-2 border-b-4 active:border-b-0 active:translate-y-1 transition-all ${customAlert.type === 'success' ? 'bg-emerald-500 border-emerald-600 hover:bg-emerald-400' : 'bg-red-500 border-red-600 hover:bg-red-400'}`}
            >
              OK, GOT IT
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
