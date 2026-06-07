export function unwrapApiData(response) {
  return response?.data?.data ?? response?.data ?? response ?? null;
}

export function asArray(value) {
  return Array.isArray(value) ? value : [];
}

export function formatDateTime(value) {
  if (!value) return 'Unavailable';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unavailable';

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function formatDateOnly(value) {
  if (!value) return 'Unavailable';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unavailable';

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
  }).format(date);
}

export function formatAdminError(error, fallback = 'Something went wrong. Please try again.') {
  const message = error?.response?.data?.message;

  if (typeof message === 'string' && message.trim()) return message;

  if (Array.isArray(message)) {
    return message.filter(Boolean).join(', ') || fallback;
  }

  if (message && typeof message === 'object') {
    const firstValue = Object.values(message)[0];
    if (Array.isArray(firstValue)) return firstValue[0] || fallback;
    if (typeof firstValue === 'string') return firstValue;
  }

  return fallback;
}

export function isForbidden(error) {
  return error?.response?.status === 403;
}

export function safeText(value, fallback = 'Unavailable') {
  if (value === null || value === undefined) return fallback;
  const text = String(value).trim();
  return text || fallback;
}

export function getStatusTone(status = '') {
  const normalized = String(status).toLowerCase();

  if (['completed', 'resolved', 'approved', 'active'].includes(normalized)) return 'success';
  if (['pending', 'queued', 'draft'].includes(normalized)) return 'warning';
  if (['cancelled', 'declined', 'rejected', 'failed'].includes(normalized)) return 'danger';
  return 'neutral';
}

export function getLandingPath(user) {
  return user?.is_staff ? '/dashboard' : '/matches';
}

