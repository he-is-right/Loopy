import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

export default function Auth({ isLogin, onAuth }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
    
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (res.ok) {
        await onAuth(data.user);
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-purple-50">
      <div className="w-full max-w-md animate-bounce-pop">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-purple-500 rounded-full border-4 border-purple-700 animate-float shadow-sm mb-4 flex items-center justify-center text-white font-bold text-2xl">L</div>
          <h1 className="text-3xl font-extrabold text-slate-800">{isLogin ? "Welcome back!" : "Let's get started!"}</h1>
        </div>
        
        <div className="gamified-card relative overflow-hidden bg-white">
          {error && <div className="bg-red-100 text-red-600 font-bold p-4 rounded-xl border-2 border-red-200 mb-6 text-center">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-500 mb-1 ml-2 uppercase tracking-wide">First Name</label>
                  <input type="text" name="firstName" required onChange={handleChange} className="gamified-input" placeholder="Jane" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-500 mb-1 ml-2 uppercase tracking-wide">Last Name</label>
                  <input type="text" name="lastName" required onChange={handleChange} className="gamified-input" placeholder="Doe" />
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-bold text-slate-500 mb-1 ml-2 uppercase tracking-wide">Email</label>
              <input type="email" name="email" required onChange={handleChange} className="gamified-input" placeholder="jane@example.com" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1 ml-2 pr-2">
                <label className="block text-sm font-bold text-slate-500 uppercase tracking-wide">Password</label>
                {isLogin && (
                  <a href="#" className="text-xs font-bold text-purple-500 hover:text-purple-700 transition-colors uppercase tracking-wider">Forgot password?</a>
                )}
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password" 
                  required 
                  onChange={handleChange} 
                  className="gamified-input pr-12" 
                  placeholder="••••••••" 
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            
            <div className="pt-4">
              <button type="submit" className="btn-3d-purple">
                {isLogin ? 'LOG IN' : 'CREATE ACCOUNT'}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-8">
          <Link to={isLogin ? '/signup' : '/login'} className="btn-3d-gray uppercase text-sm tracking-widest">
            {isLogin ? 'Create a new account' : 'Log in to existing account'}
          </Link>
        </div>
      </div>
    </div>
  );
}
