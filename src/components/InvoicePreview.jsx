import React from 'react';
import logoImg from '../assets/COMPANY_LOGO.png';

const numberToWords = (num) => {
  if (num === 0) return 'Zero';
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const inWords = (n) => {
    if ((n = n.toString()).length > 9) return 'overflow';
    let nArray = ('000000000' + n).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!nArray) return '';
    let str = '';
    str += (nArray[1] != 0) ? (a[Number(nArray[1])] || b[nArray[1][0]] + ' ' + a[nArray[1][1]]) + 'Crore ' : '';
    str += (nArray[2] != 0) ? (a[Number(nArray[2])] || b[nArray[2][0]] + ' ' + a[nArray[2][1]]) + 'Lakh ' : '';
    str += (nArray[3] != 0) ? (a[Number(nArray[3])] || b[nArray[3][0]] + ' ' + a[nArray[3][1]]) + 'Thousand ' : '';
    str += (nArray[4] != 0) ? (a[Number(nArray[4])] || b[nArray[4][0]] + ' ' + a[nArray[4][1]]) + 'Hundred ' : '';
    str += (nArray[5] != 0) ? ((str !== '') ? 'and ' : '') + (a[Number(nArray[5])] || b[nArray[5][0]] + ' ' + a[nArray[5][1]]) : '';
    return str.trim();
  };
  return inWords(Math.round(num));
};

export default function InvoicePreview({ data, profile, brokerageAmount, totalAmount }) {
  const displayLogo = profile?.logoImage || logoImg;

  const B = '1.5px solid #000';

  return (
    <div style={{
      width: '595px',
      backgroundColor: '#fff',
      fontFamily: 'Arial, Helvetica, sans-serif',
      color: '#000',
      fontSize: '10px',
      lineHeight: '1.3',
      boxSizing: 'border-box',
      padding: '20px 18px',
      margin: '0 auto',
    }}>
      <div style={{ border: B, position: 'relative', overflow: 'hidden' }}>

        {/* WATERMARK */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: 0.06, pointerEvents: 'none', zIndex: 0,
          width: '280px', height: '280px',
        }}>
          <img src={displayLogo} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>

          {/* ══ HEADER ══ */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px 6px 10px' }}>
            <img src={displayLogo} alt="Logo" style={{ maxHeight: '58px', maxWidth: '120px', objectFit: 'contain' }} />
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#1a4e7a', textTransform: 'uppercase', letterSpacing: '0.3px', lineHeight: '1.1' }}>
                {profile?.agentName || 'SAURABH SHIVAJI GADE'}
              </div>
              <div style={{ fontSize: '9.5px', color: '#1a4e7a', marginTop: '3px', fontWeight: 'bold' }}>
                Email id :- {profile?.email || 'saurabhgade32@gmail.com'}
              </div>
              <div style={{ fontSize: '9.5px', color: '#1a4e7a', marginTop: '1px', fontWeight: 'bold' }}>
                Mobile :- {profile?.mobile || '9730953309'}
              </div>
            </div>
          </div>

          {/* ══ TAX INVOICE BANNER ══ */}
          <div style={{
            backgroundColor: '#a3c3cc', borderTop: B, borderBottom: B,
            textAlign: 'center', fontWeight: 'bold', fontSize: '14px',
            letterSpacing: '1px', padding: '3px 0',
          }}>TAX INVOICE</div>

          {/* ══ INVOICE NO / DATE ══ */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 10px', fontSize: '10px', fontWeight: 'bold', borderBottom: B }}>
            <div>Invoice No :- {data.invoiceNo}</div>
            <div>Date :- {data.date ? new Date(data.date).toLocaleDateString('en-GB') : ''}</div>
          </div>

          {/* ══ TO ══ */}
          <div style={{ padding: '4px 10px', fontSize: '9.5px', lineHeight: '1.5', borderBottom: B }}>
            <div style={{ fontWeight: 'bold', fontSize: '10px' }}>To - {data.billedToName || data.customerName || ''}</div>
            {data.billedToAddress && <div style={{ paddingLeft: '22px', whiteSpace: 'pre-line' }}>{data.billedToAddress}</div>}
            {data.billedToGstin && <div style={{ paddingLeft: '22px', fontWeight: 'bold', marginTop: '2px' }}>GSTIN : {data.billedToGstin}</div>}
          </div>

          {/* ══ CHANNEL PARTNER ROW ══ */}
          <div style={{ display: 'flex', borderBottom: B }}>
            <div style={{ flex: '1.4', padding: '3px 8px', borderRight: B, fontSize: '8px', lineHeight: '1.5' }}>
              <div style={{ fontWeight: 'bold' }}>• Channel Partner REAP ID : NA</div>
              <div style={{ fontWeight: 'bold' }}>• Channel Partner GaTIN &nbsp;&nbsp;: NA</div>
              <div style={{ fontWeight: 'bold' }}>• Service Account Code &nbsp;&nbsp;: MAHARASHTRA</div>
              <div style={{ fontSize: '7px', fontStyle: 'italic', color: '#333', marginTop: '1px' }}>( Building sales on a fee / commission basis or contract basis )</div>
              <div style={{ fontSize: '7px', fontStyle: 'italic', color: '#333' }}>Place of flat sold ( it should mention state where service is rendered )</div>
            </div>
            <div style={{ flex: '1', padding: '3px 8px', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'right', fontWeight: 'bold', fontSize: '9px', lineHeight: '1.8' }}>
              <div>Channel Partner Rera No :- {profile?.reraNo || 'A52100041995'}</div>
              <div>Channel Partner Pan No :- {profile?.panNo || 'DDHPG6896K'}</div>
            </div>
          </div>

          {/* ══ MAIN TABLE ══ */}
          {/* The key fix: table is NOT stretched — it's sized purely by content.
              Row 1 amount column uses flexbox to push sub-total bar to bottom of the row. */}
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '38px' }} />
              <col />
              <col style={{ width: '62px' }} />
              <col style={{ width: '90px' }} />
            </colgroup>
            <thead>
              <tr style={{ borderBottom: B }}>
                {[['Sr.No','center'],['Particulars','left'],['Tax Rate','center'],['Amount','center']].map(([label, align], i) => (
                  <th key={label} style={{
                    padding: '4px 5px',
                    fontWeight: 'bold', fontSize: '10px',
                    textAlign: align,
                    borderRight: i < 3 ? B : 'none',
                    borderBottom: 'none',
                    backgroundColor: '#fff',
                  }}>{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>

              {/* ── ROW 1 ── */}
              <tr style={{ borderTop: B }}>
                {/* Sr No */}
                <td style={{ borderRight: B, textAlign: 'center', verticalAlign: 'top', padding: '6px 4px', fontSize: '10px' }}>1.</td>

                {/* Particulars */}
                <td style={{ borderRight: B, padding: '5px 8px', verticalAlign: 'top' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '3px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '7px' }}>■</span> Description of service provided
                  </div>
                  {[
                    ['Customer Name',      data.customerName],
                    ['Project Name.',      data.projectName],
                    ['Tower',              data.tower],
                    ['Flat No',            data.flatNo],
                    ['Considerable Value', `${Number(data.agreementValue).toLocaleString('en-IN')} /-`],
                    ['Brokerage',          `${data.brokeragePercent} %`],
                  ].map(([label, value]) => (
                    <div key={label} style={{ display: 'grid', gridTemplateColumns: '100px 12px auto', fontSize: '9.5px', lineHeight: '1.55', paddingLeft: '4px' }}>
                      <span>{label}</span><span>:-</span><span style={{ fontWeight: 'bold' }}>{value}</span>
                    </div>
                  ))}
                </td>

                {/* Tax Rate */}
                <td style={{ borderRight: B, textAlign: 'center', verticalAlign: 'middle', fontWeight: 'bold', fontSize: '10px', padding: '4px' }}>
                  {data.brokeragePercent} %
                </td>

                {/* Amount — flex column: amount floats top, sub-total bar pins to bottom of this row */}
                <td style={{ padding: 0, verticalAlign: 'top' }}>
                  {/* Use a flex column that matches row height */}
                  <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div style={{ flex: 1, textAlign: 'right', fontWeight: 'bold', fontSize: '10px', padding: '6px 7px 4px 0' }}>
                      {brokerageAmount.toLocaleString('en-IN')} /-
                    </div>
                    {/* Sub-total bar at bottom of row */}
                    <div style={{ borderTop: B, textAlign: 'right', fontWeight: 'bold', fontSize: '10px', padding: '3px 7px' }}>
                      {brokerageAmount.toLocaleString('en-IN')} /-
                    </div>
                  </div>
                </td>
              </tr>

              {/* ── ROW 2: Executive Bonus ── */}
              {Number(data.executiveBonus) > 0 && (
                <tr style={{ borderTop: B }}>
                  <td style={{ borderRight: B, textAlign: 'center', fontSize: '10px', padding: '5px 4px', verticalAlign: 'top' }}>2.</td>
                  <td style={{ borderRight: B, fontWeight: 'bold', fontSize: '10px', padding: '5px 8px', verticalAlign: 'top' }}>
                    Executive Bonus &nbsp;&nbsp;:- &nbsp;&nbsp;{Number(data.executiveBonus).toLocaleString('en-IN')} /–
                  </td>
                  <td style={{ borderRight: B, padding: '5px 4px' }}></td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '10px', padding: '5px 7px 5px 0', verticalAlign: 'top' }}>
                    {Number(data.executiveBonus).toLocaleString('en-IN')} /-
                  </td>
                </tr>
              )}

              {/* ── TOTAL ── */}
              <tr style={{ borderTop: B, borderBottom: B }}>
                <td style={{ borderRight: B, padding: '4px' }}></td>
                <td style={{ borderRight: B, textAlign: 'center', fontWeight: 'bold', fontSize: '10px', padding: '4px 8px' }}>Total</td>
                <td style={{ borderRight: B, padding: '4px' }}></td>
                <td style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '11px', padding: '4px 7px 4px 0' }}>
                  {totalAmount.toLocaleString('en-IN')} /-
                </td>
              </tr>

              {/* ── AMOUNT IN WORDS ── */}
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '9.5px', padding: '4px 8px' }}>
                  Amount in words :- {numberToWords(totalAmount)}
                </td>
              </tr>

            </tbody>
          </table>

          {/* ══ FOOTER ══ */}
          <div style={{ borderTop: B, padding: '6px 10px 8px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>

            {/* Bank details */}
            <div style={{ fontSize: '9.5px', lineHeight: '1.55', flex: 1 }}>
              <div style={{ fontWeight: 'bold', fontSize: '10px', marginBottom: '1px' }}>
                Channel Partner Cheque favouring Name : {profile?.agentName || 'Saurabh Shivaji Gade'}
              </div>
              <div style={{ marginBottom: '1px' }}>
                As Per RERA Certificate Name &nbsp;&nbsp;&nbsp;: {profile?.agentName || 'Saurabh Shivaji Gade'}
              </div>
              <div style={{ fontWeight: 'bold', fontSize: '10px', marginBottom: '2px' }}>
                For NEFT / RTGS – Bank A/C details........
              </div>
              <div style={{ fontSize: '8.5px', marginBottom: '3px', color: '#222' }}>
                Bank Name &amp; Address :- {profile?.bankName || 'HDFC Bank,S No, 648 Pune, Pune – Ahmednagar Hwy'}<br />
                <span style={{ paddingLeft: '100px' }}>{profile?.bankAddress || 'Near Lifeline Hospital, Wagholi, Pune, Maharashtra 412207'}</span>
              </div>
              {[
                ['Account Type', profile?.accountType || 'Saving'],
                ['Account No',   profile?.accountNo   || '50100560608282'],
                ['IFSC Code',    profile?.ifscCode    || 'HDFC0009332'],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'grid', gridTemplateColumns: '76px 10px auto', fontWeight: 'bold', fontSize: '9.5px', lineHeight: '1.6' }}>
                  <span>{label}</span><span>:</span><span>{value}</span>
                </div>
              ))}
            </div>

            {/* Signature */}
            <div style={{ width: '120px', textAlign: 'center', fontWeight: 'bold', fontSize: '9px', lineHeight: '1.4', flexShrink: 0, paddingBottom: '2px' }}>
              <div style={{ height: '28px' }} />
              <div>(Stamp and signature of<br />channel partner)</div>
              <div>Authorised Signatory</div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
