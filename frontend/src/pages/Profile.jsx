import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  HiPencil, HiLocationMarker, HiGlobe, HiLightningBolt,
  HiPlus, HiDotsVertical, HiChat, HiUserAdd,
  HiBadgeCheck, HiPhotograph, HiX,
  HiCalendar, HiDesktopComputer, HiFlag,
} from 'react-icons/hi';
import AppLayout from '../components/layout/AppLayout';
import { useAuth } from '../context/AuthContext';
import { getProfile, getPublicProfile, updateProfile } from '../api/auth';
import { getMatches, getUserSkills, getPublicUserSkills } from '../api/skills';
import { getUserActivity } from '../api/sessions';
import api from '../api/axios';


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

/* ─── REPORT USER MODAL ─── */
const REPORT_REASONS = [
  { value: 'Spam', label: 'Spam' },
  { value: 'Fake Profile', label: 'Fake Profile' },
  { value: 'Harassment', label: 'Harassment' },
  { value: 'Inappropriate Behavior', label: 'Inappropriate Behavior' },
  { value: 'Other', label: 'Other' },
];

function ReportUserModal({ userId, displayName, onClose }) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({ reason: '', description: '', form: '' });
  const MAX_CHARS = 500;
  const isSubmitDisabled = submitting || !reason || !description.trim();

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitDisabled) return;
    setErrors({ reason: '', description: '', form: '' });
    setSubmitting(true);
    try {
      await api.post(`/api/v1/reports/${userId}/report/`, {
        reason,
        description: description.trim(),
      });
      onClose();
      toast.success('Report submitted successfully');
    } catch (err) {
      const data = err?.response?.data;
      const reasonError = Array.isArray(data?.reason) ? data.reason[0] : data?.reason;
      const descriptionError = Array.isArray(data?.description) ? data.description[0] : data?.description;
      const formError =
        data?.detail ||
        data?.message ||
        (typeof data === 'string' ? data : null) ||
        (Array.isArray(data?.non_field_errors) ? data.non_field_errors[0] : data?.non_field_errors) ||
        (typeof data === 'object' && data
          ? Object.entries(data)
            .filter(([key]) => !['reason', 'description', 'non_field_errors'].includes(key))
            .flatMap(([, value]) => Array.isArray(value) ? value : [value])
            .filter(Boolean)
            .join(' ')
          : '') ||
        'Failed to submit report. Please try again.';
      setErrors({
        reason: reasonError ? String(reasonError) : '',
        description: descriptionError ? String(descriptionError) : '',
        form: formError,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.97 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="card-premium w-full max-w-md flex flex-col"
        style={{ overflow: 'hidden' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-5 border-b border-[var(--border-default)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(249,112,102,0.12)', border: '1px solid rgba(249,112,102,0.22)' }}>
              <HiFlag size={18} style={{ color: 'var(--accent-secondary)' }} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--text-primary)] leading-tight">Report User</h2>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{displayName}</p>
            </div>
          </div>
          <button
            id="report-modal-close"
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"
          >
            <HiX size={16} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-5">
          <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
            Help us keep SkillSwap safe by reporting inappropriate behavior or suspicious activity.
          </p>

          {/* Reason */}
          <div>
            <label htmlFor="report-reason" className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">
              Reason
            </label>
            <div className="relative">
              <select
                id="report-reason"
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  setErrors((prev) => ({ ...prev, reason: '', form: '' }));
                }}
                className="w-full rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)] px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] appearance-none cursor-pointer transition-colors"
                style={{ colorScheme: 'dark' }}
              >
                <option value="" disabled>Select a reason…</option>
                {REPORT_REASONS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="report-description" className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">
              Description
            </label>
            <textarea
              id="report-description"
              rows={4}
              maxLength={MAX_CHARS}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setErrors((prev) => ({ ...prev, description: '', form: '' }));
              }}
              placeholder="Please describe the issue in detail."
              className="w-full rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)] px-4 py-3 text-sm text-[var(--text-primary)] resize-none focus:outline-none focus:border-[var(--accent-primary)] transition-colors placeholder:text-[var(--text-muted)]"
            />
            <p className="text-[11px] text-[var(--text-muted)] mt-1.5 text-right">
              {description.length}/{MAX_CHARS}
            </p>
          </div>

          {/* Error */}
          {(errors.reason || errors.description || errors.form) && (
            <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl text-[13px] font-medium" style={{ background: 'rgba(249,112,102,0.08)', border: '1px solid rgba(249,112,102,0.22)', color: 'var(--accent-secondary)' }}>
              <HiX size={15} className="shrink-0 mt-0.5" />
              <div className="space-y-1">
                {errors.reason ? <p>Reason: {errors.reason}</p> : null}
                {errors.description ? <p>Description: {errors.description}</p> : null}
                {errors.form ? <p>{errors.form}</p> : null}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              id="report-cancel"
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="btn-ghost px-5 text-sm disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              id="report-submit"
              type="submit"
              disabled={isSubmitDisabled}
              className="px-5 py-[10px] rounded-[10px] text-sm font-semibold text-white transition-all disabled:opacity-60 flex items-center gap-2"
              style={{ background: isSubmitDisabled ? 'rgba(249,112,102,0.6)' : 'var(--accent-secondary)', cursor: isSubmitDisabled ? 'not-allowed' : 'pointer' }}
            >
              {submitting ? (
                <>
                  <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="3" /><path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>
                  Submitting…
                </>
              ) : (
                <><HiFlag size={15} /> Submit Report</>
              )}
            </button>
          </div>
        </form>
      </motion.div>
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
        className="card-premium flex w-full max-h-[85vh] max-w-xl flex-col overflow-hidden"
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

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
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

/* ─── ACTIONS MENU ─── */
function ProfileActionsMenu({ onReport }) {
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0, btnHeight: 42 });
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  // Use raw viewport coords — position:fixed is always relative to the viewport
  const updatePos = useCallback(() => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setMenuPos({
      top: rect.top,           // viewport y — do NOT add scrollY for fixed positioning
      right: window.innerWidth - rect.right,
      btnHeight: rect.height,
    });
  }, []);

  const handleToggle = () => {
    updatePos();               // always recalculate on every click
    setOpen((v) => !v);
  };

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (btnRef.current && btnRef.current.contains(e.target)) return;
      if (menuRef.current && menuRef.current.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on Escape; reposition on scroll / resize
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    const onRepos = () => updatePos();
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onRepos, true);
    window.addEventListener('resize', onRepos);
    return () => {
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onRepos, true);
      window.removeEventListener('resize', onRepos);
    };
  }, [open, updatePos]);

  const MENU_HEIGHT = 48;   // single-item row height in px
  const MENU_WIDTH = 192;  // 12rem
  const GAP = 8;    // space between button top edge and menu bottom edge

  // Position the menu above the button using fixed viewport coords
  const dropdownStyle = {
    position: 'fixed',
    top: menuPos.top - MENU_HEIGHT - GAP,
    right: menuPos.right,
    width: MENU_WIDTH,
    zIndex: 9999,
    background: 'var(--bg-card)',
    border: '1px solid var(--border-default)',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 -4px 24px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)',
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        id="profile-actions-menu-btn"
        ref={btnRef}
        type="button"
        onClick={handleToggle}
        title="More actions"
        className="w-[42px] h-[42px] flex items-center justify-center rounded-[10px] border border-[var(--border-default)] bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)] transition-all"
      >
        <HiDotsVertical size={18} />
      </button>

      {/* Portal renders into <body> so no parent overflow:hidden can clip it.
          AnimatePresence lives INSIDE the portal so it directly wraps the
          motion.div it needs to track for enter/exit — putting it outside the
          portal breaks key-tracking and silently suppresses rendering. */}
      {open && createPortal(
        <AnimatePresence>
          <motion.div
            key="report-menu"
            ref={menuRef}
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.96 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            style={dropdownStyle}
          >
            <button
              id="report-user-btn"
              type="button"
              onClick={() => { setOpen(false); onReport(); }}
              className="w-full flex items-center gap-2.5 px-4 py-3 text-[13px] font-medium text-left"
              style={{ color: 'var(--text-secondary)', background: 'transparent', transition: 'background 0.15s, color 0.15s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(249,112,102,0.08)'; e.currentTarget.style.color = 'var(--accent-secondary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              <HiFlag size={15} style={{ color: 'var(--accent-secondary)', opacity: 0.85, flexShrink: 0 }} />
              Report User
            </button>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
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
  const [showReportModal, setShowReportModal] = useState(false);
  const [mediaVersion, setMediaVersion] = useState(getStoredMediaVersion);
  const [failedMediaUrls, setFailedMediaUrls] = useState({ photo: null, banner: null });
  const latestFetchRef = useRef(0);

  // Activity timeline state
  const [activity, setActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [activityError, setActivityError] = useState(false);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchProfileData, isOwnProfile, user?.id]);

  // Fetch activity timeline for the profile being viewed
  const targetUserId = isOwnProfile ? user?.id : userId;
  const fetchActivity = useCallback(async () => {
    if (!targetUserId) return;
    setActivityLoading(true);
    setActivityError(false);
    try {
      const res = await getUserActivity(targetUserId);
      const data = res?.data?.data ?? res?.data ?? [];
      setActivity(Array.isArray(data) ? data.slice(0, 5) : []);
    } catch {
      setActivityError(true);
    } finally {
      setActivityLoading(false);
    }
  }, [targetUserId]);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

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
  const cancelledSessions = formatCount(pick(stats.cancelled_sessions, profileData.cancelled_sessions, stats.cancelled_sessions_count), '0');
  const reliabilityScore = profileData.profile?.reliability_score ?? profileData.reliability_score ?? null;
  const getReliabilityData = (score) => {
    if (score == null) return null;
    const num = Number(score);
    if (isNaN(num)) return null;
    if (num >= 90) return { color: 'text-[var(--accent-green)]' };
    if (num >= 75) return { color: 'text-blue-500' };
    if (num >= 50) return { color: 'text-yellow-500' };
    return { color: 'text-[var(--accent-secondary)]' };
  };
  const reliability = getReliabilityData(reliabilityScore);
  const avgRating = Number(stats.avg_rating);
  const ratingLabel = Number.isFinite(avgRating) ? avgRating.toFixed(1) : '0.0';
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
            {!isOwnProfile && (
              <div className="flex flex-wrap items-center gap-3">
                <button onClick={() => navigate('/messages', { state: { openChatWith: { user_id: userId, user_name: displayName, user_photo: photoUrl } } })} className="flex items-center justify-center gap-2 px-6 py-[10px] rounded-[10px] border border-[var(--accent-primary)] text-[var(--accent-primary)] font-medium hover:bg-[rgba(124,111,247,0.1)] transition-all">
                  <HiChat size={18} /> Message
                </button>
                <button onClick={() => navigate('/sessions')} className="btn-primary flex items-center gap-2 px-6">
                  <HiLightningBolt size={18} /> Request Session
                </button>
                <ProfileActionsMenu onReport={() => setShowReportModal(true)} />
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



        {/* ── CARD 7: STATS + RECENT ACTIVITY ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
          <Card>
            <CardHeader icon="📈" title="Recent Activity" />
            <p className="text-[13px] text-[var(--text-muted)] -mt-3 mb-5">Recent learning and teaching activity on SkillSwap</p>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-6">
              {[
                { val: reliability ? `${Number(reliabilityScore)}%` : 'N/A', label: 'Reliability', color: reliability?.color || 'text-[var(--text-muted)]', icon: '🛡️', tooltip: 'Reliability is calculated from completed sessions compared to cancelled sessions. Higher reliability means the user consistently attends and completes scheduled sessions.' },
                { val: ratingLabel, label: 'Avg Rating', color: 'text-[var(--accent-primary)]', icon: '⭐' },
                { val: completedSwaps, label: 'Swaps Completed', color: 'text-[var(--accent-primary)]', icon: '📚' },
                { val: matchCount, label: 'Skill Matches', color: 'text-[var(--accent-primary)]', icon: '🎯' },
                { val: cancelledSessions, label: 'Cancelled Sessions', color: 'text-[var(--accent-secondary)]', icon: '❌' }
              ].map(({ val, label, color, icon, tooltip }) => (
                <div key={label} className="relative group rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)] p-4 text-center hover:border-[var(--accent-primary)] transition-colors">
                  {tooltip && (
                    <div className="absolute top-2 right-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-help">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.061-1.061 3 3 0 112.871 5.026v.345a.75.75 0 01-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 108.94 6.94zM10 15a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                      <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg shadow-xl text-[10px] text-[var(--text-secondary)] text-left opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 pointer-events-none">
                        {tooltip}
                      </div>
                    </div>
                  )}
                  <p className={`text-2xl font-bold ${color} flex items-center justify-center gap-1.5`}>
                    {icon && <span className="text-xl">{icon}</span>}
                    {val}
                  </p>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-1 font-medium">{label}</p>
                </div>
              ))}
            </div>

            {/* Activity Timeline */}
            <div className="border-t border-[var(--border-default)] pt-5">
              {activityLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 animate-pulse">
                      <div className="w-9 h-9 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-default)] shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-1/3 rounded bg-[var(--bg-secondary)]" />
                        <div className="h-2.5 w-1/2 rounded bg-[var(--bg-secondary)]" />
                        <div className="h-2 w-1/4 rounded bg-[var(--bg-secondary)]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : activityError ? (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-default)] flex items-center justify-center text-xl">⚠️</div>
                  <p className="text-[13px] font-semibold text-[var(--text-primary)]">Unable to load recent activity</p>
                  <button
                    onClick={fetchActivity}
                    className="mt-1 px-4 py-1.5 text-xs font-bold rounded-lg border border-[var(--accent-primary)] text-[var(--accent-primary)] hover:bg-[rgba(124,111,247,0.08)] transition-colors"
                  >
                    Retry
                  </button>
                </div>
              ) : activity.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-default)] flex items-center justify-center text-xl">📭</div>
                  <p className="text-[13px] font-semibold text-[var(--text-primary)]">No recent activity yet</p>
                  <p className="text-[12px] text-[var(--text-muted)] max-w-xs">This user has not completed or participated in any sessions yet.</p>
                </div>
              ) : (
                <div className="relative space-y-0">
                  {/* Vertical line */}
                  <div className="absolute left-[17px] top-0 bottom-0 w-px bg-[var(--border-default)]" aria-hidden="true" />
                  {activity.map((item, i) => {
                    const isCompleted = item.status === 'completed';
                    const isCancelled = item.status === 'cancelled';
                    const teachName = item.teach_skill?.name ?? item.teach_skill ?? '—';
                    const learnName = item.learn_skill?.name ?? item.learn_skill ?? '—';
                    const createdAt = item.created_at ? new Date(item.created_at) : null;
                    const diffMs = createdAt ? Date.now() - createdAt.getTime() : null;
                    const diffDays = diffMs != null ? Math.floor(diffMs / 86400000) : null;
                    const timeLabel = diffDays == null ? '' :
                      diffDays === 0 ? 'Today' :
                        diffDays === 1 ? 'Yesterday' :
                          diffDays < 7 ? `${diffDays} days ago` :
                            diffDays < 14 ? '1 week ago' :
                              diffDays < 30 ? `${Math.floor(diffDays / 7)} weeks ago` :
                                diffDays < 60 ? '1 month ago' :
                                  `${Math.floor(diffDays / 30)} months ago`;

                    const dotColor = isCompleted
                      ? 'bg-[var(--accent-green)] shadow-[0_0_0_3px_rgba(52,211,153,0.18)]'
                      : isCancelled
                        ? 'bg-[var(--accent-secondary)] shadow-[0_0_0_3px_rgba(249,112,102,0.18)]'
                        : 'bg-[var(--text-muted)]';
                    const labelColor = isCompleted ? 'text-[var(--accent-green)]' : isCancelled ? 'text-[var(--accent-secondary)]' : 'text-[var(--text-muted)]';
                    const badgeBg = isCompleted
                      ? 'bg-[rgba(52,211,153,0.1)] border-[rgba(52,211,153,0.25)] text-[var(--accent-green)]'
                      : isCancelled
                        ? 'bg-[rgba(249,112,102,0.1)] border-[rgba(249,112,102,0.25)] text-[var(--accent-secondary)]'
                        : 'bg-[var(--bg-secondary)] border-[var(--border-default)] text-[var(--text-muted)]';
                    const statusLabel = isCompleted ? '✅ Session Completed' : isCancelled ? '❌ Session Cancelled' : `🔄 ${item.status ?? 'Session'}`;

                    return (
                      <div key={i} className={`relative flex items-center gap-4 py-4 ${i < activity.length - 1 ? 'border-b border-[var(--border-default)]' : ''}`}>
                        {/* LEFT: Timeline dot */}
                        <div className={`relative z-10 shrink-0 w-[34px] h-[34px] rounded-full border-2 border-[var(--bg-primary)] flex items-center justify-center ${dotColor}`}>
                          {isCompleted
                            ? <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="white" className="w-4 h-4"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                            : isCancelled
                              ? <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="white" className="w-4 h-4"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg>
                              : <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="white" className="w-3 h-3"><circle cx="10" cy="10" r="4" /></svg>
                          }
                        </div>

                        {/* CENTER: Title + skill exchange */}
                        <div className="flex-1 min-w-0">
                          <p className={`text-[11px] font-extrabold uppercase tracking-wider mb-1 ${labelColor}`}>
                            {isCompleted ? 'Session Completed' : isCancelled ? 'Session Cancelled' : (item.status ?? 'Session')}
                          </p>
                          <p className="text-[13px] font-semibold text-[var(--text-primary)] truncate">
                            <span className="text-[var(--accent-primary)]">{teachName}</span>
                            <span className="mx-1.5 text-[var(--text-muted)] font-bold">↔</span>
                            <span className="text-[var(--accent-secondary)]">{learnName}</span>
                          </p>
                        </div>

                        {/* RIGHT: Status badge + date */}
                        <div className="shrink-0 flex flex-col items-end gap-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-[10px] font-bold capitalize ${badgeBg}`}>
                            {item.status ?? 'unknown'}
                          </span>
                          {timeLabel && (
                            <p className="text-[11px] text-[var(--text-muted)] font-medium">{timeLabel}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
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

      <AnimatePresence>
        {!isOwnProfile && showReportModal && (
          <ReportUserModal
            userId={userId}
            displayName={displayName}
            onClose={() => setShowReportModal(false)}
          />
        )}
      </AnimatePresence>
    </AppLayout>
  );
}
