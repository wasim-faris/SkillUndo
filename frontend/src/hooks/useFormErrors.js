import { useState, useCallback } from 'react';

/**
 * Parses backend error shapes and distributes to field vs general errors.
 * Maps raw backend strings to professional user-facing messages.
 *
 * Backend shapes:
 *   Field errors:   { message: { email: ["..."], password: ["..."] } }
 *   General string: { message: "Invalid email or password" }
 *   Rate limit:     HTTP 429
 */

// Maps raw backend strings → professional copy
const FIELD_MESSAGE_MAP = {
  // Email-related
  'no active account found with the given credentials': null, // handled in Auth
  'user with this email already exists':               'An account with this email already exists.',
  'enter a valid email address':                       'Please enter a valid email address.',
  'this field may not be blank':                       'This field is required.',
  'this field is required':                            'This field is required.',
  'ensure this field has no more than':                'This value is too long.',
};

const GENERAL_MESSAGE_MAP = {
  'no active account found with the given credentials': null, // handled specially
  'invalid email or password':                          null, // handled specially
  'email or password is incorrect':                     null, // handled specially
  'given token not valid for any token type':           'Your session has expired. Please sign in again.',
  'token is invalid or expired':                        'Your session has expired. Please sign in again.',
};

function humanize(raw) {
  if (!raw) return '';
  const lower = raw.toLowerCase();
  for (const [key, val] of Object.entries(FIELD_MESSAGE_MAP)) {
    if (lower.includes(key)) return val ?? raw;
  }
  // Capitalize first letter as fallback
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export function useFormErrors() {
  const [fieldErrors, setFieldErrors]   = useState({});
  const [generalError, setGeneralError] = useState('');

  /**
   * Returns { type: 'email' | 'password' | 'general' | 'network', message }
   * so Auth.jsx can decide what to highlight / focus.
   */
  const setApiErrors = useCallback((error) => {
    setFieldErrors({});
    setGeneralError('');

    // Network / no response
    if (!error?.response) {
      setGeneralError('__network__');
      return { type: 'network' };
    }

    const status  = error.response.status;
    const data    = error.response.data;
    const message = data?.message ?? data?.detail ?? null;

    // Rate limit
    if (status === 429) {
      const msg = 'Too many attempts. Please wait a minute and try again.';
      setGeneralError(msg);
      return { type: 'general', message: msg };
    }

    // No message at all
    if (!message) {
      const msg = 'Something went wrong. Please try again.';
      setGeneralError(msg);
      return { type: 'general', message: msg };
    }

    // Field-level object: { email: [...], password: [...] }
    if (typeof message === 'object' && !Array.isArray(message)) {
      const parsed = {};
      let detectedType = 'field';
      Object.entries(message).forEach(([field, msgs]) => {
        const raw = Array.isArray(msgs) ? msgs[0] : String(msgs);
        parsed[field] = humanize(raw);
        detectedType = field; // last key wins for focus hint
      });
      setFieldErrors(parsed);
      return { type: detectedType, fieldErrors: parsed };
    }

    // General string — check for known credential error patterns
    const lower = String(message).toLowerCase();
    const isCredentialError =
      lower.includes('no active account') ||
      lower.includes('invalid email or password') ||
      lower.includes('email or password is incorrect') ||
      lower.includes('incorrect password') ||
      lower.includes('wrong password');

    if (isCredentialError) {
      // Return raw type so Auth.jsx can show targeted field errors
      return { type: 'credentials', raw: message };
    }

    const friendly = humanize(String(message));
    setGeneralError(friendly);
    return { type: 'general', message: friendly };
  }, []);

  const setFieldError = useCallback((name, message) => {
    setFieldErrors((prev) => ({ ...prev, [name]: message }));
  }, []);

  const fieldError = useCallback(
    (name) => fieldErrors[name] || '',
    [fieldErrors]
  );

  const clearFieldError = useCallback((name) => {
    setFieldErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setFieldErrors({});
    setGeneralError('');
  }, []);

  return {
    fieldError,
    generalError,
    setApiErrors,
    setFieldError,
    clearFieldError,
    clearAll,
    setGeneralError,
    fieldErrors,
  };
}
