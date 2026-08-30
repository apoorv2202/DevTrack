const fs = require('fs');
let content = fs.readFileSync('components/devtrack/DevTrackApp.tsx', 'utf8');

// Update RegisterPage fields
content = content.replace(/<Field label="Full Name">[\s\S]*?<\/Field>\s*<div className="grid grid-cols-2 gap-4">[\s\S]*?<\/div>\s*<Field label="Organization Email">/, '<Field label="Organization Email">');
content = content.replace(/<Field label="Employee ID">[\s\S]*?<\/Field>/, '');
content = content.replace(/const res = await register\(email, password, fullName, org, empId, role\);/, 'const res = await register(email, password);');
content = content.replace(/<div className="mb-4 text-left p-4 rounded-lg bg-black\/20 border border-white\/5">[\s\S]*?<\/div>\s*<Button type="submit"/, '<Button type="submit"');

fs.writeFileSync('components/devtrack/DevTrackApp.tsx', content);
console.log("Updated RegisterPage UI");
