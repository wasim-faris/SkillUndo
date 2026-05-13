import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { HiLightningBolt, HiEye, HiEyeOff, HiX, HiChevronRight, HiChevronLeft } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { useFormErrors } from '../hooks/useFormErrors';
import { useAuth } from '../context/AuthContext';
import { login as apiLogin, getProfile } from '../api/auth';
import api from '../api/axios';

const StyledInput = ({ label, error, type = 'text', id, onChange, ...rest }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="flex flex-col w-full animate-fade-in">
      {label && (
        <label htmlFor={id} className="label-premium">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          type={inputType}
          onChange={onChange}
          className={`input-premium ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-50' : ''}`}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
          </button>
        )}
      </div>
      {error && (
        <span className="text-red-500 text-xs mt-1.5 ml-1 flex items-center gap-1 animate-slide-left">
          <HiX size={12} /> {error}
        </span>
      )}
    </div>
  );
};

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { fieldError, generalError, setApiErrors, clearFieldError, clearAllErrors } = useFormErrors();
  const [loading, setLoading] = useState(false);
  
  // Determine initial mode from URL
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
    // Clear errors when switching modes
    setClientErrors({});
    clearAllErrors();
  }, [mode]);

  const validate = () => {
    const errs = {};
    if (!isLogin && !form.name.trim()) errs.name = 'Full name is required';
    
    if (!form.email.trim()) {
      errs.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Enter a valid email';
    }
    
    if (!form.password) {
      errs.password = 'Password is required';
    } else if (form.password.length < 8) {
      errs.password = 'Min 8 characters';
    }

    if (!isLogin) {
      if (form.password !== form.confirmPassword) {
        errs.confirmPassword = 'Passwords do not match';
      }
      if (!form.city.trim()) errs.city = 'City is required';
      if (!form.language.trim()) errs.language = 'Language is required';
    }
    
    return errs;
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setClientErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
    clearFieldError(field);
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
        const res = await apiLogin({ email: form.email, password: form.password });
        const tokens = res.data;
        const profileRes = await getProfile();
        login(tokens, profileRes.data);
        navigate('/dashboard', { replace: true });
      } else {
        const formData = new FormData();
        formData.append('name', form.name);
        formData.append('email', form.email);
        formData.append('password', form.password);
        formData.append('city', form.city);
        formData.append('language', form.language);

        const res = await api.post('/users/register/', formData);
        const tokens = res.data;
        const profileRes = await getProfile();
        login(tokens, profileRes.data);
        toast.success('Welcome to SkillSwap! 🎉');
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      if (!err.response) {
        toast.error('Network error. Please try again.');
      } else {
        setApiErrors(err);
      }
    } finally {
      setLoading(false);
    }
  };

  const fe = (f) => clientErrors[f] || fieldError(f);

  const toggleMode = () => {
    const newMode = isLogin ? 'register' : 'login';
    setMode(newMode);
    window.history.pushState({}, '', `/${newMode}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5] px-6 py-12">
      <div className="w-full max-w-[480px]">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-10 group">
          <div className="w-12 h-12 bg-[#6C63FF] rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200 group-hover:scale-110 transition-transform duration-300">
            <HiLightningBolt className="text-white w-7 h-7" />
          </div>
          <span className="text-3xl font-extrabold tracking-tight text-gray-800">SkillSwap</span>
        </Link>

        {/* Auth Card */}
        <div className="card-premium relative overflow-hidden">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isLogin ? 'Welcome back' : 'Create account'}
            </h1>
            <p className="text-gray-500 font-medium">
              {isLogin ? 'Enter your credentials to access your account' : 'Join our community of skill swappers today'}
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {!isLogin && (
              <StyledInput
                label="Full Name"
                id="name"
                placeholder="John Doe"
                value={form.name}
                onChange={handleChange('name')}
                error={fe('name')}
                autoComplete="name"
              />
            )}

            <StyledInput
              label="Email Address"
              id="email"
              type="email"
              placeholder="name@example.com"
              value={form.email}
              onChange={handleChange('email')}
              error={fe('email')}
              autoComplete="email"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <StyledInput
                label="Password"
                id="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange('password')}
                error={fe('password')}
                autoComplete={isLogin ? "current-password" : "new-password"}
              />
              {!isLogin && (
                <StyledInput
                  label="Confirm"
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={handleChange('confirmPassword')}
                  error={fe('confirmPassword')}
                  autoComplete="new-password"
                />
              )}
              {isLogin && (
                <div className="flex flex-col justify-end pb-1">
                  <Link to="/forgot-password" size="sm" className="text-[13px] text-[#6C63FF] font-bold hover:underline mb-3 ml-1">
                    Forgot password?
                  </Link>
                </div>
              )}
            </div>

            {!isLogin && (
              <div className="grid grid-cols-2 gap-5">
                <StyledInput
                  label="City"
                  id="city"
                  placeholder="e.g. London"
                  value={form.city}
                  onChange={handleChange('city')}
                  error={fe('city')}
                />
                <StyledInput
                  label="Language"
                  id="language"
                  placeholder="e.g. English"
                  value={form.language}
                  onChange={handleChange('language')}
                  error={fe('language')}
                />
              </div>
            )}

            {generalError && (
              <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-2xl p-4 animate-fade-in">
                <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center shrink-0 shadow-lg shadow-red-100">
                  <HiX className="text-white" size={16} />
                </div>
                <p className="text-sm text-red-700 font-semibold">{generalError}</p>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary w-full h-[56px] text-lg flex items-center justify-center gap-3"
            >
              {loading ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <HiChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-100 text-center">
            <p className="text-gray-500 font-medium">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={toggleMode}
                className="ml-2 text-[#6C63FF] font-bold hover:underline transition-all"
              >
                {isLogin ? 'Sign up now' : 'Log in instead'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
