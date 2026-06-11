const fs = require('fs');
const path = '/home/wasim/skillswap/frontend/src/pages/Profile.jsx';
let content = fs.readFileSync(path, 'utf8');

// remove unused imports
content = content.replace(/HiUserAdd, /g, "");
content = content.replace(/getProfile, /g, "");

// remove unused definitions
content = content.replace(/const normalizeExperience[\s\S]*?\n\}\);\n/g, ""); // wait, it's a const function
content = content.replace(/const normalizeExperience = \(item\) => \(\{[\s\S]*?\}\);\n/g, "");
content = content.replace(/const normalizeEducation = \(item\) => \(\{[\s\S]*?\}\);\n/g, "");
content = content.replace(/const AddBtn = memo\(function AddBtn\(\{ onClick \}\) \{[\s\S]*?\}\);\n\n/g, "");
content = content.replace(/const Stars = memo\(function Stars\(\{ count = 5 \}\) \{[\s\S]*?\}\);\n\n/g, "");
content = content.replace(/const StatusBadge = memo\(function StatusBadge\(\{ status \}\) \{[\s\S]*?\}\);\n\n/g, "");
content = content.replace(/function SectionEmptyState\(\{ message \}\) \{[\s\S]*?\}\n\n/g, "");

// line 952 useCallback user dependency
content = content.replace(/\}, \[applyProfile, isOwnProfile, userId\]\);/g, "}, [applyProfile, isOwnProfile, userId, user]);");

fs.writeFileSync(path, content);
console.log('Fixed lint 2');
