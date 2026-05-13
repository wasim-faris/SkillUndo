import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HiBolt, HiEnvelope, HiChevronLeft } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { useFormErrors } from '../hooks/useFormErrors';
import { forgotPassword } from '../api/auth';

export default function ForgotPassword() {
  const { fieldError, generalError, setApiErrors, clearFieldError } = useFormErrors();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState('');
  const [clientError, setClientError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setClientError('Email is required'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setClientError('Enter a valid email'); return; }

    setLoading(true);
    try {
      await forgotPassword(email);
      setSubmitted(true);
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

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-[440px]">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-10 group">
          <div className="w-12 h-12 bg-[#6C63FF] rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200 group-hover:scale-110 transition-transform duration-300">
            <HiBolt className="text-white w-7 h-7" />
          </div>
          <span className="text-3xl font-extrabold tracking-tight text-gray-800">SkillSwap</span>
        </Link>

        <div className="card-premium">
          {submitted ? (
            <div className="flex flex-col items-center text-center py-6 gap-6 animate-fade-in">
              <div className="w-20 h-20 rounded-3xl bg-green-50 flex items-center justify-center shadow-lg shadow-green-100">
                <HiEnvelope size={40} className="text-green-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
                <p className="text-gray-500 font-medium leading-relaxed">
                  We&apos;ve sent a password reset link to <br/>
                  <span className="text-gray-900 font-bold">{email}</span>
                </p>
              </div>
              <Link to="/login" className="btn-primary w-full flex items-center justify-center gap-2">
                <HiChevronLeft /> Back to Login
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset password</h1>
                <p className="text-gray-500 font-medium">
                  Enter your email address and we&apos;ll send you a link to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit} noValidate className="space-y-6">
                <div className="flex flex-col w-full">
                  <label htmlFor="email" className="label-premium">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setClientError(''); clearFieldError('email'); }}
                    className={`input-premium ${clientError || fieldError('email') ? 'border-red-400 focus:border-red-400 focus:ring-red-50' : ''}`}
                    autoComplete="email"
                  />
                  {(clientError || fieldError('email')) && (
                    <span className="text-red-500 text-xs mt-1.5 ml-1 animate-slide-left">
                       {clientError || fieldError('email')}
                    </span>
                  )}
                </div>

                {generalError && (
                  <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-sm text-red-700 font-semibold animate-fade-in">
                    {generalError}
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn-primary w-full h-[56px] text-lg flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : 'Send Reset Link'}
                </button>
              </form>

              <div className="mt-8 pt-8 border-t border-gray-100 text-center">
                <Link to="/login" className="text-gray-500 font-bold hover:text-[#6C63FF] transition-colors flex items-center justify-center gap-2">
                  <HiChevronLeft /> Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
