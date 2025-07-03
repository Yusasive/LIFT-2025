import React, { useState, useEffect } from 'react';
import { X, Download, Printer, Eye } from 'lucide-react';
import { 
  InvoiceData, 
  downloadInvoicePDF, 
  printInvoicePDF, 
  generateInvoicePDF 
} from '../../utils/invoiceUtils';
import { preloadLogo, getDefaultLogoPath } from '../../utils/logoUtils';
import { Z_INDEX } from '../../utils/zIndexManager';

interface InvoiceModalProps {
  show: boolean;
  onClose: () => void;
  invoiceData: InvoiceData;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ show, onClose, invoiceData }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [logoBase64, setLogoBase64] = useState<string | null>(null);

  // Preload logo when component mounts
  useEffect(() => {
    const loadLogo = async () => {
      const logoPath = getDefaultLogoPath();
      const base64Data = await preloadLogo(logoPath);
      setLogoBase64(base64Data);
    };
    
    loadLogo();
  }, []);

  if (!show) return null;

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      downloadInvoicePDF(invoiceData, { logo: logoBase64 || undefined });
    } catch (error) {
      console.error('Error downloading invoice:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = async () => {
    setIsGenerating(true);
    try {
      printInvoicePDF(invoiceData, { logo: logoBase64 || undefined });
    } catch (error) {
      console.error('Error printing invoice:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreview = async () => {
    setIsGenerating(true);
    try {
      const doc = generateInvoicePDF(invoiceData, { logo: logoBase64 || undefined });
      const pdfDataUrl = doc.output('dataurlstring');
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head>
              <title>Invoice Preview</title>
              <style>
                body { margin: 0; padding: 0; }
                iframe { width: 100%; height: 100vh; border: none; }
              </style>
            </head>
            <body>
              <iframe src="${pdfDataUrl}"></iframe>
            </body>
          </html>
        `);
        newWindow.document.close();
      }
    } catch (error) {
      console.error('Error previewing invoice:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 overflow-y-auto" style={{ zIndex: Z_INDEX.invoiceModal.backdrop }}>
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          style={{ zIndex: Z_INDEX.invoiceModal.backdrop }}
          onClick={onClose}
        />

        {/* Modal content */}
        <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg relative" style={{ zIndex: Z_INDEX.invoiceModal.content }}>
          {/* Header */}
          <div className="bg-gray-50 px-6 py-4 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Invoice</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Invoice Content */}
          <div className="p-6">
            {/* Invoice Header */}
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <img 
                    src="/images/litf_logo.png" 
                    alt="LITF Logo" 
                    className="w-25 h-16 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">INVOICE</h1>
                  <div className="text-sm text-gray-600">
                    <p>Lagos International Trade Fair</p>
                    <p>Lagos, Nigeria</p>
                    <p>Phone: +234 123 456 7890</p>
                    <p>Email: info@lagostradefair.com</p>
                    <p>Website: www.lagostradefair.com</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600 space-y-1">
                  <p><span className="font-semibold">Invoice Number:</span> {invoiceData.invoiceNumber}</p>
                  <p><span className="font-semibold">Date:</span> {invoiceData.date}</p>
                  <p><span className="font-semibold">Due Date:</span> {invoiceData.dueDate}</p>
                  <p><span className="font-semibold">Payment Method:</span> {invoiceData.paymentMethod}</p>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Bill To:</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium">{invoiceData.customerInfo.name}</p>
                {invoiceData.customerInfo.company && (
                  <p className="text-gray-600">{invoiceData.customerInfo.company}</p>
                )}
                <p className="text-gray-600">{invoiceData.customerInfo.email}</p>
                <p className="text-gray-600">{invoiceData.customerInfo.phone}</p>
                <p className="text-gray-600">{invoiceData.customerInfo.address}</p>
                {/* <p className="text-gray-600">
                  {invoiceData.customerInfo.city}, {invoiceData.customerInfo.state} {invoiceData.customerInfo.postalCode}
                </p>
                <p className="text-gray-600">{invoiceData.customerInfo.country}</p> */}
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-8">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Description</th>
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Size</th>
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Sector</th>
                      <th className="border border-gray-300 px-4 py-2 text-center font-semibold">Quantity</th>
                      <th className="border border-gray-300 px-4 py-2 text-right font-semibold">Unit Price</th>
                      <th className="border border-gray-300 px-4 py-2 text-right font-semibold">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceData.items.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2">{item.description}</td>
                        <td className="border border-gray-300 px-4 py-2">{item.size || '-'}</td>
                        <td className="border border-gray-300 px-4 py-2">{item.sector || '-'}</td>
                        <td className="border border-gray-300 px-4 py-2 text-center">{item.quantity}</td>
                        <td className="border border-gray-300 px-4 py-2 text-right">
                          {invoiceData.currency}{item.unitPrice.toLocaleString()}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-right">
                          {invoiceData.currency}{item.total.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-8">
              <div className="w-64">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span>{invoiceData.currency}{invoiceData.subtotal.toLocaleString()}</span>
                  </div>
                  {invoiceData.tax > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax (Inclusive):</span>
                      <span>-</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount:</span>
                    <span>0%</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold">Total:</span>
                    <span className="font-semibold text-lg">
                      {invoiceData.currency}{invoiceData.total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-gray-600 text-sm">
              <p>Thank you for your business!</p>
              <p>For any questions, please contact us at support@lagostradefair.com</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-6 py-4 bg-gray-50 border-t flex justify-end space-x-3">
            <button
              onClick={handlePreview}
              disabled={isGenerating}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <Eye size={16} className="mr-2" />
              Preview
            </button>
            <button
              onClick={handlePrint}
              disabled={isGenerating}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <Printer size={16} className="mr-2" />
              Print
            </button>
            <button
              onClick={handleDownload}
              disabled={isGenerating}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <Download size={16} className="mr-2" />
              Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal; 