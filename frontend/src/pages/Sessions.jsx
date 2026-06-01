import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  HiCalendar,
  HiCheck,
  HiClock,
  HiRefresh,
  HiStar,
  HiUserAdd,
  HiX,
} from 'react-icons/hi';
import AppLayout from '../components/layout/AppLayout';
import Avatar from '../components/ui/Avatar';
import { useAuth } from '../context/AuthContext';
import {
  acceptSession,
  addMeetingLink,
  cancelSession,
  completeSession,
  declineSession,
  getCreditHistory,
  getMySessions,
  getSessionDetail,
  submitSessionReview,
} from '../api/sessions';
import SessionRequestModal from '../components/sessions/SessionRequestModal';

const FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

const unwrap = (response) => response?.data?.data ?? response?.data ?? [];
const asArray = (value) => (Array.isArray(value) ? value : []);

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

const formatDateTime = (value) => {
  if (!value) return { date: 'Date unavailable', time: '' };
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { date: value, time: '' };

  return {
    date: new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(date),
    time: new Intl.DateTimeFormat('en-IN', { timeStyle: 'short' }).format(date),
  };
};

const statusBadgeClass = {
  pending: 'bg-[rgba(251,191,36,0.12)] text-[var(--accent-yellow)] border-[rgba(251,191,36,0.28)]',
  confirmed: 'bg-[rgba(124,111,247,0.12)] text-[var(--accent-primary)] border-[rgba(124,111,247,0.3)]',
  completed: 'bg-[rgba(52,211,153,0.12)] text-[var(--accent-green)] border-[rgba(52,211,153,0.28)]',
  cancelled: 'bg-[var(--bg-secondary)] text-[var(--text-muted)] border-[var(--border-default)]',
};

function SessionDetailModal({ sessionId, onClose, reviewed, onReviewSubmitted, onMeetingLinkUpdated }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ reviewee_id: '', rating: 5, comment: '' });

  const [meetingLink, setMeetingLink] = useState('');
  const [isEditingLink, setIsEditingLink] = useState(false);
  const [savingLink, setSavingLink] = useState(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    let active = true;

    getSessionDetail(sessionId)
      .then((response) => {
        if (!active) return;
        const data = unwrap(response);
        setSession(data);
        const revieweeId = data?.sender?.id === user?.id ? data?.receiver?.id : data?.sender?.id;
        setForm((prev) => ({ ...prev, reviewee_id: revieweeId || '' }));
        setMeetingLink(data?.meeting_link || '');
      })
      .catch((error) => {
        if (active) toast.error(formatApiError(error, 'Failed to fetch session details'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [sessionId, user?.id]);

  const handleSubmitReview = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await submitSessionReview(sessionId, {
        reviewee_id: form.reviewee_id,
        rating: Number(form.rating),
        comment: form.comment.trim(),
      });
      toast.success('Review submitted');
      onReviewSubmitted?.(sessionId);
    } catch (error) {
      const errMsg = formatApiError(error, 'Failed to submit review');
      toast.error(errMsg);
      if (errMsg.toLowerCase().includes('already reviewed')) {
        onReviewSubmitted?.(sessionId);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveMeetingLink = async (e) => {
    e.preventDefault();
    if (!meetingLink.trim()) {
      toast.error('Meeting link cannot be empty');
      return;
    }
    if (!/^https?:\/\/[^\s$.?#].[^\s]*$/i.test(meetingLink.trim())) {
      toast.error('Please enter a valid URL (starting with http:// or https://)');
      return;
    }
    
    setSavingLink(true);
    try {
      const link = meetingLink.trim();
      const response = await addMeetingLink(sessionId, link);
      const updatedData = unwrap(response);
      const resolvedLink = updatedData?.meeting_link || link;

      if (updatedData) {
        setSession(updatedData);
        setMeetingLink(resolvedLink);
      } else {
        // Optimistically update local modal state
        setSession((prev) => prev ? { ...prev, meeting_link: resolvedLink } : prev);
        setMeetingLink(resolvedLink);
      }

      // Immediately push the updated link to parent so SessionCard re-renders
      onMeetingLinkUpdated?.(sessionId, resolvedLink);

      toast.success('Meeting link updated successfully');
      setIsEditingLink(false);
    } catch (error) {
      toast.error(formatApiError(error, 'Failed to update meeting link'));
    } finally {
      setSavingLink(false);
    }
  };

  const detail = session ? formatDateTime(session.proposed_time) : null;
  const isAlreadyReviewed = reviewed || (session?.reviewer_ids && session.reviewer_ids.includes(user?.id));

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 py-4 backdrop-blur-sm transition-all duration-300"
    >
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="card-premium flex max-h-[92vh] w-full max-w-lg flex-col"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--border-default)] px-4 py-3">
          <div>
            <h2 className="text-base font-bold text-[var(--text-primary)]">Session Details</h2>
            <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">Review the session state and leave feedback after completion.</p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all">
            <HiX size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-16 animate-pulse rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)]" />
              ))}
            </div>
          ) : session ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[session.sender, session.receiver].map((participant, index) => {
                  const role = index === 0 ? 'Sender' : 'Receiver';
                  const isSelf = participant?.id === user?.id;
                  return (
                    <div
                      key={participant.id}
                      onClick={() => !isSelf && participant.id && navigate(`/profile/${participant.id}`)}
                      className={`rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)] p-3 flex items-center gap-3 transition-all ${
                        !isSelf ? 'cursor-pointer hover:border-[var(--accent-primary)] hover:bg-[var(--bg-hover)]' : ''
                      }`}
                      title={!isSelf ? 'View Profile' : undefined}
                    >
                      <Avatar firstName={participant.name?.split(' ')[0]} lastName={participant.name?.split(' ')[1]} src={participant.photo} className="!h-9 !w-9 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">{role}</p>
                        <p className={`truncate text-xs font-bold text-[var(--text-primary)] ${!isSelf ? 'hover:text-[var(--accent-primary)] transition-colors' : ''}`}>{participant.name}</p>
                        <p className="truncate text-[11px] text-[var(--text-secondary)] mb-0.5">{participant.email}</p>
                        {!isSelf && (
                          <span className="inline-flex text-[10px] font-extrabold text-[var(--accent-primary)] hover:underline items-center gap-0.5 mt-0.5">
                            View Profile ↗
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)] p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Exchange</p>
                  <p className="text-xs text-[var(--text-primary)]">
                    Teach: <span className="font-bold text-[var(--accent-primary)]">{session.teach_skill?.name || 'Unknown'}</span>
                  </p>
                  <p className="mt-1 text-xs text-[var(--text-primary)]">
                    Learn: <span className="font-bold text-[var(--accent-secondary)]">{session.learn_skill?.name || 'Unknown'}</span>
                  </p>
                </div>

                <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)] p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Schedule</p>
                  <p className="flex items-center gap-1.5 text-xs text-[var(--text-primary)]"><HiCalendar size={14} className="text-[var(--accent-primary)] shrink-0" /> {detail?.date}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-[var(--text-primary)]"><HiClock size={14} className="text-[var(--accent-secondary)] shrink-0" /> {detail?.time}</p>
                </div>
              </div>

              {/* Google Meet Link Section */}
              {(session.status === 'confirmed' || session.status === 'completed') && (
                <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)] p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Google Meet Session Link</p>
                    {session.status === 'confirmed' && session.meeting_link && !isEditingLink && (
                      <button
                        onClick={() => setIsEditingLink(true)}
                        className="text-[11px] font-bold text-[var(--accent-primary)] hover:underline bg-transparent border-none cursor-pointer"
                      >
                        Edit Link
                      </button>
                    )}
                  </div>
                  
                  {isEditingLink || (session.status === 'confirmed' && !session.meeting_link) ? (
                    <form onSubmit={handleSaveMeetingLink} className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={meetingLink}
                          onChange={(e) => setMeetingLink(e.target.value)}
                          placeholder="Paste Google Meet link (e.g. https://meet.google.com/abc-defg-hij)"
                          className="input-premium flex-1 text-xs !py-1.5 !px-3"
                          disabled={savingLink}
                        />
                        <button
                          type="submit"
                          disabled={savingLink}
                          className="btn-primary !py-1.5 text-xs px-3 font-bold rounded-lg shrink-0"
                        >
                          {savingLink ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                      {isEditingLink && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditingLink(false);
                            setMeetingLink(session.meeting_link || '');
                          }}
                          className="text-[10px] text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-transparent border-none cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                    </form>
                  ) : session.meeting_link ? (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl p-3">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[var(--text-primary)] truncate">{session.meeting_link}</p>
                        {session.meeting_link_added_at && (
                          <p className="text-[9px] text-[var(--text-muted)] mt-0.5 font-medium">
                            Added: {formatDateTime(session.meeting_link_added_at).date} {formatDateTime(session.meeting_link_added_at).time}
                          </p>
                        )}
                      </div>
                      <a
                        href={session.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary shrink-0 text-center text-xs font-bold py-1.5 px-4 rounded-lg flex items-center justify-center gap-1 hover:scale-[1.02] transition-all no-underline"
                      >
                        Join Meeting ↗
                      </a>
                    </div>
                  ) : (
                    <p className="text-xs text-[var(--text-muted)] italic font-medium">No meeting link added yet. One participant must add a Meet link before completion.</p>
                  )}
                </div>
              )}

              {/* Separate Completion Indicators */}
              {session.status === 'confirmed' && (
                <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)] p-3.5 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Session Completion Status</p>
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className={`h-2.5 w-2.5 rounded-full ${session.completed_by_sender ? 'bg-[var(--accent-green)] animate-pulse' : 'bg-[var(--text-muted)] opacity-50'}`} />
                      <span className="text-[var(--text-secondary)] font-medium">
                        Sender: <span className="font-bold">{session.completed_by_sender ? 'Marked Complete ✓' : 'Pending ⏳'}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className={`h-2.5 w-2.5 rounded-full ${session.completed_by_receiver ? 'bg-[var(--accent-green)] animate-pulse' : 'bg-[var(--text-muted)] opacity-50'}`} />
                      <span className="text-[var(--text-secondary)] font-medium">
                        Receiver: <span className="font-bold">{session.completed_by_receiver ? 'Marked Complete ✓' : 'Pending ⏳'}</span>
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {session.message ? (
                <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)] p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Message</p>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">{session.message}</p>
                </div>
              ) : null}

              {session.status === 'completed' ? (
                isAlreadyReviewed ? (
                  <div className="rounded-xl border border-[rgba(52,211,153,0.28)] bg-[rgba(52,211,153,0.06)] p-3.5 flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[rgba(52,211,153,0.12)] text-[var(--accent-green)] shrink-0">
                      <HiCheck size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[var(--text-primary)]">Review Submitted</p>
                      <p className="text-[11px] text-[var(--text-secondary)]">You have completed the feedback process for this session.</p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitReview} className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)] p-3.5">
                    <div className="flex items-center gap-2 mb-3">
                      <HiStar size={15} className="text-[var(--accent-yellow)]" />
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-primary)]">Leave Review</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-[100px_1fr]">
                      <label className="block">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Rating</span>
                        <select
                          value={form.rating}
                          onChange={(event) => setForm((prev) => ({ ...prev, rating: event.target.value }))}
                          className="input-premium mt-1.5 text-xs !py-1"
                        >
                          {[5, 4, 3, 2, 1].map((rating) => (
                            <option key={rating} value={rating}>{rating}</option>
                          ))}
                        </select>
                      </label>
                      <label className="block">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Comment</span>
                        <textarea
                          rows={2}
                          value={form.comment}
                          onChange={(event) => setForm((prev) => ({ ...prev, comment: event.target.value }))}
                          className="input-premium mt-1.5 resize-none text-xs !py-2"
                          placeholder="Share what went well in the session..."
                        />
                      </label>
                    </div>
                    <div className="mt-3 flex justify-end">
                      <button type="submit" disabled={submitting} className="btn-primary !py-1.5 text-xs px-4 disabled:opacity-60 font-bold rounded-lg">
                        {submitting ? 'Submitting...' : 'Submit Review'}
                      </button>
                    </div>
                  </form>
                )
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="border-t border-[var(--border-default)] bg-[var(--bg-card)] px-4 py-3 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors font-semibold"
          >
            ← Back
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost !py-1.5 text-xs px-3.5 border border-[var(--border-default)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-card)] rounded-lg font-bold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-primary !py-1.5 text-xs px-3.5 rounded-lg font-bold"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function SessionCard({ session, currentUserId, pendingAction, onAction, onOpenDetail, reviewed }) {
  const navigate = useNavigate();
  // Track a local completing state to prevent double-fire on the complete button
  const [completing, setCompleting] = useState(false);

  const isSender = session?.sender?.id === currentUserId;
  const partner = isSender ? session?.receiver : session?.sender;
  const directionLabel = isSender ? 'Outgoing Request' : 'Incoming Request';
  const detail = formatDateTime(session.proposed_time);
  const isBusy = pendingAction === session.id;
  const canAccept = session.status === 'pending' && !isSender;
  const canDecline = session.status === 'pending' && !isSender;
  const canCancel = ['pending', 'confirmed'].includes(session.status);
  const userHasCompleted = isSender ? session.completed_by_sender : session.completed_by_receiver;
  const canComplete = session.status === 'confirmed' && !userHasCompleted;
  const canReview = session.status === 'completed' && !reviewed;

  const handleComplete = async (e) => {
    e.stopPropagation();
    if (completing || isBusy) return;
    setCompleting(true);
    try {
      await onAction('complete', session);
    } finally {
      setCompleting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-premium flex flex-col border-l-4 border-l-[var(--accent-primary)] p-4 sm:p-5 hover:translate-y-[-2px] hover:shadow-md transition-all duration-300"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div
          onClick={() => partner?.id && navigate(`/profile/${partner.id}`)}
          className="flex items-center gap-3 min-w-0 cursor-pointer hover:opacity-85 transition-opacity"
          title="View Profile"
        >
          <Avatar firstName={partner?.name?.split(' ')[0]} lastName={partner?.name?.split(' ')[1]} src={partner?.photo} className="!h-10 !w-10 !rounded-lg shrink-0" />
          <div className="min-w-0">
            <h3 className="truncate text-base font-bold text-[var(--text-primary)] hover:text-[var(--accent-primary)] transition-colors">{partner?.name || 'Unknown user'}</h3>
            <p className="truncate text-xs text-[var(--text-secondary)] mb-0.5">{partner?.headline || partner?.email || 'Skill partner'}</p>
            <span className="inline-flex text-[10px] font-extrabold text-[var(--accent-primary)] hover:underline items-center gap-0.5">
              View Profile ↗
            </span>
          </div>
        </div>
        <span className={`inline-flex shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${statusBadgeClass[session.status] || statusBadgeClass.cancelled}`}>
          {session.status}
        </span>
      </div>

      <div className="mb-3 rounded-lg bg-[var(--bg-secondary)] px-3 py-2 border border-[var(--border-default)]">
        <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">{directionLabel}</p>
        <p className="text-xs font-semibold text-[var(--text-primary)] leading-relaxed">
          Teach <span className="font-bold text-[var(--accent-primary)]">{session.teach_skill?.name || 'Unknown'}</span> and learn <span className="font-bold text-[var(--accent-secondary)]">{session.learn_skill?.name || 'Unknown'}</span>
        </p>
      </div>

      <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--text-secondary)] font-medium">
        <div className="flex items-center gap-1.5">
          <HiCalendar size={14} className="text-[var(--accent-primary)] shrink-0" />
          <span>{detail.date}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <HiClock size={14} className="text-[var(--accent-secondary)] shrink-0" />
          <span>{detail.time || 'Time unavailable'}</span>
        </div>
      </div>

      {session.status === 'confirmed' && (
        <div className="mb-3 grid grid-cols-2 gap-2 text-[10px] bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl p-2.5 font-bold">
          <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
            <span className={`h-2 w-2 rounded-full ${session.completed_by_sender ? 'bg-[var(--accent-green)] animate-pulse' : 'bg-[var(--text-muted)] opacity-50'}`} />
            <span>Sender: {session.completed_by_sender ? 'Complete ✓' : 'Pending'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
            <span className={`h-2 w-2 rounded-full ${session.completed_by_receiver ? 'bg-[var(--accent-green)] animate-pulse' : 'bg-[var(--text-muted)] opacity-50'}`} />
            <span>Receiver: {session.completed_by_receiver ? 'Complete ✓' : 'Pending'}</span>
          </div>
        </div>
      )}

      {session.status === 'confirmed' && session.meeting_link && (
        <div className="mb-3 flex items-center justify-between gap-2 rounded-xl bg-[rgba(124,111,247,0.06)] border border-[rgba(124,111,247,0.18)] px-3 py-2">
          <div className="flex items-center gap-1.5 min-w-0 text-xs font-bold text-[var(--accent-primary)]">
            <span className="shrink-0">📹</span>
            <span className="truncate">Meet Link Ready</span>
          </div>
          <a
            href={session.meeting_link}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary !py-1 px-3 text-[10px] font-bold rounded-lg shrink-0 flex items-center gap-0.5 no-underline hover:scale-[1.02] transition-all"
          >
            Join Meet ↗
          </a>
        </div>
      )}
      {session.status === 'confirmed' && !session.meeting_link && (
        <div className="mb-3 flex items-center gap-1.5 rounded-xl bg-[rgba(251,191,36,0.05)] border border-[rgba(251,191,36,0.18)] px-3 py-2 text-[10px] font-bold text-[var(--accent-yellow)]">
          <span className="shrink-0">⚠️</span>
          <span>No meeting link added yet. (Required for completion)</span>
        </div>
      )}

      {session.message ? (
        <p className="mb-4 text-xs leading-relaxed text-[var(--text-secondary)] line-clamp-2 min-h-[2.5rem] overflow-hidden text-ellipsis">
          {session.message}
        </p>
      ) : (
        <div className="mb-4 min-h-[2.5rem] flex items-center">
          <p className="text-xs italic text-[var(--text-muted)] font-medium">No details provided.</p>
        </div>
      )}

      <div className="mt-auto flex gap-2 border-t border-[var(--border-default)] pt-3">
        <button onClick={() => onOpenDetail(session.id)} className="btn-ghost flex-1 !py-1.5 text-xs font-bold rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-card)]">
          Details
        </button>
        {canAccept ? (
          <button
            onClick={(e) => { e.stopPropagation(); onAction('accept', session); }}
            disabled={isBusy}
            className="btn-primary flex-1 flex items-center justify-center gap-1 !py-1.5 text-xs font-bold rounded-lg disabled:opacity-60"
          >
            {isBusy ? '...' : <><HiCheck size={14} /> Accept</>}
          </button>
        ) : null}
        {canDecline ? (
          <button
            onClick={(e) => { e.stopPropagation(); onAction('decline', session); }}
            disabled={isBusy}
            className="btn-ghost flex-1 flex items-center justify-center gap-1 !py-1.5 text-xs font-bold rounded-lg text-[var(--accent-secondary)] border border-[var(--border-default)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-card)] disabled:opacity-60"
          >
            {isBusy ? '...' : <><HiX size={14} /> Decline</>}
          </button>
        ) : null}
        {canCancel ? (
          <button
            onClick={(e) => { e.stopPropagation(); onAction('cancel', session); }}
            disabled={isBusy}
            className="btn-ghost flex-1 flex items-center justify-center gap-1 !py-1.5 text-xs font-bold rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-card)] disabled:opacity-60"
          >
            {isBusy ? '...' : <><HiX size={14} /> Cancel</>}
          </button>
        ) : null}
        {canComplete ? (
          <button
            onClick={handleComplete}
            disabled={completing || isBusy}
            className="btn-primary flex-1 flex items-center justify-center gap-1 !py-1.5 text-xs font-bold rounded-lg disabled:opacity-60"
          >
            {completing ? 'Saving...' : <><HiCheck size={14} /> Complete</>}
          </button>
        ) : null}
        {session.status === 'confirmed' && userHasCompleted ? (
          <button disabled className="btn-ghost flex-1 flex items-center justify-center gap-1 !py-1.5 text-[11px] font-bold rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] text-[var(--text-muted)] cursor-not-allowed opacity-75">
            Waiting for Partner...
          </button>
        ) : null}
        {canReview ? (
          <button onClick={() => onOpenDetail(session.id)} className="btn-primary flex-1 flex items-center justify-center gap-1 !py-1.5 text-xs font-bold rounded-lg">
            <HiStar size={14} /> Review
          </button>
        ) : null}
      </div>
    </motion.div>
  );
}

export default function Sessions() {
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');
  const [sessions, setSessions] = useState([]);
  const [credits, setCredits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingAction, setPendingAction] = useState('');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [detailSessionId, setDetailSessionId] = useState('');
  const [reviewedSessions, setReviewedSessions] = useState(() => new Set());

  // Use a ref so fetchSessions never has a stale closure over filter
  const filterRef = useRef(filter);
  useEffect(() => { filterRef.current = filter; }, [filter]);

  const fetchSessions = useCallback(async (statusOverride) => {
    const statusToFetch = statusOverride !== undefined ? statusOverride : filterRef.current;
    try {
      const [sessionsRes, creditsRes] = await Promise.all([
        getMySessions(statusToFetch),
        getCreditHistory(),
      ]);
      setSessions(asArray(unwrap(sessionsRes)));
      setCredits(asArray(unwrap(creditsRes)));
    } catch (error) {
      toast.error(formatApiError(error, 'Failed to load sessions'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        const [sessionsRes, creditsRes] = await Promise.all([
          getMySessions(filter),
          getCreditHistory(),
        ]);
        if (!active) return;
        setSessions(asArray(unwrap(sessionsRes)));
        setCredits(asArray(unwrap(creditsRes)));
      } catch (error) {
        if (active) toast.error(formatApiError(error, 'Failed to load sessions'));
      } finally {
        if (active) setLoading(false);
      }
    };

    run();
    return () => {
      active = false;
    };
  }, [filter]);

  const creditsEarned = useMemo(
    () => credits.reduce((sum, item) => sum + (Number(item.amount) || 0), 0),
    [credits],
  );

  const applySessionUpdate = (sessionId, updater) => {
    setSessions((prev) => prev.map((item) => (item.id === sessionId ? updater(item) : item)));
  };

  const handleAction = async (action, session) => {
    const previousSession = session;
    setPendingAction(session.id);

    // Only apply optimistic status for non-complete actions
    // (complete may stay 'confirmed' if only one party marked it)
    const optimisticStatuses = {
      accept: 'confirmed',
      decline: 'cancelled',
      cancel: 'cancelled',
    };

    if (optimisticStatuses[action]) {
      applySessionUpdate(session.id, (item) => ({ ...item, status: optimisticStatuses[action] }));
    }

    try {
      let response;
      if (action === 'accept') response = await acceptSession(session.id);
      if (action === 'decline') response = await declineSession(session.id);
      if (action === 'cancel') response = await cancelSession(session.id);
      if (action === 'complete') response = await completeSession(session.id);

      const updated = unwrap(response);
      if (updated) {
        applySessionUpdate(session.id, () => updated);
      }

      if (action === 'complete') {
        // Determine if fully completed or still waiting for other party
        const isFullyCompleted = updated?.status === 'completed';
        if (isFullyCompleted) {
          toast.success('Session marked complete! Both parties confirmed.');
        } else {
          toast.success('Marked complete — waiting for the other person to confirm.');
        }
        setLoading(true);
        await fetchSessions();
      } else if (action === 'accept') {
        toast.success('Session accepted!');
        setLoading(true);
        await fetchSessions();
      } else if (action === 'decline') {
        toast.success('Session declined.');
        setLoading(true);
        await fetchSessions();
      } else if (action === 'cancel') {
        toast.success('Session cancelled.');
        setLoading(true);
        await fetchSessions();
      }
    } catch (error) {
      applySessionUpdate(session.id, () => previousSession);
      toast.error(formatApiError(error, `Failed to ${action} session`));
    } finally {
      setPendingAction('');
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col lg:flex-row gap-5 w-full max-w-6xl">
        {/* Main Content Area */}
        <div className="flex-1 space-y-4 min-w-0">
          <div className="card-premium flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-xl font-extrabold text-[var(--text-primary)]">My Sessions</h1>
              <p className="mt-0.5 text-xs text-[var(--text-secondary)]">Track request status, complete sessions, and leave reviews.</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex flex-wrap items-center gap-1 rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)] p-1">
                {FILTERS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setLoading(true);
                      setFilter(option.value);
                    }}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${filter === option.value ? 'bg-[var(--accent-primary)] text-white shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <button onClick={() => setShowRequestModal(true)} className="btn-primary flex items-center gap-1.5 px-4 !py-2 text-xs font-bold rounded-lg shrink-0">
                <HiUserAdd size={15} /> New Request
              </button>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="card-premium h-[240px] animate-pulse bg-[var(--bg-card)] border-l-4 border-l-[var(--border-default)]" />
              ))}
            </div>
          ) : sessions.length ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {sessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  currentUserId={user?.id}
                  pendingAction={pendingAction}
                  reviewed={reviewedSessions.has(session.id)}
                  onAction={handleAction}
                  onOpenDetail={setDetailSessionId}
                />
              ))}
            </div>
          ) : (
            <div className="card-premium flex flex-col items-center p-8 text-center max-w-md mx-auto mt-4">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)]">
                <HiCalendar className="h-6 w-6 text-[var(--text-muted)]" />
              </div>
              <h2 className="text-base font-bold text-[var(--text-primary)]">No sessions in this view</h2>
              <p className="mt-1 text-xs text-[var(--text-secondary)] max-w-xs">Use matches to create a request, then manage the full workflow here.</p>
              <button onClick={() => setShowRequestModal(true)} className="btn-primary mt-4 flex items-center gap-1.5 px-4 !py-2 text-xs font-bold rounded-lg">
                <HiRefresh size={14} /> Start a Session Request
              </button>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="w-full lg:w-[280px] shrink-0 space-y-4">
          {/* Credits Summary Card */}
          <div className="card-premium p-5 space-y-3.5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Credits Balance</p>
              <div className="mt-1 flex items-baseline gap-2">
                <p className="text-3xl font-black text-[var(--accent-primary)]">{user?.profile?.credits ?? 0}</p>
                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Credits Available</span>
              </div>
              <p className="mt-1 text-xs text-[var(--text-secondary)] font-medium">Total earned: <span className="font-bold text-[var(--text-primary)]">{creditsEarned}</span></p>
            </div>
            <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)] p-3 text-[11px] text-[var(--text-secondary)] leading-relaxed font-medium">
              Credits are rewarded for completing skill swap sessions once reviewed by both participants.
            </div>
          </div>

          {/* Credit Transactions History Card */}
          <div className="card-premium p-5 flex flex-col gap-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-[var(--text-primary)]">Transaction History</h3>
            
            <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
              {credits.length ? (
                credits.map((tx) => {
                  const txDetail = formatDateTime(tx.created_at);
                  const isPositive = Number(tx.amount) >= 0;
                  return (
                    <div key={tx.id} className="flex items-start justify-between gap-3 border-b border-[var(--border-default)] pb-2.5 last:border-b-0 last:pb-0">
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-[var(--text-primary)] truncate">{tx.reason || 'Session credit'}</p>
                        <p className="text-[9px] text-[var(--text-muted)] mt-0.5 font-medium">{txDetail.date} • {txDetail.time}</p>
                        {tx.expires_at && (
                          <p className="text-[8px] text-[var(--accent-secondary)] mt-0.5 font-bold">
                            Expires: {formatDateTime(tx.expires_at).date}
                          </p>
                        )}
                      </div>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                        isPositive 
                          ? 'bg-[rgba(52,211,153,0.1)] text-[var(--accent-green)] border border-[rgba(52,211,153,0.2)]' 
                          : 'bg-[rgba(249,112,102,0.1)] text-[var(--accent-secondary)] border border-[rgba(249,112,102,0.2)]'
                      }`}>
                        {isPositive ? `+${tx.amount}` : tx.amount}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6">
                  <p className="text-xs text-[var(--text-muted)] italic font-medium">No transactions found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showRequestModal ? (
        <SessionRequestModal
          isOpen={showRequestModal}
          onClose={() => setShowRequestModal(false)}
          onCreated={(session) => {
            setSessions((prev) => [session, ...prev]);
            if (filter !== 'all' && filter !== 'pending') {
              setLoading(true);
              setFilter('all');
            }
          }}
        />
      ) : null}

      {detailSessionId ? (
        <SessionDetailModal
          sessionId={detailSessionId}
          reviewed={reviewedSessions.has(detailSessionId)}
          onClose={() => setDetailSessionId('')}
          onMeetingLinkUpdated={(sessionId, link) => {
            // Immediately update the matching session in the list so SessionCard shows Join Meet
            setSessions((prev) =>
              prev.map((s) =>
                s.id === sessionId ? { ...s, meeting_link: link } : s
              )
            );
          }}
          onReviewSubmitted={async (sessionId) => {
            setReviewedSessions((prev) => new Set(prev).add(sessionId));
            const prevCreditCount = credits.length;
            await fetchSessions();
            // fetchSessions updates the `credits` state; use getCreditHistory directly
            // to detect if credits were awarded (review_count reached 2 on backend)
            try {
              const freshCreditsRes = await getCreditHistory();
              const freshCredits = asArray(unwrap(freshCreditsRes));
              setCredits(freshCredits);
              if (freshCredits.length > prevCreditCount) {
                toast.success('🎉 Credits awarded! Both parties have reviewed the session.');
              }
            } catch {
              // Silently ignore — credits panel will update on next refresh
            }
          }}
        />
      ) : null}
    </AppLayout>
  );
}
