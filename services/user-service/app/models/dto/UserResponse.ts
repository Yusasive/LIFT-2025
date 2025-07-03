import { UserType } from "../UserType";

export interface UserResponse {
    _id: number;
    email: string;
    firstName?: string;
    lastName?: string;
    phone: string;
    userType: UserType;
    profilePic?: string;
    paymentId?: string;
    stripeId?: string;
    status?: string;
    verified?: boolean;
    address?: {
      id: number;
      address_line1: string;
      address_line2?: string;
      city: string;
      state: string;
      post_code: string;
      country: string;
      is_primary: boolean;
    }[];
    
    // Exhibitor-specific
    company?: string;
    local?: string;
  
    // Staff-specific
    staffId?: string;
    ticketNumber?: string;
    qrCode?: string;
  }
  

export interface AddressResponse {
    address_id: number;
    address_line_1: string;
    address_line_2: string;
    city: string;
    state: string;
}
