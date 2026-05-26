import { useCallback, useEffect, useMemo, useState } from 'react';
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

function SessionDetailModal({ sessionId, onClose, reviewed, onReviewSubmitted }) {
  const { user } = useAuth();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ reviewee_id: '', rating: 5, comment: '' });

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
      onClose();
    } catch (error) {
      toast.error(formatApiError(error, 'Failed to submit review'));
    } finally {
      setSubmitting(false);
    }
  };

  const detail = session ? formatDateTime(session.proposed_time) : null;
  const canReview = session?.status === 'completed' && !reviewed;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-4 backdrop-blur-sm">
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
                  return (
                    <div key={participant.id} className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)] p-3 flex items-center gap-3">
                      <Avatar firstName={participant.name?.split(' ')[0]} lastName={participant.name?.split(' ')[1]} src={participant.photo} className="!h-9 !w-9" />
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">{role}</p>
                        <p className="truncate text-xs font-bold text-[var(--text-primary)]">{participant.name}</p>
                        <p className="truncate text-[11px] text-[var(--text-secondary)]">{participant.email}</p>
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

              {session.message ? (
                <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)] p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Message</p>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">{session.message}</p>
                </div>
              ) : null}

              {canReview ? (
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
              ) : null}
            </div>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
}

function SessionCard({ session, currentUserId, pendingAction, onAction, onOpenDetail, reviewed }) {
  const isSender = session?.sender?.id === currentUserId;
  const partner = isSender ? session?.receiver : session?.sender;
  const directionLabel = isSender ? 'Outgoing Request' : 'Incoming Request';
  const detail = formatDateTime(session.proposed_time);
  const isBusy = pendingAction === session.id;
  const canAccept = session.status === 'pending' && !isSender;
  const canDecline = session.status === 'pending' && !isSender;
  const canCancel = ['pending', 'confirmed'].includes(session.status);
  const canComplete = session.status === 'confirmed';
  const canReview = session.status === 'completed' && !reviewed;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-premium flex flex-col border-l-4 border-l-[var(--accent-primary)] p-4 sm:p-5 hover:translate-y-[-2px] hover:shadow-md transition-all duration-300"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar firstName={partner?.name?.split(' ')[0]} lastName={partner?.name?.split(' ')[1]} src={partner?.photo} className="!h-10 !w-10 !rounded-lg shrink-0" />
          <div className="min-w-0">
            <h3 className="truncate text-base font-bold text-[var(--text-primary)]">{partner?.name || 'Unknown user'}</h3>
            <p className="truncate text-xs text-[var(--text-secondary)]">{partner?.headline || partner?.email || 'Skill partner'}</p>
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

      {session.message ? (
        <p className="mb-4 text-xs leading-relaxed text-[var(--text-secondary)] line-clamp-2 min-h-[2.5rem] overflow-hidden text-ellipsis">
          {session.message}
        </p>
      ) : (
        <div className="mb-4 min-h-[2.5rem] flex items-center">
          <p className="text-xs italic text-[var(--text-muted)]">No details provided.</p>
        </div>
      )}

      <div className="mt-auto flex gap-2 border-t border-[var(--border-default)] pt-3">
        <button onClick={() => onOpenDetail(session.id)} className="btn-ghost flex-1 !py-1.5 text-xs font-bold rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-card)]">
          Details
        </button>
        {canAccept ? (
          <button onClick={() => onAction('accept', session)} disabled={isBusy} className="btn-primary flex-1 flex items-center justify-center gap-1 !py-1.5 text-xs font-bold rounded-lg disabled:opacity-60">
            <HiCheck size={14} /> Accept
          </button>
        ) : null}
        {canDecline ? (
          <button onClick={() => onAction('decline', session)} disabled={isBusy} className="btn-ghost flex-1 flex items-center justify-center gap-1 !py-1.5 text-xs font-bold rounded-lg text-[var(--accent-secondary)] border border-[var(--border-default)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-card)] disabled:opacity-60">
            <HiX size={14} /> Decline
          </button>
        ) : null}
        {canCancel ? (
          <button onClick={() => onAction('cancel', session)} disabled={isBusy} className="btn-ghost flex-1 flex items-center justify-center gap-1 !py-1.5 text-xs font-bold rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-card)] disabled:opacity-60">
            <HiX size={14} /> Cancel
          </button>
        ) : null}
        {canComplete ? (
          <button onClick={() => onAction('complete', session)} disabled={isBusy} className="btn-primary flex-1 flex items-center justify-center gap-1 !py-1.5 text-xs font-bold rounded-lg disabled:opacity-60">
            <HiCheck size={14} /> Complete
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
  const { user, updateUser } = useAuth();
  const [filter, setFilter] = useState('all');
  const [sessions, setSessions] = useState([]);
  const [credits, setCredits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingAction, setPendingAction] = useState('');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [detailSessionId, setDetailSessionId] = useState('');
  const [reviewedSessions, setReviewedSessions] = useState(() => new Set());

  const fetchSessions = useCallback(async (selectedFilter = filter) => {
    try {
      const [sessionsRes, creditsRes] = await Promise.all([
        getMySessions(selectedFilter),
        getCreditHistory(),
      ]);
      setSessions(asArray(unwrap(sessionsRes)));
      setCredits(asArray(unwrap(creditsRes)));
    } catch (error) {
      toast.error(formatApiError(error, 'Failed to load sessions'));
    } finally {
      setLoading(false);
    }
  }, [filter]);

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

    const optimisticStatuses = {
      accept: 'confirmed',
      decline: 'cancelled',
      cancel: 'cancelled',
      complete: 'completed',
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
        setLoading(true);
        await fetchSessions(filter);
        if (user?.profile) {
          updateUser?.({
            profile: {
              ...user.profile,
              credits: (user.profile.credits ?? 0) + 2,
              total_sessions: (user.profile.total_sessions ?? 0) + 1,
            },
          });
        }
      }

      toast.success(`${action.charAt(0).toUpperCase()}${action.slice(1)} successful`);
    } catch (error) {
      applySessionUpdate(session.id, () => previousSession);
      toast.error(formatApiError(error, `Failed to ${action} session`));
    } finally {
      setPendingAction('');
    }
  };

  return (
    <AppLayout>
      <div className="w-full max-w-6xl space-y-4">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
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

          <div className="card-premium p-4 flex flex-col justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Credits</p>
              <div className="mt-1 flex items-baseline gap-2">
                <p className="text-2xl font-black text-[var(--accent-primary)]">{user?.profile?.credits ?? 0}</p>
                <span className="text-[10px] font-semibold text-[var(--text-muted)]">credits available</span>
              </div>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">Total earned: {creditsEarned}</p>
            </div>
            <div className="mt-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] p-2 text-[11px] text-[var(--text-secondary)] leading-relaxed">
              Earned from completed sessions.
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="card-premium h-[240px] animate-pulse bg-[var(--bg-card)] border-l-4 border-l-[var(--border-default)]" />
            ))}
          </div>
        ) : sessions.length ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
          onReviewSubmitted={(sessionId) => {
            setReviewedSessions((prev) => new Set(prev).add(sessionId));
            fetchSessions(filter);
          }}
        />
      ) : null}
    </AppLayout>
  );
}
