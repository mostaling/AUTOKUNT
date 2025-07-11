
import type { Invoice, Customer, AppSettings, Language } from '../types';

declare const jspdf: any;

// Helper to check if the language is RTL
const isRTL = (lang: Language) => lang === 'ar';

export const generateInvoicePDF = (
  invoice: Invoice, 
  customer: Customer, 
  settings: AppSettings,
  lang: Language,
  t: (key: string, options?: any) => string
) => {
  const doc = new jspdf.jsPDF('p', 'mm', 'a4');
  const { companyInfo, vatRate, currencyCode } = settings;
  const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
  const margin = 15;

  // Set document direction
  doc.setLanguage(lang);
  doc.setR2L(isRTL(lang));

  // Load fonts - Using built-in 'helvetica' for simplicity.
  // For full character support, especially Arabic, embedding a TTF font would be required.
  const font = 'helvetica';
  doc.setFont(font);

  // --- Colors ---
  const primaryColor = '#000000';
  const secondaryColor = '#555555';
  const lightGrayColor = '#CCCCCC';
  const veryLightGrayColor = '#F5F5F5';

  doc.setTextColor(primaryColor);
  
  // Helper for positioning text based on LTR/RTL
  const text = (str: string, x: number, y: number, options: any = {}) => {
      const H_ALIGN = isRTL(lang) ? 'right' : 'left';
      const X = isRTL(lang) ? pageWidth - x : x;
      doc.text(str, X, y, { align: H_ALIGN, ...options });
  };
  
  const rightAlignedText = (str: string, y: number, options: any = {}) => {
      const H_ALIGN = isRTL(lang) ? 'left' : 'right';
      const X = isRTL(lang) ? margin : pageWidth - margin;
      doc.text(str, X, y, { align: H_ALIGN, ...options });
  };


  // --- Document Title ---
  doc.setFontSize(22);
  doc.setFont(font, 'bold');
  rightAlignedText(t('pdf.invoiceTitle'), margin + 5);

  // --- Company Info (Sender) ---
  doc.setFontSize(10);
  doc.setFont(font, 'normal');
  let currentY = margin + 20;
  text(companyInfo.name, margin, currentY);
  currentY += 5;
  const companyAddressLines = doc.splitTextToSize(companyInfo.address, 80);
  text(companyAddressLines, margin, currentY);
  currentY += companyAddressLines.length * 5;
  text(`${t('pdf.phoneLabel')}: ${companyInfo.phone}`, margin, currentY);
  currentY += 5;
  text(`${t('pdf.emailLabel')}: ${companyInfo.email}`, margin, currentY);
  currentY += 5;
  if (companyInfo.vatId) {
    text(`${t('pdf.vatIdLabel')}: ${companyInfo.vatId}`, margin, currentY);
  }

  // --- Client & Invoice Details ---
  const detailsYStart = margin + 20;
  const addDetail = (label: string, value: string, yOffset: number) => {
    doc.setFont(font, 'bold');
    rightAlignedText(label, detailsYStart + yOffset);
    doc.setFont(font, 'normal');
    const valueX = isRTL(lang) ? margin + 35 : pageWidth - margin - 35;
    const valueAlign = isRTL(lang) ? 'left' : 'right';
    doc.text(value, valueX, detailsYStart + yOffset, { align: valueAlign });
  };
  
  const dateLocale = lang === 'ar' ? 'ar-TN' : `${lang}-${lang.toUpperCase()}`;
  addDetail(`${t('pdf.invoiceNumberLabel')}:`, invoice.invoiceNumber, 0);
  addDetail(`${t('pdf.invoiceDateLabel')}:`, new Date(invoice.date).toLocaleDateString(dateLocale), 7);
  if (invoice.dueDate) {
    addDetail(`${t('pdf.dueDateLabel')}:`, new Date(invoice.dueDate).toLocaleDateString(dateLocale), 14);
  }

  // --- Horizontal Line Separator ---
  currentY = margin + 55;
  doc.setDrawColor(lightGrayColor);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 10;
  
  // Client Info (Recipient)
  doc.setFontSize(9);
  doc.setTextColor(secondaryColor);
  text(t('pdf.billToLabel').toUpperCase(), margin, currentY);
  currentY += 6;
  doc.setFontSize(11);
  doc.setTextColor(primaryColor);
  doc.setFont(font, 'bold');
  text(customer.name, margin, currentY);
  currentY += 6;
  doc.setFont(font, 'normal');
  const customerAddressLines = doc.splitTextToSize(customer.address, 70);
  text(customerAddressLines, margin, currentY);
  currentY += (customerAddressLines.length * 5);
  if (customer.vatNumber) {
    text(`${t('pdf.customerVatLabel')}: ${customer.vatNumber}`, margin, currentY);
  }

  currentY += 10;

  // --- Items Table ---
  const tableColumns = [
    { header: t('pdf.table.ref'), dataKey: 'ref' },
    { header: t('pdf.table.designation'), dataKey: 'desc' },
    { header: t('pdf.table.unitPrice'), dataKey: 'pu' },
    { header: t('pdf.table.qty'), dataKey: 'qty' },
    { header: t('pdf.table.totalHT'), dataKey: 'total' },
  ];
  if(isRTL(lang)) tableColumns.reverse();

  const tableRows = invoice.items.map(item => ({
      ref: item.partSKU,
      desc: item.description,
      pu: `${item.unitPrice.toFixed(3)}`,
      qty: item.quantity,
      total: `${(item.unitPrice * item.quantity).toFixed(3)}`
  }));
  
  const totalHT = invoice.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const totalTVA = totalHT * vatRate;
  const totalTTC = totalHT + totalTVA;

  (doc as any).autoTable({
    columns: tableColumns,
    body: tableRows,
    startY: currentY,
    theme: 'grid',
    styles: { font, fontSize: 9, cellPadding: 2.5, lineColor: lightGrayColor, lineWidth: 0.1, },
    headStyles: { fillColor: veryLightGrayColor, textColor: primaryColor, fontStyle: 'bold', fontSize: 9, halign: isRTL(lang) ? 'right' : 'left' },
    bodyStyles: { textColor: secondaryColor, halign: isRTL(lang) ? 'right' : 'left' },
    alternateRowStyles: { fillColor: '#FFFFFF', },
    columnStyles: {
      ref: { halign: isRTL(lang) ? 'right' : 'left' },
      pu: { halign: 'right' },
      qty: { halign: 'center' },
      total: { halign: 'right' },
    },
    didParseCell: (data: any) => {
        // For RTL, we want most text right-aligned but numbers left-aligned in their cells
        if (isRTL(lang)) {
            if (['pu', 'qty', 'total'].includes(data.column.dataKey)) {
                data.cell.styles.halign = 'right';
            }
        }
    }
  });

  let finalY = (doc as any).lastAutoTable.finalY;

  // --- Totals ---
  const totalsStartY = finalY < pageHeight - 50 ? finalY + 10 : pageHeight - 40;
  const drawTotalLine = (label: string, value: string, y: number, isBold: boolean = false, isGrandTotal: boolean = false) => {
    const labelX = isRTL(lang) ? pageWidth - margin : pageWidth / 2 + 30;
    const valueX = isRTL(lang) ? margin : pageWidth - margin;
    doc.setFont(font, isBold ? 'bold' : 'normal');
    doc.setFontSize(isGrandTotal ? 12 : 10);
    doc.text(label, labelX, y, { align: isRTL(lang) ? 'left' : 'right' });
    doc.text(`${value} ${currencyCode}`, valueX, y, { align: isRTL(lang) ? 'left' : 'right' });
  };
  
  drawTotalLine(t('pdf.totalHT'), `${totalHT.toFixed(3)}`, totalsStartY);
  drawTotalLine(`${t('pdf.vatAmount')} (${(vatRate * 100).toFixed(0)}%)`, `${totalTVA.toFixed(3)}`, totalsStartY + 7);
  
  const lineX1 = isRTL(lang) ? margin : pageWidth / 2 + 30;
  const lineX2 = isRTL(lang) ? margin + (pageWidth/2 - 30 - margin) : pageWidth - margin;
  doc.setDrawColor(primaryColor);
  doc.line(lineX1, totalsStartY + 11, lineX2, totalsStartY + 11);
  
  drawTotalLine(t('pdf.totalTTC'), `${totalTTC.toFixed(3)}`, totalsStartY + 18, true, true);


  // --- Footer ---
  const footerY = pageHeight - 15;
  doc.setDrawColor(lightGrayColor);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
  doc.setFontSize(8);
  doc.setFont(font, 'italic');
  doc.setTextColor(secondaryColor);
  doc.text(t('pdf.footer'), pageWidth / 2, footerY, { align: 'center' });

  doc.save(`${t('pdf.invoiceFileName')}-${invoice.invoiceNumber}.pdf`);
};