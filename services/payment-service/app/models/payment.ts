export enum Currency {
  NGN = 'NGN',
  USD = 'USD',
  GHS = 'GHS',
  ZAR = 'ZAR',
  KES = 'KES'
}

export interface CreatePaymentInput {
  amount: number;
  currency: Currency;
  user_id: number;
  transaction_id: number;
  transactionStatus: string;
}

export interface Payment {
  _id?: string;
  userId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;

  description?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export enum PaymentStatus {
  ABANDONED = 'abandoned',
  FAILED = 'failed',
  ONGOING = 'ongoing',
  PENDING = 'pending',
  PROCESSING = 'processing',
  QUEUED = 'queued',
  REVERSED = 'reversed',
  SUCCESS = 'success'
}

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  BANK_TRANSFER = 'bank_transfer',
  PAYPAL = 'paypal',
  STRIPE = 'stripe'
} 