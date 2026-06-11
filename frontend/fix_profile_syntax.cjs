const fs = require('fs');
const path = '/home/wasim/skillswap/frontend/src/pages/Profile.jsx';
let content = fs.readFileSync(path, 'utf8');

// The endings were not matched properly because of \n vs \r\n or something.
content = content.replace(/    <\/div>\n  \);\n}\n\nconst AddBtn/g, "    </div>\n  );\n});\n\nconst AddBtn");
content = content.replace(/    <\/button>\n  \);\n}\n\nconst EditBtn/g, "    </button>\n  );\n});\n\nconst EditBtn");
content = content.replace(/    <\/button>\n  \);\n}\n\nconst Dots/g, "    </button>\n  );\n});\n\nconst Dots");
content = content.replace(/    <\/div>\n  \);\n}\n\nconst Stars/g, "    </div>\n  );\n});\n\nconst Stars");
content = content.replace(/  <\/span>;\n}\n\nconst StatusBadge/g, "  </span>;\n});\n\nconst StatusBadge");

// Use a more robust replace for the components missing closing '});'
const fixClosure = (componentStartStr) => {
  const parts = content.split(componentStartStr);
  if (parts.length > 1) {
    // replace the immediately preceding "}\n\n" with "});\n\n"
    const lastPart = parts[0];
    const match = lastPart.match(/  \);\n}\n\n$/);
    if (match) {
      parts[0] = lastPart.substring(0, lastPart.length - 5) + "});\n\n";
    } else {
      const match2 = lastPart.match(/};\n}\n\n$/);
      if (match2) {
        parts[0] = lastPart.substring(0, lastPart.length - 5) + "});\n\n";
      } else {
         const match3 = lastPart.match(/  <\/span>;\n}\n\n$/);
         if (match3) {
            parts[0] = lastPart.substring(0, lastPart.length - 4) + "});\n\n";
         }
      }
    }
    content = parts.join(componentStartStr);
  }
};

fixClosure("const AddBtn = memo(");
fixClosure("const EditBtn = memo(");
fixClosure("const Dots = memo(");
fixClosure("const Stars = memo(");
fixClosure("const StatusBadge = memo(");
fixClosure("function SkillLoadingState(");

// Check if SkillLoadingState needs fix
const parts = content.split("const ProfileSkillsSection = memo(");
if (parts.length > 1) {
    const lastPart = parts[0];
    const match = lastPart.match(/  \);\n}\n\n$/);
    if (match) {
        parts[0] = lastPart.substring(0, lastPart.length - 5) + "});\n\n";
        content = parts.join("const ProfileSkillsSection = memo(");
    }
}

fs.writeFileSync(path, content);
console.log('fixed closures');
