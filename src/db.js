import { createClient } from '@supabase/supabase-js';
import localforage from 'localforage';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Only create supabase client if credentials are configured
const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// Maintain compatibility with App.jsx
export async function initDB() {
  return true;
}

export async function getProfile() {
  const cached = await localforage.getItem('profile_cache');

  // Background fetch from Supabase if available
  if (supabase) {
    supabase.from('profile').select('*').eq('id', 1).single().then(({ data, error }) => {
      if (!error && data) {
        localforage.setItem('profile_cache', data);
      }
    });
  }

  if (cached) return cached;

  if (supabase) {
    const { data, error } = await supabase.from('profile').select('*').eq('id', 1).single();
    if (error && error.code !== 'PGRST116') { // PGRST116 is 'Row not found'
      console.error("Error fetching profile:", error);
      return null;
    }
    if (data) await localforage.setItem('profile_cache', data);
    return data || null;
  }

  return null;
}

export async function saveProfile(profileData) {
  const dataToSave = { id: 1, ...profileData };

  if (supabase) {
    const { data, error } = await supabase
      .from('profile')
      .upsert(dataToSave)
      .select()
      .single();

    if (error) {
      console.error("Error saving profile to Supabase:", error);
      // Fallback: save locally even if Supabase fails
      await localforage.setItem('profile_cache', dataToSave);
      return dataToSave;
    }

    await localforage.setItem('profile_cache', data);
    return data;
  }

  // Offline-only mode
  await localforage.setItem('profile_cache', dataToSave);
  return dataToSave;
}

export async function getClients() {
  const cached = await localforage.getItem('clients_cache');

  // Background fetch
  if (supabase) {
    supabase.from('clients').select('*').order('created_at', { ascending: false }).then(({ data, error }) => {
      if (!error && data) {
        localforage.setItem('clients_cache', data);
      }
    });
  }

  if (cached) return cached;

  if (supabase) {
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

  return [];
}

export async function saveClient(clientData) {
  if (supabase) {
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

  // Offline-only mode: store in localforage
  const clients = (await localforage.getItem('clients_cache')) || [];
  if (clientData.id) {
    const idx = clients.findIndex(c => c.id === clientData.id);
    if (idx !== -1) clients[idx] = { ...clientData, updated_at: new Date().toISOString() };
  } else {
    clientData.id = crypto.randomUUID();
    clientData.created_at = new Date().toISOString();
    clients.unshift(clientData);
  }
  await localforage.setItem('clients_cache', clients);
  return clientData;
}

// Aliases for compatibility with Clients.jsx
export const addClient = saveClient;

export async function updateClientStatus(id, status) {
  if (supabase) {
    const { error } = await supabase.from('clients').update({ status }).eq('id', id);
    if (error) {
      console.error("Error updating client status:", error);
      throw error;
    }
    await localforage.removeItem('clients_cache');
    return true;
  }

  // Offline mode
  const clients = (await localforage.getItem('clients_cache')) || [];
  const idx = clients.findIndex(c => c.id === id);
  if (idx !== -1) clients[idx].status = status;
  await localforage.setItem('clients_cache', clients);
  return true;
}

export async function deleteClient(id) {
  if (supabase) {
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

  // Offline mode
  const clients = (await localforage.getItem('clients_cache')) || [];
  const filtered = clients.filter(c => c.id !== id);
  await localforage.setItem('clients_cache', filtered);
  return true;
}

const processInvoiceSingle = (invoice) => {
  if (!invoice) return invoice;
  // Clone to avoid mutating original objects in local cache
  const cloned = { ...invoice };
  if (cloned.billedToAddress && cloned.billedToAddress.startsWith('DEVELOPER_NAME:')) {
    const parts = cloned.billedToAddress.split('\n');
    cloned.billedToName = parts[0].replace('DEVELOPER_NAME:', '');
    cloned.billedToAddress = parts.slice(1).join('\n');
  }
  return cloned;
};

const processInvoices = (data) => {
  return (data || []).map(processInvoiceSingle);
};

export async function getInvoices() {
  const cached = await localforage.getItem('invoices_cache');

  // Background fetch
  if (supabase) {
    supabase.from('invoices').select('*').order('created_at', { ascending: false }).then(({ data, error }) => {
      if (!error && data) {
        localforage.setItem('invoices_cache', processInvoices(data));
      }
    });
  }

  if (cached) return processInvoices(cached);

  if (supabase) {
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

  return [];
}

export async function saveInvoice(invoiceData) {
  let payload = { ...invoiceData };

  // Bundle billedToName into address to bypass schema limits
  if (payload.billedToName) {
    payload.billedToAddress = `DEVELOPER_NAME:${payload.billedToName}\n${payload.billedToAddress || ''}`;
  }
  delete payload.billedToName; // Remove from payload so it doesn't crash Supabase

  if (supabase) {
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
    return processInvoiceSingle(response.data);
  }

  // Offline-only mode
  const invoices = (await localforage.getItem('invoices_cache')) || [];
  if (payload.id) {
    const idx = invoices.findIndex(i => i.id === payload.id);
    if (idx !== -1) invoices[idx] = { ...payload };
  } else {
    payload.id = crypto.randomUUID();
    payload.created_at = new Date().toISOString();
    invoices.unshift(payload);
  }
  await localforage.setItem('invoices_cache', invoices);
  return processInvoiceSingle(payload);
}

export async function deleteInvoice(id) {
  if (supabase) {
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting invoice:", error);
      throw error;
    }
    await localforage.removeItem('invoices_cache');
    return true;
  }

  // Offline mode
  const invoices = (await localforage.getItem('invoices_cache')) || [];
  const filtered = invoices.filter(inv => inv.id !== id);
  await localforage.setItem('invoices_cache', filtered);
  return true;
}

// ---------------- VISITED CLIENTS ---------------- //

export async function getVisitedClients() {
  const cached = await localforage.getItem('visited_clients_cache');

  if (supabase) {
    supabase.from('visited_clients').select('*').order('visit_date', { ascending: false }).then(({ data, error }) => {
      if (!error && data) {
        localforage.setItem('visited_clients_cache', data);
      }
    });
  }

  if (cached) return cached;

  if (supabase) {
    const { data, error } = await supabase
      .from('visited_clients')
      .select('*')
      .order('visit_date', { ascending: false });

    if (error) {
      console.error("Error fetching visited clients:", error);
      return [];
    }

    if (data) await localforage.setItem('visited_clients_cache', data);
    return data || [];
  }

  return [];
}

export async function saveVisitedClient(clientData) {
  if (supabase) {
    let response;
    // ensure properties is stored as string/json if it's an array
    if (clientData.id) {
      response = await supabase.from('visited_clients').update(clientData).eq('id', clientData.id).select().single();
    } else {
      response = await supabase.from('visited_clients').insert([clientData]).select().single();
    }

    if (response.error) {
      console.error("Error saving visited client:", response.error);
      throw response.error;
    }

    await localforage.removeItem('visited_clients_cache');
    return response.data;
  }

  // Offline mode
  const clients = (await localforage.getItem('visited_clients_cache')) || [];
  if (clientData.id) {
    const idx = clients.findIndex(c => c.id === clientData.id);
    if (idx !== -1) clients[idx] = { ...clientData };
  } else {
    clientData.id = crypto.randomUUID();
    clientData.created_at = new Date().toISOString();
    clients.unshift(clientData);
  }
  await localforage.setItem('visited_clients_cache', clients);
  return clientData;
}

export async function deleteVisitedClient(id) {
  if (supabase) {
    const { error } = await supabase
      .from('visited_clients')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting visited client:", error);
      throw error;
    }
    await localforage.removeItem('visited_clients_cache');
    return true;
  }

  const clients = (await localforage.getItem('visited_clients_cache')) || [];
  const filtered = clients.filter(c => c.id !== id);
  await localforage.setItem('visited_clients_cache', filtered);
  return true;
}

// Export supabase for any direct use
export { supabase };
