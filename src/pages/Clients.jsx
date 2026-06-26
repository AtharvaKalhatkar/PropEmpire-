import { useState, useEffect } from 'react';
import { Plus, Phone, Trash2, Search, MessageCircle, Radio, ChevronDown, ChevronUp, FileText, FileUp, CheckSquare, Square, Send, X, Mail, MapPin } from 'lucide-react';
import { getClients, addClient, deleteClient, updateClientStatus } from '../db';
import { exportRowsToXlsx, parseImportedXlsx } from '../utils/spreadsheet';

const initForm = { name:'', phone:'', email:'', project:'', status:'Lead', budget:'', propertyType:'', leadSource:'', nextFollowUp:'', notes:'' };

const TEMPLATES = [
  { label:'New Launch', text:'🏗️ *New Project Launch Alert!*\n\nHello {name},\n\nWe are excited to introduce a brand new project:\n\n🏢 *Project:* [Enter Project]\n📍 *Location:* [Enter Location]\n🛏️ *Config:* 1/2/3 BHK\n💰 *Starting:* ₹ [Price]\n\nBook your FREE site visit now!\n\n— *PropEmpire*' },
  { label:'Special Offer', text:'🔥 *Exclusive Offer!*\n\nHi {name},\n\nGreat news! We have a special offer on:\n\n🏢 *Project:* [Enter Project]\n🎁 *Offer:* [e.g. No Stamp Duty]\n⏳ *Valid Till:* [Date]\n\nDon\'t miss out!\n\n— *PropEmpire*' },
  { label:'Follow-up', text:'Hello {name},\n\nThis is a gentle follow-up from *PropEmpire*.\n\nWould you like to schedule a site visit this weekend?\n\nLet us know your convenient time.\n\nRegards,\n*PropEmpire*' },
  { label:'Custom', text:'' },
];

const STATUS_COLORS = {
  'Lead': { bg: 'var(--primary-subtle)', color: 'var(--primary)', border: 'rgba(99,102,241,0.15)' },
  'Site Visit': { bg: 'var(--info-subtle)', color: 'var(--info)', border: 'rgba(59,130,246,0.15)' },
  'Negotiation': { bg: 'var(--warning-subtle)', color: 'var(--warning)', border: 'rgba(245,158,11,0.15)' },
  'Closed': { bg: 'var(--success-subtle)', color: 'var(--success)', border: 'rgba(34,197,94,0.15)' },
  'Lost': { bg: 'var(--danger-subtle)', color: 'var(--danger)', border: 'rgba(239,68,68,0.15)' },
};

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [adding, setAdding] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(initForm);
  const [delTarget, setDelTarget] = useState(null);
  const [showBC, setShowBC] = useState(false);
  const [selIds, setSelIds] = useState([]);
  const [bcMsg, setBcMsg] = useState(TEMPLATES[0].text);
  const [bcSending, setBcSending] = useState(false);
  const [bcSent, setBcSent] = useState(0);

  const load = () => getClients().then(setClients);
  useEffect(() => { load(); }, []);

  const filtered = clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || (c.phone && c.phone.includes(search)));

  const handleAdd = async e => {
    e.preventDefault();
    if (!form.name) return;
    try { await addClient(form); setForm(initForm); setAdding(false); load(); }
    catch { alert('Failed'); }
  };

  const handleDel = async id => {
    try { await deleteClient(id); setDelTarget(null); load(); }
    catch { alert('Failed'); }
  };

  const handleStatus = async (id, st) => {
    try { await updateClientStatus(id, st); load(); }
    catch { alert('Failed'); }
  };

  const handleExport = () => {
    if (!clients.length) return alert('No clients');
    const d = clients.map((c,i) => ({'#':i+1,'Name':c.name,'Phone':c.phone,'Email':c.email||'','Status':c.status,'Project':c.project||'','Type':c.propertyType||'','Budget':c.budget||'','Source':c.leadSource||'','Follow-up':c.nextFollowUp?new Date(c.nextFollowUp).toLocaleDateString('en-GB'):'','Notes':c.notes||''}));
    exportRowsToXlsx({rows:d,sheetName:'Clients',fileName:'PropEmpire_Clients.xlsx'});
  };

  const handleImport = async e => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const {data} = await parseImportedXlsx(file);
      if (!data?.length) return alert('No data');
      let count = 0;
      for (const row of data) {
        const g = ks => { for (const k of Object.keys(row)) { if (ks.some(x=>k.toLowerCase().includes(x))) return row[k]?.toString()||''; } return ''; };
        const name = g(['name','client','customer']);
        if (!name) continue;
        await addClient({name,phone:g(['phone','mobile']),email:g(['email']),project:g(['project']),status:'Lead',budget:g(['budget']),propertyType:g(['type','bhk']),leadSource:'Imported',notes:g(['note'])});
        count++;
      }
      alert(`Imported ${count} clients`); load();
    } catch { alert('Import failed'); }
    e.target.value='';
  };

  const fmtWA = p => { const d=p.replace(/\D/g,''); return d.length===10?'91'+d:d; };

  const handleBCSend = async () => {
    const targets = clients.filter(c => selIds.includes(c.id) && c.phone);
    if (!targets.length) return alert('Select clients with phone');
    if (!bcMsg.trim()) return alert('Enter a message');
    setBcSending(true); setBcSent(0);
    for (let i=0;i<targets.length;i++) {
      window.open(`https://wa.me/${fmtWA(targets[i].phone)}?text=${encodeURIComponent(bcMsg.replace(/\{name\}/g,targets[i].name||'there'))}`,'_blank');
      setBcSent(i+1);
      if (i<targets.length-1) await new Promise(r=>setTimeout(r,800));
    }
    setBcSending(false);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-20">
        <div>
          <h1 style={{ fontSize: 26, margin: 0 }}>Clients</h1>
          <p style={{ margin: '2px 0 0' }}>{clients.length} contacts</p>
        </div>
        <div className="flex gap-8" style={{ flexWrap: 'wrap' }}>
          <input type="file" accept=".xlsx" onChange={handleImport} style={{ display: 'none' }} id="import-excel" />
          <label htmlFor="import-excel" className="btn btn-secondary" style={{ fontSize: 11, padding: '7px 12px', cursor: 'pointer' }}>
            <FileUp size={13} /> Import
          </label>
          <button className="btn btn-secondary" onClick={handleExport} style={{ fontSize: 11, padding: '7px 12px' }}>
            <FileText size={13} /> Export
          </button>
          <button className="btn btn-primary" onClick={() => setAdding(!adding)} style={{ fontSize: 11, padding: '7px 12px' }}>
            <Plus size={13} /> Add
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="search-input-wrap">
        <Search size={16} />
        <input className="form-input" placeholder="Search clients..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Broadcast */}
      <button
        className="btn btn-secondary w-full mb-16"
        onClick={() => { setSelIds([]); setBcMsg(TEMPLATES[0].text); setBcSent(0); setBcSending(false); setShowBC(true); }}
        style={{ color: 'var(--success)', borderColor: 'rgba(34,197,94,0.2)', background: 'var(--success-subtle)', justifyContent: 'center' }}
      >
        <Radio size={15} /> WhatsApp Broadcast
      </button>

      {/* Add Form */}
      {adding && (
        <form className="card mb-16 animate-fade-in" onSubmit={handleAdd}>
          <div className="section-title">New Client</div>
          <div className="form-grid-2">
            <div className="form-group"><label className="form-label">Name *</label><input type="text" className="form-input" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required placeholder="Client name" /></div>
            <div className="form-group"><label className="form-label">Phone *</label><input type="text" className="form-input" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="Phone number" /></div>
            <div className="form-group"><label className="form-label">Email</label><input type="email" className="form-input" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="Email" /></div>
            <div className="form-group"><label className="form-label">Status</label>
              <select className="form-input" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
                <option value="Lead">Lead</option><option value="Site Visit">Site Visit</option><option value="Negotiation">Negotiation</option><option value="Closed">Closed</option><option value="Lost">Lost</option>
              </select>
            </div>
            <div className="form-group"><label className="form-label">Project</label><input type="text" className="form-input" value={form.project} onChange={e=>setForm({...form,project:e.target.value})} placeholder="Project" /></div>
            <div className="form-group"><label className="form-label">Budget</label><input type="text" className="form-input" value={form.budget} onChange={e=>setForm({...form,budget:e.target.value})} placeholder="Budget" /></div>
            <div className="form-group"><label className="form-label">Type</label>
              <select className="form-input" value={form.propertyType} onChange={e=>setForm({...form,propertyType:e.target.value})}>
                <option value="">Select</option><option value="1 BHK">1 BHK</option><option value="2 BHK">2 BHK</option><option value="3 BHK">3 BHK</option><option value="Villa">Villa</option><option value="Plot">Plot</option><option value="Commercial">Commercial</option>
              </select>
            </div>
            <div className="form-group"><label className="form-label">Source</label>
              <select className="form-input" value={form.leadSource} onChange={e=>setForm({...form,leadSource:e.target.value})}>
                <option value="">Select</option><option value="Walk-in">Walk-in</option><option value="Reference">Reference</option><option value="Social Media">Social Media</option><option value="Portal">Portal</option><option value="Cold Call">Cold Call</option>
              </select>
            </div>
            <div className="form-group"><label className="form-label">Follow-up</label><input type="date" className="form-input" value={form.nextFollowUp} onChange={e=>setForm({...form,nextFollowUp:e.target.value})} /></div>
            <div className="form-group" style={{gridColumn:'1 / -1'}}><label className="form-label">Notes</label><textarea className="form-input" rows="2" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Any notes..." /></div>
          </div>
          <div className="flex" style={{ gap: 10 }}>
            <button type="button" className="btn btn-secondary flex-1" onClick={() => setAdding(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary flex-1">Save Client</button>
          </div>
        </form>
      )}

      {/* Client List */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div className="empty-state"><p>{clients.length === 0 ? 'No clients yet' : 'No matches'}</p></div>
        ) : (
          filtered.map((c, idx) => {
            const sc = STATUS_COLORS[c.status] || STATUS_COLORS['Lead'];
            return (
              <div key={c.id}>
                <div style={{
                  display: 'flex', alignItems: 'flex-start', padding: '14px 18px',
                  borderBottom: idx < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                  gap: 12, transition: 'background 150ms'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="flex items-center gap-8" style={{ marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{c.name}</span>
                      <span className="badge" style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                        {c.status}
                      </span>
                    </div>
                    {c.phone && <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 3 }}>{c.phone}</div>}
                    <div className="flex gap-8" style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                      {c.project && <span className="flex items-center gap-4"><MapPin size={10} /> {c.project}</span>}
                      {c.nextFollowUp && <span style={{ color: 'var(--warning)' }}>Follow: {new Date(c.nextFollowUp).toLocaleDateString('en-GB')}</span>}
                    </div>
                  </div>
                  <div className="flex gap-4" style={{ flexShrink: 0, alignItems: 'flex-start' }}>
                    <select className="form-input" value={c.status} onChange={e => handleStatus(c.id, e.target.value)}
                      style={{ padding: '5px 22px 5px 8px', fontSize: 11, width: 85, marginBottom: 0, borderRadius: 'var(--radius-xs)' }}>
                      <option value="Lead">Lead</option><option value="Site Visit">Visit</option><option value="Negotiation">Negot.</option><option value="Closed">Closed</option><option value="Lost">Lost</option>
                    </select>
                    <button onClick={() => setExpanded(expanded === c.id ? null : c.id)} className="btn btn-secondary" style={{ padding: '5px 7px', fontSize: 11 }}>
                      {expanded === c.id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </button>
                    <button onClick={() => setDelTarget(c)} className="btn btn-secondary" style={{ padding: '5px 7px', fontSize: 11, color: 'var(--danger)' }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Expanded Detail */}
                {expanded === c.id && (
                  <div className="animate-fade-in" style={{
                    padding: '0 18px 14px',
                    borderBottom: idx < filtered.length - 1 ? '1px solid var(--border)' : 'none'
                  }}>
                    <div style={{
                      padding: '12px 14px', background: 'var(--bg-elevated)',
                      borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)'
                    }}>
                      <div className="flex gap-8 mb-12">
                        {c.phone && <a href={`tel:${c.phone}`} className="btn btn-secondary" style={{ padding: '5px 12px', fontSize: 11, flex: 1, textDecoration: 'none', justifyContent: 'center' }}><Phone size={13} /> Call</a>}
                        {c.phone && <a href={`https://wa.me/${fmtWA(c.phone)}`} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ padding: '5px 12px', fontSize: 11, color: 'var(--success)', flex: 1, textDecoration: 'none', justifyContent: 'center' }}><MessageCircle size={13} /> WhatsApp</a>}
                        {c.email && <a href={`mailto:${c.email}`} className="btn btn-secondary" style={{ padding: '5px 12px', fontSize: 11, flex: 1, textDecoration: 'none', justifyContent: 'center' }}><Mail size={13} /> Email</a>}
                      </div>
                      <div className="form-grid-2" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        <div><strong style={{ color: 'var(--text-tertiary)' }}>Email:</strong> {c.email || 'N/A'}</div>
                        <div><strong style={{ color: 'var(--text-tertiary)' }}>Type:</strong> {c.propertyType || 'N/A'}</div>
                        <div><strong style={{ color: 'var(--text-tertiary)' }}>Budget:</strong> {c.budget || 'N/A'}</div>
                        <div><strong style={{ color: 'var(--text-tertiary)' }}>Source:</strong> {c.leadSource || 'N/A'}</div>
                        <div style={{ gridColumn: '1 / -1' }}><strong style={{ color: 'var(--text-tertiary)' }}>Notes:</strong> {c.notes || 'N/A'}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Delete Confirmation */}
      {delTarget && (
        <div className="modal-overlay" onClick={() => setDelTarget(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: 'var(--danger-subtle)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px', border: '1px solid rgba(239,68,68,0.2)'
            }}>
              <Trash2 size={22} color="var(--danger)" />
            </div>
            <h2 style={{ textAlign: 'center', marginBottom: 4 }}>Delete Client</h2>
            <p style={{ textAlign: 'center', marginBottom: 20 }}>Are you sure you want to delete <strong style={{ color: 'var(--text-primary)' }}>{delTarget.name}</strong>?</p>
            <div className="flex" style={{ gap: 10 }}>
              <button className="btn btn-secondary flex-1" onClick={() => setDelTarget(null)}>Cancel</button>
              <button className="btn btn-danger flex-1" onClick={() => handleDel(delTarget.id)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Broadcast Modal */}
      {showBC && (
        <div className="modal-overlay" onClick={() => setShowBC(false)}>
          <div className="modal-content" style={{ maxWidth: 460 }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-20">
              <h2 style={{ margin: 0, fontSize: 18 }}>WhatsApp Broadcast</h2>
              <button onClick={() => setShowBC(false)} className="theme-toggle"><X size={18} /></button>
            </div>
            <div className="mb-16">
              <label className="form-label">Template</label>
              <div className="flex gap-8 flex-wrap">
                {TEMPLATES.map((t, i) => (
                  <button key={i} onClick={() => setBcMsg(t.text)}
                    style={{
                      padding: '5px 14px', borderRadius: 'var(--radius-full)',
                      border: `1px solid ${bcMsg === t.text ? 'var(--primary)' : 'var(--border)'}`,
                      background: bcMsg === t.text ? 'var(--primary)' : 'var(--surface-hover)',
                      color: bcMsg === t.text ? 'white' : 'var(--text-primary)',
                      cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit'
                    }}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Message ({'{name}'} = name)</label>
              <textarea className="form-input" rows="5" value={bcMsg} onChange={e => setBcMsg(e.target.value)} />
            </div>
            <div className="mb-16">
              <div className="flex items-center justify-between mb-8">
                <label className="form-label" style={{ margin: 0 }}>Clients ({selIds.length})</label>
                <button onClick={() => { const wp = filtered.filter(c => c.phone); setSelIds(selIds.length === wp.length ? [] : wp.map(c => c.id)); }}
                  style={{ fontSize: 12, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}>
                  Select All
                </button>
              </div>
              <div style={{ maxHeight: 180, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                {filtered.filter(c => c.phone).map(c => (
                  <div key={c.id} onClick={() => setSelIds(p => p.includes(c.id) ? p.filter(x => x !== c.id) : [...p, c.id])}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                      borderBottom: '1px solid var(--border)', cursor: 'pointer',
                      background: selIds.includes(c.id) ? 'var(--primary-subtle)' : 'transparent',
                      transition: 'background 150ms'
                    }}>
                    {selIds.includes(c.id) ? <CheckSquare size={16} color="var(--primary)" /> : <Square size={16} color="var(--text-tertiary)" />}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{c.phone}</div>
                    </div>
                    <span className="badge badge-blue">{c.status}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex" style={{ gap: 10 }}>
              <button className="btn btn-secondary flex-1" onClick={() => setShowBC(false)}>Cancel</button>
              <button className="btn btn-success flex-1" onClick={handleBCSend} disabled={!selIds.length || bcSending}>
                <Send size={15} /> {bcSending ? `${bcSent}/${selIds.length}` : `Send to ${selIds.length}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
