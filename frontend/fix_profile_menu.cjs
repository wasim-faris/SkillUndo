const fs = require('fs');
const path = '/home/wasim/skillswap/frontend/src/pages/Profile.jsx';
let content = fs.readFileSync(path, 'utf8');

// Extract ProfileActionsMenu exactly
const startIdx = content.indexOf('/* ─── ACTIONS MENU ─── */');
const endIdx = content.indexOf('const editProfileState = {');

if (startIdx > -1 && endIdx > -1) {
  const newMenu = `/* ─── ACTIONS MENU ─── */
function ProfileActionsMenu({ userId, displayName }) {
  const [showReport, setShowReport] = useState(false);
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0, btnHeight: 42 });
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  const updatePos = useCallback(() => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setMenuPos({
      top: rect.top,
      right: window.innerWidth - rect.right,
      btnHeight: rect.height,
    });
  }, []);

  const handleToggle = () => {
    updatePos();
    setOpen((v) => !v);
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (btnRef.current && btnRef.current.contains(e.target)) return;
      if (menuRef.current && menuRef.current.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    const onRepos = () => updatePos();
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onRepos, true);
    window.addEventListener('resize', onRepos);
    return () => {
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onRepos, true);
      window.removeEventListener('resize', onRepos);
    };
  }, [open, updatePos]);

  const MENU_HEIGHT = 48;
  const MENU_WIDTH = 192;
  const GAP = 8;
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 0;
  const placeAbove = viewportHeight ? menuPos.top > MENU_HEIGHT + GAP + 12 : true;

  const dropdownStyle = {
    position: 'fixed',
    top: placeAbove
      ? Math.max(12, menuPos.top - MENU_HEIGHT - GAP)
      : Math.min(viewportHeight - MENU_HEIGHT - 12, menuPos.top + menuPos.btnHeight + GAP),
    right: Math.max(12, menuPos.right),
    width: typeof window !== 'undefined' ? Math.min(MENU_WIDTH, window.innerWidth - 24) : MENU_WIDTH,
    maxHeight: 'calc(100vh - 24px)',
    overflowY: 'auto',
    overflowX: 'hidden',
    zIndex: 9999,
    background: 'var(--bg-card)',
    border: '1px solid var(--border-default)',
    borderRadius: '12px',
    boxShadow: '0 -4px 24px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)',
  };

  return (
    <>
      <div style={{ position: 'relative' }}>
        <button
          ref={btnRef}
          type="button"
          onClick={handleToggle}
          title="More actions"
          className="w-[42px] h-[42px] flex items-center justify-center rounded-[10px] border border-[var(--border-default)] bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)] transition-all"
        >
          <HiDotsVertical size={18} />
        </button>

        {open && createPortal(
          <AnimatePresence>
            <motion.div
              key="report-menu"
              ref={menuRef}
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.96 }}
              transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
              style={dropdownStyle}
            >
              <button
                type="button"
                onClick={() => { setOpen(false); setShowReport(true); }}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-[13px] font-medium text-left"
                style={{ color: 'var(--text-secondary)', background: 'transparent', transition: 'background 0.15s, color 0.15s' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(249,112,102,0.08)'; e.currentTarget.style.color = 'var(--accent-secondary)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >
                <HiFlag size={15} style={{ color: 'var(--accent-secondary)', opacity: 0.85, flexShrink: 0 }} />
                Report User
              </button>
            </motion.div>
          </AnimatePresence>,
          document.body
        )}
      </div>
      <AnimatePresence>
        {showReport && (
          <ReportUserModal
            userId={userId}
            displayName={displayName}
            onClose={() => setShowReport(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

`;
  
  content = content.substring(0, startIdx) + newMenu + content.substring(endIdx);
  fs.writeFileSync(path, content);
  console.log('ProfileActionsMenu replaced');
} else {
  console.log('Could not find start or end index');
}
