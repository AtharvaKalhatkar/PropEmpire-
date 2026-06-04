import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Read .env.local file manually
const envPath = path.resolve(process.cwd(), '.env.local');
let VITE_SUPABASE_URL = '';
let VITE_SUPABASE_ANON_KEY = '';

try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  for (const line of lines) {
    if (line.startsWith('VITE_SUPABASE_URL=')) VITE_SUPABASE_URL = line.split('=')[1].trim();
    if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) VITE_SUPABASE_ANON_KEY = line.split('=')[1].trim();
  }
} catch (e) {
  console.error('Could not read .env file', e);
  process.exit(1);
}

const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY);

async function run() {
  console.log("Fetching all invoices...");
  const { data, error } = await supabase.from('invoices').select('*');
  if (error) {
    console.error(error);
    return;
  }
  
  const emptyInvoices = data.filter(inv => !inv.customerName || inv.customerName.trim() === '');
  console.log(`Found ${emptyInvoices.length} empty invoices out of ${data.length} total.`);
  
  for (const inv of emptyInvoices) {
    console.log(`Deleting invoice ID: ${inv.id}`);
    await supabase.from('invoices').delete().eq('id', inv.id);
  }
  
  console.log("Done.");
}

run();
