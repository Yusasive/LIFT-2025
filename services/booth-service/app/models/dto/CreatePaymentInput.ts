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
    transactionStatus?: string;
}
