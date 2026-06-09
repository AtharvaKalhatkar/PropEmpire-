import React, { useRef } from 'react';
import logoImg from '../assets/COMPANY_LOGO.png';

/* ─────────────────────────────────────────────
   Number → Indian Words (with "Only" suffix)
───────────────────────────────────────────── */
const numberToWords = (num) => {
  if (!num || num === 0) return 'Zero Only';
  const a = [
    '', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ',
    'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ',
    'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen ',
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const inWords = (n) => {
    if ((n = n.toString()).length > 9) return 'overflow';
    const arr = ('000000000' + n).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!arr) return '';
    let str = '';
    str += arr[1] != 0 ? (a[Number(arr[1])] || b[arr[1][0]] + ' ' + a[arr[1][1]]) + 'Crore ' : '';
    str += arr[2] != 0 ? (a[Number(arr[2])] || b[arr[2][0]] + ' ' + a[arr[2][1]]) + 'Lakh ' : '';
    str += arr[3] != 0 ? (a[Number(arr[3])] || b[arr[3][0]] + ' ' + a[arr[3][1]]) + 'Thousand ' : '';
    str += arr[4] != 0 ? (a[Number(arr[4])] || b[arr[4][0]] + ' ' + a[arr[4][1]]) + 'Hundred ' : '';
    str += arr[5] != 0 ? ((str !== '') ? 'and ' : '') + (a[Number(arr[5])] || b[arr[5][0]] + ' ' + a[arr[5][1]]) : '';
    return str.trim() + ' Only';
  };
  return inWords(Math.round(num));
};

/* ─────────────────────────────────────────────
   PDF Download (uses html2pdf.js — lazy import)
   Install once: npm install html2pdf.js
───────────────────────────────────────────── */
const handleDownloadPDF = async (element, filename) => {
  try {
    const html2pdf = (await import('html2pdf.js')).default;
    html2pdf()
      .set({
        margin: 0,
        filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          letterRendering: true,
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      })
      .from(element)
      .save();
  } catch (err) {
    console.error('PDF generation error:', err);
    alert('PDF generation failed. Make sure html2pdf.js is installed:\nnpm install html2pdf.js');
  }
};

/* ─────────────────────────────────────────────
   Shared styles
───────────────────────────────────────────── */
const BD = '1.5px solid #000';          // border shorthand
const CELL = {                            // base table cell
  border: BD,
  padding: '8px 10px',
  verticalAlign: 'top',
  fontSize: '13px',
};
const BTN = (bg) => ({                   // action button
  padding: '10px 28px',
  backgroundColor: bg,
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  fontSize: '14px',
  fontWeight: 'bold',
  cursor: 'pointer',
  boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
  letterSpacing: '0.3px',
});

/* ─────────────────────────────────────────────
   Component
───────────────────────────────────────────── */
export default function InvoicePreview({ data, profile, brokerageAmount, totalAmount }) {
  const invoiceRef = useRef(null);

  const displayLogo = profile?.logoImage || logoImg;
  const bankName = profile?.bankName || 'HDFC Bank,S No, 648 Pune, Pune – Ahmednagar Hwy';
  const bankAddress = profile?.bankAddress || 'Near Lifeline Hospital, Wagholi, Pune, Maharashtra 412207';

  const fmtIN = (n) => Number(n).toLocaleString('en-IN');          // 1,79,076
  const invoiceDate = data.date
    ? new Date(data.date).toLocaleDateString('en-GB')               // DD/MM/YYYY
    : '';

  return (
    <div style={{ fontFamily: 'Arial, Helvetica, sans-serif', color: '#000' }}>

      {/* ── Action Bar (outside invoice, not in PDF) ── */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '20px' }}>
        <button
          style={BTN('#004b73')}
          onClick={() =>
            handleDownloadPDF(
              invoiceRef.current,
              `Invoice_${data.invoiceNo || '01'}.pdf`
            )
          }
        >
          ⬇&nbsp; Download PDF
        </button>
        <button style={BTN('#333')} onClick={() => window.print()}>
          🖨&nbsp; Print
        </button>
      </div>

      {/* ── A4 Invoice ── */}
      <div
        ref={invoiceRef}
        id="invoice-preview"
        style={{
          width: '794px',
          minHeight: '1123px',
          backgroundColor: '#fff',
          boxSizing: 'border-box',
          padding: '28px',
          margin: '0 auto',
          position: 'relative',
        }}
      >
        {/* Outer border */}
        <div style={{ border: BD, position: 'relative', boxSizing: 'border-box' }}>

          {/* ── Watermark ── */}
          <div style={{
            position: 'absolute', top: '55%', left: '50%',
            transform: 'translate(-50%, -50%)',
            opacity: 0.07, pointerEvents: 'none', zIndex: 0,
            width: '380px', height: '380px',
          }}>
            <img src={displayLogo} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>

          {/* Content above watermark */}
          <div style={{ position: 'relative', zIndex: 1 }}>

            {/* ══════════════════════════════
                1. HEADER — Logo (black box) + Agent info
            ══════════════════════════════ */}
            <div style={{ display: 'flex', alignItems: 'stretch', borderBottom: BD }}>

              {/* Logo — WHITE background (matches Canva exactly) */}
              <div style={{
                backgroundColor: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '14px',
                width: '190px', flexShrink: 0,
                borderRight: BD,
              }}>
                <img
                  src={displayLogo}
                  alt="Company Logo"
                  style={{ maxHeight: '110px', maxWidth: '168px', objectFit: 'contain' }}
                />
              </div>

              {/* Agent Name + Contact */}
              <div style={{
                flex: 1,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                padding: '18px 20px', textAlign: 'center',
              }}>
                <div style={{
                  fontSize: '30px', fontWeight: '900',
                  color: '#004b73', letterSpacing: '1px', marginBottom: '6px',
                }}>
                  {profile?.agentName || 'SAURABH SHIVAJI GADE'}
                </div>
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#004b73', marginBottom: '3px' }}>
                  Email id :- {profile?.email || 'saurabhgade32@gmail.com'}
                </div>
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#004b73' }}>
                  Mobile :- {profile?.mobile || '9730953309'}
                </div>
              </div>
            </div>

            {/* ══════════════════════════════
                2. TAX INVOICE BANNER
            ══════════════════════════════ */}
            <div style={{
              backgroundColor: '#a3c5d1',
              borderBottom: BD,
              textAlign: 'center',
              fontWeight: '900',
              fontSize: '22px',
              padding: '7px 0',
              letterSpacing: '2px',
            }}>
              TAX INVOICE
            </div>

            {/* ══════════════════════════════
                3. INVOICE NO & DATE
            ══════════════════════════════ */}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '7px 16px', borderBottom: BD,
              fontSize: '13px', fontWeight: 'bold',
            }}>
              <div>Invoice No :- {data.invoiceNo}</div>
              <div>Date :- {invoiceDate}</div>
            </div>

            {/* ══════════════════════════════
                4. TO BOX
            ══════════════════════════════ */}
            <div style={{ padding: '10px 16px', borderBottom: BD, fontSize: '12px', lineHeight: '1.75' }}>
              <div style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '2px' }}>
                To - {data.billedToName || data.customerName || ''}
              </div>

              {data.billedToAddress && (
                <div style={{ paddingLeft: '38px', whiteSpace: 'pre-line', fontSize: '12px' }}>
                  {data.billedToAddress}
                </div>
              )}

              {/* GSTIN — large bold, matching Canva */}
              {data.billedToGstin && (
                <div style={{ fontWeight: '900', fontSize: '15px', marginTop: '5px' }}>
                  GSTIN : {data.billedToGstin}
                </div>
              )}
            </div>

            {/* ══════════════════════════════
                5. CHANNEL PARTNER DETAILS
            ══════════════════════════════ */}
            <div style={{ display: 'flex', borderBottom: BD, backgroundColor: '#fff', fontSize: '10px' }}>

              {/* Left — bullet list + italic notes */}
              <div style={{ flex: 1.5, padding: '8px 14px', borderRight: BD, lineHeight: '1.75' }}>
                <div style={{ fontWeight: 'bold' }}>• Channel Partner REAP ID : NA</div>
                <div style={{ fontWeight: 'bold' }}>• Channel Partner GaTIN &nbsp;&nbsp;: NA</div>
                <div style={{ fontWeight: 'bold' }}>• Service Account Code &nbsp;&nbsp;: MAHARASHTRA</div>
                <div style={{ fontSize: '9px', fontStyle: 'italic', marginTop: '3px' }}>
                  ( Building sales on a fee / commission basis or contract basis )
                </div>
                <div style={{ fontSize: '9px', fontStyle: 'italic' }}>
                  Place of flat sold ( it should mention state where service is rendered )
                </div>
              </div>

              {/* Right — RERA / PAN */}
              <div style={{
                flex: 1, padding: '8px 14px',
                display: 'flex', flexDirection: 'column', justifyContent: 'center',
                textAlign: 'right', fontWeight: 'bold', fontSize: '11px', lineHeight: '2.3',
              }}>
                <div>Channel Partner Rera No :- {profile?.reraNo || 'A52100041995'}</div>
                <div>Channel Partner Pan No &nbsp;:- {profile?.panNo || 'DDHPG6896K'}</div>
              </div>
            </div>

            {/* ══════════════════════════════
                6. MAIN TABLE
            ══════════════════════════════ */}
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              tableLayout: 'fixed',
              fontSize: '13px',
              marginTop: '18px',
            }}>
              <colgroup>
                <col style={{ width: '55px' }} />
                <col />
                <col style={{ width: '85px' }} />
                <col style={{ width: '135px' }} />
              </colgroup>

              <thead>
                <tr>
                  {['Sr.No', 'Particulars', 'Tax Rate', 'Amount'].map((h) => (
                    <th key={h} style={{ ...CELL, textAlign: 'center', fontWeight: 'bold' }}>{h}</th>
                  ))}
                </tr>
              </thead>

              <tbody>

                {/* ── Row 1 — Brokerage service ── */}
                <tr>
                  <td style={{ ...CELL, textAlign: 'center', paddingTop: '14px', fontSize: '12px' }}>
                    1.
                  </td>

                  {/* Particulars — Canva format: only Customer/Project/Tower/Flat */}
                  <td style={{ ...CELL, padding: '14px 12px' }}>
                    <div style={{
                      fontWeight: 'bold', fontSize: '14px',
                      marginBottom: '14px',
                      display: 'flex', alignItems: 'center', gap: '8px',
                    }}>
                      ■ Description of service provided
                    </div>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '115px 14px 1fr',
                      rowGap: '4px',
                      fontSize: '12px',
                    }}>
                      <span>Customer Name</span><span>:-</span><strong>{data.customerName}</strong>
                      <span>Project Name.</span><span>:-</span><strong>{data.projectName}</strong>
                      <span>Tower</span><span>:-</span><strong>{data.tower}</strong>
                      <span>Flat No</span><span>:-</span><strong>{data.flatNo}</strong>
                    </div>
                  </td>

                  {/* Tax Rate — vertically aligned to MIDDLE (matches Canva) */}
                  <td style={{
                    ...CELL,
                    textAlign: 'center',
                    verticalAlign: 'middle',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    paddingBottom: '12px',
                  }}>
                    {data.brokeragePercent} %
                  </td>

                  {/* Amount — top value + border + bottom subtotal (matches Canva) */}
                  <td style={{ ...CELL, padding: 0 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '200px' }}>
                      <div style={{
                        flex: 1,
                        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                        textAlign: 'right', fontWeight: 'bold', fontSize: '14px',
                        padding: '14px 10px 8px 0',
                      }}>
                        {fmtIN(brokerageAmount)} /-
                      </div>
                      <div style={{
                        borderTop: BD,
                        textAlign: 'right', fontWeight: 'bold', fontSize: '14px',
                        padding: '8px 10px',
                      }}>
                        {fmtIN(brokerageAmount)} /-
                      </div>
                    </div>
                  </td>
                </tr>

                {/* ── Row 2 — Executive Bonus (conditional) ── */}
                {Number(data.executiveBonus) > 0 && (
                  <tr>
                    <td style={{ ...CELL, textAlign: 'center', fontSize: '12px' }}>2.</td>
                    <td style={{ ...CELL, fontWeight: 'bold', fontSize: '13px' }}>
                      Executive Bonus &nbsp;:- &nbsp;{fmtIN(data.executiveBonus)} /-
                    </td>
                    <td style={CELL}></td>
                    <td style={{ ...CELL, textAlign: 'right', fontWeight: 'bold', fontSize: '14px' }}>
                      {fmtIN(data.executiveBonus)} /-
                    </td>
                  </tr>
                )}

                {/* ── Total row ── */}
                <tr>
                  <td style={CELL}></td>
                  <td style={{
                    ...CELL,
                    textAlign: 'center', fontWeight: '900', fontSize: '17px',
                  }}>
                    Total
                  </td>
                  <td style={CELL}></td>
                  <td style={{ ...CELL, textAlign: 'right', fontWeight: '900', fontSize: '17px' }}>
                    {fmtIN(totalAmount)}/-
                  </td>
                </tr>

                {/* ── Amount in words ── */}
                <tr>
                  <td colSpan={4} style={{
                    ...CELL,
                    fontWeight: 'bold', fontSize: '12px',
                    textAlign: 'left',
                  }}>
                    Amount in words :-&nbsp;&nbsp;{numberToWords(totalAmount)}
                  </td>
                </tr>

              </tbody>
            </table>

            {/* ══════════════════════════════
                7. FOOTER
            ══════════════════════════════ */}
            <div style={{
              padding: '14px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              gap: '16px',
            }}>

              {/* Left — Bank details */}
              <div style={{ flex: 1, minWidth: 0, fontSize: '11px', lineHeight: '1.8' }}>

                <div style={{ display: 'grid', gridTemplateColumns: '270px 10px auto', marginBottom: '1px' }}>
                  <strong>Channel Partner Cheque favouring Name</strong>
                  <span>:</span>
                  <span>{profile?.bankFavouringName || 'Saurabh Shivaji Gade'}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '270px 10px auto', marginBottom: '8px' }}>
                  <strong>As Per RERA Certificate Name</strong>
                  <span>:</span>
                  <span>{profile?.agentName || 'Saurabh Shivaji Gade'}</span>
                </div>

                <div style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '5px' }}>
                  For NEFT / RTGS - Bank A/C details.........
                </div>

                <div style={{ fontSize: '10.5px', color: '#222', marginBottom: '9px', lineHeight: '1.6', wordBreak: 'break-word' }}>
                  Bank Name &amp; Address :- {bankName}
                  <br />
                  <span style={{ paddingLeft: '148px' }}>{bankAddress}</span>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '110px 8px 1fr',
                  fontWeight: 'bold', fontSize: '12px', rowGap: '2px',
                }}>
                  <span>Account Type</span><span>:</span><span>{profile?.accountType || 'Saving'}</span>
                  <span>Account No</span><span>:</span><span>{profile?.accountNo || '50100560608282'}</span>
                  <span>IFSC Code</span><span>:</span><span>{profile?.ifscCode || 'HDFC0009332'}</span>
                </div>
              </div>

              {/* Right — Signature block */}
              <div style={{
                flexShrink: 0, width: '210px',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', textAlign: 'center',
                paddingBottom: '4px',
              }}>
                <div style={{
                  fontSize: '10px', fontWeight: 'bold', fontStyle: 'italic',
                  marginBottom: '44px',
                }}>
                  (Stamp and signature of channel partner)
                </div>
                <div style={{ fontWeight: 'bold', fontSize: '13px' }}>
                  Authorised Signatory
                </div>
              </div>

            </div>{/* /footer */}

          </div>{/* /zIndex:1 */}
        </div>{/* /outer border */}
      </div>{/* /A4 */}

    </div>
  );
}