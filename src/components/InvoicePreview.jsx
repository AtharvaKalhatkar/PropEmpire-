import InvoiceTemplate from './InvoiceTemplate';
import { generateInvoicePdfBlob } from '../utils/invoiceTemplate';
import { downloadPdfBlob } from '../utils/pdf';

const BTN = (bg) => ({
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

export default function InvoicePreview({ data, profile, brokerageAmount, totalAmount, executiveBonus = 0 }) {
	const handleDownloadPDF = async () => {
		try {
			const blob = await generateInvoicePdfBlob({ data, profile, brokerageAmount, totalAmount, executiveBonus });
			downloadPdfBlob(blob, `Invoice_${data.invoiceNo || '01'}.pdf`);
		} catch (error) {
			console.error('PDF generation error:', error);
			alert('PDF generation failed while building the invoice PDF.');
		}
	};

	return (
		<div style={{ fontFamily: 'Poppins, Arial, Helvetica, sans-serif', color: '#000' }}>
			<div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '20px' }}>
				<button
					style={BTN('#004b73')}
					onClick={handleDownloadPDF}
				>
					⬇&nbsp; Download PDF
				</button>
				<button style={BTN('#333')} onClick={() => window.print()}>
					🖨&nbsp; Print
				</button>
			</div>

			<div id="invoice-preview" style={{ width: '100%', display: 'flex', justifyContent: 'center', backgroundColor: '#fff', boxSizing: 'border-box', margin: '0 auto' }}>
				<InvoiceTemplate
					data={data}
					profile={profile}
					brokerageAmount={brokerageAmount}
					totalAmount={totalAmount}
				/>
			</div>
		</div>
	);
}