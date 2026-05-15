import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { HiLightningBolt } from 'react-icons/hi';
import toast from 'react-hot-toast';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import { useFormErrors } from '../hooks/useFormErrors';
import { resetPassword } from '../api/auth';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { generalError, setApiErrors } = useFormErrors();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ new_password: '', confirm_password: '' });
  const [clientErrors, setClientErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.new_password) errs.new_password = 'Password is required.';
    else if (form.new_password.length < 8) errs.new_password = 'Password must be at least 8 characters.';
    if (!form.confirm_password) errs.confirm_password = 'Please confirm your password.';
    else if (form.new_password !== form.confirm_password) errs.confirm_password = 'Passwords do not match.';
    return errs;
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setClientErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setClientErrors(errs); return; }

    setLoading(true);
    try {
      await resetPassword(token, form.new_password);
      toast.success('Password changed successfully!');
      navigate('/login', { replace: true });
    } catch (err) {
      if (!err.response) {
        toast.error('Something went wrong. Please try again.');
      } else {
        setApiErrors(err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-[420px]">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[var(--accent-primary)] flex items-center justify-center mb-4 shadow-lg shadow-indigo-200">
            <HiLightningBolt className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Set new password</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">Choose a strong new password.</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <Input
              label="New Password"
              id="new_password"
              type="password"
              placeholder="Min 8 characters"
              value={form.new_password}
              onChange={handleChange('new_password')}
              onClearError={() => setClientErrors((p) => { const n = { ...p }; delete n.new_password; return n; })}
              error={clientErrors.new_password}
              autoComplete="new-password"
            />
            <Input
              label="Confirm Password"
              id="confirm_password"
              type="password"
              placeholder="Repeat password"
              value={form.confirm_password}
              onChange={handleChange('confirm_password')}
              onClearError={() => setClientErrors((p) => { const n = { ...p }; delete n.confirm_password; return n; })}
              error={clientErrors.confirm_password}
              autoComplete="new-password"
            />

            <Alert message={generalError} />

            <Button type="submit" fullWidth loading={loading}>
              Reset Password
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
