import { useState, useEffect } from 'react';
import { FileText, Download, Calendar, DollarSign, Eye, X, MessageCircle, Mail, Edit2, Trash2 } from 'lucide-react';
import { getInvoices, getProfile, deleteInvoice } from '../db';
import { generateInvoicePdfBlob, formatINR } from '../utils/invoiceTemplate';
import { downloadPdfBlob, viewPdfBlob } from '../utils/pdf';
import { exportRowsToXlsx } from '../utils/spreadsheet';

export default function Deals({ onEditInvoice }) {
  const [invoices, setInvoices] = useState([]);
  const [profile, setProfile] = useState(null);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [viewTarget, setViewTarget] = useState(null);
  const [generating, setGenerating] = useState(false);

  const load = () => getInvoices().then(setInvoices);
  useEffect(() => { load(); getProfile().then(p => setProfile(p || {})); }, []);

  const filtered = invoices.filter(i => i.date?.startsWith(month));
  const revenue = filtered.reduce((s, i) => s + ((Number(i.agreementValue) * Number(i.brokeragePercent)) / 100) + Number(i.executiveBonus), 0);
  const broker = i => (Number(i.agreementValue) * Number(i.brokeragePercent)) / 100;
  const total = i => broker(i) + Number(i.executiveBonus);

  const genPdf = async inv => {
    if (!profile) return null;
    return generateInvoicePdfBlob({ data: inv, profile, brokerageAmount: broker(inv), totalAmount: total(inv), executiveBonus: Number(inv.executiveBonus) });
  };

  const handleDownload = async inv => {
    setGenerating(true);
    try { const b = await genPdf(inv); if (b) downloadPdfBlob(b, `Invoice_${(inv.customerName||'').replace(/\s+/g,'_')}.pdf`); }
    catch { alert('Failed'); } finally { setGenerating(false); }
  };

  const handleView = async inv => {
    setGenerating(true);
    try { const b = await genPdf(inv); if (b) await viewPdfBlob(b, `Invoice_${(inv.customerName||'').replace(/\s+/g,'_')}.pdf`); }
    catch(e) { console.error(e); alert('Failed to view PDF'); } finally { setGenerating(false); }
  };

  const handleWA = async inv => {
    const p = inv.customerPhone?.replace(/\D/g, '');
    const wa = `https://wa.me/${p?.length===10?'91'+p:p||''}?text=${encodeURIComponent('Hello '+inv.customerName+',\n\nPlease find attached the invoice for '+inv.projectName+'.\n\nRegards,\nPropEmpire')}`;
    setGenerating(true);
    try {
      const b = await genPdf(inv);
      const f = new File([b], `Invoice_${(inv.customerName||'').replace(/\s+/g,'_')}.pdf`, {type:'application/pdf'});
      if (navigator.canShare?.({files:[f]})) await navigator.share({files:[f],title:'Invoice'});
      else { handleDownload(inv); window.open(wa,'_blank'); }
    } catch { handleDownload(inv); window.open(wa,'_blank'); } finally { setGenerating(false); }
  };

  const handleEmail = async inv => {
    const s = encodeURIComponent('Invoice for '+inv.projectName);
    const bd = encodeURIComponent('Hello '+inv.customerName+',\n\nPlease find attached the invoice.\n\nRegards,\n'+(profile?.agentName||'PropEmpire'));
    setGenerating(true);
    try {
      const b = await genPdf(inv);
      const f = new File([b], `Invoice_${(inv.customerName||'').replace(/\s+/g,'_')}.pdf`, {type:'application/pdf'});
      if (navigator.canShare?.({files:[f]})) await navigator.share({files:[f],title:'Invoice'});
      else { handleDownload(inv); window.location.href = 'mailto:'+(inv.customerEmail||'')+'?subject='+s+'&body='+bd; }
    } catch { handleDownload(inv); window.location.href = 'mailto:'+(inv.customerEmail||'')+'?subject='+s+'&body='+bd; } finally { setGenerating(false); }
  };

  const handleDelete = async inv => {
    if (!window.confirm(`Delete #${inv.invoiceNo} for ${inv.customerName}?`)) return;
    try { await deleteInvoice(inv.id); load(); } catch { alert('Failed'); }
  };

  const handleExport = () => {
    if (!filtered.length) return alert('No invoices');
    const d = filtered.map(i => ({'#':i.invoiceNo,'Date':i.date?new Date(i.date).toLocaleDateString('en-GB'):'','Customer':i.customerName,'Project':i.projectName,'Value':Number(i.agreementValue),'Brokerage %':i.brokeragePercent,'Brokerage':broker(i),'Bonus':Number(i.executiveBonus)||0,'Total':total(i)}));
    exportRowsToXlsx({rows:d,sheetName:'Invoices',fileName:`Invoices_${month}.xlsx`});
  };

  return (
    <div>
      <div className="mb-24">
        <h1 style={{ fontSize: 26, marginBottom: 2 }}>Deals</h1>
        <p style={{ margin: 0 }}>Track and manage your invoices</p>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-8 mb-20">
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--surface)', padding: '8px 14px',
          borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
          flex: 1
        }}>
          <Calendar size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
          <input type="month" value={month} onChange={e=>setMonth(e.target.value)}
            style={{
              border: 'none', outline: 'none', background: 'transparent',
              fontWeight: 600, fontSize: 13, color: 'var(--text-primary)',
              fontFamily: 'inherit', width: '100%'
            }} />
        </div>
        <button className="btn btn-secondary" onClick={handleExport} style={{ padding: '8px 14px', fontSize: 12 }}>
          <FileText size={14} /> Export
        </button>
      </div>

      {/* Revenue Card */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary), #4f46e5)',
        borderRadius: 'var(--radius)',
        padding: '20px',
        color: 'white',
        marginBottom: 20,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(99, 102, 241, 0.2)'
      }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
        <div className="flex items-center gap-12">
          <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 'var(--radius-sm)', padding: 10, display: 'flex' }}>
            <DollarSign size={22} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Revenue • {new Date(month+'-01').toLocaleString('default',{month:'short',year:'numeric'})}
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px', marginTop: 2 }}>
              ₹{formatINR(revenue)}
            </div>
          </div>
        </div>
      </div>

      {/* Invoice List */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div className="empty-state"><FileText size={36} strokeWidth={1} /><p>No invoices this month</p></div>
        ) : (
          filtered.map((inv, idx) => (
            <div key={inv.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '14px 18px',
              borderBottom: idx < filtered.length - 1 ? '1px solid var(--border)' : 'none',
              transition: 'background 150ms',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="flex items-center gap-8">
                  <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{inv.customerName}</span>
                  <span className="badge badge-blue">#{inv.invoiceNo}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 3 }}>
                  {inv.projectName} • {new Date(inv.date).toLocaleDateString('en-GB')}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
                <div className="amount" style={{ fontSize: 14 }}>₹{formatINR(total(inv))}</div>
                <div className="flex gap-8" style={{ marginTop: 6, justifyContent: 'flex-end' }}>
                  <button onClick={() => setViewTarget(inv)} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: 11 }}>
                    <Eye size={12} />
                  </button>
                  <button onClick={() => onEditInvoice?.(inv)} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: 11, color: 'var(--primary)' }}>
                    <Edit2 size={12} />
                  </button>
                  <button onClick={() => handleDelete(inv)} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: 11, color: 'var(--danger)' }}>
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* View Modal */}
      {viewTarget && profile && (
        <div className="modal-overlay" onClick={() => setViewTarget(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-20">
              <div>
                <h2 style={{ margin: 0, fontSize: 18 }}>Invoice #{viewTarget.invoiceNo}</h2>
                <p style={{ margin: '2px 0 0', fontSize: 12 }}>{viewTarget.customerName} • {viewTarget.projectName}</p>
              </div>
              <button onClick={() => setViewTarget(null)} className="theme-toggle">
                <X size={18} />
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button className="btn btn-primary" onClick={() => handleDownload(viewTarget)} disabled={generating} style={{ fontSize: 13 }}>
                <Download size={16} /> Save PDF
              </button>
              <button className="btn btn-secondary" onClick={() => handleView(viewTarget)} disabled={generating} style={{ fontSize: 13, color: 'var(--warning)' }}>
                <Eye size={16} /> View
              </button>
              <button className="btn btn-success" onClick={() => handleWA(viewTarget)} disabled={generating} style={{ fontSize: 13 }}>
                <MessageCircle size={16} /> WhatsApp
              </button>
              <button className="btn btn-secondary" onClick={() => handleEmail(viewTarget)} disabled={generating} style={{ fontSize: 13 }}>
                <Mail size={16} /> Email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {generating && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ textAlign: 'center', padding: '40px 28px' }}>
            <div style={{
              width: 40, height: 40, border: '3px solid var(--border)',
              borderTopColor: 'var(--primary)', borderRadius: '50%',
              animation: 'spin 0.8s linear infinite', margin: '0 auto 16px'
            }} />
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Generating PDF...</p>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
