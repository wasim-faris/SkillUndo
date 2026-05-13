import { useState, useCallback } from 'react';

/**
 * Parses backend error shapes and distributes to field vs general.
 *
 * Backend error shapes:
 *   Field errors:   { message: { email: ["This field is required."] } }
 *   General errors: { message: "Invalid email or password" }
 *   Rate limit:     HTTP 429
 */
export function useFormErrors() {
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState('');

  const setApiErrors = useCallback((error) => {
    setFieldErrors({});
    setGeneralError('');

    if (!error.response) {
      // Network / unknown — caller handles toast
      return;
    }

    const status = error.response.status;
    const data = error.response.data;

    if (status === 429) {
      setGeneralError('Too many attempts. Please wait a minute and try again.');
      return;
    }

    const message = data?.message || data?.detail;

    if (!message) {
      setGeneralError('Something went wrong. Please try again.');
      return;
    }

    if (typeof message === 'object' && !Array.isArray(message)) {
      // Field-level errors: { field: ["error msg", ...] }
      const parsed = {};
      Object.entries(message).forEach(([field, msgs]) => {
        parsed[field] = Array.isArray(msgs) ? msgs[0] : String(msgs);
      });
      setFieldErrors(parsed);
    } else {
      // General string error
      setGeneralError(String(message));
    }
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

  return { fieldError, generalError, setApiErrors, clearFieldError, clearAll, setGeneralError };
}
