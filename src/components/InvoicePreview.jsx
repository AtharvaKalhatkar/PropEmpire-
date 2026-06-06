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

// Shared border style for all table cells
const CELL = { border: '1.5px solid #000', padding: '8px 10px', verticalAlign: 'top' };

export default function InvoicePreview({ data, profile, brokerageAmount, totalAmount }) {
  const displayLogo = profile?.logoImage || logoImg;

  return (
    <div style={{
      width: '100%',
      height: 'auto',
      backgroundColor: '#fff',
      fontFamily: 'Arial, Helvetica, sans-serif',
      color: '#000',
      boxSizing: 'border-box',
      padding: '40px',
      margin: '0 auto',
      position: 'relative',
    }}>

      {/* ── OUTER BORDER ── */}
      <div style={{
        border: '1.5px solid #000',
        width: '100%',
        boxSizing: 'border-box',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}>

        {/* WATERMARK */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: 0.08, pointerEvents: 'none', zIndex: 0,
          width: '500px', height: '500px',
        }}>
          <img src={displayLogo} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', flex: 1 }}>

          {/* ── 1. HEADER ── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px' }}>
            <img src={displayLogo} alt="Logo" style={{ maxHeight: '100px', maxWidth: '200px', objectFit: 'contain' }} />
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '28px', fontWeight: '900', color: '#004b73', marginBottom: '6px', letterSpacing: '0.5px' }}>
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

          {/* ── 2. TAX INVOICE BANNER ── */}
          <div style={{
            backgroundColor: '#a3c5d1',
            borderTop: '1.5px solid #000',
            borderBottom: '1.5px solid #000',
            textAlign: 'center',
            fontWeight: '900',
            fontSize: '20px',
            padding: '6px 0',
            letterSpacing: '1px',
          }}>
            TAX INVOICE
          </div>

          {/* ── 3. INVOICE NO & DATE ── */}
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            padding: '6px 20px',
            borderBottom: '1.5px solid #000',
            fontSize: '13px', fontWeight: 'bold',
          }}>
            <div>Invoice No :- {data.invoiceNo}</div>
            <div>Date :- {data.date ? new Date(data.date).toLocaleDateString('en-GB') : ''}</div>
          </div>

          {/* ── 4. TO BOX ── */}
          <div style={{ padding: '10px 20px', borderBottom: '1.5px solid #000', fontSize: '12px', lineHeight: '1.6' }}>
            <div style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '4px' }}>
              To - {data.billedToName || data.customerName || ''}
            </div>
            {data.billedToAddress && (
              <div style={{ paddingLeft: '32px', whiteSpace: 'pre-line' }}>{data.billedToAddress}</div>
            )}
            {data.billedToGstin && (
              <div style={{ paddingLeft: '32px', fontWeight: 'bold', marginTop: '4px' }}>
                GSTIN : {data.billedToGstin}
              </div>
            )}
          </div>

          {/* ── 5. CHANNEL PARTNER DETAILS ── */}
          <div style={{ display: 'flex', borderBottom: '1.5px solid #000', fontSize: '10px' }}>
            <div style={{ flex: '1.4', padding: '8px 15px', borderRight: '1.5px solid #000', lineHeight: '1.6' }}>
              <div style={{ fontWeight: 'bold' }}>• Channel Partner REAP ID : NA</div>
              <div style={{ fontWeight: 'bold' }}>• Channel Partner GaTIN &nbsp;&nbsp;: NA</div>
              <div style={{ fontWeight: 'bold' }}>• Service Account Code &nbsp;&nbsp;: MAHARASHTRA</div>
              <div style={{ fontSize: '9px', fontStyle: 'italic', marginTop: '4px' }}>
                ( Building sales on a fee / commission basis or contract basis )
              </div>
              <div style={{ fontSize: '9px', fontStyle: 'italic' }}>
                Place of flat sold ( it should mention state where service is rendered )
              </div>
            </div>
            <div style={{
              flex: '1', padding: '8px 15px',
              display: 'flex', flexDirection: 'column', justifyContent: 'center',
              textAlign: 'right', fontWeight: 'bold', fontSize: '11px', lineHeight: '2',
            }}>
              <div>Channel Partner Rera No :- {profile?.reraNo || 'A52100041995'}</div>
              <div>Channel Partner Pan No :- {profile?.panNo || 'DDHPG6896K'}</div>
            </div>
          </div>

          {/* ── 6. MAIN TABLE ── */}
          {/* FIX: marginTop: '20px' adds the white space gap matching the reference image */}
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            tableLayout: 'fixed',
            fontSize: '13px',
            marginTop: '20px',      // ← gap between CP section and table
          }}>
            <colgroup>
              <col style={{ width: '60px' }} />
              <col />
              <col style={{ width: '90px' }} />
              <col style={{ width: '130px' }} />
            </colgroup>

            <thead>
              <tr>
                <th style={{ ...CELL, textAlign: 'center', fontWeight: 'bold' }}>Sr.No</th>
                <th style={{ ...CELL, textAlign: 'left', paddingLeft: '12px', fontWeight: 'bold' }}>Particulars</th>
                <th style={{ ...CELL, textAlign: 'center', fontWeight: 'bold' }}>Tax Rate</th>
                <th style={{ ...CELL, textAlign: 'center', fontWeight: 'bold' }}>Amount</th>
              </tr>
            </thead>

            <tbody>
              {/* ── ROW 1: Main service ── */}
              <tr>
                <td style={{ ...CELL, textAlign: 'center', paddingTop: '15px', fontSize: '12px' }}>1.</td>
                <td style={{ ...CELL, padding: '15px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '10px' }}>■</span> Description of service provided
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '140px 20px auto', rowGap: '6px', fontSize: '12px' }}>
                    <div>Customer Name</div><div>:-</div><div style={{ fontWeight: 'bold' }}>{data.customerName}</div>
                    <div>Project Name.</div><div>:-</div><div style={{ fontWeight: 'bold' }}>{data.projectName}</div>
                    <div>Tower</div><div>:-</div><div style={{ fontWeight: 'bold' }}>{data.tower}</div>
                    <div>Flat No</div><div>:-</div><div style={{ fontWeight: 'bold' }}>{data.flatNo}</div>
                    <div>Considerable Value</div><div>:-</div><div style={{ fontWeight: 'bold' }}>{Number(data.agreementValue).toLocaleString('en-IN')} /-</div>
                    <div>Brokerage</div><div>:-</div><div style={{ fontWeight: 'bold' }}>{data.brokeragePercent} %</div>
                  </div>
                </td>
                <td style={{ ...CELL, textAlign: 'center', verticalAlign: 'middle', fontWeight: 'bold', fontSize: '14px' }}>
                  {data.brokeragePercent} %
                </td>
                <td style={{ ...CELL, padding: 0 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '220px' }}>
                    <div style={{ flex: 1, textAlign: 'right', fontWeight: 'bold', fontSize: '14px', padding: '15px 10px 0 0' }}>
                      {brokerageAmount.toLocaleString('en-IN')} /-
                    </div>
                    <div style={{ borderTop: '1.5px solid #000', textAlign: 'right', fontWeight: 'bold', fontSize: '14px', padding: '8px 10px' }}>
                      {brokerageAmount.toLocaleString('en-IN')} /-
                    </div>
                  </div>
                </td>
              </tr>

              {/* ── ROW 2: Executive Bonus (conditional) ── */}
              {Number(data.executiveBonus) > 0 && (
                <tr>
                  <td style={{ ...CELL, textAlign: 'center', fontSize: '12px', paddingTop: '10px' }}>2.</td>
                  <td style={{ ...CELL, fontWeight: 'bold', fontSize: '13px', paddingTop: '10px' }}>
                    <div style={{ display: 'flex', gap: '20px' }}>
                      <span>Executive Bonus</span>
                      <span>:-</span>
                      <span>{Number(data.executiveBonus).toLocaleString('en-IN')} /-</span>
                    </div>
                  </td>
                  <td style={{ ...CELL }}></td>
                  <td style={{ ...CELL, textAlign: 'right', fontWeight: 'bold', fontSize: '14px', paddingTop: '10px' }}>
                    {Number(data.executiveBonus).toLocaleString('en-IN')} /-
                  </td>
                </tr>
              )}

              {/* ── TOTAL ROW ── */}
              <tr>
                <td style={{ ...CELL, borderRight: 'none' }}></td>
                <td style={{ ...CELL, borderLeft: 'none', borderRight: 'none', textAlign: 'center', fontWeight: 'bold', fontSize: '16px' }}>
                  Total
                </td>
                <td style={{ ...CELL, borderLeft: 'none', borderRight: 'none' }}></td>
                <td style={{ ...CELL, textAlign: 'right', fontWeight: 'bold', fontSize: '16px' }}>
                  {totalAmount.toLocaleString('en-IN')} /-
                </td>
              </tr>

              {/* ── AMOUNT IN WORDS ── */}
              <tr>
                <td colSpan="4" style={{ ...CELL, fontWeight: 'bold', fontSize: '12px' }}>
                  Amount in words :- {numberToWords(totalAmount)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* ── 7. FOOTER ── */}
          <div style={{ padding: '15px 20px', display: 'flex', justifyContent: 'space-between' }}>

            {/* Left: Bank details */}
            <div style={{ flex: 1, fontSize: '11px', lineHeight: '1.7' }}>
              <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '2px' }}>
                Channel Partner Cheque favouring Name : {profile?.bankFavouringName || 'Saurabh Shivaji Gade'}
              </div>
              <div style={{ marginBottom: '8px' }}>
                As Per RERA Certificate Name &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: {profile?.agentName || 'Saurabh Shivaji Gade'}
              </div>
              <div style={{ fontWeight: 'bold', fontSize: '12px', textDecoration: 'underline', marginBottom: '4px' }}>
                For NEFT / RTGS - Bank A/C details.........
              </div>
              <div style={{ fontSize: '10px', color: '#444', marginBottom: '8px', lineHeight: '1.5' }}>
                Bank Name & Address :- {profile?.bankName || 'HDFC Bank, S No, 648 Pune, Pune - Ahmednagar Hwy'}
                {profile?.bankAddress && (
                  <><br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    {profile.bankAddress}
                  </>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 10px auto', fontWeight: 'bold', fontSize: '11px', rowGap: '2px' }}>
                <div>Account Type</div><div>:</div><div>{profile?.accountType || 'Saving'}</div>
                <div>Account No</div><div>:</div><div>{profile?.accountNo || '50100560608282'}</div>
                <div>IFSC Code</div><div>:</div><div>{profile?.ifscCode || 'HDFC0009332'}</div>
              </div>
            </div>

            {/* Right: Signature */}
            <div style={{
              width: '200px',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'flex-end',
              paddingBottom: '10px',
            }}>
              <div style={{ fontSize: '10px', fontWeight: 'bold', fontStyle: 'italic', textAlign: 'center', marginBottom: '40px' }}>
                (Stamp and signature of channel partner)
              </div>
              <div style={{ fontWeight: 'bold', fontSize: '13px' }}>Authorised Signatory</div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}