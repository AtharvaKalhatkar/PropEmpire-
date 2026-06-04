import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Printer, FileText } from 'lucide-react';
import InvoicePreview from '../components/InvoicePreview';
import { saveInvoice, getProfile, getInvoices } from '../db';
import { generatePdfBlobFromElement, downloadPdfBlob } from '../utils/pdf';

export default function CreateInvoice({ onNavigate }) {
  const [mode, setMode] = useState('edit');
  const [profile, setProfile] = useState(null);
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
    getProfile().then(setProfile);
    getInvoices().then(invoices => {
      // Auto-increment invoice number based on existing
      if (invoices.length > 0) {
        setFormData(prev => ({ ...prev, invoiceNo: (invoices.length + 1).toString() }));
      }
    });
  }, []);

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

  const handlePreview = async () => {
    try {
      // Auto-save when previewing
      await saveInvoice(formData);
      setMode('preview');
    } catch (error) {
      alert("Failed to save invoice to database: " + error.message);
    }
  };

  const getFileName = () => {
    return `Invoice_${formData.customerName.replace(/\s+/g, '_') || 'PropEmpire'}.pdf`;
  };

  const handleSavePdf = async () => {
    const blob = await generatePdfBlobFromElement('printable-invoice');
    if (blob) {
      downloadPdfBlob(blob, getFileName());
    }
  };

  const handleOpenPdf = async () => {
    const blob = await generatePdfBlobFromElement('printable-invoice');
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
      const blob = await generatePdfBlobFromElement('printable-invoice');
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
      const blob = await generatePdfBlobFromElement('printable-invoice');
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
    }
  };

  if (!profile) return <div>Loading...</div>;

  if (mode === 'preview') {
    return (
      <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <button className="btn btn-secondary" onClick={() => setMode('edit')}>
            <ArrowLeft size={16} /> Edit
          </button>
          <button className="btn btn-primary" onClick={handleSavePdf}>
            <Printer size={16} /> Save as PDF
          </button>
          <button className="btn btn-primary" onClick={handleOpenPdf} style={{ backgroundColor: '#f59e0b', borderColor: '#f59e0b' }}>
            <FileText size={16} /> Open PDF
          </button>
          <button onClick={handleShareWhatsApp} className="btn btn-secondary" style={{ backgroundColor: '#25D366', color: 'white', borderColor: '#25D366' }}>
            WhatsApp
          </button>
          <button onClick={handleShareEmail} className="btn btn-secondary">
            Email
          </button>
        </div>
        
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem', textAlign: 'center' }}>
          * Tip: Click "Save as PDF", then send it as an attachment via WhatsApp/Email.
        </p>
        
        <div style={{ overflowX: 'auto', background: 'var(--surface-color)', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)' }}>
          <div id="printable-invoice" style={{ width: '800px' }}>
            <InvoicePreview 
              data={formData} 
              profile={profile}
              brokerageAmount={calculateBrokerage()} 
              totalAmount={calculateTotal()} 
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0 }}>Create Invoice</h1>
        <button className="btn btn-primary" onClick={handlePreview}>
          Preview <ArrowRightIcon />
        </button>
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
            <label className="form-label">Customer Email (For Email Sending)</label>
            <input type="email" className="form-input" name="customerEmail" value={formData.customerEmail} onChange={handleChange} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>* Phone & Email won't be displayed on the final invoice PDF.</span>
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
            <strong>₹ {calculateBrokerage().toLocaleString('en-IN')}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span>Executive Bonus:</span>
            <strong>₹ {Number(formData.executiveBonus).toLocaleString('en-IN')}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '1rem', fontSize: '1.25rem' }}>
            <strong>Total Amount:</strong>
            <strong style={{ color: 'var(--primary-blue)' }}>₹ {calculateTotal().toLocaleString('en-IN')}</strong>
          </div>
        </div>
      </div>
      
      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', paddingBottom: '5rem' }}>
        <button className="btn btn-primary" style={{ width: '100%', maxWidth: '300px' }} onClick={handlePreview}>
          Preview Invoice
        </button>
      </div>
    </div>
  );
}

const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
);
