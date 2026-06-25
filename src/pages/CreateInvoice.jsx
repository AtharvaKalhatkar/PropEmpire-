import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Printer, FileText, Home } from 'lucide-react';
import InvoiceTemplate from '../components/InvoiceTemplate';
import { generateInvoicePdfBlob, formatINR } from '../utils/invoiceTemplate';
import { saveInvoice, getProfile, getInvoices } from '../db';
import { downloadPdfBlob } from '../utils/pdf';
import { Download, Share2, MessageCircle, X } from 'lucide-react';

export default function CreateInvoice({ onNavigate, editingInvoice, setEditingInvoice }) {
  const [profile, setProfile] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [formData, setFormData] = useState({
    invoiceNo: '1',
    date: new Date().toISOString().split('T')[0],
    billedToName: '',
    billedToAddress: '',
    billedToGstin: '',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    projectName: '',
    tower: '',
    flatNo: '',
    agreementValue: 0,
    brokeragePercent: 3,
    executiveBonus: 0
  });

  useEffect(() => {
    getProfile().then(data => {
      setProfile(data || {
        agentName: '', email: '', mobile: '',
        reraNo: '', panNo: '',
        bankFavouringName: '', bankName: '',
        accountType: 'Saving', accountNo: '', ifscCode: '',
        logoImage: ''
      });
    }).catch(() => {
      setProfile({
        agentName: '', email: '', mobile: '',
        reraNo: '', panNo: '',
        bankFavouringName: '', bankName: '',
        accountType: 'Saving', accountNo: '', ifscCode: '',
        logoImage: ''
      });
    });
    getInvoices().then(invoices => {
      // Auto-increment invoice number based on existing ONLY if not editing
      if (!editingInvoice) {
        // Only consider simple numeric invoice numbers (ignore old 26xxx format)
        const simpleNums = invoices
          .map(inv => parseInt(inv.invoiceNo, 10))
          .filter(n => !isNaN(n) && n < 1000);
        const nextNo = simpleNums.length > 0 ? Math.max(...simpleNums) + 1 : invoices.length + 1;
        setFormData(prev => ({ ...prev, invoiceNo: String(nextNo) }));
      }
    }).catch(() => {});
  }, [editingInvoice]);

  useEffect(() => {
    if (editingInvoice) {
      setFormData(editingInvoice);
    }
  }, [editingInvoice]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const calculateBrokerage = () => {
    return (Number(formData.agreementValue) * Number(formData.brokeragePercent)) / 100;
  };

  const calculateTotal = () => {
    return calculateBrokerage() + Number(formData.executiveBonus);
  };

  const ensureSaved = async () => {
    if (!formData.customerName) {
      alert("Please enter at least a Customer Name before saving or exporting.");
      return false;
    }
    try {
      const saved = await saveInvoice(formData);
      if (!formData.id && saved?.id) {
        setFormData(prev => ({ ...prev, id: saved.id }));
      }
      return true;
    } catch (error) {
      alert("Failed to save invoice to database: " + error.message);
      return false;
    }
  };

  const handleGenerateClick = async () => {
    if (!formData.customerName) {
      alert("Please enter at least a Customer Name before generating.");
      return;
    }
    const saved = await ensureSaved();
    if (saved) {
      setShowActionModal(true);
    }
  };

  const handleSaveToDeals = async () => {
    if (await ensureSaved()) {
      alert("Invoice saved to Deals successfully!");
    }
  };

  const getFileName = () => {
    return `Invoice_${formData.customerName.replace(/\s+/g, '_') || 'PropEmpire'}.pdf`;
  };

  const handleSavePdf = async () => {
    if (!(await ensureSaved())) return;
    const blob = await generateInvoicePdfBlob({
      data: formData,
      profile,
      brokerageAmount: calculateBrokerage(),
      totalAmount: calculateTotal(),
      executiveBonus: Number(formData.executiveBonus),
    });
    if (blob) {
      downloadPdfBlob(blob, getFileName());
    }
  };

  const handleOpenPdf = async () => {
    if (!(await ensureSaved())) return;
    const blob = await generateInvoicePdfBlob({
      data: formData,
      profile,
      brokerageAmount: calculateBrokerage(),
      totalAmount: calculateTotal(),
      executiveBonus: Number(formData.executiveBonus),
    });
    if (blob) {
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    }
  };

  const handleShareWhatsApp = async (e) => {
    e.preventDefault();
    const digits = formData.customerPhone.replace(/\D/g, '');
    const phone = digits.length === 10 ? `91${digits}` : digits;
    const text = `Hello ${formData.customerName},\n\nPlease find attached the invoice for ${formData.projectName}.\n\nRegards,\nPropEmpire`;
    const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;

    try {
      if (!(await ensureSaved())) return;
      const blob = await generateInvoicePdfBlob({
        data: formData,
        profile,
        brokerageAmount: calculateBrokerage(),
        totalAmount: calculateTotal(),
        executiveBonus: Number(formData.executiveBonus),
      });
      const file = new File([blob], getFileName(), { type: 'application/pdf' });
      
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Invoice',
          text: text
        });
        console.log('Shared successfully');
      } else {
        // Fallback: Download PDF automatically, then open WhatsApp web
        handleSavePdf();
        window.open(waUrl, '_blank');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Final fallback
      handleSavePdf();
      window.open(waUrl, '_blank');
    }
  };

  const handleShareEmail = async (e) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Invoice for ${formData.projectName}`);
    const body = encodeURIComponent(`Hello ${formData.customerName},\n\nPlease find the attached invoice for your reference.\n\nRegards,\n${profile?.agentName || 'PropEmpire'}`);
    const emailUrl = `mailto:${formData.customerEmail}?subject=${subject}&body=${body}`;

    try {
      if (!(await ensureSaved())) return;
      const blob = await generateInvoicePdfBlob({
        data: formData,
        profile,
        brokerageAmount: calculateBrokerage(),
        totalAmount: calculateTotal(),
        executiveBonus: Number(formData.executiveBonus),
      });
      const file = new File([blob], getFileName(), { type: 'application/pdf' });
      
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Invoice',
          text: `Invoice for ${formData.projectName}`
        });
      } else {
        // Fallback: Download PDF and open mailto
        handleSavePdf();
        window.location.href = emailUrl;
      }
    } catch (error) {
      handleSavePdf();
      window.location.href = emailUrl;
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleCloseModal = () => {
    setShowActionModal(false);
  };

  if (!profile) return <div>Loading...</div>;

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '2rem', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0 }}>{editingInvoice ? 'Edit Invoice' : 'Create Invoice'}</h1>
        {editingInvoice && (
          <button className="btn btn-secondary" onClick={() => setEditingInvoice(null)}>
            Cancel Edit
          </button>
        )}
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Invoice Details</h2>
        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label">Invoice No.</label>
            <input type="text" className="form-input" name="invoiceNo" value={formData.invoiceNo} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Date</label>
            <input type="date" className="form-input" name="date" value={formData.date} onChange={handleChange} />
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Billed To (Developer)</h2>
        <div className="form-group">
          <label className="form-label">Company / Developer Name</label>
          <input type="text" className="form-input" name="billedToName" value={formData.billedToName || ''} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label className="form-label">Address</label>
          <textarea className="form-input" name="billedToAddress" rows="3" value={formData.billedToAddress || ''} onChange={handleChange}></textarea>
        </div>
        <div className="form-group">
          <label className="form-label">GSTIN</label>
          <input type="text" className="form-input" name="billedToGstin" value={formData.billedToGstin} onChange={handleChange} />
        </div>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Particulars (Client & Property)</h2>
        <div className="form-grid-2" style={{ marginBottom: '1rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Customer Name</label>
            <input type="text" className="form-input" name="customerName" value={formData.customerName} onChange={handleChange} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Customer Phone (For WhatsApp)</label>
            <input type="text" className="form-input" name="customerPhone" value={formData.customerPhone} onChange={handleChange} />
          </div>
          <div className="form-group" style={{ marginBottom: 0, gridColumn: '1 / -1' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>* Phone won't be displayed on the final invoice PDF.</span>
          </div>
        </div>
        <div className="form-grid-3">
          <div className="form-group">
            <label className="form-label">Project Name</label>
            <input type="text" className="form-input" name="projectName" value={formData.projectName} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Tower</label>
            <input type="text" className="form-input" name="tower" value={formData.tower} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Flat No</label>
            <input type="text" className="form-input" name="flatNo" value={formData.flatNo} onChange={handleChange} />
          </div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Financials</h2>
        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label">Agreement Value (₹)</label>
            <input type="number" className="form-input" name="agreementValue" value={formData.agreementValue} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Brokerage (%)</label>
            <input type="number" step="0.1" className="form-input" name="brokeragePercent" value={formData.brokeragePercent} onChange={handleChange} />
          </div>
        </div>
        <div className="form-group" style={{ marginTop: '1rem' }}>
          <label className="form-label">Executive Bonus (₹)</label>
          <input type="number" className="form-input" name="executiveBonus" value={formData.executiveBonus} onChange={handleChange} />
        </div>
        
        <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span>Brokerage Amount:</span>
            <strong>₹ {formatINR(calculateBrokerage())}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span>Executive Bonus:</span>
            <strong>₹ {formatINR(formData.executiveBonus)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '1rem', fontSize: '1.25rem' }}>
            <strong>Total Amount:</strong>
            <strong style={{ color: 'var(--primary-blue)' }}>₹ {formatINR(calculateTotal())}</strong>
          </div>
        </div>
      </div>
      
      {/* Action Button */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
        <button className="btn btn-primary" style={{ width: '100%', fontSize: '1.125rem', padding: '0.875rem' }} onClick={handleGenerateClick}>
          {editingInvoice ? 'Update & Generate Invoice' : 'Generate Invoice'}
        </button>
      </div>

      {/* Hidden container for PDF rendering */}
      <div style={{ position: 'absolute', top: '0', left: '-10000px', pointerEvents: 'none' }}>
        <div id="printable-invoice" style={{ width: '904px', minWidth: '904px', height: '1280px', boxSizing: 'border-box', backgroundColor: '#ffffff' }}>
          <InvoiceTemplate 
            data={formData} 
            profile={profile}
            brokerageAmount={calculateBrokerage()} 
            totalAmount={calculateTotal()}
            executiveBonus={Number(formData.executiveBonus)}
          />
        </div>
      </div>

      {/* Invoice Created Success Modal - Full screen fixed overlay */}
      {showActionModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', overflow: 'hidden' }}>
          <div className="animate-fade-in card" style={{ width: '100%', maxWidth: '400px', padding: '2rem', textAlign: 'center', margin: '0 auto' }}>
            
            {/* Success Icon */}
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto', boxShadow: '0 8px 20px rgba(16,185,129,0.3)' }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            
            <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem' }}>Invoice Created!</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.75rem', fontSize: '0.9rem' }}>Invoice #{formData.invoiceNo} for {formData.customerName} has been saved successfully.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button className="btn btn-primary" onClick={handleOpenPdf} disabled={isGeneratingPdf} style={{ width: '100%', padding: '0.875rem', fontSize: '1rem', justifyContent: 'center' }}>
                <FileText size={20} style={{ marginRight: '0.75rem' }} /> {isGeneratingPdf ? 'Generating...' : 'Open as PDF'}
              </button>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button className="btn btn-secondary" onClick={handleShareWhatsApp} disabled={isGeneratingPdf} style={{ padding: '0.875rem', fontSize: '0.9rem', justifyContent: 'center', backgroundColor: '#f0fdf4', borderColor: '#bbf7d0', color: '#16a34a' }}>
                  <MessageCircle size={18} style={{ marginRight: '0.5rem' }} /> WhatsApp
                </button>
              </div>
              
              <button className="btn btn-secondary" onClick={() => { setShowActionModal(false); if (setEditingInvoice) setEditingInvoice(null); onNavigate('dashboard'); }} style={{ width: '100%', padding: '0.875rem', fontSize: '1rem', justifyContent: 'center', marginTop: '0.25rem' }}>
                <Home size={20} style={{ marginRight: '0.75rem' }} /> Go to Home
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
