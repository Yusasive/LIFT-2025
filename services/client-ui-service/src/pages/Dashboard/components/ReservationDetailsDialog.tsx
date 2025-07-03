import React from 'react';
import { BoothTransaction } from '../../../store/booth-slice';

interface Props {
  open: boolean;
  onClose: () => void;
  reservation: BoothTransaction | null;
  onPayNow?: (transactionId: number, amount: number) => void;
}

const ReservationDetailsDialog: React.FC<Props> = ({ open, onClose, reservation, onPayNow }) => {
  if (!open || !reservation) return null;

  // Helper to format price
  const formatPrice = (amount: number | string) => {
    const num = typeof amount === 'string'
      ? parseInt(amount.replace(/[^\d]/g, '')) || 0
      : amount || 0;
    return `₦${num.toLocaleString()}`;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr; // fallback if invalid
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Reservation Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl leading-none">&times;</button>
        </div>
        <div className="space-y-2">
          <div><strong>Transaction ID:</strong> {reservation.transactionId || reservation.id}</div>
          <div><strong>Number of Booths:</strong> {reservation.boothCount}</div>
          <div><strong>Price:</strong> {formatPrice(reservation.totalAmount)}</div>
          <div><strong>Payment Status:</strong> {reservation.paymentStatus}</div>
          <div><strong>Validity Status:</strong> {reservation.validityStatus}</div>
          <div><strong>Reservation Date:</strong> {formatDate(reservation.reservationDate)}</div>
          <div><strong>Expiration Date:</strong> {formatDate(reservation.expirationDate)}</div>
          {reservation.remark && (
            <div><strong>Remark:</strong> {reservation.remark}</div>
          )}
          {/* List booth items if available */}
          {reservation.booths && reservation.booths.length > 0 && (
            <div>
              <strong>Booth(s):</strong>
              <ul className="list-disc list-inside ml-4">
                {reservation.booths.map((booth, idx) => (
                  <li key={booth.id || idx}>
                    {booth.sector} - {booth.boothNum} ({booth.boothType}) {formatPrice(booth.boothPrice)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="mt-6 flex justify-end gap-2">
          {reservation.paymentStatus?.toLowerCase() === 'pending' && onPayNow && (
            <button
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 mr-2"
              onClick={() => onPayNow(reservation.transactionId || reservation.id, typeof reservation.totalAmount === 'string'
                ? parseInt(reservation.totalAmount.replace(/[^\d]/g, '')) || 0
                : reservation.totalAmount || 0)}
            >
              Pay Now
            </button>
          )}
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Close</button>
        </div>
      </div>
    </div>
  );
};

export default ReservationDetailsDialog;