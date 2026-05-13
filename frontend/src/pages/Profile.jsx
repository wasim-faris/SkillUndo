import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiUser, HiPencilSquare, HiCheck, HiXMark } from 'react-icons/hi2';
import AppLayout from '../components/layout/AppLayout';
import Avatar from '../components/ui/Avatar';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { SkeletonLine } from '../components/ui/SkeletonCard';
import { useFormErrors } from '../hooks/useFormErrors';
import { useAuth } from '../context/AuthContext';
import { getProfile, updateProfile } from '../api/auth';

export default function Profile() {
  const { updateUser } = useAuth();
  const { fieldError, generalError, setApiErrors, clearFieldError } = useFormErrors();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '', bio: '' });

  useEffect(() => {
    getProfile()
      .then((res) => {
        setProfile(res.data);
        setForm({
          first_name: res.data.first_name || '',
          last_name: res.data.last_name || '',
          bio: res.data.bio || '',
        });
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    clearFieldError(field);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateProfile(form);
      setProfile(res.data);
      updateUser(res.data);
      toast.success('Profile updated! ✨');
      setEditing(false);
    } catch (err) {
      if (!err.response) {
        toast.error('Network error. Try again.');
      } else {
        setApiErrors(err);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setForm({
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
      bio: profile?.bio || '',
    });
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-black text-gray-900">My Profile</h1>
          {!editing && !loading && (
            <Button variant="outline" onClick={() => setEditing(true)} className="gap-2">
              <HiPencilSquare size={20} /> Edit Profile
            </Button>
          )}
        </div>

        {/* Profile Card */}
        <div className="card-premium">
          {loading ? (
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-gray-100 animate-pulse rounded-3xl" />
                <div className="flex-1 space-y-3">
                  <div className="h-6 w-48 bg-gray-100 animate-pulse rounded-lg" />
                  <div className="h-4 w-64 bg-gray-50 animate-pulse rounded-lg" />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              <div className="relative group">
                <Avatar firstName={profile?.first_name} lastName={profile?.last_name} size="2xl" />
                <div className="absolute inset-0 bg-[#6C63FF]/20 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                  <HiPencilSquare className="text-white w-8 h-8" />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl font-black text-gray-900 mb-1">
                  {profile?.first_name} {profile?.last_name}
                </h2>
                <p className="text-gray-400 font-bold text-lg mb-4">{profile?.email}</p>
                {profile?.bio && (
                  <p className="text-gray-600 font-medium text-base leading-relaxed bg-gray-50 p-6 rounded-2xl border-l-4 border-[#6C63FF]">
                    "{profile.bio}"
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Edit Section */}
        {editing && (
          <div className="card-premium border-2 border-[#6C63FF]/10 animate-fade-in">
            <h3 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-[#6C63FF]">
                 <HiUser size={22} />
              </div>
              Update Personal Details
            </h3>

            <form onSubmit={handleSave} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="First Name"
                  id="edit_first_name"
                  value={form.first_name}
                  onChange={handleChange('first_name')}
                  error={fieldError('first_name')}
                />
                <Input
                  label="Last Name"
                  id="edit_last_name"
                  value={form.last_name}
                  onChange={handleChange('last_name')}
                  error={fieldError('last_name')}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="bio" className="label-premium">Bio / Introduction</label>
                <textarea
                  id="bio"
                  value={form.bio}
                  onChange={(e) => { setForm((p) => ({ ...p, bio: e.target.value })); clearFieldError('bio'); }}
                  placeholder="Tell the community who you are and what makes you special..."
                  rows={4}
                  className={`
                    input-premium resize-none
                    ${fieldError('bio') ? 'border-red-400 focus:border-red-400 focus:ring-red-50' : ''}
                  `}
                />
                {fieldError('bio') && (
                  <p className="text-red-500 text-xs font-bold mt-1 animate-slide-left" role="alert">{fieldError('bio')}</p>
                )}
              </div>

              {generalError && (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-sm text-red-700 font-bold animate-fade-in">
                  {generalError}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button type="submit" loading={saving} className="flex-1 h-14 text-lg">
                  <HiCheck size={20} /> Save Changes
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel} disabled={saving} className="flex-1 h-14 text-lg">
                  <HiXMark size={20} /> Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Account Settings */}
        <div className="card-premium">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-gray-900 mb-1">Security</h3>
              <p className="text-gray-400 font-bold text-sm">Update your password or account settings</p>
            </div>
            <Link to="/forgot-password">
              <Button variant="secondary" size="sm">Reset Password</Button>
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
