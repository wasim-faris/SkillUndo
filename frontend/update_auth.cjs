const fs = require('fs');

const path = '/home/wasim/skillswap/frontend/src/pages/Auth.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Move validators outside
const validatorsStr = `
const validators = {
  name: (v, isLogin) => (!isLogin && !v.trim() ? 'Full name is required.' : ''),
  email: (v) => {
    if (!v.trim()) return 'Email address is required.';
    if (!EMAIL_RE.test(v)) return 'Please enter a valid email address.';
    return '';
  },
  password: (v) => {
    if (!v) return 'Password is required.';
    if (v.length < 8) return 'Password must be at least 8 characters.';
    return '';
  },
  confirmPassword: (v, isLogin, formPass) =>
    !isLogin && v !== formPass ? 'Passwords do not match.' : '',
};
`;

content = content.replace('/* ─── email regex (RFC-5322 lite) ─────────────────────────────── */\nconst EMAIL_RE = /^[^\s@]+@[^\s@]+\\.[^\s@]+$/;\n', '/* ─── email regex (RFC-5322 lite) ─────────────────────────────── */\nconst EMAIL_RE = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;\n' + validatorsStr);

// 2. Remove old validators inside
content = content.replace(/\/\* ── Real-time per-field validators ─────────────────────────── \*\/(.|\n)*?};/, '');

// 3. Replace state
const oldState = `  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    city: '', language: '', bio: '', photo: null,
  });

  /* touched tracks which fields the user has interacted with */
  const [touched, setTouched] = useState({});
  const [clientErrors, setClientErrors] = useState({});
  const [showOptional, setShowOptional] = useState(false);`;

const newState = `  const [formState, setFormState] = useState({
    values: {
      name: '', email: '', password: '', confirmPassword: '',
      city: '', language: '', bio: '', photo: null,
    },
    touched: {},
    clientErrors: {}
  });
  const { values: form, touched, clientErrors } = formState;
  const [showOptional, setShowOptional] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);`;

content = content.replace(oldState, newState);

// 4. Update mode switch effect
const oldModeSwitch = `  /* reset everything on mode switch */
  useEffect(() => {
    setClientErrors({});
    setTouched({});
    clearAll();
  }, [mode]);                        // eslint-disable-line react-hooks/exhaustive-deps`;

const newModeSwitch = `  /* reset everything on mode switch */
  useEffect(() => {
    setFormState(prev => ({ ...prev, touched: {}, clientErrors: {} }));
    clearAll();
  }, [mode]);                        // eslint-disable-line react-hooks/exhaustive-deps`;

content = content.replace(oldModeSwitch, newModeSwitch);

// 5. Replace validateField, handleChange, handleBlur, handleFileChange, validateAll
const oldHandlersRegex = /  \/\* run a single field validator and push result into clientErrors \*\/((.|\n)*?)  \/\* ── Submit ──────────────────────────────────────────────────── \*\//;

const newHandlers = `  const validateField = useCallback((field, value, currentState) => {
    const fn = validators[field];
    return fn ? fn(value, isLogin, currentState.values.password) : '';
  }, [isLogin]);

  /* ── Handlers ────────────────────────────────────────────────── */
  const handleChange = (field) => (e) => {
    const value = e.target.value;
    clearAll();

    setFormState(prev => ({
      ...prev,
      values: { ...prev.values, [field]: value }
    }));

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setFormState(prev => {
        if (!prev.touched[field]) return prev;
        const msg = validateField(field, prev.values[field], prev);
        if (prev.clientErrors[field] === msg) return prev;
        
        const nextErrors = { ...prev.clientErrors };
        if (msg) nextErrors[field] = msg;
        else delete nextErrors[field];
        
        return { ...prev, clientErrors: nextErrors };
      });
    }, 300);
  };

  const handleBlur = (field) => () => {
    setFormState(prev => {
      const msg = validateField(field, prev.values[field], prev);
      const nextErrors = { ...prev.clientErrors };
      if (msg) nextErrors[field] = msg;
      else delete nextErrors[field];
      
      return {
        ...prev,
        touched: { ...prev.touched, [field]: true },
        clientErrors: nextErrors
      };
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setFormState(prev => ({
        ...prev,
        values: { ...prev.values, photo: file }
      }));
    }
  };

  /* ── Full-form validate on submit ────────────────────────────── */
  const validateAll = () => {
    const fields = isLogin
      ? ['email', 'password']
      : ['name', 'email', 'password', 'confirmPassword'];

    const errs = {};
    const nextTouched = {};
    fields.forEach((f) => {
      const msg = validators[f]?.(form[f] ?? '', isLogin, form.password);
      if (msg) errs[f] = msg;
      nextTouched[f] = true;
    });

    setFormState(prev => ({
      ...prev,
      touched: { ...prev.touched, ...nextTouched },
      clientErrors: errs
    }));
    return errs;
  };

  /* ── Submit ──────────────────────────────────────────────────── */`;

content = content.replace(oldHandlersRegex, newHandlers);

// 6. Fix setTouched usage in handleSubmit network error section
content = content.replace(`        setTouched((prev) => ({ ...prev, email: true, password: true }));`, `        setFormState(prev => ({ ...prev, touched: { ...prev.touched, email: true, password: true } }));`);

fs.writeFileSync(path, content);
console.log('updated');
