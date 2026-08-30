const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://jgyvggsafrsnwxuhkqra.supabase.co', 'sb_publishable_DT6X-xcFl-pHLwmqjGqoew_3b81a-Ry');
(async () => {
  const { data, error } = await supabase.from('verification_requests').insert({ invalid_column_name: 'test' });
  console.log(error);
})();
