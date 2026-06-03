import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  HiPencil, HiLocationMarker, HiGlobe, HiLightningBolt,
  HiPlus, HiDotsHorizontal, HiChat, HiUserAdd,
  HiBadgeCheck, HiPhotograph, HiX,
  HiCalendar, HiDesktopComputer,
} from 'react-icons/hi';
import AppLayout from '../components/layout/AppLayout';
import { useAuth } from '../context/AuthContext';
import { getProfile, getPublicProfile, updateProfile } from '../api/auth';
import { getMatches, getUserSkills, getPublicUserSkills } from '../api/skills';


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
const normalizeProfileMedia = (profile) => {
  if (!profile) return profile;
  return {
    ...profile,
    photo: getProfileImage(profile) || profile.photo,
    banner_image: getBannerImage(profile) || profile.banner_image,
  };
};
const normalizeSkillName = (item) =>
  (
    item?.skill?.name
    || item?.name
    || item?.title
    || item?.skill_name
    || (typeof item === 'string' ? item : '')
  ).toString().trim();
const normalizeTeachSkill = (item) => {
  const name = normalizeSkillName(item);
  if (!name) return null;
  return {
    id: item?.id || item?.skill?.id || `teach-${name.toLowerCase()}`,
    name,
    endorsements: item?.endorsements ?? item?.endorsement_count ?? 0,
    level: item?.level ?? item?.proficiency ?? 3,
  };
};
const normalizeLearnSkill = (item) => {
  const name = normalizeSkillName(item);
  if (!name) return null;
  return {
    id: item?.id || item?.skill?.id || `learn-${name.toLowerCase()}`,
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
    <div className="flex min-h-[88px] flex-wrap content-start gap-4">
      {widths.map((width, index) => (
        <div key={index} className={`h-12 ${width} bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl animate-pulse`} />
      ))}
    </div>
  );
}

function SkillEmptyState({ message, onAdd, variant = 'teach', canAdd = true }) {
  const buttonClass = variant === 'learn'
    ? 'border-[var(--accent-secondary)] text-[var(--accent-secondary)] hover:bg-[rgba(249,112,102,0.1)]'
    : 'border-[var(--accent-primary)] text-[var(--accent-primary)] hover:bg-[rgba(124,111,247,0.1)]';

  return (
    <div className="flex min-h-[88px] w-full flex-col items-center justify-center rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)] px-5 py-8 text-center">
      <p className="text-[var(--text-secondary)] font-medium text-sm mb-4">{message}</p>
      {canAdd ? (
        <button
          onClick={onAdd}
          className={`px-3 py-1.5 text-[12px] rounded-lg border font-medium transition-all flex items-center gap-1 ${buttonClass}`}
        >
          <HiPlus size={13} /> Add Skill
        </button>
      ) : null}
    </div>
  );
}

function ProfileSkillsSection({ type, skills, loading, onAdd, canAdd = true }) {
  const isLearn = type === 'learn';
  const hasSkills = skills.length > 0;

  if (loading) {
    return <SkillLoadingState variant={type} />;
  }

  if (!hasSkills) {
    return (
      <SkillEmptyState
        message="No skills added yet"
        onAdd={onAdd}
        variant={type}
        canAdd={canAdd}
      />
    );
  }

  if (isLearn) {
    return (
      <div className="flex min-h-[88px] flex-wrap content-start gap-2">
        {skills.map(skill => (
          <span key={skill.id} className="px-3.5 py-1.5 rounded-full bg-[rgba(249,112,102,0.1)] border border-[rgba(249,112,102,0.3)] text-[var(--accent-secondary)] text-[13px] font-medium hover:bg-[rgba(249,112,102,0.2)] transition-all cursor-default">
            {skill.name}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="flex min-h-[88px] flex-wrap content-start gap-4">
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
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

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
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
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

      if (photoFile || bannerFile) {
        const data = new FormData();
        Object.entries(fields).forEach(([key, value]) => {
          data.append(key, typeof value === 'boolean' ? String(value) : value);
        });
        if (photoFile) data.append('photo', photoFile);
        if (bannerFile) data.append('banner_image', bannerFile);
        await onSave(data);
        return;
      }

      await onSave(fields);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 px-3 py-4 backdrop-blur-sm sm:px-4">
      <motion.form
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        onSubmit={handleSubmit}
        className="card-premium flex w-full max-w-2xl flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between border-b border-[var(--border-default)] px-5 pb-4 pt-5 sm:px-6">
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

        <div className="max-h-[calc(100vh-14rem)] overflow-y-auto px-5 py-5 sm:max-h-[calc(100vh-13rem)] sm:px-6">
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
        </div>

        <div className="sticky bottom-0 flex justify-end gap-3 border-t border-[var(--border-default)] bg-[var(--bg-card)] px-5 py-4 sm:px-6">
          <button type="button" onClick={onClose} className="btn-ghost px-5" disabled={saving}>Cancel</button>
          <button type="submit" className="btn-primary px-5 disabled:opacity-60" disabled={saving}>
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
  const { user_id: userId } = useParams();
  const { user, updateUser } = useAuth();
  const isOwnProfile = !userId || userId === user?.id;
  const [profile, setProfile] = useState(() => (isOwnProfile ? user : null));
  const [userSkills, setUserSkills] = useState([]);
  const [publicUserSkills, setPublicUserSkills] = useState([]);
  const [matches, setMatches] = useState([]);

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [mediaVersion, setMediaVersion] = useState(getStoredMediaVersion);
  const [failedMediaUrls, setFailedMediaUrls] = useState({ photo: null, banner: null });
  const latestFetchRef = useRef(0);

  const applyProfile = useCallback((nextProfile, nextMediaVersion, shouldSyncUser = false) => {
    if (!nextProfile) return;
    const normalizedProfile = normalizeProfileMedia(nextProfile);
    const syncedProfile = nextMediaVersion
      ? { ...normalizedProfile, __media_version: nextMediaVersion }
      : normalizedProfile;
    setProfile(syncedProfile);
    if (shouldSyncUser) updateUser?.(syncedProfile);
  }, [updateUser]);

  const fetchProfileData = useCallback(async ({ includeRelated = true } = {}) => {
    const fetchId = latestFetchRef.current + 1;
    latestFetchRef.current = fetchId;
    setLoadingProfile(true);
    try {
      if (!isOwnProfile) {
        const [profileRes, skillsRes] = await Promise.allSettled([
          getPublicProfile(userId),
          getPublicUserSkills(userId),
        ]);

        if (latestFetchRef.current !== fetchId) return null;

        let selectedProfile = null;
        if (profileRes?.status === 'fulfilled') {
          selectedProfile = unwrap(profileRes.value);
          applyProfile(selectedProfile);
        }

        if (skillsRes?.status === 'fulfilled') {
          setPublicUserSkills(asArray(unwrap(skillsRes.value)));
        }

        return selectedProfile || null;
      }

      const requests = includeRelated
        ? [getProfile(), getUserSkills(), getMatches()]
        : [getProfile()];

      const [profileRes, skillsRes, matchesRes] = await Promise.allSettled(requests);
      if (latestFetchRef.current !== fetchId) return null;

      if (profileRes?.status === 'fulfilled') {
        const profileData = unwrap(profileRes.value);
        applyProfile(profileData, undefined, true);
      }

      if (includeRelated && skillsRes?.status === 'fulfilled') {
        setUserSkills(asArray(unwrap(skillsRes.value)));
      }

      if (includeRelated && matchesRes?.status === 'fulfilled') {
        setMatches(asArray(unwrap(matchesRes.value)));
      }

      return profileRes?.status === 'fulfilled' ? unwrap(profileRes.value) : null;
    } finally {
      if (latestFetchRef.current === fetchId) {
        setLoadingProfile(false);
      }
    }
  }, [applyProfile, isOwnProfile, userId]);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      if (!active) return;
      setProfile(isOwnProfile ? user : null);
      setPublicUserSkills([]);
      setFailedMediaUrls({ photo: null, banner: null });
      fetchProfileData().catch((error) => {
        if (active) console.error('[Profile] Initial fetch failed:', error?.response?.data || error);
      });
    }, 0);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [fetchProfileData, isOwnProfile, user]);

  const profileData = useMemo(
    () => profile || (isOwnProfile ? user : null) || {},
    [isOwnProfile, profile, user],
  );
  const stats = profileData.profile || {};
  const displayName = pick(profileData.name, isOwnProfile ? user?.name : null, 'User');
  const initials = getInitials(displayName);
  const photoUrl = withCacheBust(getProfileImage(profileData) || (isOwnProfile ? getProfileImage(user) : null), mediaVersion);
  const bannerUrl = withCacheBust(getBannerImage(profileData) || (isOwnProfile ? getBannerImage(user) : null), mediaVersion);
  const photoFailed = photoUrl && failedMediaUrls.photo === photoUrl;
  const bannerFailed = bannerUrl && failedMediaUrls.banner === bannerUrl;
  const headline = pick(profileData.headline, profileData.title, profileData.language && `${profileData.language} Speaker`, 'No headline added');
  const location = pick(profileData.location, profileData.city, 'Location not added');
  const bio = pick(profileData.bio, 'No bio added yet.');
  const skillItems = useMemo(() => {
    return isOwnProfile ? userSkills : publicUserSkills;
  }, [isOwnProfile, userSkills, publicUserSkills]);
  const showSkillLoading = loadingProfile && skillItems.length === 0;
  const teachSkills = useMemo(() => {
    return skillItems
      .filter((item) => item?.skill_type === 'teach')
      .map(normalizeTeachSkill)
      .filter(Boolean);
  }, [skillItems]);
  const learnSkills = useMemo(() => {
    return skillItems
      .filter((item) => item?.skill_type === 'learn')
      .map(normalizeLearnSkill)
      .filter(Boolean);
  }, [skillItems]);
  const openAddSkills = (tab) => navigate(`/skills?tab=${tab}&add=1`);
  const experience = asArray(profileData.experience).map(normalizeExperience);
  const education = asArray(profileData.education).map(normalizeEducation);
  const swaps = asArray(profileData.swaps || profileData.swap_history);
  const connectionCount = formatCount(pick(profileData.connections_count, profileData.connection_count, profileData.followers_count), '0');
  const matchCount = formatCount(pick(profileData.matches_count, isOwnProfile ? matches.length || null : null), '0');
  const completedSwaps = formatCount(pick(stats.total_sessions, profileData.posts_count, profileData.activity_count), '0');
  const avgRating = Number(stats.avg_rating);
  const ratingLabel = Number.isFinite(avgRating) ? `${avgRating.toFixed(1)}★` : '0.0★';
  const creditsLabel = formatCount(stats.credits, '0');
  const isAvailable = toBoolean(profileData.is_available, true);
  const sessionTypes = asArray(profileData.session_types || profileData.preferred_session_types);
  const weeklyAvailability = pick(profileData.weekly_availability, profileData.availability_note, profileData.schedule_note, '');
  const communicationTools = asArray(profileData.communication_tools || profileData.preferred_tools);

  useEffect(() => {
    if (!isOwnProfile) {
      console.log(profileData);
    }
  }, [isOwnProfile, profileData]);

  const handleProfileSave = async (formData) => {
    try {
      const response = await updateProfile(formData);
      const updatedProfile = unwrap(response);
      const nextMediaVersion = Date.now();
      localStorage.setItem(PROFILE_MEDIA_VERSION_KEY, String(nextMediaVersion));
      setMediaVersion(nextMediaVersion);

      if (updatedProfile) {
        applyProfile(updatedProfile, nextMediaVersion, true);
      }

      const freshProfile = await fetchProfileData({ includeRelated: false });
      if (freshProfile) {
        applyProfile(freshProfile, nextMediaVersion, true);
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
              {isOwnProfile ? (
                <button onClick={() => setShowEditProfile(true)} className="mb-2 px-4 py-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-[13px] font-medium hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] transition-all flex items-center gap-1.5">
                  <HiPencil size={14} /> Edit Profile
                </button>
              ) : null}
            </div>

            {/* Identity */}
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">{displayName}</h1>
              {profileData?.profile?.is_verified ? <HiBadgeCheck className="text-[var(--accent-primary)] w-5 h-5" /> : null}
            </div>
            <p className="text-[15px] text-[var(--text-secondary)] mb-3">
              {loadingProfile && !profile ? 'Loading profile...' : headline}
            </p>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-[var(--text-muted)] mb-5">
              <span className="flex items-center gap-1"><HiLocationMarker size={14} /> {location}</span>
              <span className="text-[var(--border-default)]">·</span>
              <span className="flex items-center gap-1"><HiGlobe size={14} /> {isAvailable ? 'Available for Remote Swaps' : 'Not available for swaps'}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[13px] mb-6 bg-[var(--bg-secondary)] w-fit px-4 py-2 rounded-xl border border-[var(--border-default)]">
              <span className="font-bold text-[var(--accent-secondary)]">{matchCount}</span>
              <span className="text-[var(--text-secondary)]">Skill Matches</span>
              <span className="text-[var(--border-default)]">·</span>
              <span className="font-bold text-[var(--accent-green)]">{creditsLabel}</span>
              <span className="text-[var(--text-secondary)]">Credits</span>
            </div>

            {/* Action buttons */}
            {isOwnProfile ? (
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
            ) : (
              <div className="flex flex-wrap gap-3">
                <button onClick={() => navigate('/matches')} className="btn-primary flex items-center gap-2 px-6">
                  <HiUserAdd size={18} /> Back to Matches
                </button>
                <button onClick={() => navigate('/sessions')} className="btn-ghost flex items-center gap-2 px-6">
                  <HiLightningBolt size={18} /> Request Session
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* ── CARD 2: ABOUT ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card className="group">
            <CardHeader icon="📝" title="About" action={isOwnProfile ? <EditBtn onClick={() => setShowEditProfile(true)} /> : null} />
            <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed">{bio}</p>
          </Card>
        </motion.div>

        {/* ── CARD 3: SKILLS I OFFER ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <Card>
            <CardHeader icon="⚡" title="Skills I Can Teach" action={isOwnProfile ? (
              <button onClick={() => openAddSkills('teaching')} className="px-3 py-1.5 text-[12px] rounded-lg border border-[var(--accent-primary)] text-[var(--accent-primary)] font-medium hover:bg-[rgba(124,111,247,0.1)] transition-all flex items-center gap-1">
                <HiPlus size={13} /> Add Skill
              </button>
            ) : null} />
            <ProfileSkillsSection
              type="teach"
              skills={teachSkills}
              loading={showSkillLoading}
              onAdd={() => openAddSkills('teaching')}
              canAdd={isOwnProfile}
            />
          </Card>
        </motion.div>

        {/* ── CARD 4: SKILLS I WANT ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader icon="🎯" title="Skills I Want to Learn" action={isOwnProfile ? (
              <button onClick={() => openAddSkills('learning')} className="px-3 py-1.5 text-[12px] rounded-lg border border-[var(--accent-secondary)] text-[var(--accent-secondary)] font-medium hover:bg-[rgba(249,112,102,0.1)] transition-all flex items-center gap-1">
                <HiPlus size={13} /> Add Skill
              </button>
            ) : null} />
            <ProfileSkillsSection
              type="learn"
              skills={learnSkills}
              loading={showSkillLoading}
              onAdd={() => openAddSkills('learning')}
              canAdd={isOwnProfile}
            />
          </Card>
        </motion.div>



        {/* ── CARD 7: SWAP HISTORY ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
          <Card>
            <CardHeader icon="🔄" title="Swap History" />
            <p className="text-[13px] text-[var(--text-muted)] -mt-3 mb-5">Skills exchanged with the community</p>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[[completedSwaps, 'Swaps Completed'], [ratingLabel, 'Avg Rating'], [matchCount, 'Skill Matches']].map(([val, label]) => (
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
            <CardHeader icon="📅" title="Availability" action={isOwnProfile ? <EditBtn onClick={() => setShowEditProfile(true)} /> : null} />
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

      {isOwnProfile && showEditProfile && (
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
