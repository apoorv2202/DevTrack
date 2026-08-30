const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://jgyvggsafrsnwxuhkqra.supabase.co', 'sb_publishable_DT6X-xcFl-pHLwmqjGqoew_3b81a-Ry');
(async () => {
  const { data: auth, error: authErr } = await supabase.auth.signInWithPassword({ email: 'testowner1@gmail.com', password: 'password' });
  const { data, error } = await supabase.from('organization_members').insert({ organization_id: '123', user_id: '123', role: 'Developer', employee_id: '123' });
  console.log(error);
})();
