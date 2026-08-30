const fs = require('fs');
let content = fs.readFileSync('components/devtrack/DevTrackApp.tsx', 'utf8');

const newOnboarding = `function VerificationPendingBlocker({ user }: { user: any }) {
  const [file, setFile] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [org, setOrg] = useState("");
  const [role, setRole] = useState("Developer");
  const [empId, setEmpId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!file || !fullName || !org || !empId) {
      setError("Please fill out all fields and attach your ID document.");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      
      // Update profile
      await supabase.from("profiles").update({ full_name: fullName }).eq("id", user.id);
      
      // Upload ID
      const ext = file.name.split('.').pop();
      const path = \`\${user.id}/id-document-\${Date.now()}.\${ext}\`;
      const { error: uploadErr } = await supabase.storage.from("verification_documents").upload(path, file);
      
      if (uploadErr) {
        setError("Document upload failed: " + uploadErr.message);
        setUploading(false);
        return;
      }
      
      // We assume there's a trigger or backend function handling the organization link, or we can insert into verification_requests
      const { error: vrErr } = await supabase.from("verification_requests").insert({
        user_id: user.id,
        organization_name: org,
        requested_role: role,
        employee_id: empId,
        document_path: path
      });
      
      if (vrErr && !vrErr.message.includes("already exists")) {
        console.warn("VR insert warn:", vrErr);
      }
      
      setSuccess(true);
    } catch (e: any) {
      setError(e.message);
    }
    setUploading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-black dt-fade devtrack-root">
      <div className="dt-card p-8 max-w-md w-full text-center">
        <Clock size={32} className="mx-auto mb-4" style={{ color: T.amber }} />
        <h1 className="font-display font-bold text-[20px] mb-2">Verification Pending</h1>
        <p className="text-[13px] mb-6 leading-relaxed" style={{ color: T.textDim }}>
          Your organization administrator must verify your identity before you can access the workspace.
        </p>
        
        {!success ? (
          <div className="text-left bg-black/20 p-4 rounded-lg border border-white/5 mb-6">
            <div className="space-y-4 mb-4">
              <Field label="Full Name"><TextField placeholder="Jane Doe" value={fullName} onChange={(e:any) => setFullName(e.target.value)} /></Field>
              <Field label="Organization"><TextField placeholder="Acme Corp" value={org} onChange={(e:any) => setOrg(e.target.value)} /></Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Role in Organization">
                  <select className="dt-input dt-focusable w-full rounded-lg px-3.5 py-2.5 text-[13.5px] appearance-none" value={role} onChange={(e: any) => setRole(e.target.value)}>
                    <option value="Developer">Developer</option>
                    <option value="QA">QA</option>
                    <option value="Admin">Admin</option>
                  </select>
                </Field>
                <Field label="Employee ID"><TextField placeholder="EMP-1234" value={empId} onChange={(e:any) => setEmpId(e.target.value)} /></Field>
              </div>
            </div>
            
            <div className="text-[12px] font-medium mb-3">ID Document Verification</div>
            <p className="text-[11.5px] mb-3" style={{ color: T.textFaint }}>Please upload your employee ID card to expedite verification.</p>
            <input type="file" accept="image/*" className="dt-input w-full text-[12px] p-2 mb-3" onChange={(e: any) => setFile(e.target.files?.[0])} />
            <Button variant="primary" className="w-full text-[12px] py-1.5" disabled={!file || !fullName || !org || !empId || uploading} onClick={handleSubmit}>
              {uploading ? "Submitting..." : "Submit Verification"}
            </Button>
            {error && <div className="mt-3 text-red-500 text-[11.5px]">{error}</div>}
          </div>
        ) : (
          <div className="text-green-500 text-[12px] p-3 bg-green-500/10 rounded mb-6 border border-green-500/20">
            Verification submitted successfully! Please wait for approval.
          </div>
        )}

        <Button onClick={async () => {
          const { logout } = await import("@/lib/data/auth");
          await logout();
          window.location.reload();
        }}>Sign Out</Button>
      </div>
    </div>
  );
}`;

content = content.replace(/function VerificationPendingBlocker\(\{ user \}: \{ user: any \}\) \{[\s\S]*?return \(\s*<div className="min-h-screen[\s\S]*?<\/div>\s*\);\s*\}/, newOnboarding);
fs.writeFileSync('components/devtrack/DevTrackApp.tsx', content);
console.log("Replaced Blocker");
