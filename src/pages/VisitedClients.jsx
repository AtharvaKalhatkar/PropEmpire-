import { useState, useEffect } from 'react';
import { MapPin, UserPlus, Phone, Trash2, Calendar, FileText, ChevronDown, ChevronUp, Search, MessageCircle, CheckSquare, Square, Filter, X } from 'lucide-react';
import { getVisitedClients, saveVisitedClient, deleteVisitedClient } from '../db';
import { exportRowsToCsv, exportRowsToXlsx } from '../utils/spreadsheet';

export default function VisitedClients() {
  const [clients, setClients] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  
  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilterFrom, setDateFilterFrom] = useState('');
  const [dateFilterTo, setDateFilterTo] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];
  
  const initialForm = { 
    visit_date: todayStr,
    name: '', 
    phone: '', 
    project: '', 
    properties: [], // Array for multiple options
    budget: '',
    notes: '' 
  };
  const [newClient, setNewClient] = useState(initialForm);
  const [clientToDelete, setClientToDelete] = useState(null);

  const loadClients = async () => {
    const data = await getVisitedClients();
    setClients(data);
  };

  const handleExportExcel = () => {
    if (clients.length === 0) {
      alert("No clients to export.");
      return;
    }
    const exportData = clients.map((client, index) => {
      let propsString = '';
      if (Array.isArray(client.properties)) {
        propsString = client.properties.join(', ');
      } else if (typeof client.properties === 'string') {
        try {
          const parsed = JSON.parse(client.properties);
          if (Array.isArray(parsed)) propsString = parsed.join(', ');
          else propsString = client.properties;
        } catch(e) {
          propsString = client.properties;
        }
      }

      return {
        'Sr. No.': index + 1,
        'Visit Date': client.visit_date ? new Date(client.visit_date).toLocaleDateString('en-GB') : '',
        'Full Name': client.name || '',
        'Mobile No': client.phone || '',
        'Project Showed': client.project || '',
        'Property Showed': propsString,
        'Budget': client.budget || '',
        'Notes': client.notes || ''
      };
    });

    exportRowsToXlsx({ rows: exportData, sheetName: 'Visited Clients', fileName: 'PropEmpire_Visited_Clients.xlsx' });
  };

  const handleExportCSV = () => {
    if (clients.length === 0) {
      alert("No clients to export.");
      return;
    }
    const exportData = clients.map((client, index) => {
      let propsString = '';
      if (Array.isArray(client.properties)) {
        propsString = client.properties.join(', ');
      } else if (typeof client.properties === 'string') {
        try {
          const parsed = JSON.parse(client.properties);
          if (Array.isArray(parsed)) propsString = parsed.join(', ');
          else propsString = client.properties;
        } catch(e) {
          propsString = client.properties;
        }
      }

      return {
        'Sr. No.': index + 1,
        'Visit Date': client.visit_date ? new Date(client.visit_date).toLocaleDateString('en-GB') : '',
        'Full Name': client.name || '',
        'Mobile No': client.phone || '',
        'Project Showed': client.project || '',
        'Property Showed': propsString,
        'Budget': client.budget || '',
        'Notes': client.notes || ''
      };
    });

    exportRowsToCsv({ rows: exportData, fileName: 'PropEmpire_Visited_Clients.csv' });
  };

  useEffect(() => {
    loadClients();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newClient.name) return;
    try {
      // Store array as JSON string for simple Supabase compatibility if needed
      const dataToSave = { 
        ...newClient, 
        properties: JSON.stringify(newClient.properties) 
      };
      await saveVisitedClient(dataToSave);
      setNewClient(initialForm);
      setIsAdding(false);
      loadClients();
    } catch (err) {
      console.error("Failed to save:", err);
      alert("Failed to save visited client.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteVisitedClient(id);
      setClientToDelete(null);
      loadClients();
    } catch (err) {
      console.error(err);
      alert("Failed to delete visited client: " + err.message);
    }
  };

  const toggleExpand = (id) => {
    if (expandedId === id) setExpandedId(null);
    else setExpandedId(id);
  }

  const toggleProperty = (propOption) => {
    setNewClient(prev => {
      const isSelected = prev.properties.includes(propOption);
      if (isSelected) {
        return { ...prev, properties: prev.properties.filter(p => p !== propOption) };
      } else {
        return { ...prev, properties: [...prev.properties, propOption] };
      }
    });
  };

  const propertyOptions = ['1 BHK', '2 BHK', '3 BHK', '4 BHK', 'Villa', 'Plot', 'Commercial'];

  const filteredClients = clients.filter(client => {
    // Text search
    const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (client.phone && client.phone.includes(searchQuery));
    
    // Date filter
    let matchesDate = true;
    if (dateFilterFrom || dateFilterTo) {
      const clientDate = new Date(client.visit_date);
      clientDate.setHours(0,0,0,0);
      
      if (dateFilterFrom) {
        const fromD = new Date(dateFilterFrom);
        fromD.setHours(0,0,0,0);
        if (clientDate < fromD) matchesDate = false;
      }
      if (dateFilterTo) {
        const toD = new Date(dateFilterTo);
        toD.setHours(0,0,0,0);
        if (clientDate > toD) matchesDate = false;
      }
    }

    return matchesSearch && matchesDate;
  });

  const formatWaNumber = (phone) => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) return `91${digits}`;
    return digits;
  };

  const renderProperties = (propsData) => {
    if (!propsData) return 'N/A';
    let arr = [];
    if (Array.isArray(propsData)) arr = propsData;
    else if (typeof propsData === 'string') {
      try {
        arr = JSON.parse(propsData);
        if (!Array.isArray(arr)) arr = [propsData];
      } catch(e) {
        arr = [propsData];
      }
    }
    
    if (arr.length === 0) return 'N/A';
    return arr.map((p, i) => (
      <span key={i} style={{ display: 'inline-block', background: 'var(--primary-blue)', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', marginRight: '4px', marginBottom: '4px' }}>
        {p}
      </span>
    ));
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
          <MapPin size={28} color="var(--primary-blue)" /> 
          Visited Clients
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
        <button className="btn btn-secondary" onClick={handleExportCSV} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)' }}>
          <FileText size={18} color="var(--primary-blue)" /> Export CSV
        </button>
        <button className="btn btn-secondary" onClick={handleExportExcel} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)' }}>
          <FileText size={18} color="#10b981" /> Export Excel
        </button>
        <button className="btn btn-primary" onClick={() => setIsAdding(!isAdding)} style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.875rem', fontSize: '1rem' }}>
          <UserPlus size={20} /> Log New Visit
        </button>
      </div>

      {/* Minimal Filters Area */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
        <div style={{ flex: '1 1 150px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            className="form-input" 
            placeholder="Search name or mobile..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '32px', marginBottom: 0, padding: '0.5rem 0.5rem 0.5rem 32px', fontSize: '0.875rem' }}
          />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexWrap: 'wrap', backgroundColor: 'var(--surface-color)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <Filter size={14} color="var(--text-muted)" />
          <input 
            type="date" 
            className="form-input" 
            style={{ width: 'auto', marginBottom: 0, border: 'none', background: 'transparent', padding: '0.25rem', fontSize: '0.75rem' }}
            value={dateFilterFrom}
            onChange={(e) => setDateFilterFrom(e.target.value)}
            title="From Date"
          />
          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>to</span>
          <input 
            type="date" 
            className="form-input" 
            style={{ width: 'auto', marginBottom: 0, border: 'none', background: 'transparent', padding: '0.25rem', fontSize: '0.75rem' }}
            value={dateFilterTo}
            onChange={(e) => setDateFilterTo(e.target.value)}
            title="To Date"
          />
          {(dateFilterFrom || dateFilterTo) && (
            <button 
              onClick={() => { setDateFilterFrom(''); setDateFilterTo(''); }} 
              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.75rem', padding: '0.25rem' }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {isAdding && (
        <form className="card animate-fade-in" style={{ marginBottom: '2rem' }} onSubmit={handleAdd}>
          <h2 style={{ fontSize: '1.125rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Log New Site Visit</h2>
          
          <div className="form-grid-2" style={{ marginBottom: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Visit Date *</label>
              <input type="date" className="form-input" value={newClient.visit_date} onChange={e => setNewClient({...newClient, visit_date: e.target.value})} required />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Client Name *</label>
              <input type="text" className="form-input" value={newClient.name} onChange={e => setNewClient({...newClient, name: e.target.value})} required />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Mobile No *</label>
              <input type="text" className="form-input" value={newClient.phone} onChange={e => setNewClient({...newClient, phone: e.target.value})} required />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Project Showed</label>
              <input type="text" className="form-input" placeholder="e.g. Mangalam Marvel" value={newClient.project} onChange={e => setNewClient({...newClient, project: e.target.value})} />
            </div>
            
            <div className="form-group" style={{ marginBottom: 0, gridColumn: '1 / -1' }}>
              <label className="form-label">Property Showed (Select multiple)</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.5rem' }}>
                {propertyOptions.map(opt => {
                  const isSelected = newClient.properties.includes(opt);
                  return (
                    <div 
                      key={opt} 
                      onClick={() => toggleProperty(opt)}
                      style={{ 
                        display: 'flex', alignItems: 'center', gap: '0.25rem', 
                        cursor: 'pointer', padding: '0.25rem 0.5rem',
                        border: isSelected ? '1px solid var(--primary-blue)' : '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: isSelected ? 'var(--bg-color)' : 'transparent',
                        fontSize: '0.875rem'
                      }}
                    >
                      {isSelected ? <CheckSquare size={16} color="var(--primary-blue)" /> : <Square size={16} color="var(--text-muted)" />}
                      <span style={{ color: isSelected ? 'var(--primary-blue)' : 'var(--text-main)' }}>{opt}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Client Budget</label>
              <input type="text" className="form-input" placeholder="e.g. 50 Lacs" value={newClient.budget} onChange={e => setNewClient({...newClient, budget: e.target.value})} />
            </div>
            <div className="form-group" style={{ marginBottom: 0, gridColumn: '1 / -1' }}>
              <label className="form-label">Notes / Feedback</label>
              <textarea className="form-input" rows="2" placeholder="Any specific requirements or comments..." value={newClient.notes} onChange={e => setNewClient({...newClient, notes: e.target.value})}></textarea>
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAdding(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Visited Client</button>
          </div>
        </form>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredClients.length === 0 ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <MapPin size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.5, color: 'var(--primary-blue)' }} />
            <p>{clients.length === 0 ? 'No visited clients yet. Start by logging a visit!' : 'No clients match your filters.'}</p>
          </div>
        ) : (
          filteredClients.map(client => (
            <div key={client.id} className="card" style={{ display: 'flex', flexDirection: 'column', padding: '1.25rem', position: 'relative', overflow: 'hidden' }}>
              
              {/* Top Row: Date & Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--bg-color)', padding: '0.25rem 0.75rem', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
                  <Calendar size={14} color="var(--primary-blue)" />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-main)', fontWeight: '600' }}>
                    {new Date(client.visit_date).toLocaleDateString('en-GB')}
                  </span>
                </div>
                
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button onClick={() => toggleExpand(client.id)} style={{ background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '50%', color: 'var(--text-main)', cursor: 'pointer', padding: '0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {expandedId === client.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  <button onClick={() => setClientToDelete(client)} style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '50%', color: '#ef4444', cursor: 'pointer', padding: '0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Client Info */}
              <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)' }} onClick={() => toggleExpand(client.id)}>
                {client.name} 
              </h3>
              
              {client.project && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }} onClick={() => toggleExpand(client.id)}>
                  <MapPin size={14} /> <span>{client.project}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                {client.phone && (
                  <>
                    <a href={`tel:${client.phone}`} className="btn btn-secondary" style={{ flex: 1, padding: '0.5rem', fontSize: '0.875rem', gap: '0.5rem', justifyContent: 'center' }}>
                      <Phone size={16} color="var(--primary-blue)" /> Call
                    </a>
                    <a href={`https://wa.me/${formatWaNumber(client.phone)}`} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ flex: 1, padding: '0.5rem', fontSize: '0.875rem', gap: '0.5rem', color: '#16a34a', borderColor: '#bbf7d0', backgroundColor: '#f0fdf4', justifyContent: 'center' }}>
                      <MessageCircle size={16} /> WhatsApp
                    </a>
                  </>
                )}
              </div>

              {/* Expanded Details */}
              {expandedId === client.id && (
                <div className="animate-fade-in" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed var(--border-color)', fontSize: '0.875rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', backgroundColor: 'var(--bg-color)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                  <div><strong style={{color:'var(--text-muted)', display: 'block', marginBottom: '6px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Properties:</strong> {renderProperties(client.properties)}</div>
                  <div><strong style={{color:'var(--text-muted)', display: 'block', marginBottom: '6px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Budget:</strong> <span style={{ fontWeight: '600' }}>{client.budget || 'N/A'}</span></div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <strong style={{color:'var(--text-muted)', display: 'block', marginBottom: '6px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Notes:</strong> 
                    <p style={{ margin: 0, whiteSpace: 'pre-line', color: 'var(--text-main)', lineHeight: '1.5' }}>{client.notes || 'No notes added.'}</p>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Custom Delete Confirmation Modal */}
      {clientToDelete && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '400px', backgroundColor: 'var(--surface-color)' }}>
            <h3 style={{ marginTop: 0, color: '#ef4444' }}>Delete Visit</h3>
            <p style={{ margin: '1rem 0' }}>Are you sure you want to permanently delete this visit for <strong>{clientToDelete.name}</strong>?</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button className="btn btn-secondary" onClick={() => setClientToDelete(null)}>Cancel</button>
              <button className="btn btn-primary" style={{ backgroundColor: '#ef4444', border: 'none' }} onClick={() => handleDelete(clientToDelete.id)}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
