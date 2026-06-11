const fs = require('fs');
const path = '/home/wasim/skillswap/frontend/src/pages/Profile.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Import memo
content = content.replace("import { useCallback, useEffect, useMemo, useRef, useState } from 'react';", "import { useCallback, useEffect, useMemo, useRef, useState, memo } from 'react';");

// 2. Wrap components in memo
content = content.replace(/function Card\(\{ children, className = '' \}\) \{/g, "const Card = memo(function Card({ children, className = '' }) {");
content = content.replace(/function CardHeader\(\{ icon, title, action \}\) \{/g, "const CardHeader = memo(function CardHeader({ icon, title, action }) {");
content = content.replace(/function AddBtn\(\{ onClick \}\) \{/g, "const AddBtn = memo(function AddBtn({ onClick }) {");
content = content.replace(/function EditBtn\(\{ onClick \}\) \{/g, "const EditBtn = memo(function EditBtn({ onClick }) {");
content = content.replace(/function Dots\(\{ max = 5, filled = 3 \}\) \{/g, "const Dots = memo(function Dots({ max = 5, filled = 3 }) {");
content = content.replace(/function Stars\(\{ count = 5 \}\) \{/g, "const Stars = memo(function Stars({ count = 5 }) {");
content = content.replace(/function StatusBadge\(\{ status \}\) \{/g, "const StatusBadge = memo(function StatusBadge({ status }) {");

// Close the memo parentheses at the end of each component block
// Card
content = content.replace(/    <\/div>\n  \);\n}\n\n/g, function(match, offset, str) {
  if (str.substring(offset - 100, offset).includes('children}')) {
    return "    </div>\n  );\n});\n\n";
  }
  return match;
});

// Fix CardHeader, AddBtn, EditBtn, Dots, Stars, StatusBadge endings
content = content.replace(/    <\/div>\n  \);\n}\n\nfunction AddBtn/g, "    </div>\n  );\n});\n\nconst AddBtn");
content = content.replace(/    <\/button>\n  \);\n}\n\nfunction EditBtn/g, "    </button>\n  );\n});\n\nconst EditBtn");
content = content.replace(/    <\/button>\n  \);\n}\n\nfunction Dots/g, "    </button>\n  );\n});\n\nconst Dots");
content = content.replace(/    <\/div>\n  \);\n}\n\nfunction Stars/g, "    </div>\n  );\n});\n\nconst Stars");
content = content.replace(/  <\/span>;\n}\n\nfunction StatusBadge/g, "  </span>;\n});\n\nconst StatusBadge");
content = content.replace(/    <\/span>\n  \);\n}\n\nfunction SkillLoadingState/g, "    </span>\n  );\n});\n\nfunction SkillLoadingState");

// ProfileSkillsSection - if it exists
if (content.includes("function ProfileSkillsSection")) {
  content = content.replace(/function ProfileSkillsSection\(/g, "const ProfileSkillsSection = memo(function ProfileSkillsSection(");
  content = content.replace(/    <\/div>\n  \);\n}\n\n\/\* ─── MODALS ─── \*\//g, "    </div>\n  );\n});\n\n/* ─── MODALS ─── */");
  // Try another ending pattern just in case
  content = content.replace(/    <\/div>\n  \);\n}\n\nfunction EditProfileModal/g, "    </div>\n  );\n});\n\nfunction EditProfileModal");
}

// 3. Remove getProfile redundancy
const oldFetch = `      const requests = includeRelated
        ? [getProfile(), getUserSkills(), getMatches()]
        : [getProfile()];

      const [profileRes, skillsRes, matchesRes] = await Promise.allSettled(requests);
      if (latestFetchRef.current !== fetchId) return null;

      if (profileRes?.status === 'fulfilled') {
        const profileData = unwrap(profileRes.value);
        applyProfile(profileData, undefined, true);
      }

      if (includeRelated && skillsRes?.status === 'fulfilled') {
        setUserSkills(asArray(unwrap(skillsRes.value)));
      }

      if (includeRelated && matchesRes?.status === 'fulfilled') {
        setMatches(asArray(unwrap(matchesRes.value)));
      }

      return profileRes?.status === 'fulfilled' ? unwrap(profileRes.value) : null;`;

const newFetch = `      if (includeRelated) {
        const [skillsRes, matchesRes] = await Promise.allSettled([getUserSkills(), getMatches()]);
        if (latestFetchRef.current !== fetchId) return null;
        if (skillsRes?.status === 'fulfilled') setUserSkills(asArray(unwrap(skillsRes.value)));
        if (matchesRes?.status === 'fulfilled') setMatches(asArray(unwrap(matchesRes.value)));
      }
      
      return user;`;

content = content.replace(oldFetch, newFetch);


// 4. Modals Open/Close State extraction
// Create a small event bus for EditProfile
const editBus = `
const editProfileState = {
  listeners: [],
  open: false,
  subscribe(fn) { this.listeners.push(fn); return () => this.listeners = this.listeners.filter(l => l !== fn); },
  set(val) { this.open = val; this.listeners.forEach(fn => fn(val)); }
};
const openEditProfile = () => editProfileState.set(true);

function EditProfileModalRenderer({ profile, photoUrl, bannerUrl, onSave }) {
  const [open, setOpen] = useState(editProfileState.open);
  useEffect(() => editProfileState.subscribe(setOpen), []);
  if (!open) return null;
  return (
    <EditProfileModal
      profile={profile}
      photoUrl={photoUrl}
      bannerUrl={bannerUrl}
      onClose={() => editProfileState.set(false)}
      onSave={(data) => {
        onSave(data);
      }}
    />
  );
}
`;

content = content.replace("/* ─── MAIN PAGE ─── */", editBus + "\n/* ─── MAIN PAGE ─── */");

// Replace setShowEditProfile with openEditProfile
content = content.replace(/setShowEditProfile\(true\)/g, "openEditProfile()");
// Remove showEditProfile from Profile
content = content.replace(/  const \[showEditProfile, setShowEditProfile\] = useState\(false\);\n/g, "");

// Replace the EditProfileModal inside Profile with the Renderer
const oldModalCall = `      {isOwnProfile && showEditProfile && (
        <EditProfileModal
          profile={profileData}
          photoUrl={photoUrl}
          bannerUrl={bannerUrl}
          onClose={() => setShowEditProfile(false)}
          onSave={handleProfileSave}
        />
      )}`;
const newModalCall = `      {isOwnProfile && (
        <EditProfileModalRenderer
          profile={profileData}
          photoUrl={photoUrl}
          bannerUrl={bannerUrl}
          onSave={handleProfileSave}
        />
      )}`;
content = content.replace(oldModalCall, newModalCall);

// Extract ReportUserModal logic into ProfileActionsMenu
// ProfileActionsMenu is used as: <ProfileActionsMenu onReport={() => setShowReportModal(true)} />
// Let's modify ProfileActionsMenu to handle it directly
const oldMenu = `function ProfileActionsMenu({ onReport }) {`;
const newMenu = `function ProfileActionsMenu({ userId, displayName }) {
  const [showReport, setShowReport] = useState(false);`;

content = content.replace(oldMenu, newMenu);
content = content.replace(/onReport\(\);/g, "setShowReport(true);");

const menuReturnOld = `    </div>
  );
}`;
const menuReturnNew = `    </div>
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
}`;

content = content.replace(/    <\/div>\n  \);\n}\n\n\/\* ─── MAIN PAGE ─── \*\//g, menuReturnNew + "\n\n/* ─── MAIN PAGE ─── */");
content = content.replace(/<div style={{ position: 'relative' }}>/g, "<>\n    <div style={{ position: 'relative' }}>");

// Update ProfileActionsMenu usage
content = content.replace(/<ProfileActionsMenu onReport=\{[^}]+\} \/>/g, "<ProfileActionsMenu userId={userId} displayName={displayName} />");

// Remove showReportModal from Profile
content = content.replace(/  const \[showReportModal, setShowReportModal\] = useState\(false\);\n/g, "");
const oldReportCall = `      <AnimatePresence>
        {!isOwnProfile && showReportModal && (
          <ReportUserModal
            userId={userId}
            displayName={displayName}
            onClose={() => setShowReportModal(false)}
          />
        )}
      </AnimatePresence>`;
content = content.replace(oldReportCall, "");

fs.writeFileSync(path, content);
console.log('Profile fixed');
