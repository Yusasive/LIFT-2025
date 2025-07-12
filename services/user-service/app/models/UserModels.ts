import { AddressModel } from "./AddressModel";
import { UserType } from "./UserType";

export interface UserModel {
  user_id?: number;
  email: string;
  password: string;
  salt: string;
  phone: string;
  user_type: UserType;
  
  first_name?: string;
  last_name?: string;
  profile_pic?: string;
  verified?: boolean;
  verification_code?: number;
  expiry?: string;
  is_active?: boolean;
  gender?: string;

  address?: AddressModel[];

  // Exhibitor-only fields
  company?: string;
  booth_preference?: string;
  booth_type?: string;
  status?: string;
  pin_code?: string;
  lat?: number;
  lng?: number;
  rating?: number;

  // Staff-only fields (organizer, organizer_staff, super_admin, exhibitor_staff)
  ticket_number?: string;
  qr_code?: string;
  download?: string;
  staff_id?: string;

  // Stripe/payment (optional)
  stripe_id?: string;
  payment_id?: string;

  // Exhibitor Staff linkage
  parent_exhibitor_id?: number;
  parentExhibitor?: UserModel;
  managedStaff?: UserModel[];
}
