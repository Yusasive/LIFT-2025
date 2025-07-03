export interface AddressModel {
    user_id: string;
    address_line1: string;
    address_line2: string;
    city: string;
    state: string;
    country: string;
    id?: number;
    is_primary?: boolean;
  }
  