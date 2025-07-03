export interface BoothItemResponse {
    id: number;
    sector: string;
    boothNum: string;
    boothPrice: number;
    boothType: string;
    boothStatus: string;
}

export interface BoothReservationResponse {
    id: number;
    remark: string;
    boothTransStatus: string;
    paymentStatus: string;
    validityPeriodDays: number;
    reservationDate: string;
    expirationDate: string;
    validityStatus: string;
    totalAmount: number;
    boothCount: number;
    booths: BoothItemResponse[];
}

export interface BoothTransactionResponse {
    transactionId: number;
    reservationDetails: BoothReservationResponse;
}

export interface ReservedBoothItem {
    sector: string;
    boothNum: string;
    transactionId: number;
}

export interface EnhancedReservedBoothItem extends ReservedBoothItem {
    boothPrice: number;
    boothType: string;
    reservationDate: string;
    expirationDate: string;
    paymentStatus: string;
    validityStatus: string;
}

export interface ReservedBoothsResponse {
    success: boolean;
    count: number;
    data: ReservedBoothItem[] | EnhancedReservedBoothItem[];
}

export interface BoothStatsResponse {
    totalReserved: number;
    bySector: Array<{ sector: string; count: number }>;
    byPaymentStatus: Array<{ paymentStatus: string; count: number }>;
    byValidityStatus: Array<{ validityStatus: string; count: number }>;
}