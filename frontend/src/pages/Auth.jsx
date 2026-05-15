import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { HiLightningBolt, HiChevronRight } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { useFormErrors } from '../hooks/useFormErrors';
import { useAuth } from '../context/AuthContext';
import { getProfile } from '../api/auth';
import api from '../api/axios';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { fieldError, generalError, setApiErrors, clearAll } = useFormErrors();
  const [loading, setLoading] = useState(false);
  
  const [mode, setMode] = useState(location.pathname === '/register' ? 'register' : 'login');
  const isLogin = mode === 'login';

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    city: '',
    language: '',
  });

  const [clientErrors, setClientErrors] = useState({});

  useEffect(() => {
    setClientErrors({});
    clearAll();
  }, [mode]);

  const validate = () => {
    const errs = {};
    if (!isLogin && !form.name.trim()) errs.name = 'Please enter your full name.';
    if (!form.email.trim()) errs.email = 'Please enter your email.';
    if (!form.password) errs.password = 'Please enter a password.';
    else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters.';

    if (!isLogin) {
      if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match.';
      if (!form.city.trim()) errs.city = 'Please enter your city.';
      if (!form.language.trim()) errs.language = 'Please enter your language.';
    }
    return errs;
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setClientErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
    clearAll();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setClientErrors(errs);
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const response = await api.post('/api/v1/auth/login/', {
          email: form.email,
          password: form.password,
        });
        
        const tokens = response.data.data;
        localStorage.setItem('access', tokens.access);
        localStorage.setItem('refresh', tokens.refresh);

        try {
          const profileRes = await getProfile();
          login(tokens, profileRes.data);
          toast.success('Signed in successfully');
          navigate('/feed');
        } catch {
          login(tokens, { email: form.email, name: 'User' });
          navigate('/feed');
        }
      } else {
        await api.post('/api/v1/auth/register/', {
          email: form.email,
          name: form.name,
          password: form.password,
          confirm_password: form.confirmPassword,
          city: form.city || '',
          language: form.language || '',
        });
        
        toast.success('Welcome! Please sign in.');
        setMode('login');
      }
    } catch (err) {
      setApiErrors(err);
    } finally {
      setLoading(false);
    }
  };

  const fe = (f) => clientErrors[f] || fieldError(f);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-start py-12 px-6">
      {/* Brand Header */}
      <div className="w-full max-w-[1128px] flex items-center mb-10 self-center">
        <Link to="/" className="flex items-center gap-1 group">
           <span className="text-[32px] font-bold text-[#0a66c2] tracking-tighter">SkillSwap</span>
           <div className="w-8 h-8 bg-[#0a66c2] rounded-sm flex items-center justify-center">
             <HiLightningBolt className="text-white w-6 h-6" />
           </div>
        </Link>
      </div>

      <div className="w-full max-w-[400px] animate-fade-in">
        <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-md shadow-black/5">
          <h1 className="text-[32px] font-bold text-black mb-1 leading-tight">
            {isLogin ? 'Sign in' : 'Join SkillSwap'}
          </h1>
          <p className="text-[14px] text-black mb-6">
            Stay updated on your professional world
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <Input
                label="Full name"
                placeholder="Required"
                value={form.name}
                onChange={handleChange('name')}
                error={fe('name')}
              />
            )}
            
            <Input
              label="Email"
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={handleChange('email')}
              error={fe('email')}
            />

            <Input
              label="Password (8 or more characters)"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange('password')}
              error={fe('password')}
            />

            {!isLogin && (
              <>
                <Input
                  label="Confirm password"
                  type="password"
                  placeholder="Repeat password"
                  value={form.confirmPassword}
                  onChange={handleChange('confirmPassword')}
                  error={fe('confirmPassword')}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="City"
                    placeholder="Location"
                    value={form.city}
                    onChange={handleChange('city')}
                    error={fe('city')}
                  />
                  <Input
                    label="Language"
                    placeholder="Language"
                    value={form.language}
                    onChange={handleChange('language')}
                    error={fe('language')}
                  />
                </div>
              </>
            )}

            {generalError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-red-600 text-[12px] font-bold text-center">
                {generalError}
              </div>
            )}

            <div className="pt-2">
              <Button type="submit" fullWidth loading={loading} className="h-[52px] text-lg">
                {isLogin ? 'Sign in' : 'Agree & Join'}
              </Button>
            </div>
          </form>

          {isLogin && (
            <div className="mt-4 text-center">
              <Link to="/forgot-password" size="sm" className="text-[#0a66c2] text-[14px] font-bold hover:underline">
                Forgot password?
              </Link>
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <p className="text-black text-[16px]">
            {isLogin ? "New to SkillSwap?" : "Already on SkillSwap?"}
            <button
              onClick={() => setMode(isLogin ? 'register' : 'login')}
              className="text-[#0a66c2] font-bold ml-1 hover:underline hover:bg-blue-50 px-2 py-1 rounded-full transition-all"
            >
              {isLogin ? 'Join now' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-12 text-[12px] text-neutral-500 font-medium">
         SkillSwap Corporation © 2026
      </div>
    </div>
  );
}
