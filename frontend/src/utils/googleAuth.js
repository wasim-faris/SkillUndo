const rawGoogleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export const googleClientId =
  typeof rawGoogleClientId === 'string' ? rawGoogleClientId.trim() : '';

export const hasGoogleClientId =
  googleClientId.length > 0 &&
  googleClientId.toLowerCase() !== 'undefined' &&
  googleClientId.toLowerCase() !== 'null';
