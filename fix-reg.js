const fs = require('fs');
let content = fs.readFileSync('components/devtrack/DevTrackApp.tsx', 'utf8');

// Completely rewrite RegisterPage
content = content.replace(/function RegisterPage\(\{ goLogin, goLanding \}: any\) \{[\s\S]*?return \(\s*<AuthShell>[\s\S]*?<\/AuthShell>\s*\);\s*\}/, `function RegisterPage({ goLogin, goLanding }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successText, setSuccessText] = useState("");
  const isSubmitting = useRef(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (isSubmitting.current) return;
    isSubmitting.current = true;
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      isSubmitting.current = false;
      return;
    }
    setLoading(true);
    const { register } = await import("@/lib/data/auth");
    const res = await register(email, password, "", "", "", ""); // pass empty strings to match signature
    if (res.error) {
      setError(res.error);
      setLoading(false); isSubmitting.current = false;
    } else if (res.data?.user?.identities && res.data.user.identities.length === 0) {
      setError("An account with this email already exists. Please sign in instead.");
      setLoading(false); isSubmitting.current = false;
    } else {
      setSuccessText("Account created successfully. Please sign in to complete your onboarding verification.");
      setLoading(false);
      isSubmitting.current = false;
    }
  };

  return (
    <AuthShell>
      <div className="dt-card p-7 sm:p-8 relative">
        {loading && <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 rounded-xl"><Loader2 className="animate-spin text-white" /></div>}
        <h1 className="font-display font-bold text-[22px] mb-1">Create your account</h1>
        <p className="text-[13px] mb-6" style={{ color: T.textFaint }}>Join your organization's engineering workspace.</p>
        
        {error && <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-[12.5px]">{error}</div>}
        {successText && <div className="mb-4 p-3 rounded bg-green-500/10 border border-green-500/20 text-green-500 text-[12.5px] whitespace-pre-line">{successText}</div>}
        
        <form onSubmit={handleSubmit}>
          <Field label="Email">
            <TextField type="email" placeholder="you@company.com" required value={email} onChange={(e: any) => setEmail(e.target.value)} />
          </Field>
          <Field label="Password">
            <TextField type="password" placeholder="Create a secure password" required minLength={6} value={password} onChange={(e: any) => setPassword(e.target.value)} />
          </Field>
          <Field label="Confirm Password">
            <TextField type="password" placeholder="Confirm your password" required minLength={6} value={confirmPassword} onChange={(e: any) => setConfirmPassword(e.target.value)} />
          </Field>
          <Button type="submit" variant="primary" className="w-full py-2.5 text-[13.5px]">Create Account</Button>
        </form>
        <div className="text-center mt-6 text-[13px]" style={{ color: T.textFaint }}>
          Already have an account? <button type="button" onClick={goLogin} className="dt-focusable font-medium" style={{ color: T.crimsonBright }} data-interactive>Sign in instead</button>
        </div>
      </div>
      <button onClick={goLanding} className="w-full text-center mt-5 text-[12.5px] dt-focusable" style={{ color: T.textFaint }} data-interactive>? Back to home</button>
    </AuthShell>
  );
}`);

fs.writeFileSync('components/devtrack/DevTrackApp.tsx', content);
console.log("Replaced RegisterPage");
