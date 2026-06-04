import { createClient } from '@supabase/supabase-js';
import localforage from 'localforage';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Maintain compatibility with App.jsx
export async function initDB() {
  return true;
}

export async function getProfile() {
  const cached = await localforage.getItem('profile_cache');
  
  // Background fetch
  supabase.from('profile').select('*').eq('id', 1).single().then(({ data, error }) => {
    if (!error && data) {
      localforage.setItem('profile_cache', data);
    }
  });

  if (cached) return cached;

  const { data, error } = await supabase.from('profile').select('*').eq('id', 1).single();
  if (error && error.code !== 'PGRST116') { // PGRST116 is 'Row not found'
    console.error("Error fetching profile:", error);
    return null;
  }
  if (data) await localforage.setItem('profile_cache', data);
  return data || null;
}

export async function saveProfile(profileData) {
  const { data, error } = await supabase
    .from('profile')
    .upsert({ id: 1, ...profileData })
    .select()
    .single();
    
  if (error) {
    console.error("Error saving profile:", error);
    throw error;
  }
  
  await localforage.setItem('profile_cache', data);
  return data;
}

export async function getClients() {
  const cached = await localforage.getItem('clients_cache');
  
  // Background fetch
  supabase.from('clients').select('*').order('created_at', { ascending: false }).then(({ data, error }) => {
    if (!error && data) {
      localforage.setItem('clients_cache', data);
    }
  });

  if (cached) return cached;

  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error("Error fetching clients:", error);
    return [];
  }
  
  if (data) await localforage.setItem('clients_cache', data);
  return data || [];
}

export async function saveClient(clientData) {
  let response;
  if (clientData.id) {
    response = await supabase.from('clients').update({ ...clientData, updated_at: new Date().toISOString() }).eq('id', clientData.id).select().single();
  } else {
    response = await supabase.from('clients').insert([clientData]).select().single();
  }
  
  if (response.error) {
    console.error("Error saving client:", response.error);
    throw response.error;
  }
  
  // Invalidate cache so next load fetches fresh data
  await localforage.removeItem('clients_cache');
  return response.data;
}

// Aliases for compatibility with Clients.jsx
export const addClient = saveClient;

export async function updateClientStatus(id, status) {
  const { error } = await supabase.from('clients').update({ status }).eq('id', id);
  if (error) {
    console.error("Error updating client status:", error);
    throw error;
  }
  await localforage.removeItem('clients_cache');
  return true;
}

export async function deleteClient(id) {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error("Error deleting client:", error);
    throw error;
  }
  await localforage.removeItem('clients_cache');
  return true;
}

const processInvoices = (data) => {
  return (data || []).map(invoice => {
    if (invoice.billedToAddress && invoice.billedToAddress.startsWith('DEVELOPER_NAME:')) {
      const parts = invoice.billedToAddress.split('\n');
      invoice.billedToName = parts[0].replace('DEVELOPER_NAME:', '');
      invoice.billedToAddress = parts.slice(1).join('\n');
    }
    return invoice;
  });
};

export async function getInvoices() {
  const cached = await localforage.getItem('invoices_cache');
  
  // Background fetch
  supabase.from('invoices').select('*').order('created_at', { ascending: false }).then(({ data, error }) => {
    if (!error && data) {
      localforage.setItem('invoices_cache', processInvoices(data));
    }
  });

  if (cached) return cached;

  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error("Error fetching invoices:", error);
    return [];
  }
  
  const processed = processInvoices(data);
  await localforage.setItem('invoices_cache', processed);
  return processed;
}

export async function saveInvoice(invoiceData) {
  let payload = { ...invoiceData };
  
  // Bundle billedToName into address to bypass schema limits
  if (payload.billedToName) {
    payload.billedToAddress = `DEVELOPER_NAME:${payload.billedToName}\n${payload.billedToAddress || ''}`;
  }
  delete payload.billedToName; // Remove from payload so it doesn't crash Supabase

  let response;
  if (payload.id) {
    response = await supabase.from('invoices').update(payload).eq('id', payload.id).select().single();
  } else {
    response = await supabase.from('invoices').insert([payload]).select().single();
  }
  
  if (response.error) {
    console.error("Error saving invoice:", response.error);
    throw response.error;
  }
  
  await localforage.removeItem('invoices_cache');
  return response.data;
}
