import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const formData = {
    invoiceNo: '1',
    date: '2026-06-04',
    billedToName: '',
    billedToAddress: '',
    billedToGstin: '',
    customerName: 'Test',
    customerPhone: '',
    customerEmail: '',
    projectName: '',
    tower: '',
    flatNo: '',
    agreementValue: 0,
    brokeragePercent: 3,
    executiveBonus: 0
  };
  
  console.log("Attempting insert...");
  const response = await supabase.from('invoices').insert([formData]).select().single();
  
  if (response.error) {
    console.error("Supabase Error:", JSON.stringify(response.error, null, 2));
  } else {
    console.log("Success:", response.data);
  }
}

test();
