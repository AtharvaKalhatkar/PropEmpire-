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

  // ── Base text sizes (matching reference photo at ~595pt A4 width) ──
  const F = {
    xs:   '7.5px',
    sm:   '9px',
    base: '10px',
    md:   '11px',
    lg:   '13px',
    xl:   '18px',
    xxl:  '26px',
  };

  const border1 = '1.5px solid #000';

  // ── Shared td/th styles ──
  const thBase = {
    border: 'none',
    borderRight: border1,
    borderBottom: border1,
    padding: '4px 6px',
    fontWeight: 'bold',
    fontSize: F.md,
    backgroundColor: '#fff',
    textAlign: 'center',
  };
  const tdBase = {
    border: 'none',
    borderRight: border1,
    padding: '4px 8px',
    verticalAlign: 'top',
    fontSize: F.md,
  };

  return (
    /* ── PAGE WRAPPER: width fixed, height = content only ── */
    <div style={{
      width: '595px',          /* A4 width at 72dpi (PDF point width) */
      backgroundColor: '#fff',
      fontFamily: 'Arial, Helvetica, sans-serif',
      color: '#000',
      fontSize: F.md,
      lineHeight: '1.35',
      boxSizing: 'border-box',
      padding: '20px 18px',
      margin: '0 auto',
    }}>

      {/* ── OUTER BORDER BOX (content-height only) ── */}
      <div style={{
        border: border1,
        position: 'relative',
        overflow: 'hidden',
      }}>

        {/* WATERMARK */}
        <div style={{
          position: 'absolute', top: '55%', left: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: 0.07, pointerEvents: 'none', zIndex: 0,
          width: '300px', height: '300px',
        }}>
          <img src={displayLogo} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>

          {/* ══ HEADER ══ */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '8px 10px 6px 10px',
          }}>
            <img src={displayLogo} alt="Logo"
              style={{ maxHeight: '60px', maxWidth: '130px', objectFit: 'contain' }} />

            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontSize: F.xxl, fontWeight: '900',
                color: '#1a4e7a', textTransform: 'uppercase',
                letterSpacing: '0.3px', lineHeight: '1.1',
              }}>
                {profile?.agentName || 'SAURABH SHIVAJI GADE'}
              </div>
              <div style={{ fontSize: F.base, color: '#1a4e7a', marginTop: '3px' }}>
                Email id :- {profile?.email || 'saurabhgade32@gmail.com'}
              </div>
              <div style={{ fontSize: F.base, color: '#1a4e7a', marginTop: '1px' }}>
                Mobile :- {profile?.mobile || '9730953309'}
              </div>
            </div>
          </div>

          {/* ══ TAX INVOICE BANNER ══ */}
          <div style={{
            backgroundColor: '#a3c3cc',
            borderTop: border1, borderBottom: border1,
            textAlign: 'center',
            fontWeight: 'bold',
            fontSize: F.lg,
            letterSpacing: '1px',
            padding: '3px 0',
          }}>
            TAX INVOICE
          </div>

          {/* ══ INVOICE NO / DATE ══ */}
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            padding: '3px 10px',
            fontSize: F.md, fontWeight: 'bold',
            borderBottom: border1,
          }}>
            <div>Invoice No :- {data.invoiceNo}</div>
            <div>Date :- {data.date ? new Date(data.date).toLocaleDateString('en-GB') : ''}</div>
          </div>

          {/* ══ TO (BILLED TO) ══ */}
          <div style={{
            padding: '4px 10px',
            fontSize: F.base, lineHeight: '1.5',
            borderBottom: border1,
          }}>
            <div style={{ fontWeight: 'bold', fontSize: F.md }}>
              To - {data.billedToName || data.customerName || ''}
            </div>
            {data.billedToAddress && (
              <div style={{ paddingLeft: '24px', whiteSpace: 'pre-line' }}>
                {data.billedToAddress}
              </div>
            )}
            {data.billedToGstin && (
              <div style={{ paddingLeft: '24px', fontWeight: 'bold', marginTop: '2px' }}>
                GSTIN : {data.billedToGstin}
              </div>
            )}
          </div>

          {/* ══ CHANNEL PARTNER ROW ══ */}
          <div style={{ display: 'flex', borderBottom: border1 }}>
            <div style={{
              flex: '1.4', padding: '4px 10px',
              borderRight: border1,
              fontSize: F.sm, lineHeight: '1.5',
            }}>
              <div style={{ fontWeight: 'bold' }}>• Channel Partner REAP ID : NA</div>
              <div style={{ fontWeight: 'bold' }}>• Channel Partner GaTIN &nbsp;&nbsp;: NA</div>
              <div style={{ fontWeight: 'bold' }}>• Service Account Code &nbsp;&nbsp;: MAHARASHTRA</div>
              <div style={{ fontSize: F.xs, fontStyle: 'italic', color: '#333', marginTop: '1px' }}>
                ( Building sales on a fee / commission basis or contract basis )
              </div>
              <div style={{ fontSize: F.xs, fontStyle: 'italic', color: '#333' }}>
                Place of flat sold ( it should mention state where service is rendered )
              </div>
            </div>
            <div style={{
              flex: '1', padding: '4px 10px',
              display: 'flex', flexDirection: 'column', justifyContent: 'center',
              textAlign: 'right', fontWeight: 'bold',
              fontSize: F.base, lineHeight: '1.8',
            }}>
              <div>Channel Partner Rera No :- {profile?.reraNo || 'A52100041995'}</div>
              <div>Channel Partner Pan No :- {profile?.panNo || 'DDHPG6896K'}</div>
            </div>
          </div>

          {/* ══ MAIN TABLE ══ */}
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ ...thBase, width: '40px', textAlign: 'center' }}>Sr.No</th>
                <th style={{ ...thBase, textAlign: 'left', paddingLeft: '10px' }}>Particulars</th>
                <th style={{ ...thBase, width: '66px' }}>Tax Rate</th>
                <th style={{ ...thBase, width: '100px', borderRight: 'none' }}>Amount</th>
              </tr>
            </thead>
            <tbody>

              {/* ── ROW 1: Service ── */}
              <tr>
                <td style={{ ...tdBase, textAlign: 'center', paddingTop: '10px', fontSize: F.md }}>1.</td>

                <td style={{ ...tdBase, paddingTop: '8px', paddingBottom: '6px' }}>
                  <div style={{
                    fontWeight: 'bold', fontSize: F.md,
                    display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px',
                  }}>
                    <span style={{ fontSize: '8px' }}>■</span> Description of service provided
                  </div>
                  {[
                    ['Customer Name',     data.customerName],
                    ['Project Name.',     data.projectName],
                    ['Tower',             data.tower],
                    ['Flat No',          data.flatNo],
                    ['Considerable Value', `${Number(data.agreementValue).toLocaleString('en-IN')} /-`],
                    ['Brokerage',         `${data.brokeragePercent} %`],
                  ].map(([label, value]) => (
                    <div key={label} style={{
                      display: 'grid',
                      gridTemplateColumns: '110px 14px auto',
                      margin: '2px 0',
                      paddingLeft: '6px',
                      fontSize: F.base,
                      lineHeight: '1.4',
                    }}>
                      <span>{label}</span>
                      <span>:-</span>
                      <span style={{ fontWeight: 'bold' }}>{value}</span>
                    </div>
                  ))}
                </td>

                {/* Tax Rate */}
                <td style={{
                  ...tdBase,
                  textAlign: 'center', fontWeight: 'bold',
                  verticalAlign: 'middle', fontSize: F.md,
                }}>
                  {data.brokeragePercent} %
                </td>

                {/* Amount — top value + bottom sub-bar */}
                <td style={{ borderBottom: 'none', padding: 0, verticalAlign: 'top' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div style={{
                      flex: 1,
                      textAlign: 'right', fontWeight: 'bold',
                      padding: '10px 8px 0 0', fontSize: F.md,
                    }}>
                      {brokerageAmount.toLocaleString('en-IN')} /-
                    </div>
                    <div style={{
                      borderTop: border1,
                      textAlign: 'right', fontWeight: 'bold',
                      padding: '4px 8px', fontSize: F.md,
                    }}>
                      {brokerageAmount.toLocaleString('en-IN')} /-
                    </div>
                  </div>
                </td>
              </tr>

              {/* ── ROW 2: Executive Bonus (conditional) ── */}
              {Number(data.executiveBonus) > 0 && (
                <tr style={{ borderTop: border1 }}>
                  <td style={{ ...tdBase, textAlign: 'center', fontSize: F.md, padding: '6px' }}>2.</td>
                  <td style={{ ...tdBase, fontWeight: 'bold', fontSize: F.md, padding: '6px 10px' }}>
                    Executive Bonus &nbsp;&nbsp;:- &nbsp;&nbsp;{Number(data.executiveBonus).toLocaleString('en-IN')} /–
                  </td>
                  <td style={{ ...tdBase, padding: '6px' }}></td>
                  <td style={{
                    textAlign: 'right', fontWeight: 'bold',
                    fontSize: F.md, padding: '6px 8px 6px 0',
                  }}>
                    {Number(data.executiveBonus).toLocaleString('en-IN')} /-
                  </td>
                </tr>
              )}

              {/* ── TOTAL ROW ── */}
              <tr style={{ borderTop: border1, borderBottom: border1 }}>
                <td style={{ ...tdBase, padding: '4px 6px' }}></td>
                <td style={{
                  ...tdBase,
                  textAlign: 'center', fontWeight: 'bold',
                  fontSize: F.md, padding: '4px 10px',
                }}>Total</td>
                <td style={{ ...tdBase, padding: '4px 6px' }}></td>
                <td style={{
                  textAlign: 'right', fontWeight: 'bold',
                  fontSize: F.lg, padding: '4px 8px 4px 0',
                  borderRight: 'none',
                }}>
                  {totalAmount.toLocaleString('en-IN')} /-
                </td>
              </tr>

              {/* ── AMOUNT IN WORDS ── */}
              <tr>
                <td colSpan="4" style={{
                  textAlign: 'center', fontWeight: 'bold',
                  fontSize: F.base, padding: '5px 8px',
                  borderTop: 'none',
                }}>
                  Amount in words :- {numberToWords(totalAmount)}
                </td>
              </tr>

            </tbody>
          </table>

          {/* ══ FOOTER ══ */}
          <div style={{
            borderTop: border1,
            padding: '6px 10px 10px 10px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}>

            {/* Bank details left */}
            <div style={{ fontSize: F.base, lineHeight: '1.6', flex: 1 }}>
              <div style={{ fontWeight: 'bold', fontSize: F.md, marginBottom: '1px' }}>
                Channel Partner Cheque favouring Name : {profile?.agentName || 'Saurabh Shivaji Gade'}
              </div>
              <div style={{ marginBottom: '1px' }}>
                As Per RERA Certificate Name &nbsp;&nbsp;&nbsp;: {profile?.agentName || 'Saurabh Shivaji Gade'}
              </div>
              <div style={{ fontWeight: 'bold', fontSize: F.md, marginBottom: '2px' }}>
                For NEFT / RTGS – Bank A/C details........
              </div>
              <div style={{ fontSize: F.sm, marginBottom: '4px', color: '#222' }}>
                Bank Name &amp; Address :- {profile?.bankName || 'HDFC Bank,S No, 648 Pune, Pune – Ahmednagar Hwy'}<br />
                <span style={{ paddingLeft: '108px' }}>
                  {profile?.bankAddress || 'Near Lifeline Hospital, Wagholi, Pune, Maharashtra 412207'}
                </span>
              </div>
              {[
                ['Account Type', profile?.accountType || 'Saving'],
                ['Account No',   profile?.accountNo   || '50100560608282'],
                ['IFSC Code',    profile?.ifscCode    || 'HDFC0009332'],
              ].map(([label, value]) => (
                <div key={label} style={{
                  display: 'grid',
                  gridTemplateColumns: '82px 10px auto',
                  fontWeight: 'bold',
                  fontSize: F.base,
                  lineHeight: '1.6',
                }}>
                  <span>{label}</span>
                  <span>:</span>
                  <span>{value}</span>
                </div>
              ))}
            </div>

            {/* Signature right */}
            <div style={{
              width: '130px',
              textAlign: 'center',
              fontWeight: 'bold',
              fontSize: F.base,
              lineHeight: '1.4',
              paddingBottom: '2px',
              flexShrink: 0,
            }}>
              <div style={{ height: '32px' }} />{/* stamp space */}
              <div>(Stamp and signature of<br />channel partner)</div>
              <div>Authorised Signatory</div>
            </div>

          </div>

        </div>{/* /zIndex:1 */}
      </div>{/* /outer border */}
    </div>
  );
}