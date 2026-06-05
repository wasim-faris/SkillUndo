import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { HiCalendar, HiClock, HiPaperAirplane, HiX } from 'react-icons/hi';
import { getMatches, getUserSkills, getPublicUserSkills } from '../../api/skills';
import { sendSessionRequest } from '../../api/sessions';

const unwrap = (response) => response?.data?.data ?? response?.data ?? [];

const formatApiError = (error, fallback) => {
  const message = error?.response?.data?.message;
  if (typeof message === 'string') return message;
  if (Array.isArray(message)) return message.join(', ');
  if (message && typeof message === 'object') {
    const firstValue = Object.values(message)[0];
    if (Array.isArray(firstValue)) return firstValue[0];
    if (typeof firstValue === 'string') return firstValue;
  }
  return fallback;
};

const toLocalDateTimeInput = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - (offset * 60000)).toISOString().slice(0, 16);
};

export default function SessionRequestModal({ isOpen, onClose, onCreated, initialReceiverId = '' }) {
  const [matches, setMatches] = useState([]);
  const [skills, setSkills] = useState([]);
  const [receiverSkills, setReceiverSkills] = useState([]);
  const [loadingReceiverSkills, setLoadingReceiverSkills] = useState(() => Boolean(initialReceiverId));
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    receiver_id: initialReceiverId,
    teach_skill_id: '',
    learn_skill_id: '',
    proposed_time: '',
    message: '',
  });

  const teachSkills = useMemo(
    () => skills.filter((item) => item?.skill_type === 'teach'),
    [skills],
  );

  const receiverTeachSkills = useMemo(
    () => receiverSkills.filter((item) => item?.skill_type === 'teach'),
    [receiverSkills],
  );

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    let active = true;

    Promise.all([getMatches(), getUserSkills()])
      .then(([matchesRes, skillsRes]) => {
        if (!active) return;
        setMatches(Array.isArray(unwrap(matchesRes)) ? unwrap(matchesRes) : []);
        setSkills(Array.isArray(unwrap(skillsRes)) ? unwrap(skillsRes) : []);
      })
      .catch(() => {
        if (active) toast.error('Failed to load request options');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!form.receiver_id) {
      return undefined;
    }

    let active = true;
    getPublicUserSkills(form.receiver_id)
      .then((res) => {
        if (!active) return;
        const fetchedSkills = Array.isArray(unwrap(res)) ? unwrap(res) : [];
        setReceiverSkills(fetchedSkills);
      })
      .catch((err) => {
        console.error('Failed to load receiver skills:', err);
        toast.error("Failed to load selected user's skills");
      })
      .finally(() => {
        if (active) setLoadingReceiverSkills(false);
      });

    return () => {
      active = false;
    };
  }, [form.receiver_id]);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const resetAndClose = () => {
    setForm({
      receiver_id: initialReceiverId || '',
      teach_skill_id: '',
      learn_skill_id: '',
      proposed_time: '',
      message: '',
    });
    onClose();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        ...form,
        message: form.message.trim(),
        proposed_time: new Date(form.proposed_time).toISOString(),
      };

      console.log('[SessionRequestModal] Submitting session request payload:', payload);

      const response = await sendSessionRequest(payload);
      toast.success('Session request sent');
      onCreated?.(unwrap(response));
      resetAndClose();
    } catch (error) {
      toast.error(formatApiError(error, 'Failed to send session request'));
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-4 backdrop-blur-sm">
      <motion.form
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        onSubmit={handleSubmit}
        className="card-premium flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--border-default)] px-4 py-3">
          <div>
            <h2 className="text-base font-bold text-[var(--text-primary)]">New Session Request</h2>
            <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">Choose a match, your teaching skill, and what you want to learn.</p>
          </div>
          <button
            type="button"
            onClick={resetAndClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] text-[var(--text-muted)] transition-all hover:text-[var(--text-primary)]"
          >
            <HiX size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-12 animate-pulse rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)]" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <label className="block">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Match</span>
                <select
                  value={form.receiver_id}
                  onChange={(event) => {
                    const newReceiverId = event.target.value;
                    setForm((prev) => ({
                      ...prev,
                      receiver_id: newReceiverId,
                      learn_skill_id: '',
                    }));
                    setReceiverSkills([]);
                    setLoadingReceiverSkills(Boolean(newReceiverId));
                  }}
                  required
                  className="input-premium mt-1.5 text-xs !py-2"
                >
                  <option value="">Select a match</option>
                  {matches.map((match) => (
                    <option key={match.id} value={match.id}>
                      {match.name}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Skill You Teach</span>
                  <select value={form.teach_skill_id} onChange={handleChange('teach_skill_id')} required className="input-premium mt-1.5 text-xs !py-2">
                    <option value="">Choose a teaching skill</option>
                    {teachSkills.map((item) => (
                      <option key={item.id} value={item.skill?.id}>
                        {item.skill?.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Skill You Want to Learn</span>
                  <select
                    value={form.learn_skill_id}
                    onChange={handleChange('learn_skill_id')}
                    required
                    disabled={loadingReceiverSkills || !form.receiver_id}
                    className="input-premium mt-1.5 text-xs !py-2"
                  >
                    <option value="">
                      {!form.receiver_id
                        ? 'Select a match first'
                        : loadingReceiverSkills
                        ? 'Loading user skills...'
                        : receiverTeachSkills.length === 0
                        ? 'User has no teaching skills'
                        : 'Choose a learning skill'}
                    </option>
                    {receiverTeachSkills.map((item) => (
                      <option key={item.id} value={item.skill?.id}>
                        {item.skill?.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    <HiCalendar size={13} /> Date and Time
                  </span>
                  <input
                    type="datetime-local"
                    min={toLocalDateTimeInput(new Date().toISOString())}
                    value={form.proposed_time}
                    onChange={handleChange('proposed_time')}
                    required
                    className="input-premium text-xs !py-2"
                  />
                </label>

                <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)] px-3 py-2 flex flex-col justify-center">
                  <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    <HiClock size={13} /> Validation
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-[var(--text-secondary)]">
                    The backend verifies schedules, skills, and session conflicts automatically.
                  </p>
                </div>
              </div>

              <label className="block">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Message</span>
                <textarea
                  rows={2}
                  value={form.message}
                  onChange={handleChange('message')}
                  placeholder="Provide context or guidelines for the session request..."
                  className="input-premium mt-1.5 resize-none text-xs !py-2"
                />
              </label>
            </div>
          )}
        </div>

        <div className="border-t border-[var(--border-default)] bg-[var(--bg-card)] px-4 py-3">
          <div className="flex justify-end gap-2">
            <button type="button" onClick={resetAndClose} className="btn-ghost !py-1.5 text-xs px-4" disabled={submitting}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                loading ||
                submitting ||
                matches.length === 0 ||
                teachSkills.length === 0 ||
                !form.receiver_id ||
                !form.teach_skill_id ||
                !form.learn_skill_id ||
                receiverTeachSkills.length === 0
              }
              className="btn-primary flex items-center gap-1.5 !py-1.5 text-xs px-4 disabled:cursor-not-allowed disabled:opacity-60 font-bold rounded-lg"
            >
              <HiPaperAirplane size={14} />
              {submitting ? 'Sending...' : 'Send Request'}
            </button>
          </div>
        </div>
      </motion.form>
    </div>
  );
}
