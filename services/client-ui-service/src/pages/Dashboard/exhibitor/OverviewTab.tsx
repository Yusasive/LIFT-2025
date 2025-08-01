import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { StatCard } from '../components/StatCard';
import DataTable from '../../../components/datatable/Datatable';
import { 
  getUserBoothReservations,
  selectBoothTransactions,
  selectBoothLoading,
  selectActiveReservations,
  selectPendingPaymentReservations,
  selectPaidReservations,
  BoothTransaction
} from '../../../store/booth-slice';
import { PaymentController } from '../../../controllers/PaymentController';
import { useUser } from '../../../context/UserContext';
import PaystackPaymentDialog from '../../../components/payment/PaystackPaymentDialog';
import { useState } from 'react';
import ReservationDetailsDialog from '../components/ReservationDetailsDialog';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import ToastNotification from '@/components/common/ToastNotification';
import { ExhibitorSetupProgress } from './ExhibitorSetupProgress';
import LoadingOverlay from '@/components/common/LoadingOverlay';

export default function OverviewTab() {
  const dispatch = useDispatch();
  const { user } = useUser();
  // Get booth data from Redux state
  const boothTransactions = useSelector(selectBoothTransactions);
  
  const loading = useSelector(selectBoothLoading);
  const activeReservations = useSelector(selectActiveReservations);
  const pendingPaymentReservations = useSelector(selectPendingPaymentReservations);
  const paidReservations = useSelector(selectPaidReservations);

  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState('');
  
  const [toastType, setToastType] = useState<ToastType>('success');
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<BoothTransaction | null>(null);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  // Fetch booth reservations on component mount
  useEffect(() => {
    dispatch(getUserBoothReservations() as any);
  }, []);

  type ToastType = 'success' | 'info' | 'error' | 'warning';

  // Calculate booth status (reserved booths / total available booths)
  const boothStatus = useMemo(() => {
    const reservedBooths = boothTransactions.reduce((total, transaction) => 
      total + transaction.boothCount, 0
    );
    const totalAvailableBooths = 58; // Africa Hall total booths
    return `${reservedBooths} / ${totalAvailableBooths}`;
  }, [boothTransactions]);

  // Calculate payment summary (total pending + paid amounts)
  const paymentSummary = useMemo(() => {
    const totalPending = pendingPaymentReservations.reduce((total, transaction) => {
      const amount = typeof transaction.totalAmount === 'string' 
        ? parseInt(transaction.totalAmount.replace(/[^\d]/g, '')) || 0
        : transaction.totalAmount || 0;
      return total + amount;
    }, 0);

    const totalPaid = paidReservations.reduce((total, transaction) => {
      const amount = typeof transaction.totalAmount === 'string' 
        ? parseInt(transaction.totalAmount.replace(/[^\d]/g, '')) || 0
        : transaction.totalAmount || 0;
      return total + amount;
    }, 0);

    const grandTotal = totalPending + totalPaid;
    return `₦${grandTotal.toLocaleString()}`;
  }, [pendingPaymentReservations, paidReservations]);

  // Calculate visitor insights (mock data - you can replace with real analytics)
  const visitorInsights = useMemo(() => {
    // Mock calculation based on booth activity
    const baseVisitors = 428;
    const activityMultiplier = Math.max(1, activeReservations.length * 0.1);
    const totalVisitors = Math.floor(baseVisitors * activityMultiplier);
    const growthPercentage = Math.floor(Math.random() * 20 + 5); // Mock 5-25% growth
    return `${totalVisitors} ↑${growthPercentage}%`;
  }, [activeReservations]);

  // Calculate event countdown (to a fixed event date)
  const eventCountdown = useMemo(() => {
    // Set your actual event date here
    const eventDate = new Date('2025-12-01'); // Example: December 1, 2025
    const today = new Date();
    const timeDifference = eventDate.getTime() - today.getTime();
    const daysRemaining = Math.ceil(timeDifference / (1000 * 3600 * 24));
    
    if (daysRemaining > 0) {
      return `${daysRemaining} days`;
    } else if (daysRemaining === 0) {
      return 'Today!';
    } else {
      return 'Event passed';
    }
  }, []);

  // Helper to get the numeric amount from totalAmount
  const getAmount = (row: BoothTransaction) => {
    return typeof row.totalAmount === 'string'
      ? parseInt(row.totalAmount.replace(/[^\d]/g, '')) || 0
      : row.totalAmount || 0;
  };

  // Define table columns for booth transactions
  const columns = useMemo(() => [
    {
      name: 'Serial #',
      selector: (row: BoothTransaction) => row.transactionId || "#N/A",
      sortable: true,
    },
    {
      name: 'Number of Booths',
      selector: (row: BoothTransaction) => row.boothCount,
      sortable: true,
    },
    {
      name: 'Total Amount',
      selector: (row: BoothTransaction) => `₦${getAmount(row).toLocaleString()}`,
      sortable: true,
    },
    {
      name: 'Payment Status',
      selector: (row: BoothTransaction) => row.paymentStatus,
      sortable: true,
      cell: (row: BoothTransaction) => {
        const status = row.paymentStatus?.toLowerCase();
        let badgeClass = '';
        let text = row.paymentStatus || 'Unknown';
        
        switch (status) {
          case 'paid':
            badgeClass = 'bg-green-100 text-green-800';
            break;
          case 'pending':
            badgeClass = 'bg-yellow-100 text-yellow-800';
            break;
          case 'failed':
            badgeClass = 'bg-red-100 text-red-800';
            break;
          default:
            badgeClass = 'bg-gray-100 text-gray-800';
        }
        
        return (
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${badgeClass}`}>
            {text}
          </span>
        );
      },
    },
    {
      name: 'Reserved On',
      selector: (row: BoothTransaction) => {
        if (!row.createdAt) return '-';
        return new Date(row.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      },
      sortable: true,
    },
    {
      name: 'Payed On',
      selector: (row: BoothTransaction) => {
        if (row.paymentStatus?.toLowerCase() === 'paid') {
          if (!row.updatedAt) return '-';
          return new Date(row.updatedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
        } else {
          return '-';
        }
      },
      sortable: true,
    },
    {
      name: 'Actions',
      cell: (row: BoothTransaction) => (
        <div className="flex space-x-2">
          <button 
            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            onClick={() => handleViewDetails(row.transactionId || row.id)}
          >
            View
          </button>
          {row.paymentStatus?.toLowerCase() === 'pending' && (
            <button 
              className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              onClick={() => handlePayNow(row.transactionId || 0, getAmount(row))} // Need to make transactionID not optional
            >
              Pay Now
            </button>
          )}
          {/* <button 
            className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            onClick={() => handleConfirmCancelReservation(row.transactionId || 0)}
          >
            Cancel
          </button> */}
        </div>
      ),
      minWidth: '250px',
    },
  ], []);

  // Handle view details action
  const handleViewDetails = (transactionId: number) => {
    console.log("View Transactions", boothTransactions);
    // The API returns transactionId, so we need to match by that field
    const reservation = boothTransactions.find(t => t.transactionId === transactionId);
    setSelectedReservation(reservation || null);
    setShowDetailsDialog(true);
  };

  // Handle cancel reservation action
  // const handleConfirmCancelReservation = (transactionId: number) => {
  //   setSelectedReservation(boothTransactions.find(t => t.transactionId === transactionId || t.id === transactionId) || null);
  //   setShowDetailsDialog(false);
  //   setShowConfirmationDialog(true);
  // };

  const handleCancelReservation = (transactionId: number) => {
    console.log("Cancel Reservation", transactionId);
    //TODO: Cancel the reservation
    setShowConfirmationDialog(false);
    setShowDetailsDialog(false);
    setSelectedReservation(null);
  };

  // Handle pay now action
  const handlePayNow = async (transactionId: number, totalAmount: number) => {
    if (!user?._id || !user?.email) {
      setToastType('error');
      setToastMessage('User information is incomplete');
      setShowToast(true);
      return;
    }

    setShowLoading(true);
    
    const response = await PaymentController.getInstance().makePayment({
      user_id: user._id,
      email: user.email,
      amount: totalAmount,
      currency: 'NGN',
      transaction_id:transactionId, 
    });

    if (response.success && response.data?.authorization_url) {
      setPaymentUrl(response.data.authorization_url);
      setShowLoading(false);
      setShowPaymentDialog(true);
    } else {
      setToastType('error');
      setToastMessage('Failed to initialize payment. Please try again.');
      setShowToast(true);
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showToast) {
      timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [showToast]);

  // Toast Component
  const ToastComponent = () => (
    showToast && (
      <ToastNotification toastType={toastType} toastMessage={toastMessage} setShowToast={setShowToast} />
    )
  );

  // Show loading state
  if (loading && boothTransactions.length === 0) {
    return (
      <div className="space-y-6 w-full">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <StatCard title="Booth Status" value="Loading..." />
          <StatCard title="Payment Summary" value="Loading..." />
          <StatCard title="Visitor Insights" value="Loading..." />
          <StatCard title="Event Countdown" value={eventCountdown} />
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      <div>
        <div><ExhibitorSetupProgress /></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm p-6">
        <StatCard 
          title="Booth Status" 
          value={boothStatus}
        />
        <StatCard 
          title="Payment Summary" 
          value={paymentSummary}
        />
        <StatCard 
          title="Visitor Insights" 
          value={visitorInsights}
        />
        <StatCard 
          title="Event Countdown" 
          value={eventCountdown}
        />
      </div>

      {/* Booth Transactions Table */}
      <div className="w-full">
        <DataTable
          title="Booth Transactions"
          columns={columns}
          data={boothTransactions}
          loading={loading}
          pagination={true}
        />
      </div>

      <PaystackPaymentDialog
        show={showPaymentDialog}
        onClose={() => setShowPaymentDialog(false)}
        paymentUrl={paymentUrl}
        onPaymentSuccess={() => {
          setShowPaymentDialog(false);
          setToastType('success');
          setToastMessage('Payment successful!');
          setShowToast(true);
          
          // Reload the table when payment is complete
          dispatch(getUserBoothReservations() as any);
        }}
        onPaymentError={(msg) => {
          setShowPaymentDialog(false);
          setToastType('error');
          setToastMessage(msg);
          setShowToast(true);
        }}
      />

      <ReservationDetailsDialog
        open={showDetailsDialog}
        onClose={() => setShowDetailsDialog(false)}
        reservation={selectedReservation}
        onPayNow={handlePayNow}
      />

      <ConfirmDialog
        isOpen={showConfirmationDialog}
        onConfirm={() => handleCancelReservation(selectedReservation?.transactionId || 0)}
        onCancel={() => setShowConfirmationDialog(false)}
        message="Are you sure you want to cancel this reservation?"
        confirmText="Cancel Reservation"
        cancelText="Keep Reservation"
      />

      <LoadingOverlay isLoading={showLoading} />

      <ToastComponent />
    </div>
  );
}