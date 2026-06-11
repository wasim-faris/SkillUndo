const fs = require('fs');
const path = '/home/wasim/skillswap/frontend/src/pages/Auth.jsx';
let content = fs.readFileSync(path, 'utf8');

const oldUseEffect = `  /* reset everything on mode switch */
  useEffect(() => {
    setFormState(prev => ({ ...prev, touched: {}, clientErrors: {} }));
    clearAll();
  }, [mode]);                        // eslint-disable-line react-hooks/exhaustive-deps`;

content = content.replace(oldUseEffect, '');

const oldOnClick = `onClick={() => { setMode(t); setShowOptional(false); }}`;
const newOnClick = `onClick={() => {
                        setMode(t);
                        setShowOptional(false);
                        setFormState(prev => ({ ...prev, touched: {}, clientErrors: {} }));
                        clearAll();
                      }}`;

content = content.replace(oldOnClick, newOnClick);
content = content.replace(oldOnClick, newOnClick); // replace both occurrences just in case, though there's only one

fs.writeFileSync(path, content);
console.log('fixed mode switch');
