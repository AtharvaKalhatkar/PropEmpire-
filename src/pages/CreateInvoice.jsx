import { useState, useEffect } from 'react';
import { FileText, Home, Eye, MessageCircle, X, Check } from 'lucide-react';
import InvoiceTemplate from '../components/InvoiceTemplate';
import { generateInvoicePdfBlob, formatINR } from '../utils/invoiceTemplate';
import { saveInvoice, getProfile, getInvoices } from '../db';
import { downloadPdfBlob, viewPdfBlob } from '../utils/pdf';

const DF = { invoiceNo:'1', date:new Date().toISOString().split('T')[0], billedToName:'', billedToAddress:'', billedToGstin:'', customerName:'', customerPhone:'', customerEmail:'', projectName:'', tower:'', flatNo:'', agreementValue:0, brokeragePercent:3, executiveBonus:0 };

export default function CreateInvoice({ onNavigate, editingInvoice, setEditingInvoice }) {
  const [profile, setProfile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [form, setForm] = useState(DF);

  useEffect(() => {
    getProfile().then(d => setProfile(d || {agentName:'',email:'',mobile:'',reraNo:'',panNo:'',bankFavouringName:'',bankName:'',accountType:'Saving',accountNo:'',ifscCode:'',logoImage:''})).catch(()=>setProfile({}));
    if (!editingInvoice) {
      getInvoices().then(invs => {
        const nums = invs.map(i=>parseInt(i.invoiceNo,10)).filter(n=>!isNaN(n)&&n<1000);
        setForm(p=>({...p,invoiceNo:String(nums.length?Math.max(...nums)+1:invs.length+1)}));
      }).catch(()=>{});
    }
  }, []);

  useEffect(() => { if (editingInvoice) setForm(editingInvoice); }, [editingInvoice]);

  const chg = e => setForm(p=>({...p,[e.target.name]:e.target.value}));
  const broker = () => (Number(form.agreementValue)*Number(form.brokeragePercent))/100;
  const tot = () => broker()+Number(form.executiveBonus);

  const ensure = async () => {
    if (!form.customerName) { alert('Enter customer name'); return false; }
    try { const s = await saveInvoice(form); if (!form.id&&s?.id) setForm(p=>({...p,id:s.id})); return true; }
    catch(e) { alert('Failed: '+e.message); return false; }
  };

  const genBlob = async () => {
    if (!(await ensure())) return null;
    return generateInvoicePdfBlob({data:form,profile,brokerageAmount:broker(),totalAmount:tot(),executiveBonus:Number(form.executiveBonus)});
  };

  const handleGen = async () => {
    if (!form.customerName) { alert('Enter customer name'); return; }
    if (await ensure()) setShowModal(true);
  };

  const handleOpen = async () => { setGenerating(true); try { const b = await genBlob(); if(b) await viewPdfBlob(b, fname()); } catch(e) { console.error(e); alert('Failed to open PDF'); } finally { setGenerating(false); } };
  const fname = () => `Invoice_${(form.customerName||'PropEmpire').replace(/\s+/g,'_')}.pdf`;

  const handleWA = async () => {
    const p = form.customerPhone?.replace(/\D/g,'');
    const wa = `https://wa.me/${p?.length===10?'91'+p:p||''}?text=${encodeURIComponent('Hello '+form.customerName+',\n\nPlease find attached the invoice for '+form.projectName+'.\n\nRegards,\nPropEmpire')}`;
    setGenerating(true);
    const b = await genBlob();
    if (b) {
      const f = new File([b],fname(),{type:'application/pdf'});
      if (navigator.canShare?.({files:[f]})) await navigator.share({files:[f],title:'Invoice'});
      else { downloadPdfBlob(b,fname()); window.open(wa,'_blank'); }
    }
    setGenerating(false);
  };

  if (!profile) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40vh' }}>
      <div style={{
        width: 36, height: 36, border: '3px solid var(--border)',
        borderTopColor: 'var(--primary)', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-24">
        <div>
          <h1 style={{ fontSize: 26, margin: 0 }}>{editingInvoice ? 'Edit Invoice' : 'New Invoice'}</h1>
          <p style={{ margin: '2px 0 0' }}>Fill in the details below</p>
        </div>
        {editingInvoice && (
          <button className="btn btn-secondary" onClick={() => setEditingInvoice(null)} style={{ fontSize: 12, padding: '8px 14px' }}>
            <X size={14} /> Cancel
          </button>
        )}
      </div>

      {/* Invoice Info */}
      <div className="card mb-16">
        <div className="section-title">Invoice Details</div>
        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label">Invoice No.</label>
            <input type="text" className="form-input" name="invoiceNo" value={form.invoiceNo} onChange={chg} />
          </div>
          <div className="form-group">
            <label className="form-label">Date</label>
            <input type="date" className="form-input" name="date" value={form.date} onChange={chg} />
          </div>
        </div>
      </div>

      {/* Billed To */}
      <div className="card mb-16">
        <div className="section-title">Billed To</div>
        <div className="form-group">
          <label className="form-label">Developer Name</label>
          <input type="text" className="form-input" name="billedToName" value={form.billedToName} onChange={chg} placeholder="Enter developer name" />
        </div>
        <div className="form-group">
          <label className="form-label">Address</label>
          <textarea className="form-input" name="billedToAddress" rows="2" value={form.billedToAddress} onChange={chg} placeholder="Enter address" />
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">GSTIN</label>
          <input type="text" className="form-input" name="billedToGstin" value={form.billedToGstin} onChange={chg} placeholder="Enter GSTIN" />
        </div>
      </div>

      {/* Customer & Property */}
      <div className="card mb-16">
        <div className="section-title">Customer & Property</div>
        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label">Name *</label>
            <input type="text" className="form-input" name="customerName" value={form.customerName} onChange={chg} placeholder="Customer name" />
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input type="text" className="form-input" name="customerPhone" value={form.customerPhone} onChange={chg} placeholder="Phone number" />
          </div>
          <div className="form-group">
            <label className="form-label">Project</label>
            <input type="text" className="form-input" name="projectName" value={form.projectName} onChange={chg} placeholder="Project name" />
          </div>
          <div className="form-group">
            <label className="form-label">Tower</label>
            <input type="text" className="form-input" name="tower" value={form.tower} onChange={chg} placeholder="Tower" />
          </div>
          <div className="form-group">
            <label className="form-label">Flat No</label>
            <input type="text" className="form-input" name="flatNo" value={form.flatNo} onChange={chg} placeholder="Flat number" />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-input" name="customerEmail" value={form.customerEmail} onChange={chg} placeholder="Email address" />
          </div>
        </div>
      </div>

      {/* Financials */}
      <div className="card mb-20">
        <div className="section-title">Financials</div>
        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label">Agreement Value (₹)</label>
            <input type="number" className="form-input" name="agreementValue" value={form.agreementValue} onChange={chg} />
          </div>
          <div className="form-group">
            <label className="form-label">Brokerage (%)</label>
            <input type="number" step="0.1" className="form-input" name="brokeragePercent" value={form.brokeragePercent} onChange={chg} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Executive Bonus (₹)</label>
          <input type="number" className="form-input" name="executiveBonus" value={form.executiveBonus} onChange={chg} />
        </div>

        {/* Summary */}
        <div style={{
          marginTop: 16, padding: '14px 16px',
          background: 'var(--bg-elevated)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border)'
        }}>
          <div className="flex justify-between mb-8">
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Brokerage</span>
            <strong style={{ fontSize: 13 }}>₹{formatINR(broker())}</strong>
          </div>
          <div className="flex justify-between mb-8">
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Bonus</span>
            <strong style={{ fontSize: 13 }}>₹{formatINR(form.executiveBonus)}</strong>
          </div>
          <div className="flex justify-between" style={{ borderTop: '1px solid var(--border)', paddingTop: 10, marginTop: 4 }}>
            <strong style={{ fontSize: 15 }}>Total</strong>
            <strong className="amount" style={{ fontSize: 17 }}>₹{formatINR(tot())}</strong>
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <button className="btn btn-primary w-full" style={{
        padding: 14, fontSize: 15, fontWeight: 700,
        borderRadius: 'var(--radius)',
        background: 'linear-gradient(135deg, var(--primary), #4f46e5)',
        boxShadow: '0 4px 16px rgba(99, 102, 241, 0.3)'
      }} onClick={handleGen}>
        <FileText size={18} /> {editingInvoice ? 'Update & Generate' : 'Generate Invoice'}
      </button>

      {/* Hidden Invoice Template */}
      <div style={{ position: 'absolute', top: 0, left: '-10000px', pointerEvents: 'none' }}>
        <div id="printable-invoice" style={{ width: '904px', minWidth: '904px', height: '1280px', backgroundColor: '#fff' }}>
          <InvoiceTemplate data={form} profile={profile} brokerageAmount={broker()} totalAmount={tot()} executiveBonus={Number(form.executiveBonus)} />
        </div>
      </div>

      {/* Success Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ textAlign: 'center' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'var(--success)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 4px 16px rgba(34, 197, 94, 0.3)'
            }}>
              <Check size={28} color="white" strokeWidth={3} />
            </div>
            <h2 style={{ fontSize: 20, marginBottom: 4 }}>Invoice Created!</h2>
            <p style={{ marginBottom: 24, color: 'var(--text-secondary)' }}>Invoice #{form.invoiceNo} has been saved</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button className="btn btn-primary w-full" onClick={handleOpen} disabled={generating} style={{ padding: 12, fontSize: 14 }}>
                <Eye size={18} /> {generating ? 'Generating...' : 'Open PDF'}
              </button>
              <button className="btn btn-success w-full" onClick={handleWA} disabled={generating} style={{ padding: 12, fontSize: 14 }}>
                <MessageCircle size={18} /> WhatsApp
              </button>
              <button className="btn btn-secondary w-full" onClick={() => { setShowModal(false); setEditingInvoice?.(null); onNavigate('dashboard'); }} style={{ padding: 12, fontSize: 14 }}>
                <Home size={18} /> Home
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
