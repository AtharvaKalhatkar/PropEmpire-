import React from 'react';
import logoImg from '../assets/COMPANY_LOGO.png';

const numberToWords = (num) => {
  if (num === 0) return 'Zero';
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const inWords = (n) => {
    if ((n = n.toString()).length > 9) return 'overflow';
    let nArray = ('000000000' + n).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!nArray) return;
    let str = '';
    str += (nArray[1] != 0) ? (a[Number(nArray[1])] || b[nArray[1][0]] + ' ' + a[nArray[1][1]]) + 'Crore ' : '';
    str += (nArray[2] != 0) ? (a[Number(nArray[2])] || b[nArray[2][0]] + ' ' + a[nArray[2][1]]) + 'Lakh ' : '';
    str += (nArray[3] != 0) ? (a[Number(nArray[3])] || b[nArray[3][0]] + ' ' + a[nArray[3][1]]) + 'Thousand ' : '';
    str += (nArray[4] != 0) ? (a[Number(nArray[4])] || b[nArray[4][0]] + ' ' + a[nArray[4][1]]) + 'Hundred ' : '';
    str += (nArray[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(nArray[5])] || b[nArray[5][0]] + ' ' + a[nArray[5][1]]) : '';
    return str.trim();
  };
  return inWords(Math.round(num));
};

export default function InvoicePreview({ data, profile, brokerageAmount, totalAmount }) {
  // Use uploaded logo from profile if available, otherwise use default
  const displayLogo = profile?.logoImage || logoImg;

  // All inline styles for A4 PDF rendering — no external CSS dependency
  const s = {
    page: {
      width: '100%', height: '100%',
      backgroundColor: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      color: '#000', fontSize: '11.5px', lineHeight: 1.35,
      boxSizing: 'border-box',
      padding: '24px 28px',
      display: 'flex', flexDirection: 'column',
    },
    border: {
      border: '1.5px solid #000',
      display: 'flex', flexDirection: 'column',
      position: 'relative',
      boxSizing: 'border-box',
      overflow: 'hidden',
      // No flex: 1, so it only grows as much as needed
    },
    watermark: {
      position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
      opacity: 0.07, pointerEvents: 'none', zIndex: 0,
      width: '340px', height: '340px',
    },
    watermarkImg: {
      width: '100%', height: '100%', objectFit: 'contain',
    },
    inner: {
      position: 'relative', zIndex: 1,
      display: 'flex', flexDirection: 'column',
      height: '100%',
    },

    // --- HEADER ---
    header: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '14px 16px 10px 16px',
    },
    logo: { maxHeight: '90px', maxWidth: '180px', objectFit: 'contain' },
    agentBlock: { textAlign: 'right' },
    agentName: {
      fontSize: '24px', fontWeight: 'bold', color: '#1a3c5e',
      textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px',
    },
    agentContact: { fontSize: '13px', fontWeight: 'bold', color: '#000', marginTop: '1px' },

    // --- TAX INVOICE BANNER ---
    banner: {
      backgroundColor: '#7ea7b3', textAlign: 'center',
      fontWeight: 'bold', fontSize: '20px', color: '#000',
      padding: '5px 0', textTransform: 'uppercase', letterSpacing: '1.5px',
      borderTop: '1.5px solid #000', borderBottom: '1.5px solid #000',
    },

    // --- META ROW ---
    metaRow: {
      display: 'flex', justifyContent: 'space-between',
      padding: '5px 16px', fontSize: '12px', fontWeight: 'bold',
      borderBottom: '1.5px solid #000',
    },

    // --- TO SECTION ---
    toBox: {
      padding: '8px 16px', fontSize: '11.5px', lineHeight: 1.35,
      borderBottom: '1.5px solid #000',
    },

    // --- CHANNEL PARTNER META ---
    cpRow: {
      display: 'flex', borderBottom: '1.5px solid #000', fontSize: '10px',
    },
    cpLeft: {
      flex: 1.3, padding: '6px 12px', borderRight: '1.5px solid #000', lineHeight: 1.3,
    },
    cpRight: {
      flex: 1, padding: '6px 12px', fontWeight: 'bold', lineHeight: 1.6,
    },

    // --- TABLE ---
    table: {
      width: 'calc(100% - 32px)', margin: '10px 16px 0 16px',
      borderCollapse: 'collapse', fontSize: '11.5px',
    },
    th: {
      border: '1.5px solid #000', padding: '5px 8px',
      fontWeight: 'bold', textAlign: 'center', backgroundColor: '#fff',
    },
    td: {
      border: '1.5px solid #000', padding: '6px 10px',
      verticalAlign: 'top',
    },
    pItem: {
      display: 'grid', gridTemplateColumns: '120px 20px auto',
      margin: '4px 0', lineHeight: 1.4,
    },

    // --- FOOTER ---
    footer: {
      display: 'flex', justifyContent: 'space-between',
      padding: '0 16px',
      marginTop: '15px',
      fontSize: '11px', lineHeight: 1.35,
      paddingBottom: '16px', paddingTop: '10px',
    },
    bankBlock: { flex: 1.5 },
    sigBlock: {
      flex: 1, display: 'flex', flexDirection: 'column',
      justifyContent: 'flex-end', alignItems: 'center', textAlign: 'center',
    },
  };

  return (
    <div style={s.page}>
      <div style={s.border}>
        {/* ======= WATERMARK LOGO (CENTER) ======= */}
        <div style={s.watermark}>
          <img src={displayLogo} alt="" style={s.watermarkImg} />
        </div>
        <div style={s.inner}>

          {/* ======= HEADER ======= */}
          <div style={s.header}>
            <img src={displayLogo} alt="PropEmpire" style={s.logo} />
            <div style={s.agentBlock}>
              <div style={s.agentName}>{profile?.agentName || 'SAURABH SHIVAJI GADE'}</div>
              <div style={s.agentContact}>Email id :- {profile?.email || 'saurabhgade32@gmail.com'}</div>
              <div style={s.agentContact}>Mobile :- {profile?.mobile || '9730953309'}</div>
            </div>
          </div>

          {/* ======= TAX INVOICE BANNER ======= */}
          <div style={s.banner}>TAX INVOICE</div>

          {/* ======= INVOICE NO / DATE ======= */}
          <div style={s.metaRow}>
            <div>Invoice No :- {data.invoiceNo}</div>
            <div>Date :- {data.date ? new Date(data.date).toLocaleDateString('en-GB') : ''}</div>
          </div>

          {/* ======= TO (BILLED TO) ======= */}
          <div style={s.toBox}>
            <div style={{ fontWeight: 'bold', fontSize: '12px' }}>
              To - {data.billedToName || data.customerName || ''}
            </div>
            {data.billedToAddress && (
              <div style={{ paddingLeft: '28px', whiteSpace: 'pre-line', marginTop: '1px' }}>
                {data.billedToAddress}
              </div>
            )}
            {data.billedToGstin && (
              <div style={{ paddingLeft: '28px', fontWeight: 'bold', marginTop: '3px' }}>
                GSTIN : {data.billedToGstin}
              </div>
            )}
          </div>

          {/* ======= CHANNEL PARTNER DETAILS ======= */}
          <div style={s.cpRow}>
            <div style={s.cpLeft}>
              <div style={{ fontWeight: 'bold' }}>• Channel Partner REAP ID : NA</div>
              <div style={{ fontWeight: 'bold' }}>• Channel Partner GaTIN &nbsp;&nbsp;: NA</div>
              <div style={{ fontWeight: 'bold' }}>• Service Account Code &nbsp;&nbsp;: MAHARASHTRA</div>
              <div style={{ fontSize: '8px', fontStyle: 'italic', color: '#555', marginTop: '2px' }}>
                ( Building sales on a fee i commission basis or contract basis )
              </div>
              <div style={{ fontSize: '8px', fontStyle: 'italic', color: '#555' }}>
                Place of flat sold ( it should mention state where service is rendered )
              </div>
            </div>
            <div style={s.cpRight}>
              <div>Channel Partner Rera No :- {profile?.reraNo || 'A52100041995'}</div>
              <div>Channel Partner Pan No :- {profile?.panNo || 'DDHPG6896K'}</div>
            </div>
          </div>

          {/* ======= MAIN TABLE ======= */}
          <table style={s.table}>
            <thead>
              <tr>
                <th style={{ ...s.th, width: '50px' }}>Sr.No</th>
                <th style={{ ...s.th, textAlign: 'left', paddingLeft: '12px' }}>Particulars</th>
                <th style={{ ...s.th, width: '80px' }}>Tax Rate</th>
                <th style={{ ...s.th, width: '120px' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {/* Row 1 — Main service */}
              <tr>
                <td style={{ ...s.td, textAlign: 'center', paddingTop: '14px', fontSize: '12px' }}>1.</td>
                <td style={s.td}>
                  <div style={{ fontWeight: 'bold', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ fontSize: '9px' }}>■</span> Description of service provided
                  </div>
                  <div style={{ marginLeft: '12px', marginTop: '6px' }}>
                    <div style={s.pItem}><span>Customer Name</span><span>:-</span><span style={{ fontWeight: 'bold' }}>{data.customerName}</span></div>
                    <div style={s.pItem}><span>Project Name.</span><span>:-</span><span style={{ fontWeight: 'bold' }}>{data.projectName}</span></div>
                    <div style={s.pItem}><span>Tower</span><span>:-</span><span style={{ fontWeight: 'bold' }}>{data.tower}</span></div>
                    <div style={s.pItem}><span>Flat No</span><span>:-</span><span style={{ fontWeight: 'bold' }}>{data.flatNo}</span></div>
                    <div style={s.pItem}><span>Considerable Value</span><span>:-</span><span style={{ fontWeight: 'bold' }}>{Number(data.agreementValue).toLocaleString('en-IN')} /-</span></div>
                    <div style={s.pItem}><span>Brokerage</span><span>:-</span><span style={{ fontWeight: 'bold' }}>{data.brokeragePercent} %</span></div>
                  </div>
                </td>
                <td style={{ ...s.td, textAlign: 'center', fontWeight: 'bold', verticalAlign: 'middle', fontSize: '13px' }}>
                  {data.brokeragePercent} %
                </td>
                <td style={{ ...s.td, padding: 0 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '160px', justifyContent: 'space-between' }}>
                    <div style={{ textAlign: 'right', fontWeight: 'bold', padding: '14px 10px 0 0', fontSize: '12px' }}>
                      {brokerageAmount.toLocaleString('en-IN')} /-
                    </div>
                    <div style={{ borderTop: '1.5px solid #000', textAlign: 'right', fontWeight: 'bold', padding: '6px 10px', fontSize: '12px' }}>
                      {brokerageAmount.toLocaleString('en-IN')} /-
                    </div>
                  </div>
                </td>
              </tr>

              {/* Row 2 — Executive Bonus (conditional) */}
              {Number(data.executiveBonus) > 0 && (
                <tr>
                  <td style={{ ...s.td, textAlign: 'center', fontSize: '12px', paddingTop: '10px' }}>2.</td>
                  <td style={{ ...s.td, fontWeight: 'bold', fontSize: '12px', paddingTop: '10px' }}>
                    Executive Bonus &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:- &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{Number(data.executiveBonus).toLocaleString('en-IN')} /–
                  </td>
                  <td style={{ ...s.td, textAlign: 'center' }}></td>
                  <td style={{ ...s.td, textAlign: 'right', fontWeight: 'bold', fontSize: '12px', paddingTop: '10px' }}>
                    {Number(data.executiveBonus).toLocaleString('en-IN')} /-
                  </td>
                </tr>
              )}

              {/* Total row */}
              <tr>
                <td style={{ ...s.td, borderRight: 'none' }}></td>
                <td style={{ ...s.td, borderLeft: 'none', borderRight: 'none', textAlign: 'center', fontWeight: 'bold', fontSize: '13px' }}>Total</td>
                <td style={{ ...s.td, borderLeft: 'none', borderRight: 'none' }}></td>
                <td style={{ ...s.td, textAlign: 'right', fontWeight: 'bold', fontSize: '14px' }}>
                  {totalAmount.toLocaleString('en-IN')} /-
                </td>
              </tr>

              {/* Amount in words */}
              <tr>
                <td colSpan="4" style={{ ...s.td, fontWeight: 'bold', fontSize: '12px', padding: '6px 10px', textAlign: 'center' }}>
                  Amount in words :- {numberToWords(totalAmount)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* ======= FOOTER — Bank + Signature ======= */}
          <div style={s.footer}>
            <div style={s.bankBlock}>
              <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '2px' }}>
                Channel Partner Cheque favouring Name : {profile?.bankFavouringName || profile?.agentName || 'Saurabh Shivaji Gade'}
              </div>
              <div style={{ fontSize: '12px', marginBottom: '6px' }}>
                As Per RERA Certificate Name &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: {profile?.agentName || 'Saurabh Shivaji Gade'}
              </div>
              <div style={{ fontWeight: 'bold', textDecoration: 'underline', marginBottom: '3px', fontSize: '12px' }}>
                For NEFT / RTGS - Bank A/C details.........
              </div>
              <div style={{ fontSize: '10px', color: '#333', marginBottom: '6px', lineHeight: 1.3 }}>
                Bank Name & Address :- {profile?.bankName || 'HDFC Bank,S No, 648 Pune, Pune - Ahmednagar Hwy'}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '110px auto', gap: '2px', fontSize: '11.5px', fontWeight: 'bold' }}>
                <div>Account Type</div><div>: {profile?.accountType || 'Saving'}</div>
                <div>Account No</div><div>: {profile?.accountNo || '50100560608282'}</div>
                <div>IFSC Code</div><div>: {profile?.ifscCode || 'HDFC0009332'}</div>
              </div>
            </div>
            <div style={s.sigBlock}>
              <div style={{ fontStyle: 'italic', fontWeight: 'bold', fontSize: '9px', marginBottom: '30px' }}>
                (Stampandsignatureofchannelpartner)
              </div>
              <div style={{ fontWeight: 'bold', fontSize: '12px' }}>Authorised Signatory</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
