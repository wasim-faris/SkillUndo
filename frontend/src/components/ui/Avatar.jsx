import { useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/u, '') || 'http://127.0.0.1:8000';
const PROFILE_MEDIA_VERSION_KEY = 'skillswap_profile_media_version';

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
  // Already an absolute URL — return as-is
  if (/^https?:\/\//i.test(normalizedUrl)) return normalizedUrl;
  // Relative media paths must point to the Django backend, not the Vite dev server.
  // Without this, historyApiFallback intercepts them and returns index.html.
  return `${API_BASE_URL}${normalizedUrl}`;
};

const withCacheBust = (url) => {
  if (!url) return null;
  const version = localStorage.getItem(PROFILE_MEDIA_VERSION_KEY);
  if (!version) return url;
  return `${url}${url.includes('?') ? '&' : '?'}v=${version}`;
};

export default function Avatar({
  firstName = '',
  lastName = '',
  src,
  size = 'md',
  className = '',
  theme = 'default',
}) {
  const imageSrc = withCacheBust(getAssetUrl(src));
  const [failedImageSrc, setFailedImageSrc] = useState(null);
  const imageFailed = imageSrc && failedImageSrc === imageSrc;
  const initials = [firstName?.charAt(0), lastName?.charAt(0)]
    .filter(Boolean)
    .join('')
    .toUpperCase() || '?';

  const themes = {
    default: {
      border: 'border-[var(--border-default)]',
      surface: 'bg-[var(--bg-secondary)]',
      text: 'text-[var(--text-primary)]',
    },
    admin: {
      border: 'border-[var(--admin-border)]',
      surface: 'bg-[var(--admin-surface)]',
      text: 'text-[var(--admin-text)]',
    },
  };

  const selectedTheme = themes[theme] || themes.default;

  const sizes = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-[11px]',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-24 h-24 text-2xl',
  };

  const selectedSize = sizes[size] || sizes.md;

  if (imageSrc && !imageFailed) {
    return (
      <img
        src={imageSrc}
        alt={`${firstName} ${lastName}`}
        onError={() => {
          console.warn('[Avatar] Failed to load avatar image:', imageSrc);
          setFailedImageSrc(imageSrc);
        }}
        className={`
          rounded-full object-cover shrink-0 border ${selectedTheme.border}
          ${selectedSize}
          ${className}
        `}
      />

    );
  }

  return (
    <div
      className={`
        inline-flex items-center justify-center rounded-full font-bold select-none shrink-0 
        ${selectedTheme.surface} ${selectedTheme.border} ${selectedTheme.text} transition-all duration-200
        ${selectedSize}
        ${className}
      `}
    >
      {initials}
    </div>

  );
}
