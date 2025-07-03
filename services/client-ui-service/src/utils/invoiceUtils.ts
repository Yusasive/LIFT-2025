import jsPDF from 'jspdf';

export interface InvoiceData {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  customerInfo: {
    name: string;
    company: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  paymentMethod: string;
  reservationIds: string[];
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  size?: string;
  sector?: string;
}

export interface InvoiceOptions {
  title?: string;
  filename?: string;
  logo?: string;
  companyInfo?: {
    name: string;
    address: string;
    phone: string;
    email: string;
    website: string;
  };
}

/**
 * Generate invoice PDF
 */
export const generateInvoicePDF = (
  data: InvoiceData,
  options: InvoiceOptions = {}
): jsPDF => {
  const defaultOptions: InvoiceOptions = {
    title: 'INVOICE',
    filename: `invoice_${data.invoiceNumber}.pdf`,
    companyInfo: {
      name: 'Lagos International Trade Fair',
      address: 'Lagos, Nigeria',
      phone: '+234 123 456 7890',
      email: 'info@lagostradefair.com',
      website: 'www.lagostradefair.com'
    },
    ...options
  };

  // Use 'NGN' as currency for compatibility
  const currency = data.currency && data.currency.length < 4 ? data.currency : 'NGN ';

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  let yPosition = 20;

  // Header - use a two-column layout
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(defaultOptions.title!, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 12;

  if (defaultOptions.logo) {
    try {
      // Load and add the logo image
      const img = new Image();
      img.src = defaultOptions.logo;
      
      // Wait for image to load
      const addLogo = () => {
        try {
          const logoWidth = 30;
          const logoHeight = 30;
          const logoX = margin;
          const logoY = yPosition - 5;
          
          doc.addImage(img, 'PNG', logoX, logoY, logoWidth, logoHeight);
          
          // Adjust company info position to account for logo
          const companyInfoX = margin + logoWidth + 10;
          const companyInfoY = yPosition;
          
          // Company Info (Left) with logo
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text(defaultOptions.companyInfo!.name, companyInfoX, companyInfoY);
          doc.setFont('helvetica', 'normal');
          doc.text(defaultOptions.companyInfo!.address, companyInfoX, companyInfoY + 6);
          doc.text(`Phone: ${defaultOptions.companyInfo!.phone}`, companyInfoX, companyInfoY + 12);
          doc.text(`Email: ${defaultOptions.companyInfo!.email}`, companyInfoX, companyInfoY + 18);
          doc.text(`Website: ${defaultOptions.companyInfo!.website}`, companyInfoX, companyInfoY + 24);
          
          yPosition = companyInfoY + 30;
        } catch (error) {
          console.warn('Failed to add logo to PDF:', error);
          // Fallback to original layout without logo
          addCompanyInfoWithoutLogo();
        }
      };
      
      if (img.complete) {
        addLogo();
      } else {
        img.onload = addLogo;
        img.onerror = () => {
          console.warn('Failed to load logo image');
          addCompanyInfoWithoutLogo();
        };
      }
    } catch (error) {
      console.warn('Failed to add logo to PDF:', error);
      addCompanyInfoWithoutLogo();
    }
  } else {
    addCompanyInfoWithoutLogo();
  }

  // Helper function for company info without logo
  function addCompanyInfoWithoutLogo() {
    // Company Info (Left) and Invoice Info (Right)
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(defaultOptions.companyInfo!.name, margin, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(defaultOptions.companyInfo!.address, margin, yPosition + 6);
    doc.text(`Phone: ${defaultOptions.companyInfo!.phone}`, margin, yPosition + 12);
    doc.text(`Email: ${defaultOptions.companyInfo!.email}`, margin, yPosition + 18);
    doc.text(`Website: ${defaultOptions.companyInfo!.website}`, margin, yPosition + 24);
    yPosition += 36;
  }
  

  // Invoice Info (Right)
  const rightX = pageWidth - margin - 70;
  let rightY = yPosition - 30;
  doc.setFont('helvetica', 'bold');
  doc.text('Invoice Number:', rightX, rightY);
  doc.setFont('helvetica', 'normal');
  doc.text(data.invoiceNumber, rightX + 40, rightY);
  rightY += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Date:', rightX, rightY);
  doc.setFont('helvetica', 'normal');
  doc.text(data.date, rightX + 40, rightY);
  rightY += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Due Date:', rightX, rightY);
  doc.setFont('helvetica', 'normal');
  doc.text(data.dueDate, rightX + 40, rightY);
  rightY += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Payment Method:', rightX, rightY);
  doc.setFont('helvetica', 'normal');
  doc.text(data.paymentMethod, rightX + 40, rightY);

  yPosition += 36;

  // Bill To
  doc.setFont('helvetica', 'bold');
  doc.text('Bill To:', margin, yPosition);
  doc.setFont('helvetica', 'normal');
  const customer = data.customerInfo || {};
  let billToLines = [];
  if (customer.name) billToLines.push(customer.name);
  if (customer.company) billToLines.push(customer.company);
  if (customer.email) billToLines.push(customer.email);
  if (customer.phone) billToLines.push(customer.phone);
  if (customer.address) billToLines.push(customer.address);
  if (customer.city || customer.state || customer.postalCode)
    billToLines.push(`${customer.city || ''}${customer.city && customer.state ? ', ' : ''}${customer.state || ''} ${customer.postalCode || ''}`.trim());
  if (customer.country) billToLines.push(customer.country);
  if (billToLines.length === 0) billToLines.push('-');
  doc.setFontSize(11);
  doc.text(billToLines, margin, yPosition + 8);

  yPosition += 28 + (billToLines.length - 1) * 6;

  // Items Table
  const tableHeaders = ['Description', 'Size', 'Sector', 'Quantity', 'Unit Price', 'Total'];
  const columnWidths = [60, 25, 25, 25, 30, 30];
  let currentX = margin;

  // Draw table headers
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  tableHeaders.forEach((header, index) => {
    doc.text(header, currentX, yPosition);
    currentX += columnWidths[index];
  });

  // Draw table lines
  yPosition += 2;
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 8;

  // Draw table data
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  (data.items || []).forEach((item) => {
    currentX = margin;
    // Defensive: fallback values
    const desc = item.description || '-';
    const size = item.size || '-';
    const sector = item.sector || '-';
    const qty = item.quantity || 1;
    const unitPrice = typeof item.unitPrice === 'number' ? item.unitPrice : 0;
    const total = typeof item.total === 'number' ? item.total : 0;

    // Check if we need a new page
    if (yPosition > doc.internal.pageSize.height - 60) {
      doc.addPage();
      yPosition = 20;
    }

    // Description
    const descriptionLines = doc.splitTextToSize(desc, columnWidths[0] - 2);
    doc.text(descriptionLines, currentX, yPosition);
    currentX += columnWidths[0];

    // Size
    doc.text(size, currentX, yPosition);
    currentX += columnWidths[1];

    // Sector
    doc.text(sector, currentX, yPosition);
    currentX += columnWidths[2];

    // Quantity
    doc.text(qty.toString(), currentX, yPosition);
    currentX += columnWidths[3];

    // Unit Price
    doc.text(`${currency}${unitPrice.toLocaleString()}`, currentX, yPosition);
    currentX += columnWidths[4];

    // Total
    doc.text(`${currency}${total.toLocaleString()}`, currentX, yPosition);

    yPosition += Math.max(descriptionLines.length * 4, 8);
  });

  // Draw bottom line
  yPosition += 2;
  doc.line(margin, yPosition, pageWidth - margin, yPosition);

  // Totals
  yPosition += 15;
  const totalsX = pageWidth - margin - 80;
  
  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal:', totalsX, yPosition);
  doc.text(`${currency}${data.subtotal.toLocaleString()}`, pageWidth - margin, yPosition, { align: 'right' });
  yPosition += 8;
  
  if (data.tax > 0) {
    doc.text('Tax:', totalsX, yPosition);
    doc.text(`${currency}${data.tax.toLocaleString()}`, pageWidth - margin, yPosition, { align: 'right' });
    yPosition += 8;
  }
  
  doc.setFont('helvetica', 'bold');
  doc.text('Total:', totalsX, yPosition);
  doc.text(`${currency}${data.total.toLocaleString()}`, pageWidth - margin, yPosition, { align: 'right' });

  // Footer
  yPosition += 30;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Thank you for your business!', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 6;
  doc.text('For any questions, please contact us at support@lagostradefair.com', pageWidth / 2, yPosition, { align: 'center' });

  return doc;
};

/**
 * Download invoice PDF
 */
export const downloadInvoicePDF = (
  data: InvoiceData,
  options: InvoiceOptions = {}
): void => {
  const doc = generateInvoicePDF(data, options);
  const filename = options.filename || `invoice_${data.invoiceNumber}.pdf`;
  doc.save(filename);
};

/**
 * Print invoice PDF
 */
export const printInvoicePDF = (
  data: InvoiceData,
  options: InvoiceOptions = {}
): void => {
  const doc = generateInvoicePDF(data, options);
  doc.autoPrint();
  doc.output('dataurlnewwindow');
};

/**
 * Generate a unique invoice number
 */
export const generateInvoiceNumber = (): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `INV-${timestamp}-${random}`;
};

/**
 * Format date for invoice
 */
export const formatInvoiceDate = (date: Date = new Date()): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Calculate due date (30 days from invoice date)
 */
export const calculateDueDate = (invoiceDate: Date = new Date()): string => {
  const dueDate = new Date(invoiceDate);
  dueDate.setDate(dueDate.getDate() + 30);
  return formatInvoiceDate(dueDate);
}; 