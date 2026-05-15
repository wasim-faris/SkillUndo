import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiUser, HiPencil, HiCheck, HiX, HiLocationMarker, HiGlobe, HiStar, HiAcademicCap, HiCurrencyDollar, HiCamera } from 'react-icons/hi';
import AppLayout from '../components/layout/AppLayout';
import Avatar from '../components/ui/Avatar';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
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
  const [form, setForm] = useState({ 
    name: '', 
    city: '', 
    language: '', 
    bio: '',
    photo: '' 
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await getProfile();
      setProfile(res.data);
      setForm({
        name: res.data.name || '',
        city: res.data.city || '',
        language: res.data.language || '',
        bio: res.data.bio || '',
        photo: res.data.photo || '',
      });
    } catch {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

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
      toast.success('Profile saved');
      setEditing(false);
    } catch (err) {
      setApiErrors(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-[1128px] mx-auto space-y-6 py-4 animate-fade-in">
        
        {/* Profile Card */}
        <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden shadow-sm">
          <div className="h-[200px] bg-[#a0b4b7] relative">
             <button className="absolute top-4 right-4 p-2 bg-white rounded-full text-[#0a66c2] shadow-md hover:bg-neutral-50 transition-colors">
                <HiCamera size={20} />
             </button>
          </div>
          
          <div className="px-6 pb-6 relative">
            <div className="absolute -top-[80px] left-6">
              <Avatar 
                firstName={profile?.name?.split(' ')[0]} 
                lastName={profile?.name?.split(' ')[1]} 
                src={profile?.photo}
                size="2xl" 
                className="!w-[160px] !h-[160px] !rounded-full border-4 border-white shadow-md bg-white"
              />
            </div>

            <div className="flex justify-end pt-4">
              {!editing && (
                <button 
                  onClick={() => setEditing(true)}
                  className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-full transition-all"
                >
                  <HiPencil size={24} />
                </button>
              )}
            </div>
            
            <div className="mt-10">
              {loading ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-8 w-64 bg-neutral-100 rounded-md" />
                  <div className="h-4 w-96 bg-neutral-100 rounded-md" />
                </div>
              ) : (
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex-1">
                    <h1 className="text-[24px] font-bold text-black mb-1">{profile?.name}</h1>
                    <p className="text-[16px] text-neutral-800 mb-2 font-medium">Software Engineer & Skill Swapper</p>
                    <div className="flex flex-wrap items-center gap-2 text-neutral-500 text-[14px] font-medium">
                      <span>{profile?.city || 'Global'}</span>
                      <span className="w-1 h-1 bg-neutral-400 rounded-full" />
                      <button className="text-[#0a66c2] font-bold hover:underline">Contact info</button>
                      <span className="w-1 h-1 bg-neutral-400 rounded-full" />
                      <button className="text-[#0a66c2] font-bold hover:underline">500+ connections</button>
                    </div>
                    
                    <div className="mt-4 flex flex-wrap gap-2">
                       <Button size="sm">Open to</Button>
                       <Button variant="outline" size="sm">Add profile section</Button>
                       <Button variant="ghost" size="sm" className="!text-neutral-500">More</Button>
                    </div>
                  </div>

                  <div className="hidden md:block w-64 space-y-3">
                     <div className="flex items-center gap-2 group cursor-pointer">
                        <div className="w-8 h-8 bg-neutral-100 rounded-sm flex items-center justify-center text-neutral-500">
                           <HiLightningBolt size={18} />
                        </div>
                        <span className="text-[14px] font-bold text-black group-hover:text-[#0a66c2] group-hover:underline">SkillSwap Corp</span>
                     </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <div className="lg:col-span-2 space-y-6">
              {/* About Card */}
              <section className="bg-white border border-neutral-200 rounded-lg p-6 shadow-sm">
                 <div className="flex items-center justify-between mb-4">
                    <h2 className="text-[20px] font-bold text-black">About</h2>
                    {editing ? (
                      <div className="flex items-center gap-2">
                         <button onClick={handleSave} className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-all">
                            <HiCheck size={24} />
                         </button>
                         <button onClick={() => setEditing(false)} className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-all">
                            <HiX size={24} />
                         </button>
                      </div>
                    ) : (
                      <button onClick={() => setEditing(true)} className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-full transition-all">
                        <HiPencil size={20} />
                      </button>
                    )}
                 </div>
                 
                 {editing ? (
                    <textarea
                      value={form.bio}
                      onChange={(e) => setForm(p => ({ ...p, bio: e.target.value }))}
                      rows={5}
                      className="w-full bg-[#f9fafb] border border-neutral-300 rounded-md p-3 text-[14px] text-black outline-none focus:border-[#0a66c2]"
                      placeholder="Write a brief about yourself..."
                    />
                 ) : (
                    <p className="text-[14px] text-neutral-800 leading-relaxed whitespace-pre-wrap">
                       {profile?.bio || 'Add a bio to tell others about your skills and goals.'}
                    </p>
                 )}
              </section>

              {/* Experience / Skills Preview */}
              <section className="bg-white border border-neutral-200 rounded-lg p-6 shadow-sm">
                 <div className="flex items-center justify-between mb-6">
                    <h2 className="text-[20px] font-bold text-black">Skills Overview</h2>
                    <Link to="/skills" className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-full transition-all">
                       <HiPencil size={20} />
                    </Link>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-[#f9fafb] rounded-lg border border-neutral-100">
                       <HiStar className="mx-auto mb-2 text-[#e7a33e]" size={24} />
                       <p className="text-lg font-bold text-black">{profile?.profile?.avg_rating || '5.0'}</p>
                       <p className="text-[12px] font-bold text-neutral-500 uppercase">Rating</p>
                    </div>
                    <div className="text-center p-4 bg-[#f9fafb] rounded-lg border border-neutral-100">
                       <HiAcademicCap className="mx-auto mb-2 text-[#0a66c2]" size={24} />
                       <p className="text-lg font-bold text-black">{profile?.profile?.total_sessions || '0'}</p>
                       <p className="text-[12px] font-bold text-neutral-500 uppercase">Sessions</p>
                    </div>
                    <div className="text-center p-4 bg-[#f9fafb] rounded-lg border border-neutral-100">
                       <HiCurrencyDollar className="mx-auto mb-2 text-[#5f9b41]" size={24} />
                       <p className="text-lg font-bold text-black">{profile?.profile?.credits || '0'}</p>
                       <p className="text-[12px] font-bold text-neutral-500 uppercase">Credits</p>
                    </div>
                 </div>
              </section>
           </div>

           {/* Right Column */}
           <div className="space-y-6">
              <section className="bg-white border border-neutral-200 rounded-lg p-4 shadow-sm">
                 <h3 className="text-[16px] font-bold text-black mb-4">Profile Language</h3>
                 <p className="text-[14px] text-neutral-500 font-medium">English</p>
              </section>

              <section className="bg-white border border-neutral-200 rounded-lg p-4 shadow-sm">
                 <h3 className="text-[16px] font-bold text-black mb-4">Public Profile & URL</h3>
                 <p className="text-[14px] text-neutral-500 font-medium truncate">www.skillswap.com/in/{ (profile?.name || '').toLowerCase().replace(/\s+/g, '-') }</p>
              </section>
           </div>
        </div>
      </div>
    </AppLayout>
  );
}
