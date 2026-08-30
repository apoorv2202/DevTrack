const fs = require("fs");
let c = fs.readFileSync("components/devtrack/DevTrackApp.tsx", "utf8");
c = c.replace(/function Avatar\(\{ user, size = 28, onUpload \}: any\) \{/, 'function Avatar({ user, size = 28, onUpload, isMe }: any) {\n  const fileInputRef = useRef<HTMLInputElement>(null);');
c = c.replace(/title=\{isMe \? "Change profile photo" : user\?\.name\}/, 'onClick={() => isMe && fileInputRef.current?.click()}\n      title={isMe ? "Change profile photo" : user?.name}');
fs.writeFileSync("components/devtrack/DevTrackApp.tsx", c);
console.log("Fixed Avatar");
