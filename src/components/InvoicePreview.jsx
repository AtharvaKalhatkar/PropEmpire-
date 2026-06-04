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

  // A4 = 794px wide × 1123px tall at 96dpi
  // We render at full A4 width, height auto
  const page = {
    width: '794px',
    minHeight: '1123px',
    backgroundColor: '#ffffff',
    fontFamily: 'Arial, Helvetica, sans-serif',
    color: '#000',
    fontSize: '11px',
    lineHeight: '1.4',
    boxSizing: 'border-box',
    padding: '28px 30px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
  };

  const outerBorder = {
    border: '2px solid #000',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
  };

  return (
    <div style={page}>
      <div style={outerBorder}>

        {/* ── WATERMARK ── */}
        <div style={{
          position: 'absolute', top: '55%', left: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: 0.07, pointerEvents: 'none', zIndex: 0,
          width: '460px', height: '460px',
        }}>
          <img src={displayLogo} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', flex: 1 }}>

          {/* ── HEADER ── */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '14px 16px 10px 16px',
          }}>
            {/* Logo left */}
            <div>
              <img src={displayLogo} alt="Logo" style={{ maxHeight: '90px', maxWidth: '200px', objectFit: 'contain' }} />
            </div>

            {/* Agent info right */}
            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontSize: '30px', fontWeight: '900', color: '#1a4e7a',
                textTransform: 'uppercase', letterSpacing: '0.5px', lineHeight: 1.1,
              }}>
                {profile?.agentName || 'SAURABH SHIVAJI GADE'}
              </div>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#1a4e7a', marginTop: '6px' }}>
                Email id :- {profile?.email || 'saurabhgade32@gmail.com'}
              </div>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#1a4e7a', marginTop: '2px' }}>
                Mobile :- {profile?.mobile || '9730953309'}
              </div>
            </div>
          </div>

          {/* ── TAX INVOICE BANNER ── */}
          <div style={{
            backgroundColor: '#a3c3cc',
            borderTop: '2px solid #000', borderBottom: '2px solid #000',
            textAlign: 'center', fontWeight: 'bold',
            fontSize: '20px', letterSpacing: '1px',
            padding: '5px 0',
          }}>
            TAX INVOICE
          </div>

          {/* ── INVOICE NO / DATE ── */}
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            padding: '5px 14px',
            fontSize: '12px', fontWeight: 'bold',
            borderBottom: '2px solid #000',
          }}>
            <div>Invoice No :- {data.invoiceNo}</div>
            <div>Date :- {data.date ? new Date(data.date).toLocaleDateString('en-GB') : ''}</div>
          </div>

          {/* ── TO (BILLED TO) ── */}
          <div style={{
            padding: '6px 14px',
            fontSize: '11px', lineHeight: '1.5',
            borderBottom: '2px solid #000',
          }}>
            <div style={{ fontWeight: 'bold', fontSize: '12px' }}>
              To - {data.billedToName || data.customerName || ''}
            </div>
            {data.billedToAddress && (
              <div style={{ paddingLeft: '30px', whiteSpace: 'pre-line', marginTop: '1px' }}>
                {data.billedToAddress}
              </div>
            )}
            {data.billedToGstin && (
              <div style={{ paddingLeft: '30px', fontWeight: 'bold', marginTop: '3px' }}>
                GSTIN : {data.billedToGstin}
              </div>
            )}
          </div>

          {/* ── CHANNEL PARTNER ROW ── */}
          <div style={{
            display: 'flex',
            borderBottom: '2px solid #000',
            fontSize: '9px',
          }}>
            <div style={{
              flex: '1.4', padding: '5px 12px',
              borderRight: '2px solid #000', lineHeight: '1.5',
            }}>
              <div style={{ fontWeight: 'bold' }}>• Channel Partner REAP ID : NA</div>
              <div style={{ fontWeight: 'bold' }}>• Channel Partner GaTIN &nbsp;&nbsp;: NA</div>
              <div style={{ fontWeight: 'bold' }}>• Service Account Code &nbsp;&nbsp;: MAHARASHTRA</div>
              <div style={{ fontSize: '7.5px', fontStyle: 'italic', color: '#333', marginTop: '2px' }}>
                ( Building sales on a fee / commission basis or contract basis )
              </div>
              <div style={{ fontSize: '7.5px', fontStyle: 'italic', color: '#333' }}>
                Place of flat sold ( it should mention state where service is rendered )
              </div>
            </div>
            <div style={{
              flex: '1', padding: '5px 12px',
              display: 'flex', flexDirection: 'column', justifyContent: 'center',
              textAlign: 'right', fontWeight: 'bold', fontSize: '10px', lineHeight: '1.8',
            }}>
              <div>Channel Partner Rera No :- {profile?.reraNo || 'A52100041995'}</div>
              <div>Channel Partner Pan No :- &nbsp;{profile?.panNo || 'DDHPG6896K'}</div>
            </div>
          </div>

          {/* ── MAIN TABLE ── */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #000' }}>
                <th style={{
                  width: '52px', padding: '7px 6px', fontWeight: 'bold',
                  textAlign: 'center', borderRight: '2px solid #000',
                }}>Sr.No</th>
                <th style={{
                  padding: '7px 10px', fontWeight: 'bold',
                  textAlign: 'left', borderRight: '2px solid #000',
                }}>Particulars</th>
                <th style={{
                  width: '80px', padding: '7px 6px', fontWeight: 'bold',
                  textAlign: 'center', borderRight: '2px solid #000',
                }}>Tax Rate</th>
                <th style={{
                  width: '120px', padding: '7px 8px', fontWeight: 'bold',
                  textAlign: 'center',
                }}>Amount</th>
              </tr>
            </thead>
            <tbody>

              {/* ── ROW 1: Service Description ── */}
              <tr>
                <td style={{
                  borderRight: '2px solid #000', textAlign: 'center',
                  verticalAlign: 'top', padding: '14px 6px 10px 6px',
                  fontSize: '12px',
                }}>1.</td>

                <td style={{ borderRight: '2px solid #000', padding: '10px 10px 10px 10px', verticalAlign: 'top' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '9px' }}>■</span> Description of service provided
                  </div>
                  {[
                    ['Customer Name', data.customerName],
                    ['Project Name.', data.projectName],
                    ['Tower', data.tower],
                    ['Flat No', data.flatNo],
                    ['Considerable Value', `${Number(data.agreementValue).toLocaleString('en-IN')} /-`],
                    ['Brokerage', `${data.brokeragePercent} %`],
                  ].map(([label, value]) => (
                    <div key={label} style={{
                      display: 'grid', gridTemplateColumns: '130px 16px auto',
                      margin: '3px 0', lineHeight: '1.4', paddingLeft: '8px',
                    }}>
                      <span>{label}</span>
                      <span>:-</span>
                      <span style={{ fontWeight: 'bold' }}>{value}</span>
                    </div>
                  ))}
                </td>

                {/* Tax Rate cell */}
                <td style={{
                  borderRight: '2px solid #000', textAlign: 'center',
                  fontWeight: 'bold', verticalAlign: 'middle', fontSize: '12px',
                  padding: '6px',
                }}>
                  {data.brokeragePercent} %
                </td>

                {/* Amount cell — split into top amount + sub-total bar */}
                <td style={{ padding: 0, verticalAlign: 'top' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '195px' }}>
                    <div style={{
                      flex: 1, textAlign: 'right', fontWeight: 'bold',
                      padding: '14px 10px 0 0', fontSize: '12px',
                    }}>
                      {brokerageAmount.toLocaleString('en-IN')} /-
                    </div>
                    <div style={{
                      borderTop: '2px solid #000',
                      textAlign: 'right', fontWeight: 'bold',
                      padding: '6px 10px', fontSize: '12px',
                    }}>
                      {brokerageAmount.toLocaleString('en-IN')} /-
                    </div>
                  </div>
                </td>
              </tr>

              {/* ── ROW 2: Executive Bonus (conditional) ── */}
              {Number(data.executiveBonus) > 0 && (
                <tr style={{ borderTop: '2px solid #000' }}>
                  <td style={{
                    borderRight: '2px solid #000', textAlign: 'center',
                    fontSize: '12px', padding: '10px 6px',
                  }}>2.</td>
                  <td style={{
                    borderRight: '2px solid #000',
                    fontWeight: 'bold', fontSize: '12px',
                    padding: '10px 10px',
                  }}>
                    Executive Bonus &nbsp;&nbsp;&nbsp;:- &nbsp;&nbsp;&nbsp;{Number(data.executiveBonus).toLocaleString('en-IN')} /–
                  </td>
                  <td style={{ borderRight: '2px solid #000', padding: '10px 6px' }}></td>
                  <td style={{
                    textAlign: 'right', fontWeight: 'bold',
                    fontSize: '12px', padding: '10px 10px 10px 0',
                  }}>
                    {Number(data.executiveBonus).toLocaleString('en-IN')} /-
                  </td>
                </tr>
              )}

              {/* ── TOTAL ROW ── */}
              <tr style={{ borderTop: '2px solid #000', borderBottom: '2px solid #000' }}>
                <td style={{ borderRight: '2px solid #000', padding: '6px 6px' }}></td>
                <td style={{
                  borderRight: '2px solid #000',
                  textAlign: 'center', fontWeight: 'bold', fontSize: '13px',
                  padding: '6px 10px',
                }}>Total</td>
                <td style={{ borderRight: '2px solid #000', padding: '6px 6px' }}></td>
                <td style={{
                  textAlign: 'right', fontWeight: 'bold',
                  fontSize: '13px', padding: '6px 10px 6px 0',
                }}>
                  {totalAmount.toLocaleString('en-IN')} /-
                </td>
              </tr>

              {/* ── AMOUNT IN WORDS ── */}
              <tr>
                <td colSpan="4" style={{
                  textAlign: 'center', fontWeight: 'bold',
                  fontSize: '11px', padding: '7px 10px',
                }}>
                  Amount in words :- {numberToWords(totalAmount)}
                </td>
              </tr>

            </tbody>
          </table>

          {/* ── FOOTER (inside border) ── */}
          <div style={{
            borderTop: '2px solid #000',
            padding: '8px 14px 14px 14px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>

              {/* ── Bank Details left ── */}
              <div style={{ fontSize: '11px', lineHeight: '1.7', flex: 1 }}>
                <div style={{ fontWeight: 'bold', fontSize: '11px', marginBottom: '2px' }}>
                  Channel Partner Cheque favouring Name : {profile?.agentName || 'Saurabh Shivaji Gade'}
                </div>
                <div style={{ marginBottom: '2px' }}>
                  As Per RERA Certificate Name &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: {profile?.agentName || 'Saurabh Shivaji Gade'}
                </div>
                <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '4px' }}>
                  For NEFT / RTGS – Bank A/C details........
                </div>
                <div style={{ fontSize: '10px', marginBottom: '6px', color: '#333' }}>
                  Bank Name &amp; Address :- {profile?.bankName || 'HDFC Bank,S No, 648 Pune, Pune – Ahmednagar Hwy'}<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  {profile?.bankAddress || 'Near Lifeline Hospital, Wagholi, Pune, Maharashtra 412207'}
                </div>
                {[
                  ['Account Type', profile?.accountType || 'Saving'],
                  ['Account No', profile?.accountNo || '50100560608282'],
                  ['IFSC Code', profile?.ifscCode || 'HDFC0009332'],
                ].map(([label, value]) => (
                  <div key={label} style={{
                    display: 'grid', gridTemplateColumns: '100px 12px auto',
                    fontWeight: 'bold', fontSize: '11px', lineHeight: '1.7',
                  }}>
                    <span>{label}</span>
                    <span>:</span>
                    <span>{value}</span>
                  </div>
                ))}
              </div>

              {/* ── Signature right ── */}
              <div style={{
                width: '160px', textAlign: 'center',
                fontWeight: 'bold', fontSize: '11px',
                lineHeight: '1.5', paddingBottom: '4px',
              }}>
                <div style={{ marginBottom: '40px' }}></div>{/* space for stamp */}
                <div>(Stamp and signature of channel partner)</div>
                <div>Authorised Signatory</div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}