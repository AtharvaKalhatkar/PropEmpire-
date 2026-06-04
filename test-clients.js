import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('clients').select('*');
  console.log("Clients:", data);
  if (data && data.length > 0) {
    const id = data[0].id;
    console.log("Attempting to delete id:", id);
    const { error: delError } = await supabase.from('clients').delete().eq('id', id);
    if (delError) console.error("Delete error:", delError);
    else console.log("Deleted successfully!");
  }
}
test();
