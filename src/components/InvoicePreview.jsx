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

  return (
    <div style={{
      width: '100%',
      height: '100%',
      backgroundColor: '#fff',
      fontFamily: 'Arial, Helvetica, sans-serif',
      color: '#000',
      boxSizing: 'border-box',
      padding: '40px',
      margin: '0 auto',
      position: 'relative'
    }}>
      {/* Outer Border */}
      <div style={{
        border: '1.5px solid #000',
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column'
      }}>
        
        {/* WATERMARK */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: 0.1, pointerEvents: 'none', zIndex: 0,
          width: '500px', height: '500px',
        }}>
          <img src={displayLogo} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', flex: 1 }}>
          
          {/* 1. HEADER */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 20px' }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <img src={displayLogo} alt="Logo" style={{ maxHeight: '100px', maxWidth: '200px', objectFit: 'contain' }} />
            </div>
            {/* Agent Info */}
            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: '900', color: '#004b73', marginBottom: '8px', letterSpacing: '0.5px' }}>
                {profile?.agentName || 'SAURABH SHIVAJI GADE'}
              </div>
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#004b73', marginBottom: '4px' }}>
                Email id :- {profile?.email || 'saurabhgade32@gmail.com'}
              </div>
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#004b73' }}>
                Mobile :- {profile?.mobile || '9730953309'}
              </div>
            </div>
          </div>

          {/* 2. TAX INVOICE BANNER */}
          <div style={{
            backgroundColor: '#a3c5d1',
            borderTop: '1.5px solid #000',
            borderBottom: '1.5px solid #000',
            textAlign: 'center',
            fontWeight: '900',
            fontSize: '20px',
            padding: '6px 0',
            letterSpacing: '1px'
          }}>
            TAX INVOICE
          </div>

          {/* 3. INVOICE NO & DATE */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 20px', borderBottom: '1.5px solid #000', fontSize: '13px', fontWeight: 'bold' }}>
            <div>Invoice No :- {data.invoiceNo}</div>
            <div>Date :- {data.date ? new Date(data.date).toLocaleDateString('en-GB') : ''}</div>
          </div>

          {/* 4. TO BOX */}
          <div style={{ padding: '10px 20px', borderBottom: '1.5px solid #000', fontSize: '12px', lineHeight: '1.6' }}>
            <div style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '4px' }}>
              To - {data.billedToName || data.customerName || ''}
            </div>
            {data.billedToAddress && (
              <div style={{ paddingLeft: '32px', whiteSpace: 'pre-line' }}>{data.billedToAddress}</div>
            )}
            {data.billedToGstin && (
              <div style={{ paddingLeft: '32px', fontWeight: 'bold', marginTop: '4px' }}>GSTIN : {data.billedToGstin}</div>
            )}
          </div>

          {/* 5. CHANNEL PARTNER DETAILS */}
          <div style={{ display: 'flex', borderBottom: '1.5px solid #000', fontSize: '10px' }}>
            <div style={{ flex: '1.4', padding: '8px 15px', borderRight: '1.5px solid #000', lineHeight: '1.6' }}>
              <div style={{ fontWeight: 'bold' }}>• Channel Partner REAP ID : NA</div>
              <div style={{ fontWeight: 'bold' }}>• Channel Partner GaTIN &nbsp;&nbsp;: NA</div>
              <div style={{ fontWeight: 'bold' }}>• Service Account Code &nbsp;&nbsp;: MAHARASHTRA</div>
              <div style={{ fontSize: '9px', fontStyle: 'italic', marginTop: '4px' }}>( Building sales on a fee / commission basis or contract basis )</div>
              <div style={{ fontSize: '9px', fontStyle: 'italic' }}>Place of flat sold ( it should mention state where service is rendered )</div>
            </div>
            <div style={{ flex: '1', padding: '8px 15px', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'right', fontWeight: 'bold', fontSize: '11px', lineHeight: '2' }}>
              <div>Channel Partner Rera No :- {profile?.reraNo || 'A52100041995'}</div>
              <div>Channel Partner Pan No :- {profile?.panNo || 'DDHPG6896K'}</div>
            </div>
          </div>

          {/* 6. TABLE */}
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', fontSize: '13px' }}>
            <colgroup>
              <col style={{ width: '60px' }} />
              <col />
              <col style={{ width: '90px' }} />
              <col style={{ width: '130px' }} />
            </colgroup>
            <thead>
              <tr style={{ borderBottom: '1.5px solid #000' }}>
                <th style={{ padding: '8px', borderRight: '1.5px solid #000' }}>Sr.No</th>
                <th style={{ padding: '8px', borderRight: '1.5px solid #000', textAlign: 'left' }}>Particulars</th>
                <th style={{ padding: '8px', borderRight: '1.5px solid #000' }}>Tax Rate</th>
                <th style={{ padding: '8px' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {/* Row 1 */}
              <tr style={{ borderBottom: '1.5px solid #000' }}>
                <td style={{ borderRight: '1.5px solid #000', textAlign: 'center', verticalAlign: 'top', padding: '15px 8px' }}>1.</td>
                <td style={{ borderRight: '1.5px solid #000', padding: '15px 15px', verticalAlign: 'top' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '10px' }}>■</span> Description of service provided
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '130px 20px auto', rowGap: '6px', fontSize: '12px' }}>
                    <div>Customer Name</div><div>:-</div><div style={{ fontWeight: 'bold' }}>{data.customerName}</div>
                    <div>Project Name.</div><div>:-</div><div style={{ fontWeight: 'bold' }}>{data.projectName}</div>
                    <div>Tower</div><div>:-</div><div style={{ fontWeight: 'bold' }}>{data.tower}</div>
                    <div>Flat No</div><div>:-</div><div style={{ fontWeight: 'bold' }}>{data.flatNo}</div>
                    <div>Considerable Value</div><div>:-</div><div style={{ fontWeight: 'bold' }}>{Number(data.agreementValue).toLocaleString('en-IN')} /-</div>
                    <div>Brokerage</div><div>:-</div><div style={{ fontWeight: 'bold' }}>{data.brokeragePercent} %</div>
                  </div>
                </td>
                <td style={{ borderRight: '1.5px solid #000', textAlign: 'center', verticalAlign: 'middle', fontWeight: 'bold', fontSize: '14px' }}>
                  {data.brokeragePercent} %
                </td>
                <td style={{ padding: 0, verticalAlign: 'top' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '200px' }}>
                    <div style={{ flex: 1, textAlign: 'right', fontWeight: 'bold', fontSize: '14px', padding: '15px 10px' }}>
                      {brokerageAmount.toLocaleString('en-IN')} /-
                    </div>
                    {/* Subtotal line at bottom of row */}
                    <div style={{ borderTop: '1.5px solid #000', textAlign: 'right', fontWeight: 'bold', fontSize: '14px', padding: '8px 10px' }}>
                      {brokerageAmount.toLocaleString('en-IN')} /-
                    </div>
                  </div>
                </td>
              </tr>

              {/* Row 2: Bonus */}
              {Number(data.executiveBonus) > 0 && (
                <tr style={{ borderBottom: '1.5px solid #000' }}>
                  <td style={{ borderRight: '1.5px solid #000', textAlign: 'center', padding: '10px 8px' }}>2.</td>
                  <td style={{ borderRight: '1.5px solid #000', padding: '10px 15px', fontWeight: 'bold', display: 'flex', gap: '30px' }}>
                    <span>Executive Bonus</span> <span>:-</span> <span>{Number(data.executiveBonus).toLocaleString('en-IN')} /-</span>
                  </td>
                  <td style={{ borderRight: '1.5px solid #000' }}></td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '14px', padding: '10px 10px' }}>
                    {Number(data.executiveBonus).toLocaleString('en-IN')} /-
                  </td>
                </tr>
              )}

              {/* Total Row */}
              <tr style={{ borderBottom: '1.5px solid #000' }}>
                <td colSpan="2" style={{ borderRight: '1.5px solid #000', textAlign: 'center', fontWeight: 'bold', fontSize: '16px', padding: '8px' }}>Total</td>
                <td style={{ borderRight: '1.5px solid #000' }}></td>
                <td style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '16px', padding: '8px 10px' }}>
                  {totalAmount.toLocaleString('en-IN')} /-
                </td>
              </tr>

              {/* Amount in words */}
              <tr>
                <td colSpan="4" style={{ padding: '8px 15px', fontWeight: 'bold', fontSize: '12px' }}>
                  Amount in words :- {numberToWords(totalAmount)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* 7. FOOTER */}
          <div style={{ borderTop: '1.5px solid #000', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', flex: 1 }}>
            {/* Left Box */}
            <div style={{ flex: 1, fontSize: '11px', lineHeight: '1.6' }}>
              <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '2px' }}>
                Channel Partner Cheque favouring Name : {profile?.bankFavouringName || 'SAURABH SHIVAJI GADE'}
              </div>
              <div style={{ marginBottom: '6px' }}>
                As Per RERA Certificate Name &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: {profile?.agentName || 'SAURABH SHIVAJI GADE'}
              </div>
              
              <div style={{ fontWeight: 'bold', fontSize: '12px', textDecoration: 'underline', marginBottom: '4px' }}>
                For NEFT / RTGS - Bank A/C details.........
              </div>
              
              <div style={{ fontSize: '10px', color: '#444', marginBottom: '8px' }}>
                Bank Name & Address :- {profile?.bankName || 'HDFC Bank,S No, 648 Pune, Pune - Ahmednagar Hwy'}<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{profile?.bankAddress || 'Near Lifeline Hospital, Wagholi, Pune, Maharashtra 412207'}
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '120px 20px auto', fontWeight: 'bold', fontSize: '11px' }}>
                <div>Account Type</div><div>:</div><div>{profile?.accountType || 'Saving'}</div>
                <div>Account No</div><div>:</div><div>{profile?.accountNo || '50100560608282'}</div>
                <div>IFSC Code</div><div>:</div><div>{profile?.ifscCode || 'HDFC0009332'}</div>
              </div>
            </div>

            {/* Right Signature */}
            <div style={{ width: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: '10px' }}>
              <div style={{ fontSize: '11px', fontWeight: 'bold', fontStyle: 'italic', textAlign: 'center', marginBottom: '40px' }}>
                (Stamp and signature of<br/>channel partner)
              </div>
              <div style={{ fontWeight: 'bold', fontSize: '13px' }}>Authorised Signatory</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
