import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const response = await supabase.from('invoices').select('*').limit(1);
  if (response.data) {
    console.log("Columns:", Object.keys(response.data[0]));
  }
}
test();
