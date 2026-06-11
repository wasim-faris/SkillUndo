const fs = require('fs');
const path = '/home/wasim/skillswap/frontend/src/pages/Auth.jsx';
let content = fs.readFileSync(path, 'utf8');

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

if (!content.includes('const validators = {')) {
  content = content.replace('const EMAIL_RE = /^[^\s@]+@[^\s@]+\\.[^\s@]+$/;\n', 'const EMAIL_RE = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;\n' + validatorsStr);
}

const oldHandleChange = `  const handleChange = (field) => (e) => {
    const value = e.target.value;
    clearAll();

    setFormState(prev => ({
      ...prev,
      values: { ...prev.values, [field]: value }
    }));

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {`;

const newHandleChange = `  const handleChange = useCallback((field) => (e) => {
    const value = e.target.value;
    clearAll();

    setFormState(prev => ({
      ...prev,
      values: { ...prev.values, [field]: value }
    }));

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {`;

content = content.replace(oldHandleChange, newHandleChange);
content = content.replace('      });\n    }, 300);\n  };\n', '      });\n    }, 300);\n  }, [clearAll, validateField]);\n');

fs.writeFileSync(path, content);
console.log('fixed');
