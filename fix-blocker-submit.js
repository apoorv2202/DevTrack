const fs = require('fs');
let content = fs.readFileSync('components/devtrack/DevTrackApp.tsx', 'utf8');

const newSubmit = `
      // Update profile
      await supabase.from("profiles").update({ full_name: fullName }).eq("id", user.id);
      
      // Update user metadata so DB triggers can sync it
      await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          organization: org,
          employee_id: empId,
          role: role
        }
      });
      
      // Upload ID
`;
content = content.replace(/\/\/ Update profile[\s\S]*?\/\/ Upload ID/, newSubmit);
fs.writeFileSync('components/devtrack/DevTrackApp.tsx', content);
console.log("Updated blocker to use updateUser");
