import { z } from 'zod';
import { UserRole } from '../repository/UserRepository';

export const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  address: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  country: z.string().min(1, 'Country is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(1, 'Phone number is required'),
  company: z.string().optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
  staffId: z.string().optional(),
  role: z.nativeEnum(UserRole)
}).refine((data) => {
  // If role is staff, staffId is required
  if (data.role === UserRole.STAFF) {
    return data.staffId && data.staffId.length > 0;
  }
  return true;
}, {
  message: "Staff ID is required for staff login",
  path: ["staffId"]
});

export type LoginFormData = {
  email: string;
  password: string;
  staffId?: string;
  role: UserRole;
} & {
  submit?: string;
};

export const registerSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirm_password: z.string().min(1, 'Confirm your password'),
  phone: z.string().min(1, 'Phone number is required'),
  company_name: z.string().optional(),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

export type RegisterFormData = z.infer<typeof registerSchema> & {
  submit?: string;
};
