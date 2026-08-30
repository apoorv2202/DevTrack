const fs = require('fs');
let content = fs.readFileSync('components/devtrack/DevTrackApp.tsx', 'utf8');
content = content.replace(/status: \(\(byId\(meId\) as any\)\?\.role\?\.toLowerCase\(\) !== 'owner' && \(byId\(meId\) as any\)\?\.role\?\.toLowerCase\(\) !== 'admin'\) \? "PENDING" : "OPEN"/, 'status: ((byId(meId) as any)?.role?.toLowerCase() !== \\'owner\\' && (byId(meId) as any)?.role?.toLowerCase() !== \\'admin\\') ? "in_review" : "open"');
fs.writeFileSync('components/devtrack/DevTrackApp.tsx', content);
console.log("Fixed status in CreateIssue");
