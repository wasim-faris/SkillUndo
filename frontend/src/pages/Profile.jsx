import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  HiPencil, HiLocationMarker, HiGlobe, HiLightningBolt,
  HiPlus, HiDotsHorizontal, HiChat, HiUserAdd,
  HiBadgeCheck, HiPhotograph, HiX,
  HiCalendar, HiDesktopComputer,
} from 'react-icons/hi';
import AppLayout from '../components/layout/AppLayout';
import { useAuth } from '../context/AuthContext';
import { getProfile, updateProfile } from '../api/auth';
import { getMatches, getUserSkills } from '../api/skills';

const API_BASE_URL = 'http://127.0.0.1:8000';
const PROFILE_MEDIA_VERSION_KEY = 'skillswap_profile_media_version';

const unwrap = (response) => response?.data?.data ?? response?.data ?? null;
const hasValue = (value) => value !== undefined && value !== null && value !== '';
const pick = (...values) => values.find(hasValue);
const asArray = (value) => Array.isArray(value) ? value : [];
const toBoolean = (value, fallback = true) => {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['false', '0', 'no', 'off'].includes(normalized)) return false;
    if (['true', '1', 'yes', 'on'].includes(normalized)) return true;
  }
  return Boolean(value);
};
const formatCount = (value, fallback) => {
  const number = Number(value);
  return Number.isFinite(number) ? number.toLocaleString() : fallback;
};
const getInitials = (value) =>
  (value || 'User').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
const normalizeMediaPath = (url) => {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith('/')) return url;
  if (url.startsWith('media/')) return `/${url}`;
  if (url.startsWith('profile_photos/') || url.startsWith('banners/')) return `/${url}`;
  return `/media/${url}`;
};
const getAssetUrl = (url) => {
  const normalizedUrl = normalizeMediaPath(url);
  if (!normalizedUrl) return null;
  if (/^https?:\/\//i.test(normalizedUrl)) return normalizedUrl;
  if (normalizedUrl.startsWith('/profile_photos/') || normalizedUrl.startsWith('/banners/')) {
    return normalizedUrl;
  }
  return `${API_BASE_URL}${normalizedUrl}`;
};
const withCacheBust = (url, version) => {
  if (!url || !version) return url;
  return `${url}${url.includes('?') ? '&' : '?'}v=${version}`;
};
const getStoredMediaVersion = () => Number(localStorage.getItem(PROFILE_MEDIA_VERSION_KEY)) || 0;
const getProfileImage = (profile) => getAssetUrl(pick(
  profile?.photo,
  profile?.profile_image,
  profile?.avatar,
  profile?.image,
));
const getBannerImage = (profile) => getAssetUrl(pick(
  profile?.banner_image,
  profile?.banner,
  profile?.cover_image,
  profile?.cover,
));
const getRawProfileImage = (profile) => pick(
  profile?.photo,
  profile?.profile_image,
  profile?.avatar,
  profile?.image,
);
const getRawBannerImage = (profile) => pick(
  profile?.banner_image,
  profile?.banner,
  profile?.cover_image,
  profile?.cover,
);
const normalizeProfileMedia = (profile) => {
  if (!profile) return profile;
  return {
    ...profile,
    photo: getProfileImage(profile) || profile.photo,
    banner_image: getBannerImage(profile) || profile.banner_image,
  };
};
const normalizeSkillName = (item) =>
  item?.skill?.name || item?.name || item?.title || item?.skill_name || item;
const normalizeTeachSkill = (item) => {
  const name = normalizeSkillName(item);
  if (!name) return null;
  return {
    id: item?.id || item?.skill?.id || name,
    name,
    endorsements: item?.endorsements ?? item?.endorsement_count ?? 0,
    level: item?.level ?? item?.proficiency ?? 3,
  };
};
const normalizeLearnSkill = (item) => {
  const name = normalizeSkillName(item);
  if (!name) return null;
  return {
    id: item?.id || item?.skill?.id || name,
    name,
  };
};
const normalizeExperience = (item) => ({
  title: pick(item?.title, item?.role, item?.position, 'Role'),
  company: pick(item?.company, item?.organization, item?.employer, 'Company'),
  type: pick(item?.type, item?.employment_type, 'Full-time'),
  duration: pick(item?.duration, item?.date_range, [item?.start_date, item?.end_date].filter(Boolean).join(' – '), ''),
  location: pick(item?.location, item?.city, 'Remote'),
  description: pick(item?.description, item?.summary, ''),
  skills: asArray(item?.skills).map(normalizeSkillName).filter(Boolean),
  initials: pick(item?.initials, getInitials(pick(item?.company, item?.organization, item?.employer, ''))),
});
const normalizeEducation = (item) => ({
  degree: pick(item?.degree, item?.course, item?.field_of_study, 'Degree'),
  institution: pick(item?.institution, item?.school, item?.university, 'Institution'),
  years: pick(item?.years, item?.date_range, [item?.start_year, item?.end_year].filter(Boolean).join(' – '), ''),
  initials: pick(item?.initials, getInitials(pick(item?.institution, item?.school, item?.university, ''))),
  description: pick(item?.description, ''),
});

/* ─── SUB-COMPONENTS ─── */
function Card({ children, className = '' }) {
  return (
    <div className={`card-premium p-6 ${className}`}>
      {children}
    </div>
  );
}

function CardHeader({ icon, title, action }) {
  return (
    <div className="flex items-center justify-between pb-4 mb-5 border-b border-[var(--border-default)]">
      <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
        <span>{icon}</span> {title}
      </h2>
      {action}
    </div>
  );
}

function AddBtn({ onClick }) {
  return (
    <button onClick={onClick} className="w-8 h-8 flex items-center justify-center rounded-lg border border-[var(--border-default)] text-[var(--text-muted)] hover:text-[var(--accent-primary)] hover:border-[var(--accent-primary)] transition-all text-lg leading-none bg-[var(--bg-secondary)]">
      <HiPlus size={16} />
    </button>
  );
}

function EditBtn({ onClick }) {
  return (
    <button type="button" onClick={onClick} className="w-7 h-7 flex items-center justify-center rounded-md border border-[var(--border-default)] text-[var(--text-muted)] hover:text-[var(--accent-primary)] hover:border-[var(--accent-primary)] transition-all opacity-0 group-hover:opacity-100 bg-[var(--bg-secondary)]">
      <HiPencil size={13} />
    </button>
  );
}

function Dots({ max = 5, filled = 3 }) {
  return (
    <div className="flex gap-0.5 mt-1">
      {Array.from({ length: max }).map((_, i) => (
        <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < filled ? 'bg-[var(--accent-primary)]' : 'bg-[var(--bg-secondary)]'}`} />
      ))}
    </div>
  );
}

function Stars({ count = 5 }) {
  return <span className="text-[var(--accent-yellow)] text-sm">{'★'.repeat(count)}{'☆'.repeat(5 - count)}</span>;
}

function StatusBadge({ status }) {
  const map = {
    Completed: 'bg-[rgba(52,211,153,0.1)] border-[rgba(52,211,153,0.3)] text-[var(--accent-green)]',
    Active: 'bg-[rgba(124,111,247,0.1)] border-[rgba(124,111,247,0.3)] text-[var(--accent-primary)]',
    Pending: 'bg-[var(--bg-secondary)] border-[var(--border-default)] text-[var(--text-muted)]',
  };
  return (
    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${map[status] || map.Pending}`}>
      {status}
    </span>
  );
}

function SkillLoadingState({ variant = 'teach' }) {
  const widths = variant === 'teach' ? ['w-32', 'w-40', 'w-36'] : ['w-28', 'w-36', 'w-32'];

  return (
    <div className="flex flex-wrap gap-4">
      {widths.map((width, index) => (
        <div key={index} className={`h-12 ${width} bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl animate-pulse`} />
      ))}
    </div>
  );
}

function SkillEmptyState({ message, onAdd, variant = 'teach' }) {
  const buttonClass = variant === 'learn'
    ? 'border-[var(--accent-secondary)] text-[var(--accent-secondary)] hover:bg-[rgba(249,112,102,0.1)]'
    : 'border-[var(--accent-primary)] text-[var(--accent-primary)] hover:bg-[rgba(124,111,247,0.1)]';

  return (
    <div className="w-full rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)] px-5 py-8 text-center flex flex-col items-center">
      <p className="text-[var(--text-secondary)] font-medium text-sm mb-4">{message}</p>
      <button
        onClick={onAdd}
        className={`px-3 py-1.5 text-[12px] rounded-lg border font-medium transition-all flex items-center gap-1 ${buttonClass}`}
      >
        <HiPlus size={13} /> Add Skill
      </button>
    </div>
  );
}

function ProfileSkillsSection({ type, skills, loading, onAdd }) {
  const isLearn = type === 'learn';

  if (loading) {
    return <SkillLoadingState variant={type} />;
  }

  if (!skills.length) {
    return (
      <SkillEmptyState
        message={isLearn ? 'No learning skills added yet' : 'No teaching skills added yet'}
        onAdd={onAdd}
        variant={type}
      />
    );
  }

  if (isLearn) {
    return (
      <div className="flex flex-wrap gap-2">
        {skills.map(skill => (
          <span key={skill.id} className="px-3.5 py-1.5 rounded-full bg-[rgba(249,112,102,0.1)] border border-[rgba(249,112,102,0.3)] text-[var(--accent-secondary)] text-[13px] font-medium hover:bg-[rgba(249,112,102,0.2)] transition-all cursor-default">
            {skill.name}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-4">
      {skills.map(skill => (
        <div key={skill.id} className="flex flex-col items-start bg-[var(--bg-secondary)] border border-[var(--border-default)] p-2 rounded-xl">
          <div className="flex items-center gap-2 px-2 py-1 text-[var(--text-primary)] text-[13px] font-semibold cursor-default">
            {skill.name}
            <span className="text-[10px] text-[var(--accent-primary)] bg-[rgba(124,111,247,0.1)] px-1.5 py-0.5 rounded-md">✓ {skill.endorsements}</span>
          </div>
          <div className="px-2 pb-1">
            <Dots max={5} filled={skill.level} />
          </div>
        </div>
      ))}
    </div>
  );
}

function SectionEmptyState({ message }) {
  return (
    <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)] px-5 py-8 text-center">
      <p className="text-[14px] font-medium text-[var(--text-muted)]">{message}</p>
    </div>
  );
}

function FilePicker({ id, label, file, previewUrl, onChange }) {
  return (
    <label htmlFor={id} className="block cursor-pointer group">
      <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)] p-3 transition-all group-hover:border-[var(--accent-primary)]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-lg overflow-hidden bg-[var(--bg-card)] border border-[var(--border-default)] flex items-center justify-center shrink-0">
            {previewUrl ? (
              <img src={previewUrl} alt={label} className="w-full h-full object-cover" />
            ) : (
              <HiPhotograph size={22} className="text-[var(--text-muted)]" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-[var(--text-primary)]">{label}</p>
            <p className="text-[11px] text-[var(--text-muted)] truncate">{file?.name || 'Choose an image'}</p>
          </div>
        </div>
        <span className="text-[11px] font-bold text-[var(--accent-primary)]">Browse</span>
      </div>
      <input
        id={id}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => onChange(event.target.files?.[0] || null)}
      />
    </label>
  );
}

function EditProfileModal({ profile, photoUrl, bannerUrl, onClose, onSave }) {
  const initialAvailability = toBoolean(profile?.is_available, true);
  const [form, setForm] = useState(() => ({
    name: profile?.name || '',
    headline: profile?.headline || '',
    city: profile?.city || '',
    language: profile?.language || '',
    bio: profile?.bio || '',
    is_available: initialAvailability,
  }));
  const [photoFile, setPhotoFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const photoPreview = useMemo(() => (
    photoFile ? URL.createObjectURL(photoFile) : photoUrl
  ), [photoFile, photoUrl]);
  const bannerPreview = useMemo(() => (
    bannerFile ? URL.createObjectURL(bannerFile) : bannerUrl
  ), [bannerFile, bannerUrl]);

  useEffect(() => {
    return () => {
      if (photoFile && photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoFile, photoPreview]);

  useEffect(() => {
    return () => {
      if (bannerFile && bannerPreview) URL.revokeObjectURL(bannerPreview);
    };
  }, [bannerFile, bannerPreview]);

  const updateField = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    if (field === 'is_available') {
      console.log('[Profile] Availability toggle changed:', {
        previous: form.is_available,
        next: value,
        rawProfileValue: profile?.is_available,
      });
    }
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log('SAVE BUTTON CLICKED');
    setSaving(true);

    try {
      const textFields = {
        name: form.name.trim(),
        headline: form.headline.trim(),
        city: form.city.trim(),
        language: form.language.trim(),
        bio: form.bio.trim(),
      };
      const fields = {
        is_available: Boolean(form.is_available),
      };

      Object.entries(textFields).forEach(([key, value]) => {
        const currentValue = profile?.[key] ?? '';
        if (key === 'name' && !value) return;
        if (value !== currentValue) fields[key] = value;
      });

      console.log('[Profile] Availability before save:', {
        initial: initialAvailability,
        current: form.is_available,
        payloadValue: fields.is_available,
        payloadType: typeof fields.is_available,
        rawProfileValue: profile?.is_available,
      });

      if (photoFile || bannerFile) {
        const data = new FormData();
        Object.entries(fields).forEach(([key, value]) => {
          data.append(key, typeof value === 'boolean' ? String(value) : value);
        });
        if (photoFile) data.append('photo', photoFile);
        if (bannerFile) data.append('banner_image', bannerFile);

        console.log('FORM DATA:', Object.fromEntries(data.entries()));
        await onSave(data);
        return;
      }

      console.log('PROFILE UPDATE PAYLOAD:', fields);
      await onSave(fields);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <motion.form
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        onSubmit={handleSubmit}
        className="card-premium w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6"
      >
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-[var(--border-default)]">
          <div>
            <h2 className="text-lg font-black text-[var(--text-primary)]">Edit Profile</h2>
            <p className="text-[12px] text-[var(--text-muted)] mt-1">Update your public profile details.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all flex items-center justify-center"
          >
            <HiX size={18} />
          </button>
        </div>

        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FilePicker id="profile-photo" label="Profile image" file={photoFile} previewUrl={photoPreview} onChange={setPhotoFile} />
            <FilePicker id="profile-banner" label="Banner image" file={bannerFile} previewUrl={bannerPreview} onChange={setBannerFile} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Name</span>
              <input value={form.name} onChange={updateField('name')} className="mt-2 w-full rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)] px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]" />
            </label>
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Headline</span>
              <input value={form.headline} onChange={updateField('headline')} className="mt-2 w-full rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)] px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]" />
            </label>
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">City</span>
              <input value={form.city} onChange={updateField('city')} className="mt-2 w-full rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)] px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]" />
            </label>
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Language</span>
              <input value={form.language} onChange={updateField('language')} className="mt-2 w-full rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)] px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]" />
            </label>
          </div>

          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Bio</span>
            <textarea value={form.bio} onChange={updateField('bio')} rows={5} className="mt-2 w-full rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)] px-4 py-3 text-sm text-[var(--text-primary)] resize-none focus:outline-none focus:border-[var(--accent-primary)]" />
          </label>

          <label className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)] px-4 py-3">
            <span>
              <span className="block text-[13px] font-bold text-[var(--text-primary)]">Open to skill swaps</span>
              <span className="block text-[11px] text-[var(--text-muted)] mt-0.5">Show availability on your profile.</span>
            </span>
            <input type="checkbox" checked={form.is_available} onChange={updateField('is_available')} className="w-5 h-5 accent-[var(--accent-primary)]" />
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-5 mt-5 border-t border-[var(--border-default)]">
          <button type="button" onClick={onClose} className="btn-ghost px-5" disabled={saving}>Cancel</button>
          <button type="submit" onClick={() => console.log('SAVE PROFILE BUTTON CLICKED')} className="btn-primary px-5 disabled:opacity-60" disabled={saving}>
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </motion.form>
    </div>
  );
}

/* ─── MAIN PAGE ─── */
export default function Profile() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(user);
  const [userSkills, setUserSkills] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [mediaVersion, setMediaVersion] = useState(getStoredMediaVersion);
  const [failedMediaUrls, setFailedMediaUrls] = useState({ photo: null, banner: null });

  const applyProfile = useCallback((nextProfile, nextMediaVersion) => {
    if (!nextProfile) return;
    const normalizedProfile = normalizeProfileMedia(nextProfile);
    const syncedProfile = nextMediaVersion
      ? { ...normalizedProfile, __media_version: nextMediaVersion }
      : normalizedProfile;
    setProfile(syncedProfile);
    updateUser?.(syncedProfile);
  }, [updateUser]);

  const fetchProfileData = useCallback(async ({ includeRelated = true } = {}) => {
    setLoadingProfile(true);
    try {
      const requests = includeRelated
        ? [getProfile(), getUserSkills(), getMatches()]
        : [getProfile()];

      const [profileRes, skillsRes, matchesRes] = await Promise.allSettled(requests);

      if (profileRes?.status === 'fulfilled') {
        const profileData = unwrap(profileRes.value);
        console.log('[Profile] FETCH PROFILE RESPONSE:', profileRes.value?.data);
        applyProfile(profileData);
      }

      if (includeRelated && skillsRes?.status === 'fulfilled') {
        setUserSkills(asArray(unwrap(skillsRes.value)));
      }

      if (includeRelated && matchesRes?.status === 'fulfilled') {
        setMatches(asArray(unwrap(matchesRes.value)));
      }

      return profileRes?.status === 'fulfilled' ? unwrap(profileRes.value) : null;
    } finally {
      setLoadingProfile(false);
    }
  }, [applyProfile]);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      fetchProfileData().catch((error) => {
        if (active) console.error('[Profile] Initial fetch failed:', error?.response?.data || error);
      });
    }, 0);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [fetchProfileData]);

  const profileData = profile || user || {};
  const stats = profileData.profile || {};
  const displayName = pick(profileData.name, user?.name, 'User');
  const initials = getInitials(displayName);
  const rawPhoto = getRawProfileImage(profileData) || getRawProfileImage(user);
  const rawBanner = getRawBannerImage(profileData) || getRawBannerImage(user);
  const photoUrl = withCacheBust(getProfileImage(profileData) || getProfileImage(user), mediaVersion);
  const bannerUrl = withCacheBust(getBannerImage(profileData) || getBannerImage(user), mediaVersion);
  const photoFailed = photoUrl && failedMediaUrls.photo === photoUrl;
  const bannerFailed = bannerUrl && failedMediaUrls.banner === bannerUrl;
  const headline = pick(profileData.headline, profileData.title, profileData.language && `${profileData.language} Speaker`, 'Add a headline');
  const location = pick(profileData.location, profileData.city, 'Add your location');
  const bio = pick(profileData.bio, 'Add a short bio to tell people what you teach and want to learn.');
  const teachSkills = useMemo(() => {
    return userSkills
      .filter((item) => item?.skill_type === 'teach')
      .map(normalizeTeachSkill)
      .filter(Boolean);
  }, [userSkills]);
  const learnSkills = useMemo(() => {
    return userSkills
      .filter((item) => item?.skill_type === 'learn')
      .map(normalizeLearnSkill)
      .filter(Boolean);
  }, [userSkills]);
  const openAddSkills = (tab) => navigate(`/skills?tab=${tab}&add=1`);
  const experience = asArray(profileData.experience).map(normalizeExperience);
  const education = asArray(profileData.education).map(normalizeEducation);
  const swaps = asArray(profileData.swaps || profileData.swap_history);
  const connectionCount = formatCount(pick(profileData.connections_count, profileData.connection_count, profileData.followers_count), '0');
  const matchCount = formatCount(pick(profileData.matches_count, matches.length || null), '0');
  const completedSwaps = formatCount(pick(stats.total_sessions, profileData.posts_count, profileData.activity_count), '0');
  const avgRating = Number(stats.avg_rating);
  const ratingLabel = Number.isFinite(avgRating) && avgRating > 0 ? `${avgRating.toFixed(1)}★` : '4.9★';
  const isAvailable = toBoolean(profileData.is_available, true);
  const sessionTypes = asArray(profileData.session_types || profileData.preferred_session_types);
  const weeklyAvailability = pick(profileData.weekly_availability, profileData.availability_note, profileData.schedule_note, '');
  const communicationTools = asArray(profileData.communication_tools || profileData.preferred_tools);

  useEffect(() => {
    console.log('[Profile] Resolved media render URLs:', {
      rawPhoto,
      photoUrl,
      rawBanner,
      bannerUrl,
      mediaVersion,
    });
  }, [rawPhoto, photoUrl, rawBanner, bannerUrl, mediaVersion]);

  const handleProfileSave = async (formData) => {
    try {
      const payloadFields = formData instanceof FormData ? Array.from(formData.keys()) : Object.keys(formData);
      console.log('[Profile] Updating profile with fields:', payloadFields);
      const response = await updateProfile(formData);
      console.log('UPDATE RESPONSE:', response.data);
      const updatedProfile = unwrap(response);
      const nextMediaVersion = Date.now();
      localStorage.setItem(PROFILE_MEDIA_VERSION_KEY, String(nextMediaVersion));
      setMediaVersion(nextMediaVersion);

      if (updatedProfile) {
        applyProfile(updatedProfile, nextMediaVersion);
        console.log('[Profile] Profile updated:', updatedProfile);
        console.log('[Profile] Availability response value:', {
          raw: updatedProfile?.is_available,
          parsed: toBoolean(updatedProfile?.is_available, true),
        });
        console.log('[Profile] Updated media URLs:', {
          profileImage: getProfileImage(updatedProfile),
          bannerImage: getBannerImage(updatedProfile),
        });
      }

      const freshProfile = await fetchProfileData({ includeRelated: false });
      if (freshProfile) {
        applyProfile(freshProfile, nextMediaVersion);
        console.log('[Profile] Final availability after refetch:', {
          raw: freshProfile?.is_available,
          parsed: toBoolean(freshProfile?.is_available, true),
        });
        console.log('[Profile] Refetched media URLs:', {
          profileImage: getProfileImage(freshProfile),
          bannerImage: getBannerImage(freshProfile),
        });
      }

      toast.success('Profile updated');
      setShowEditProfile(false);
    } catch (error) {
      console.error('[Profile] Update failed:', {
        status: error?.response?.status,
        data: error?.response?.data,
        message: error?.message,
      });
      toast.error('Failed to update profile');
      throw error;
    }
  };

  return (
    <AppLayout>
      <div className="max-w-[900px] mx-auto space-y-5">

        {/* ── CARD 1: HERO ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card-premium overflow-hidden">
          {/* Banner */}
          <div className="h-40 relative" style={{ background: 'var(--gradient-1)' }}>
            {bannerUrl && !bannerFailed && (
              <img
                src={bannerUrl}
                alt={`${displayName} banner`}
                onError={() => {
                  console.warn('[Profile] Failed to load banner image:', bannerUrl);
                  setFailedMediaUrls((prev) => ({ ...prev, banner: bannerUrl }));
                }}
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 opacity-20 mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
          </div>

          <div className="px-6 pb-6">
            {/* Avatar row */}
            <div className="flex items-end justify-between -mt-14 mb-4 relative z-10">
              <div className="w-28 h-28 rounded-full border-4 border-[var(--bg-card)] bg-[var(--bg-secondary)] flex items-center justify-center overflow-hidden shadow-xl">
                {photoUrl && !photoFailed ? (
                  <img
                    src={photoUrl}
                    alt={displayName}
                    onError={() => {
                      console.warn('[Profile] Failed to load profile image:', photoUrl);
                      setFailedMediaUrls((prev) => ({ ...prev, photo: photoUrl }));
                    }}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[var(--gradient-2)] flex items-center justify-center text-white font-black text-3xl">
                    {initials}
                  </div>
                )}
              </div>
              <button onClick={() => setShowEditProfile(true)} className="mb-2 px-4 py-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-[13px] font-medium hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] transition-all flex items-center gap-1.5">
                <HiPencil size={14} /> Edit Profile
              </button>
            </div>

            {/* Identity */}
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">{displayName}</h1>
              <HiBadgeCheck className="text-[var(--accent-primary)] w-5 h-5" />
            </div>
            <p className="text-[15px] text-[var(--text-secondary)] mb-3">
              {loadingProfile && !profile ? 'Loading profile...' : headline}
            </p>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-[var(--text-muted)] mb-5">
              <span className="flex items-center gap-1"><HiLocationMarker size={14} /> {location}</span>
              <span className="text-[var(--border-default)]">·</span>
              <span className="flex items-center gap-1"><HiGlobe size={14} /> {isAvailable ? 'Available for Remote Swaps' : 'Not available for swaps'}</span>
            </div>

            <div className="flex items-center gap-2 text-[13px] mb-6 bg-[var(--bg-secondary)] w-fit px-4 py-2 rounded-xl border border-[var(--border-default)]">
              <span className="font-bold text-[var(--accent-primary)]">{connectionCount}</span>
              <span className="text-[var(--text-secondary)]">Connections</span>
              <span className="text-[var(--border-default)]">·</span>
              <span className="font-bold text-[var(--accent-secondary)]">{matchCount}</span>
              <span className="text-[var(--text-secondary)]">Skill Matches</span>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">
              <button className="btn-primary flex items-center gap-2 px-6">
                <HiUserAdd size={18} /> Connect
              </button>
              <button className="btn-ghost flex items-center gap-2 px-6">
                <HiChat size={18} /> Message
              </button>
              <button className="btn-ghost flex items-center gap-2 px-6">
                <HiLightningBolt size={18} /> Swap Skills
              </button>
              <button className="w-11 h-11 rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--accent-primary)] transition-all flex items-center justify-center">
                <HiDotsHorizontal size={20} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* ── CARD 2: ABOUT ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card className="group">
            <CardHeader icon="📝" title="About" action={<EditBtn onClick={() => setShowEditProfile(true)} />} />
            <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed">{bio}</p>
          </Card>
        </motion.div>

        {/* ── CARD 3: SKILLS I OFFER ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <Card>
            <CardHeader icon="⚡" title="Skills I Can Teach" action={
              <button onClick={() => openAddSkills('teaching')} className="px-3 py-1.5 text-[12px] rounded-lg border border-[var(--accent-primary)] text-[var(--accent-primary)] font-medium hover:bg-[rgba(124,111,247,0.1)] transition-all flex items-center gap-1">
                <HiPlus size={13} /> Add Skill
              </button>
            } />
            <ProfileSkillsSection
              type="teach"
              skills={teachSkills}
              loading={loadingProfile}
              onAdd={() => openAddSkills('teaching')}
            />
          </Card>
        </motion.div>

        {/* ── CARD 4: SKILLS I WANT ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader icon="🎯" title="Skills I Want to Learn" action={
              <button onClick={() => openAddSkills('learning')} className="px-3 py-1.5 text-[12px] rounded-lg border border-[var(--accent-secondary)] text-[var(--accent-secondary)] font-medium hover:bg-[rgba(249,112,102,0.1)] transition-all flex items-center gap-1">
                <HiPlus size={13} /> Add Skill
              </button>
            } />
            <ProfileSkillsSection
              type="learn"
              skills={learnSkills}
              loading={loadingProfile}
              onAdd={() => openAddSkills('learning')}
            />
          </Card>
        </motion.div>

        {/* ── CARD 5: EXPERIENCE ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
          <Card>
            <CardHeader icon="💼" title="Experience" action={<AddBtn />} />
            {experience.length > 0 ? (
              <div className="space-y-0">
                {experience.map((exp, i) => (
                <div key={i}>
                  <div className="flex gap-4 group py-2">
                    <div className="w-12 h-12 shrink-0 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--accent-primary)] font-bold text-sm border border-[var(--border-default)]">
                      {exp.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-[15px] font-bold text-[var(--text-primary)]">{exp.title}</p>
                          <p className="text-[14px] text-[var(--text-secondary)] font-medium">{exp.company} · {exp.type}</p>
                          <p className="text-[13px] text-[var(--text-muted)] mt-0.5">{exp.duration} · {exp.location}</p>
                        </div>
                        <EditBtn />
                      </div>
                      {exp.description && (
                        <p className="text-[14px] text-[var(--text-secondary)] leading-[1.65] mt-3 mb-3">{exp.description}</p>
                      )}
                      <div className="flex flex-wrap gap-1.5">
                        {exp.skills.map(s => (
                          <span key={s} className="px-2 py-0.5 rounded text-[11px] bg-[var(--bg-secondary)] border border-[var(--border-default)] text-[var(--text-muted)]">{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  {i < experience.length - 1 && <div className="h-px bg-[var(--border-default)] my-4" />}
                </div>
                ))}
              </div>
            ) : (
              <SectionEmptyState message="No experience added yet." />
            )}
          </Card>
        </motion.div>

        {/* ── CARD 6: EDUCATION ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
          <Card>
            <CardHeader icon="🎓" title="Education" action={<AddBtn />} />
            {education.length > 0 ? (
              <div className="space-y-0">
                {education.map((edu, i) => (
                <div key={i}>
                  <div className="flex gap-4 group py-2">
                    <div className="w-12 h-12 shrink-0 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--accent-secondary)] font-bold text-xs border border-[var(--border-default)]">
                      {edu.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-[15px] font-bold text-[var(--text-primary)]">{edu.degree}</p>
                          <p className="text-[14px] text-[var(--text-secondary)] font-medium">{edu.institution}</p>
                          <p className="text-[13px] text-[var(--text-muted)] mt-0.5">{edu.years}</p>
                        </div>
                        <EditBtn />
                      </div>
                      {edu.description && (
                        <p className="text-[14px] text-[var(--text-secondary)] leading-[1.65] mt-3">{edu.description}</p>
                      )}
                    </div>
                  </div>
                  {i < education.length - 1 && <div className="h-px bg-[var(--border-default)] my-4" />}
                </div>
                ))}
              </div>
            ) : (
              <SectionEmptyState message="No education added yet." />
            )}
          </Card>
        </motion.div>

        {/* ── CARD 7: SWAP HISTORY ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
          <Card>
            <CardHeader icon="🔄" title="Swap History" />
            <p className="text-[13px] text-[var(--text-muted)] -mt-3 mb-5">Skills exchanged with the community</p>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[[completedSwaps, 'Swaps Completed'], [ratingLabel, 'Avg Rating'], ['8', 'Active Swaps']].map(([val, label]) => (
                <div key={label} className="rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)] p-4 text-center">
                  <p className="text-2xl font-bold text-[var(--accent-primary)]">{val}</p>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-1 font-medium">{label}</p>
                </div>
              ))}
            </div>

            {swaps.length > 0 ? (
              <div className="space-y-0">
                {swaps.map((swap, i) => (
                <div key={i}>
                  <div className="flex items-center gap-4 py-4">
                    {/* Avatars with arrow */}
                    <div className="flex items-center gap-2 shrink-0 bg-[var(--bg-secondary)] border border-[var(--border-default)] px-2 py-1.5 rounded-full">
                      <div className="w-8 h-8 rounded-full bg-[var(--gradient-1)] flex items-center justify-center text-white text-xs font-bold shadow-sm">
                        {initials}
                      </div>
                      <span className="text-[var(--text-muted)] text-sm">⇄</span>
                      <div className="w-8 h-8 rounded-full bg-[var(--bg-card)] border border-[var(--border-default)] flex items-center justify-center text-[var(--text-primary)] text-xs font-bold">
                        {pick(swap.initials, getInitials(swap.partner || swap.partner_name))}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 ml-2">
                      <p className="text-[14px] text-[var(--text-primary)] font-medium">
                        Taught <span className="text-[var(--accent-primary)] font-bold">{pick(swap.taught, swap.taught_skill, 'Skill')}</span> to {pick(swap.partner, swap.partner_name, 'Partner')} · Learned <span className="text-[var(--accent-secondary)] font-bold">{pick(swap.learned, swap.learned_skill, 'Skill')}</span>
                      </p>
                      <p className="text-[12px] text-[var(--text-muted)] mt-1">{pick(swap.date, swap.completed_at, swap.created_at, '')} · {pick(swap.sessions, swap.session_count, 0)} sessions</p>
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-1.5">
                      <Stars count={Number(swap.rating) || 0} />
                      <StatusBadge status={pick(swap.status, 'Pending')} />
                    </div>
                  </div>
                  {i < swaps.length - 1 && <div className="h-px bg-[var(--border-default)]" />}
                </div>
                ))}
              </div>
            ) : (
              <SectionEmptyState message="No swap history yet." />
            )}
          </Card>
        </motion.div>

        {/* ── CARD 8: AVAILABILITY ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader icon="📅" title="Availability" action={<EditBtn onClick={() => setShowEditProfile(true)} />} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-6">
                {/* Status */}
                <div>
                  <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider mb-2 font-bold">Status</p>
                  <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[13px] font-bold border ${isAvailable ? 'bg-[rgba(52,211,153,0.1)] border-[rgba(52,211,153,0.3)] text-[var(--accent-green)]' : 'bg-[var(--bg-secondary)] border-[var(--border-default)] text-[var(--text-muted)]'}`}>
                    <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-green-400 animate-pulse' : 'bg-[var(--text-muted)]'}`} /> {isAvailable ? 'Open to Skill Swaps' : 'Not Available'}
                  </span>
                </div>

                {/* Session types */}
                <div>
                  <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider mb-2 font-bold">Preferred Session Types</p>
                  <div className="flex flex-wrap gap-2">
                    {sessionTypes.length > 0 ? (
                      sessionTypes.map(t => (
                        <span key={t} className="px-3 py-1.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-[12px] font-medium cursor-default">{t}</span>
                      ))
                    ) : (
                      <span className="text-[13px] text-[var(--text-muted)]">No session types added yet.</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Schedule */}
                <div>
                  <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider mb-2 font-bold">Weekly Availability</p>
                  {weeklyAvailability ? (
                    <p className="text-[13px] text-[var(--text-primary)] flex items-center gap-2 font-medium bg-[var(--bg-secondary)] px-3 py-2 rounded-lg border border-[var(--border-default)] w-fit"><HiCalendar size={16} className="text-[var(--accent-primary)]" /> {weeklyAvailability}</p>
                  ) : (
                    <p className="text-[13px] text-[var(--text-muted)]">No weekly availability added yet.</p>
                  )}
                </div>
                
                {/* Communication */}
                <div>
                  <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider mb-2 font-bold">Communication Tools</p>
                  <div className="flex flex-wrap gap-2">
                    {communicationTools.length > 0 ? (
                      communicationTools.map((tool) => {
                        const label = typeof tool === 'string' ? tool : pick(tool.label, tool.name, tool.tool, 'Tool');
                        return (
                          <span key={label} className="px-3 py-1.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-[12px] font-medium flex items-center gap-1.5 cursor-default">
                            <HiDesktopComputer size={14} className="text-[var(--accent-secondary)]" /> {label}
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-[13px] text-[var(--text-muted)]">No communication tools added yet.</span>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </Card>
        </motion.div>

      </div>

      {showEditProfile && (
        <EditProfileModal
          profile={profileData}
          photoUrl={photoUrl}
          bannerUrl={bannerUrl}
          onClose={() => setShowEditProfile(false)}
          onSave={handleProfileSave}
        />
      )}
    </AppLayout>
  );
}
