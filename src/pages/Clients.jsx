import { useState, useEffect } from 'react';
import { Users, UserPlus, Phone, Trash2, Calendar, FileText, ChevronDown, ChevronUp, Search, MessageCircle } from 'lucide-react';
import { getClients, addClient, deleteClient, updateClientStatus } from '../db';
import { exportRowsToXlsx } from '../utils/spreadsheet';

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const initialForm = { 
    name: '', phone: '', email: '', project: '', 
    status: 'Lead', budget: '', propertyType: '', 
    leadSource: '', nextFollowUp: '', notes: '' 
  };
  const [newClient, setNewClient] = useState(initialForm);
  const [clientToDelete, setClientToDelete] = useState(null);

  const loadClients = async () => {
    const data = await getClients();
    setClients(data);
  };

  const handleExportExcel = () => {
    if (clients.length === 0) {
      alert("No clients to export.");
      return;
    }
    const exportData = clients.map((client, index) => ({
      'Sr. No.': index + 1,
      'Full Name': client.name || '',
      'Phone Number': client.phone || '',
      'Email ID': client.email || '',
      'Status': client.status || '',
      'Interested Project': client.project || '',
      'Property Type': client.propertyType || '',
      'Budget Range': client.budget || '',
      'Lead Source': client.leadSource || '',
      'Next Follow-up Date': client.nextFollowUp ? new Date(client.nextFollowUp).toLocaleDateString('en-GB') : '',
      'Notes / History': client.notes || ''
    }));
    exportRowsToXlsx({ rows: exportData, sheetName: 'Clients List', fileName: 'PropEmpire_Clients.xlsx' });
  };

  useEffect(() => {
    loadClients();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newClient.name) return;
    try {
      await addClient(newClient);
      setNewClient(initialForm);
      setIsAdding(false);
      loadClients();
    } catch (err) {
      console.error("Failed to save:", err);
      alert("Failed to save client. Check console for details.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteClient(id);
      setClientToDelete(null);
      loadClients();
    } catch (err) {
      console.error(err);
      alert("Failed to delete client: " + err.message);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateClientStatus(id, status);
      loadClients();
    } catch (err) {
      console.error(err);
      alert("Failed to update status.");
    }
  };

  const toggleExpand = (id) => {
    if (expandedId === id) setExpandedId(null);
    else setExpandedId(id);
  }

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (client.phone && client.phone.includes(searchQuery))
  );

  const formatWaNumber = (phone) => {
    // Remove non-digits
    const digits = phone.replace(/\D/g, '');
    // If it's a 10 digit Indian number without country code, add 91
    if (digits.length === 10) return `91${digits}`;
    return digits;
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h1 style={{ margin: 0 }}>Clients & Leads</h1>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={handleExportExcel} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={16} /> Export Excel
          </button>
          <button className="btn btn-primary" onClick={() => setIsAdding(!isAdding)}>
            <UserPlus size={16} /> Add Client
          </button>
        </div>
      </div>

      <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
        <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input 
          type="text" 
          className="form-input" 
          placeholder="Search by name or phone..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ paddingLeft: '40px', borderRadius: 'var(--radius-xl)' }}
        />
      </div>

      {isAdding && (
        <form className="card animate-fade-in" style={{ marginBottom: '2rem' }} onSubmit={handleAdd}>
          <h2 style={{ fontSize: '1.125rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>New Customer Full Details</h2>
          
          <div className="form-grid-2" style={{ marginBottom: '1rem' }}>
            {/* Basic Info */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Full Name *</label>
              <input type="text" className="form-input" value={newClient.name} onChange={e => setNewClient({...newClient, name: e.target.value})} required />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Phone Number *</label>
              <input type="text" className="form-input" value={newClient.phone} onChange={e => setNewClient({...newClient, phone: e.target.value})} required />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Email ID</label>
              <input type="email" className="form-input" value={newClient.email} onChange={e => setNewClient({...newClient, email: e.target.value})} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Status</label>
              <select className="form-input" value={newClient.status} onChange={e => setNewClient({...newClient, status: e.target.value})}>
                <option value="Lead">Lead (New Inquiry)</option>
                <option value="Site Visit">Site Visit Planned/Done</option>
                <option value="Negotiation">Negotiation</option>
                <option value="Closed">Closed (Deal Done)</option>
                <option value="Lost">Lost (Not Interested)</option>
              </select>
            </div>

            {/* Real Estate Requirements */}
            <div className="form-group" style={{ marginBottom: 0, gridColumn: '1 / -1', marginTop: '1rem' }}>
              <h3 style={{ fontSize: '1rem', color: 'var(--primary-blue)', marginBottom: '0.5rem' }}>Property Requirements</h3>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Interested Project</label>
              <input type="text" className="form-input" value={newClient.project} onChange={e => setNewClient({...newClient, project: e.target.value})} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Property Type</label>
              <select className="form-input" value={newClient.propertyType} onChange={e => setNewClient({...newClient, propertyType: e.target.value})}>
                <option value="">Select...</option>
                <option value="1 BHK">1 BHK</option>
                <option value="2 BHK">2 BHK</option>
                <option value="3 BHK">3 BHK</option>
                <option value="Villa/Row House">Villa/Row House</option>
                <option value="Commercial">Commercial/Shop</option>
                <option value="Plot">Plot</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Budget Range</label>
              <input type="text" className="form-input" placeholder="e.g. 50 Lacs - 80 Lacs" value={newClient.budget} onChange={e => setNewClient({...newClient, budget: e.target.value})} />
            </div>
            
            {/* Tracking Info */}
            <div className="form-group" style={{ marginBottom: 0, gridColumn: '1 / -1', marginTop: '1rem' }}>
              <h3 style={{ fontSize: '1rem', color: 'var(--primary-blue)', marginBottom: '0.5rem' }}>Tracking & Notes</h3>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Lead Source</label>
              <select className="form-input" value={newClient.leadSource} onChange={e => setNewClient({...newClient, leadSource: e.target.value})}>
                <option value="">Select...</option>
                <option value="Walk-in">Walk-in Visitor</option>
                <option value="Reference">Reference/Word of Mouth</option>
                <option value="Facebook/Insta">Facebook/Insta Ads</option>
                <option value="MagicBricks/99Acres">Property Portal</option>
                <option value="Cold Call">Cold Call</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Next Follow-up Date</label>
              <input type="date" className="form-input" value={newClient.nextFollowUp} onChange={e => setNewClient({...newClient, nextFollowUp: e.target.value})} />
            </div>
            <div className="form-group" style={{ marginBottom: 0, gridColumn: '1 / -1' }}>
              <label className="form-label">Notes / Conversation History</label>
              <textarea className="form-input" rows="3" value={newClient.notes} onChange={e => setNewClient({...newClient, notes: e.target.value})}></textarea>
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAdding(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Complete Profile</button>
          </div>
        </form>
      )}

      <div className="card" style={{ padding: 0 }}>
        {filteredClients.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Users size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
            <p>{clients.length === 0 ? 'No clients added yet. Start by adding your first client!' : 'No clients match your search.'}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filteredClients.map(client => (
              <div key={client.id} style={{ display: 'flex', flexDirection: 'column', padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                {/* Header Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => toggleExpand(client.id)}>
                      {client.name} 
                      {client.status === 'Closed' && <span style={{fontSize:'0.7rem', background:'#10b981', color:'white', padding:'2px 6px', borderRadius:'4px'}}>Deal Done</span>}
                    </h3>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                      {client.phone && (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <a href={`tel:${client.phone}`} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', gap: '0.25rem' }}>
                            <Phone size={14} /> Call
                          </a>
                          <a href={`https://wa.me/${formatWaNumber(client.phone)}`} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', gap: '0.25rem', color: '#16a34a', borderColor: '#bbf7d0', backgroundColor: '#f0fdf4' }}>
                            <MessageCircle size={14} /> WhatsApp
                          </a>
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)', flexWrap: 'wrap' }} onClick={() => toggleExpand(client.id)}>
                      {client.project && <span>🏢 {client.project}</span>}
                      {client.nextFollowUp && <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#f59e0b' }}><Calendar size={14} /> Follow-up: {new Date(client.nextFollowUp).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                    <select 
                      className="form-input" 
                      style={{ padding: '0.25rem 0.5rem', width: '120px', fontSize: '0.75rem', backgroundColor: client.status === 'Closed' ? 'var(--bg-color)' : 'white' }}
                      value={client.status}
                      onChange={(e) => handleStatusChange(client.id, e.target.value)}
                    >
                      <option value="Lead">Lead</option>
                      <option value="Site Visit">Site Visit</option>
                      <option value="Negotiation">Negotiation</option>
                      <option value="Closed">Closed</option>
                      <option value="Lost">Lost</option>
                    </select>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button onClick={() => toggleExpand(client.id)} style={{ background: 'none', border: 'none', color: 'var(--primary-blue)', cursor: 'pointer', padding: '0.25rem' }}>
                        {expandedId === client.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                      <button onClick={() => setClientToDelete(client)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.25rem' }}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Details Row */}
                {expandedId === client.id && (
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed var(--border-color)', fontSize: '0.875rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', backgroundColor: 'var(--bg-color)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                    <div><strong style={{color:'var(--text-muted)'}}>Email:</strong> {client.email || 'N/A'}</div>
                    <div><strong style={{color:'var(--text-muted)'}}>Property Type:</strong> {client.propertyType || 'N/A'}</div>
                    <div><strong style={{color:'var(--text-muted)'}}>Budget:</strong> {client.budget || 'N/A'}</div>
                    <div><strong style={{color:'var(--text-muted)'}}>Lead Source:</strong> {client.leadSource || 'N/A'}</div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <strong style={{color:'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.25rem'}}><FileText size={14}/> Notes:</strong> 
                      <p style={{ margin: 0, whiteSpace: 'pre-line' }}>{client.notes || 'No notes added.'}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Custom Delete Confirmation Modal */}
      {clientToDelete && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '400px', backgroundColor: 'var(--surface-color)' }}>
            <h3 style={{ marginTop: 0, color: '#ef4444' }}>Delete Client</h3>
            <p style={{ margin: '1rem 0' }}>Are you sure you want to permanently delete <strong>{clientToDelete.name}</strong>? This action cannot be undone.</p>
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
