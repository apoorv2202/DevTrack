const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://jgyvggsafrsnwxuhkqra.supabase.co', 'sb_publishable_DT6X-xcFl-pHLwmqjGqoew_3b81a-Ry');
(async () => {
  const { data, error } = await supabase.from('issues').insert({ status: 'invalid_status' }).select('status');
  console.log(error);
})();
