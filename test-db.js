const { createClient } = require('@supabase/supabase-js');
const url = 'https://jgyvggsafrsnwxuhkqra.supabase.co';
const key = 'sb_publishable_DT6X-xcFl-pHLwmqjGqoew_3b81a-Ry'; // wait, the user gave this: sb_publishable_DT6X-xcFl-pHLwmqjGqoew_3b81a-Ry
const supabase = createClient(url, key);
(async () => {
  // Can't use service_role, so I can only query public stuff or use an existing user.
  // I will just use the testowner1@gmail.com account
  const { data: auth, error: authErr } = await supabase.auth.signInWithPassword({ email: 'testowner1@gmail.com', password: 'password123' });
  if (authErr) { console.log(authErr); return; }
  
  const { data, error } = await supabase.from('verification_requests').select('*').limit(5);
  console.log("verification_requests:", data);
  
})();
