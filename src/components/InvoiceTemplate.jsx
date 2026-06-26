import { BASE_HEIGHT, BASE_WIDTH, formatDate, formatINR, invoiceTemplatePdfSrc, POSITIONS, numberToWords } from '../utils/invoiceTemplate';

const Field = ({ x, y, value, style = {} }) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      whiteSpace: 'nowrap',
      lineHeight: 1,
      color: '#000',
      fontFamily: 'Poppins, Arial, Helvetica, sans-serif',
      ...style,
    }}
  >
    {value}
  </div>
);

const PREVIEW_FIELD_STYLES = {
  invoiceNo: { fontSize: '14px', fontWeight: 600 },
  date: { fontSize: '14px', fontWeight: 600 },
  billedToName: { fontSize: '14px', fontWeight: 600 },
  billedToAddress: {
    fontSize: '9px',
    fontWeight: 400,
    whiteSpace: 'pre-wrap',
    lineHeight: '1.1',
    maxWidth: '500px',
  },
  gstin: { fontSize: '14px', fontWeight: 600 },
  customerName: { fontSize: '13px', fontWeight: 600 },
  projectName: { fontSize: '13px', fontWeight: 600 },
  towerName: { fontSize: '13px', fontWeight: 600 },
  flatNo: { fontSize: '13px', fontWeight: 600 },
  taxRate: { fontSize: '15px', fontWeight: 700, textAlign: 'center', width: '13.3%' },
  brokerageAmount: { fontSize: '15px', fontWeight: 700, textAlign: 'right', width: '13.3%' },
  subtotalAmount: { fontSize: '15px', fontWeight: 700, textAlign: 'right', width: '13.3%' },
  executiveBonus: { fontSize: '13px', fontWeight: 700, textAlign: 'right', width: '100%' },
  totalAmount: { fontSize: '16px', fontWeight: 800, textAlign: 'right', width: '13.3%' },
  amountInWords: { fontSize: '13px', fontWeight: 700, width: '100%' },
  bankFavouringName: { fontSize: '14px', fontWeight: 600, width: '39.8%' },
  reraName: { fontSize: '14px', fontWeight: 600, width: '39.8%' },
  accountType: { fontSize: '14px', fontWeight: 600, width: '28.8%' },
  accountNo: { fontSize: '14px', fontWeight: 600, width: '28.8%' },
  ifscCode: { fontSize: '14px', fontWeight: 600, width: '28.8%' },
};

export default function InvoiceTemplate({ data = {}, profile = {}, brokerageAmount = 0, totalAmount = 0, executiveBonus = 0 }) {
  const invoiceDate = formatDate(data.date);
  const billedToName = data.billedToName || data.customerName || '';
  const billedToAddress = data.billedToAddress || '';
  const gstin = data.billedToGstin || '';
  const customerName = data.customerName || '';
  const projectName = data.projectName || '';
  const towerName = data.tower || '';
  const flatNo = data.flatNo || '';
  const taxRate = data.brokeragePercent ? `${data.brokeragePercent} %` : '';
  const bankFavouringName = profile?.bankFavouringName || profile?.agentName || '';
  const reraName = profile?.agentName || '';
  const accountType = profile?.accountType || '';
  const accountNo = profile?.accountNo || '';
  const ifscCode = profile?.ifscCode || '';

  console.log({
    pageWidth: BASE_WIDTH,
    pageHeight: BASE_HEIGHT,
    scale: 1,
    viewportWidth: typeof window !== 'undefined' ? window.innerWidth : undefined,
    viewportHeight: typeof window !== 'undefined' ? window.innerHeight : undefined,
  });

  return (
    <div
      style={{
        width: `${BASE_WIDTH}px`,
        height: `${BASE_HEIGHT}px`,
        margin: '0 auto',
        overflow: 'hidden',
        backgroundColor: '#fff',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          fontFamily: 'Poppins, Arial, Helvetica, sans-serif',
          color: '#000',
        }}
      >
        <iframe
          src={invoiceTemplatePdfSrc}
          title="Invoice template"
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            border: 'none',
            pointerEvents: 'none',
          }}
        />

        <Field x={POSITIONS.invoiceNo.x} y={POSITIONS.invoiceNo.y} value={data.invoiceNo || ''} style={PREVIEW_FIELD_STYLES.invoiceNo} />
        <Field x={POSITIONS.date.x} y={POSITIONS.date.y} value={invoiceDate} style={PREVIEW_FIELD_STYLES.date} />

        <Field x={POSITIONS.billedToName.x} y={POSITIONS.billedToName.y} value={billedToName} style={PREVIEW_FIELD_STYLES.billedToName} />
        <Field x={POSITIONS.billedToAddress.x} y={POSITIONS.billedToAddress.y} value={billedToAddress} style={PREVIEW_FIELD_STYLES.billedToAddress} />
        <Field x={POSITIONS.gstin.x} y={POSITIONS.gstin.y} value={gstin} style={PREVIEW_FIELD_STYLES.gstin} />

        <Field x={POSITIONS.customerName.x} y={POSITIONS.customerName.y} value={customerName} style={PREVIEW_FIELD_STYLES.customerName} />
        <Field x={POSITIONS.projectName.x} y={POSITIONS.projectName.y} value={projectName} style={PREVIEW_FIELD_STYLES.projectName} />
        <Field x={POSITIONS.towerName.x} y={POSITIONS.towerName.y} value={towerName} style={PREVIEW_FIELD_STYLES.towerName} />
        <Field x={POSITIONS.flatNo.x} y={POSITIONS.flatNo.y} value={flatNo} style={PREVIEW_FIELD_STYLES.flatNo} />

        <Field x={POSITIONS.taxRate.x} y={POSITIONS.taxRate.y} value={taxRate} style={PREVIEW_FIELD_STYLES.taxRate} />

        <Field x={POSITIONS.brokerageAmount.x} y={POSITIONS.brokerageAmount.y} value={`${formatINR(brokerageAmount)} /-`} style={PREVIEW_FIELD_STYLES.brokerageAmount} />
        <Field x={POSITIONS.subtotalAmount.x} y={POSITIONS.subtotalAmount.y} value={`${formatINR(brokerageAmount)} /-`} style={PREVIEW_FIELD_STYLES.subtotalAmount} />
        {executiveBonus > 0 && (
          <Field x={POSITIONS.executiveBonus.x} y={POSITIONS.executiveBonus.y} value={`${formatINR(executiveBonus)} /-`} style={PREVIEW_FIELD_STYLES.executiveBonus} />
        )}
        <Field x={POSITIONS.totalAmount.x} y={POSITIONS.totalAmount.y} value={`${formatINR(totalAmount)} /-`} style={PREVIEW_FIELD_STYLES.totalAmount} />
        <Field x={POSITIONS.amountInWords.x} y={POSITIONS.amountInWords.y} value={numberToWords(totalAmount)} style={PREVIEW_FIELD_STYLES.amountInWords} />

        <Field x={POSITIONS.bankFavouringName.x} y={POSITIONS.bankFavouringName.y} value={bankFavouringName} style={PREVIEW_FIELD_STYLES.bankFavouringName} />
        <Field x={POSITIONS.reraName.x} y={POSITIONS.reraName.y} value={reraName} style={PREVIEW_FIELD_STYLES.reraName} />

        <Field x={POSITIONS.accountType.x} y={POSITIONS.accountType.y} value={accountType} style={PREVIEW_FIELD_STYLES.accountType} />
        <Field x={POSITIONS.accountNo.x} y={POSITIONS.accountNo.y} value={accountNo} style={PREVIEW_FIELD_STYLES.accountNo} />
        <Field x={POSITIONS.ifscCode.x} y={POSITIONS.ifscCode.y} value={ifscCode} style={PREVIEW_FIELD_STYLES.ifscCode} />
      </div>
    </div>
  );
}