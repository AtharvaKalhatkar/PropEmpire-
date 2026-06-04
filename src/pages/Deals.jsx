import { useState, useEffect } from 'react';
import { FileText, Download, Calendar, DollarSign, Eye, X, Printer, MessageCircle, Mail } from 'lucide-react';
import { getInvoices, getProfile } from '../db';
import InvoicePreview from '../components/InvoicePreview';
import { generatePdfBlobFromElement, downloadPdfBlob } from '../utils/pdf';

export default function Deals() {
  const [invoices, setInvoices] = useState([]);
  const [profile, setProfile] = useState(null);
  
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  
  const [viewingInvoice, setViewingInvoice] = useState(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  useEffect(() => {
    getInvoices().then(setInvoices);
    getProfile().then(setProfile);
  }, []);

  // Filter invoices based on selected month (YYYY-MM format)
  const filteredInvoices = invoices.filter(inv => {
    if (!inv.date) return false;
    return inv.date.startsWith(selectedMonth);
  });

  // Calculate revenue for filtered month
  const totalRevenue = filteredInvoices.reduce((sum, inv) => {
    const broker = (Number(inv.agreementValue) * Number(inv.brokeragePercent)) / 100;
    return sum + broker + Number(inv.executiveBonus);
  }, 0);

  const calculateBrokerage = (inv) => {
    return (Number(inv.agreementValue) * Number(inv.brokeragePercent)) / 100;
  };

  const calculateTotal = (inv) => {
    return calculateBrokerage(inv) + Number(inv.executiveBonus);
  };

  const getFileName = (inv) => {
    return `Invoice_${inv.customerName.replace(/\s+/g, '_') || 'PropEmpire'}.pdf`;
  };

  const handleDownloadPdf = async (invoice) => {
    setIsGeneratingPdf(true);
    try {
      const blob = await generatePdfBlobFromElement('printable-invoice-modal');
      if (blob) {
        const fileName = `Invoice_${invoice.customerName.replace(/\s+/g, '_') || 'PropEmpire'}.pdf`;
        downloadPdfBlob(blob, fileName);
      }
    } catch (e) {
      console.error("Error generating PDF:", e);
      alert("Failed to generate PDF.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleOpenPdf = async (invoice) => {
    setIsGeneratingPdf(true);
    try {
      const blob = await generatePdfBlobFromElement('printable-invoice-modal');
      if (blob) {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      }
    } catch (e) {
      console.error("Error generating PDF:", e);
      alert("Failed to generate PDF.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleShareWhatsApp = async (invoice) => {
    const digits = invoice.customerPhone ? invoice.customerPhone.replace(/\D/g, '') : '';
    const phone = digits.length === 10 ? `91${digits}` : digits;
    const text = `Hello ${invoice.customerName},\n\nPlease find attached the invoice for ${invoice.projectName}.\n\nRegards,\nPropEmpire`;
    const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;

    setIsGeneratingPdf(true);
    try {
      const blob = await generatePdfBlobFromElement('printable-invoice-modal');
      const file = new File([blob], getFileName(invoice), { type: 'application/pdf' });
      
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Invoice', text: text });
      } else {
        handleDownloadPdf(invoice);
        window.open(waUrl, '_blank');
      }
    } catch (error) {
      handleDownloadPdf(invoice);
      window.open(waUrl, '_blank');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleShareEmail = async (invoice) => {
    const subject = encodeURIComponent(`Invoice for ${invoice.projectName}`);
    const body = encodeURIComponent(`Hello ${invoice.customerName},\n\nPlease find the attached invoice for your reference.\n\nRegards,\n${profile?.agentName || 'PropEmpire'}`);
    const emailUrl = `mailto:${invoice.customerEmail || ''}?subject=${subject}&body=${body}`;

    setIsGeneratingPdf(true);
    try {
      const blob = await generatePdfBlobFromElement('printable-invoice-modal');
      const file = new File([blob], getFileName(invoice), { type: 'application/pdf' });
      
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Invoice', text: `Invoice for ${invoice.projectName}` });
      } else {
        handleDownloadPdf(invoice);
        window.location.href = emailUrl;
      }
    } catch (error) {
      handleDownloadPdf(invoice);
      window.location.href = emailUrl;
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ margin: 0 }}>Deals & Bills</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--surface-color)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)' }}>
          <Calendar size={18} color="var(--primary-blue)" />
          <input 
            type="month" 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{ border: 'none', outline: 'none', background: 'transparent', fontWeight: 'bold', color: 'var(--text-main)', fontSize: '1rem' }}
          />
        </div>
      </div>

      <div className="card" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--gradient-primary)', color: 'white' }}>
        <div style={{ background: 'rgba(255,255,255,0.2)', padding: '1rem', borderRadius: '50%' }}>
          <DollarSign size={32} />
        </div>
        <div>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-light)', opacity: 0.9 }}>Total Revenue ({new Date(selectedMonth + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })})</p>
          <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: '800', color: 'white' }}>₹ {totalRevenue.toLocaleString('en-IN')}</h2>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {filteredInvoices.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <FileText size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
            <p>No bills generated in this month.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)' }}>
                  <th style={{ padding: '1rem', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Inv #</th>
                  <th style={{ padding: '1rem', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Date</th>
                  <th style={{ padding: '1rem', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Customer</th>
                  <th style={{ padding: '1rem', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Project</th>
                  <th style={{ padding: '1rem', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Revenue</th>
                  <th style={{ padding: '1rem', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map(inv => (
                  <tr key={inv.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem' }}>{inv.invoiceNo}</td>
                    <td style={{ padding: '1rem' }}>{new Date(inv.date).toLocaleDateString('en-GB')}</td>
                    <td style={{ padding: '1rem', fontWeight: '500' }}>{inv.customerName}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{inv.projectName}</td>
                    <td style={{ padding: '1rem', fontWeight: '600', color: 'var(--primary-blue)' }}>₹ {calculateTotal(inv).toLocaleString('en-IN')}</td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <button 
                        onClick={() => setViewingInvoice(inv)} 
                        className="btn btn-secondary" 
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                      >
                        <Eye size={14} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Full Screen View Modal */}
      {viewingInvoice && profile && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'var(--bg-color)', zIndex: 100, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <div style={{ position: 'sticky', top: 0, backgroundColor: 'var(--surface-color)', padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1rem', zIndex: 101, boxShadow: 'var(--shadow-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Invoice #{viewingInvoice.invoiceNo}</h2>
              <button onClick={() => setViewingInvoice(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-main)', padding: '0.5rem' }}>
                <X size={24} />
              </button>
            </div>
            <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={() => handleDownloadPdf(viewingInvoice)} disabled={isGeneratingPdf} style={{ flex: 1, minWidth: '120px' }}>
                <Download size={16} /> Save PDF
              </button>
              <button className="btn btn-primary" onClick={() => handleOpenPdf(viewingInvoice)} disabled={isGeneratingPdf} style={{ flex: 1, minWidth: '120px', backgroundColor: '#f59e0b', borderColor: '#f59e0b' }}>
                <FileText size={16} /> Open PDF
              </button>
              <button className="btn btn-secondary" onClick={() => handleShareWhatsApp(viewingInvoice)} disabled={isGeneratingPdf} style={{ flex: 1, minWidth: '120px', backgroundColor: '#25D366', color: 'white', borderColor: '#25D366' }}>
                <MessageCircle size={16} /> WhatsApp
              </button>
              <button className="btn btn-secondary" onClick={() => handleShareEmail(viewingInvoice)} disabled={isGeneratingPdf} style={{ flex: 1 }}>
                <Mail size={16} /> Email
              </button>
            </div>
          </div>
          
          <div style={{ padding: '2rem 1rem', display: 'flex', justifyContent: 'center', flex: 1 }}>
            <div style={{ width: '100%', maxWidth: '850px', overflowX: 'auto', backgroundColor: 'var(--surface-color)', padding: '1rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)' }}>
              <div id="printable-invoice-modal" style={{ width: '794px', height: '1123px', boxSizing: 'border-box', backgroundColor: '#ffffff' }}>
                <InvoicePreview 
                  data={viewingInvoice} 
                  profile={profile}
                  brokerageAmount={calculateBrokerage(viewingInvoice)} 
                  totalAmount={calculateTotal(viewingInvoice)} 
                />
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Show a loading overlay if generating */}
      {isGeneratingPdf && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ color: 'var(--text-main)' }}>Processing...</div>
        </div>
      )}
    </div>
  );
}
