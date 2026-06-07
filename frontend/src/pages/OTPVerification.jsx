import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiLightningBolt } from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { getLandingPath } from '../utils/admin';

export default function OTPVerification() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState('');
  const [timer, setTimer] = useState(60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    const pendingEmail = localStorage.getItem('pending_email');
    if (!pendingEmail) {
      navigate('/login');
      return;
    }
    setEmail(pendingEmail);

    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [navigate]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError(false);

    // Auto focus next
    if (value !== '' && index < 5) {
      inputRefs.current[index + 1].focus();
    }

    // Auto submit if all filled
    if (newOtp.every(v => v !== '') && !newOtp.includes('')) {
      handleSubmit(newOtp.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = async (code) => {
    setLoading(true);
    try {
      const response = await api.post('/api/v1/auth/verify-otp/', {
        email,
        code,
      });

      const tokens = response.data.data;

      // Fetch the actual user profile to get their real name/photo
      let profileData = { email, name: 'User', is_staff: false };
      try {
        localStorage.setItem('access_token', tokens.access);
        localStorage.setItem('refresh_token', tokens.refresh);
        const profileRes = await api.get('/api/v1/auth/me/');
        profileData = profileRes.data.data || profileData;
      } catch (profileErr) {
        console.error('Failed to load profile details after OTP verification:', profileErr);
      }

      login(tokens, profileData);
      localStorage.removeItem('pending_email');
      toast.success('Email verified successfully!');
      navigate(getLandingPath(profileData), { replace: true });
    } catch (err) {
      setError(true);
      toast.error(err.response?.data?.message || 'Invalid verification code');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;

    setLoading(true);
    try {
      await api.post('/api/v1/auth/resend-otp/', { email });
      toast.success('Code resent successfully!');
      setTimer(60);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root" style={{ justifyContent: 'center', alignItems: 'center' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className={`card-premium p-10 w-full max-w-md mx-auto ${error ? 'animate-shake' : ''}`}
        style={{ border: error ? '1px solid var(--accent-secondary)' : undefined }}
      >
        <div className="flex flex-col items-center text-center">
          <div
            className="w-12 h-12 flex items-center justify-center mb-6"
            style={{ background: 'var(--gradient-1)', borderRadius: '12px' }}
          >
            <HiLightningBolt style={{ color: '#fff', width: 24, height: 24 }} />
          </div>

          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
            Check your email
          </h1>
          <p className="text-[var(--text-secondary)] text-sm mb-8">
            We sent a 6-digit code to <span className="text-[var(--text-primary)] font-medium">{email}</span>
          </p>

          <div className="flex justify-center gap-3 mb-8 w-full">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={loading}
                className="w-12 h-14 text-center text-xl font-bold rounded-xl"
                style={{
                  background: 'var(--bg-secondary)',
                  border: `1px solid ${error ? 'var(--accent-secondary)' : digit ? 'var(--accent-primary)' : 'var(--border-default)'}`,
                  color: 'var(--text-primary)',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--accent-primary)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(124, 111, 247, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = error ? 'var(--accent-secondary)' : digit ? 'var(--accent-primary)' : 'var(--border-default)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            ))}
          </div>

          <div className="text-sm font-medium text-[var(--text-secondary)] mb-6 flex items-center justify-between w-full">
            <button
              onClick={() => navigate('/login')}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              Back to login
            </button>
            <button
              onClick={handleResend}
              disabled={timer > 0 || loading}
              className={`${timer > 0 ? 'text-[var(--text-muted)]' : 'text-[var(--accent-primary)] hover:text-[var(--accent-hover)]'} transition-colors`}
            >
              {timer > 0 ? `Resend code in ${timer}s` : 'Resend code'}
            </button>
          </div>

          <button
            onClick={() => handleSubmit(otp.join(''))}
            disabled={loading || otp.join('').length !== 6}
            className="btn-primary w-full h-12"
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
