import { useState, useEffect } from 'react';
import { MapPin, Plus, Phone, Trash2, Search, MessageCircle, Calendar, FileText, ChevronDown, ChevronUp, Filter, X, CheckSquare, Square } from 'lucide-react';
import { getVisitedClients, saveVisitedClient, deleteVisitedClient } from '../db';
import { exportRowsToXlsx, exportRowsToCsv } from '../utils/spreadsheet';

const IF = { visit_date:new Date().toISOString().split('T')[0], name:'', phone:'', project:'', properties:[], budget:'', notes:'' };
const PROPS = ['1 BHK','2 BHK','3 BHK','4 BHK','Villa','Plot','Commercial'];

export default function VisitedClients() {
  const [clients, setClients] = useState([]);
  const [adding, setAdding] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [search, setSearch] = useState('');
  const [dF, setDF] = useState('');
  const [dT, setDT] = useState('');
  const [form, setForm] = useState(IF);
  const [delTarget, setDelTarget] = useState(null);

  const load = () => getVisitedClients().then(setClients);
  useEffect(() => { load(); }, []);

  const filtered = clients.filter(c => {
    const ms = c.name.toLowerCase().includes(search.toLowerCase()) || (c.phone&&c.phone.includes(search));
    let md = true;
    if (dF||dT) {
      const d = new Date(c.visit_date); d.setHours(0,0,0,0);
      if (dF) { const f=new Date(dF); f.setHours(0,0,0,0); if (d<f) md=false; }
      if (dT) { const t=new Date(dT); t.setHours(0,0,0,0); if (d>t) md=false; }
    }
    return ms&&md;
  });

  const handleAdd = async e => {
    e.preventDefault();
    if (!form.name) return;
    try { await saveVisitedClient({...form,properties:JSON.stringify(form.properties)}); setForm(IF); setAdding(false); load(); }
    catch { alert('Failed'); }
  };

  const handleDel = async id => {
    try { await deleteVisitedClient(id); setDelTarget(null); load(); }
    catch { alert('Failed'); }
  };

  const toggleP = o => setForm(p=>({...p,properties:p.properties.includes(o)?p.properties.filter(x=>x!==o):[...p.properties,o]}));

  const fmtWA = p => { const d=p.replace(/\D/g,''); return d.length===10?'91'+d:d; };

  const renderP = d => {
    let a=[];
    if (Array.isArray(d)) a=d;
    else if (typeof d==='string') { try { a=JSON.parse(d); if(!Array.isArray(a)) a=[d]; } catch { a=[d]; } }
    return a.length?a.map((p,i)=><span key={i} className="badge badge-blue" style={{marginRight:4,marginBottom:4}}>{p}</span>):<span style={{ color: 'var(--text-tertiary)', fontSize: 12 }}>N/A</span>;
  };

  const doExport = fmt => {
    if (!clients.length) return alert('No data');
    const d = clients.map((c,i)=>{
      let p='';
      if (Array.isArray(c.properties)) p=c.properties.join(', ');
      else if (typeof c.properties==='string') { try { const x=JSON.parse(c.properties); p=Array.isArray(x)?x.join(', '):c.properties; } catch { p=c.properties; } }
      return {'#':i+1,'Date':c.visit_date?new Date(c.visit_date).toLocaleDateString('en-GB'):'','Name':c.name,'Phone':c.phone||'','Project':c.project||'','Properties':p,'Budget':c.budget||'','Notes':c.notes||''};
    });
    if (fmt==='csv') exportRowsToCsv({rows:d,fileName:'PropEmpire_Visited.csv'});
    else exportRowsToXlsx({rows:d,sheetName:'Visited Clients',fileName:'PropEmpire_Visited.xlsx'});
  };

  return (
    <div>
      <div className="mb-24">
        <h1 style={{ fontSize: 26, marginBottom: 2 }}>Site Visits</h1>
        <p style={{ margin: 0 }}>{clients.length} visits logged</p>
      </div>

      {/* Export & Add */}
      <div className="flex gap-8 mb-16">
        <button className="btn btn-secondary flex-1" onClick={()=>doExport('csv')} style={{ padding: 10, fontSize: 12, justifyContent: 'center' }}>
          <FileText size={14} /> CSV
        </button>
        <button className="btn btn-secondary flex-1" onClick={()=>doExport('xlsx')} style={{ padding: 10, fontSize: 12, justifyContent: 'center' }}>
          <FileText size={14} /> Excel
        </button>
      </div>

      <button className="btn btn-primary w-full mb-16" onClick={()=>setAdding(!adding)} style={{
        padding: 12, justifyContent: 'center', fontSize: 14, fontWeight: 600,
        background: 'linear-gradient(135deg, var(--primary), #4f46e5)',
        boxShadow: '0 4px 16px rgba(99, 102, 241, 0.25)',
        borderRadius: 'var(--radius)'
      }}>
        <Plus size={18} /> Log New Visit
      </button>

      {/* Search */}
      <div className="search-input-wrap"><Search size={16} /><input className="form-input" placeholder="Search visits..." value={search} onChange={e=>setSearch(e.target.value)} /></div>

      {/* Date Filter */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: 'var(--surface)', padding: '8px 14px',
        borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
        marginBottom: 20
      }}>
        <Filter size={14} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
        <input type="date" value={dF} onChange={e=>setDF(e.target.value)} style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 12, color: 'var(--text-primary)', fontFamily: 'inherit', flex: 1 }} />
        <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>to</span>
        <input type="date" value={dT} onChange={e=>setDT(e.target.value)} style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 12, color: 'var(--text-primary)', fontFamily: 'inherit', flex: 1 }} />
        {(dF||dT)&&<button onClick={()=>{setDF('');setDT('');}} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', display: 'flex' }}><X size={14} /></button>}
      </div>

      {/* Add Form */}
      {adding&&(
        <form className="card mb-16 animate-fade-in" onSubmit={handleAdd}>
          <div className="section-title">New Site Visit</div>
          <div className="form-grid-2">
            <div className="form-group"><label className="form-label">Date *</label><input type="date" className="form-input" value={form.visit_date} onChange={e=>setForm({...form,visit_date:e.target.value})} required /></div>
            <div className="form-group"><label className="form-label">Name *</label><input type="text" className="form-input" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required placeholder="Client name" /></div>
            <div className="form-group"><label className="form-label">Phone *</label><input type="text" className="form-input" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="Phone number" /></div>
            <div className="form-group"><label className="form-label">Project</label><input type="text" className="form-input" value={form.project} onChange={e=>setForm({...form,project:e.target.value})} placeholder="Project name" /></div>
            <div className="form-group" style={{gridColumn:'1 / -1'}}>
              <label className="form-label">Properties Showed</label>
              <div className="flex gap-8 flex-wrap" style={{marginTop:6}}>
                {PROPS.map(o=>{
                  const s=form.properties.includes(o);
                  return (
                    <div key={o} onClick={()=>toggleP(o)} style={{
                      display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer',
                      padding: '6px 12px', borderRadius: 'var(--radius-full)',
                      border: `1px solid ${s ? 'var(--primary)' : 'var(--border)'}`,
                      background: s ? 'var(--primary-subtle)' : 'transparent',
                      fontSize: 12, fontWeight: 600, color: s ? 'var(--primary)' : 'var(--text-secondary)',
                      transition: 'all 150ms'
                    }}>
                      {s?<CheckSquare size={13} />:<Square size={13} />}
                      <span>{o}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="form-group"><label className="form-label">Budget</label><input type="text" className="form-input" value={form.budget} onChange={e=>setForm({...form,budget:e.target.value})} placeholder="Budget range" /></div>
            <div className="form-group" style={{gridColumn:'1 / -1'}}><label className="form-label">Notes</label><textarea className="form-input" rows="2" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Visit notes..." /></div>
          </div>
          <div className="flex" style={{gap:10}}>
            <button type="button" className="btn btn-secondary flex-1" onClick={()=>setAdding(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary flex-1">Save Visit</button>
          </div>
        </form>
      )}

      {/* Visit Cards */}
      <div style={{display:'flex',flexDirection:'column',gap:12}}>
        {filtered.length===0?(
          <div className="empty-state" style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 40 }}>
            <MapPin size={36} strokeWidth={1} />
            <p>{clients.length===0?'No visits yet':'No matches'}</p>
          </div>
        ):filtered.map(c=>(
          <div key={c.id} className="card" style={{ padding: 16, transition: 'border-color 200ms' }}>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-8">
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  background: 'var(--primary-subtle)', padding: '4px 10px',
                  borderRadius: 'var(--radius-full)', border: '1px solid rgba(99,102,241,0.12)',
                  fontSize: 11, fontWeight: 600, color: 'var(--primary)'
                }}>
                  <Calendar size={11} /> {new Date(c.visit_date).toLocaleDateString('en-GB')}
                </div>
              </div>
              <div className="flex gap-8">
                <button onClick={()=>setExpanded(expanded===c.id?null:c.id)} className="btn btn-secondary" style={{padding:'5px 7px',fontSize:11}}>
                  {expanded===c.id?<ChevronUp size={13}/>:<ChevronDown size={13}/>}
                </button>
                <button onClick={()=>setDelTarget(c)} className="btn btn-secondary" style={{padding:'5px 7px',fontSize:11,color:'var(--danger)'}}>
                  <Trash2 size={13}/>
                </button>
              </div>
            </div>
            <div style={{fontWeight:700,fontSize:15,marginBottom:3,color:'var(--text-primary)'}}>{c.name}</div>
            {c.project&&<div className="flex items-center gap-8" style={{fontSize:12,color:'var(--text-secondary)',marginBottom:10}}>
              <MapPin size={12}/> {c.project}
            </div>}
            <div className="flex gap-8">
              {c.phone&&<>
                <a href={`tel:${c.phone}`} className="btn btn-secondary" style={{padding:'7px 14px',fontSize:12,flex:1,textDecoration:'none',justifyContent:'center'}}>
                  <Phone size={13}/> Call
                </a>
                <a href={`https://wa.me/${fmtWA(c.phone)}`} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{
                  padding:'7px 14px',fontSize:12,flex:1,textDecoration:'none',justifyContent:'center',
                  color:'var(--success)',borderColor:'rgba(34,197,94,0.2)',background:'var(--success-subtle)'
                }}>
                  <MessageCircle size={13}/> WhatsApp
                </a>
              </>}
            </div>
            {expanded===c.id&&(
              <div className="animate-fade-in" style={{
                marginTop:14,paddingTop:14,borderTop:'1px solid var(--border)',fontSize:12
              }}>
                <div className="form-grid-2">
                  <div><strong style={{color:'var(--text-tertiary)'}}>Properties:</strong><div className="mt-8">{renderP(c.properties)}</div></div>
                  <div><strong style={{color:'var(--text-tertiary)'}}>Budget:</strong><div className="mt-8" style={{color:'var(--text-secondary)'}}>{c.budget||'N/A'}</div></div>
                  <div style={{gridColumn:'1 / -1'}}><strong style={{color:'var(--text-tertiary)'}}>Notes:</strong><div className="mt-8" style={{color:'var(--text-secondary)'}}>{c.notes||'N/A'}</div></div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Delete Modal */}
      {delTarget&&(
        <div className="modal-overlay" onClick={()=>setDelTarget(null)}>
          <div className="modal-content" onClick={e=>e.stopPropagation()}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: 'var(--danger-subtle)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px', border: '1px solid rgba(239,68,68,0.2)'
            }}>
              <Trash2 size={22} color="var(--danger)" />
            </div>
            <h2 style={{textAlign:'center',marginBottom:4}}>Delete Visit</h2>
            <p style={{textAlign:'center',marginBottom:20}}>Delete visit for <strong style={{color:'var(--text-primary)'}}>{delTarget.name}</strong>?</p>
            <div className="flex" style={{gap:10}}>
              <button className="btn btn-secondary flex-1" onClick={()=>setDelTarget(null)}>Cancel</button>
              <button className="btn btn-danger flex-1" onClick={()=>handleDel(delTarget.id)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
