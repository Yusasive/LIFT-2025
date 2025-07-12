// components/Register.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { UserController } from '../../controllers/UserController';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import SuccessDialog from '../../components/common/SuccessDialog';
import { registerSchema, RegisterFormData } from '../../types/formSchemas';
import { z } from 'zod';
import { RegisterRequest, UserRegistrationRole } from '@/repository/UserRepository';
import { useUser } from '@/context/UserContext';
import { FaGift, FaEye, FaEyeSlash, FaChevronDown } from 'react-icons/fa';
import { countriesList } from '@/data/countries';

// Terms Modal Component
const TermsModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white max-w-2xl w-full max-h-[80vh] overflow-y-auto rounded-xl shadow-lg p-6 relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-2xl">&times;</button>
        <h2 className="text-2xl font-bold mb-4 text-green-800">Terms and Conditions for Participation</h2>
        <ol className="list-decimal pl-6 space-y-4 text-gray-800">
          <li>
            <span className="font-semibold text-red-600">Application & Payment</span>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Participation is confirmed only after full payment and a completed application form.</li>
              <li>Allocation of space is first come, first served.</li>
              <li>Payments are non-refundable, even if an exhibitor cancels or fails to attend.</li>
            </ul>
          </li>
          <li>
            <span className="font-semibold text-red-600">Exhibition Booths & Space</span>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Exhibitors must stick to their allocated spaces.</li>
              <li>Sharing or subletting of space is prohibited.</li>
              <li>Booth designs must be approved in advance and must not obstruct other exhibitors.</li>
            </ul>
          </li>
          <li>
            <span className="font-semibold text-red-600">Setup & Dismantling</span>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Booth setup must be completed before the opening.</li>
              <li>Exhibitors may not dismantle before the official closing of the fair.</li>
            </ul>
          </li>
          <li>
            <span className="font-semibold text-red-600">Conduct & Use of Premises</span>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Exhibitors are responsible for the cleanliness and security of their booths.</li>
              <li>Offensive or dangerous displays are not allowed.</li>
              <li>Noise levels must be kept within acceptable limits.</li>
            </ul>
          </li>
          <li>
            <span className="font-semibold text-red-600">Security & Insurance</span>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>General security will be provided, but exhibitors are advised to secure their valuables.</li>
              <li>The organizers are not liable for losses, damages, or injuries.</li>
            </ul>
          </li>
          <li>
            <span className="font-semibold text-red-600">Advertising & Promotions</span>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>All promotional materials and activities within the fairgrounds must be approved by the organizers.</li>
              <li>Loud music, live performances, or mascots need special permission.</li>
            </ul>
          </li>
          <li>
            <span className="font-semibold text-red-600">Compliance</span>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Exhibitors must comply with all local laws, safety, and fire regulations.</li>
              <li>The organizers reserve the right to remove non-compliant exhibitors.</li>
            </ul>
          </li>
          <li>
            <span className="font-semibold text-red-600">Force Majeure</span>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>The organizers are not liable for cancellations or disruptions due to events beyond their control (e.g., natural disasters, government action).</li>
            </ul>
          </li>
          <li>
            <span className="font-semibold text-red-600">Disputes</span>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Any disputes will be resolved under Nigeria law.</li>
            </ul>
          </li>
        </ol>
      </div>
    </div>
  );
};

// Phone Input Component
const PhoneInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  error?: string;
}> = ({ value, onChange, error }) => {
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(() => {
    // Default to Nigeria
    return countriesList.find(country => country.code === 'NG') || countriesList[0];
  });
  const [phoneNumber, setPhoneNumber] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Parse the full phone value to extract country code and number
  useEffect(() => {
    if (value) {
      const countryWithCode = countriesList.find(country => 
        value.startsWith(`+${country.phoneCode}`)
      );
      if (countryWithCode) {
        setSelectedCountry(countryWithCode);
        setPhoneNumber(value.replace(`+${countryWithCode.phoneCode}`, ''));
      } else {
        setPhoneNumber(value);
      }
    }
  }, [value]);

  // Update the full phone value when country or number changes
  useEffect(() => {
    const fullPhone = selectedCountry ? `+${selectedCountry.phoneCode}${phoneNumber}` : phoneNumber;
    onChange(fullPhone);
  }, [selectedCountry, phoneNumber, onChange]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.phone-input-container')) {
        setShowCountryDropdown(false);
      }
    };
    if (showCountryDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showCountryDropdown]);

  const handleCountrySelect = (country: typeof countriesList[0]) => {
    setSelectedCountry(country);
    setShowCountryDropdown(false);
    setSearchTerm('');
  };

  const filteredCountries = countriesList.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.phoneCode.includes(searchTerm)
  );

  return (
    <div className="relative phone-input-container">
      <label className="text-sm text-gray-600">Phone Number</label>
      <div className="flex mt-1">
        {/* Country Code Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowCountryDropdown(!showCountryDropdown)}
            className={`flex items-center space-x-2 px-3 py-2 border border-r-0 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary-400 ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
            style={{ height: '42px' }}
          >
            <span className="text-sm font-medium">
              +{selectedCountry?.phoneCode}
            </span>
            <FaChevronDown className={`w-3 h-3 text-gray-500 transition-transform ${showCountryDropdown ? 'rotate-180' : ''}`} />
          </button>

          {/* Country Dropdown */}
          {showCountryDropdown && (
          <div
            className="absolute left-0 top-full z-50 w-64 min-w-full bg-white border border-gray-300 rounded-b-md shadow-lg"
          >
            <div className="p-2 border-b border-gray-200">
              <input
                type="text"
                placeholder="Search countries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            {/* Only this should scroll */}
            <div className="max-h-48 overflow-y-auto">
              {filteredCountries.length > 0 ? (
                filteredCountries.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => handleCountrySelect(country)}
                    className={`w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center justify-between ${
                      selectedCountry?.code === country.code ? 'bg-primary-50 text-primary-700' : ''
                    }`}
                  >
                    <span className="text-sm">{country.name}</span>
                    <span className="text-sm text-gray-500">+{country.phoneCode}</span>
                  </button>
                ))
              ) : (
                <div className="px-4 py-2 text-sm text-gray-500 text-center">
                  No countries found
                </div>
              )}
            </div>
          </div>
        )}

        </div>

        {/* Phone Number Input */}
        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => {
            let val = e.target.value;
            val = val.replace(/\D/g, '');
            if (val.startsWith('0')) {
              val = val.replace(/^0+/, '');
            }
            setPhoneNumber(val);
          }}
          onPaste={(e) => {
            e.preventDefault();
            let paste = e.clipboardData.getData('text');
            paste = paste.replace(/\D/g, '');
            if (paste.startsWith('0')) {
              paste = paste.replace(/^0+/, '');
            }
            setPhoneNumber(paste);
          }}
          placeholder="Enter phone number"
          className={`flex-1 border rounded-r-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400 ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
        />
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      {phoneNumber && selectedCountry && (
        <p className="text-xs text-gray-500 mt-1">
          Full number: +{selectedCountry.phoneCode}{phoneNumber}
        </p>
      )}
    </div>
  );
};

const Register: React.FC = () => {
  const { user, loading } = useUser();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role')?.toUpperCase() || 'ATTENDEE';
  const local = searchParams.get('local')?.toUpperCase() || 'LOCAL';
  const referralCode = searchParams.get('ref');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const userController = UserController.getInstance();
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    password: '',
    confirm_password: '',
    phone: '',
  });

  const [errors, setErrors] = useState<Partial<RegisterFormData>>({});
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  // Memoize the phone onChange function to prevent infinite re-renders
  const handlePhoneChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, phone: value }));
  }, []);

  const passwordConstraints = [
    { label: 'At least 8 characters', regex: /.{8,}/ },
    { label: 'At least one uppercase letter', regex: /[A-Z]/ },
    { label: 'At least one lowercase letter', regex: /[a-z]/ },
    { label: 'At least one number', regex: /[0-9]/ },
    { label: 'At least one special character', regex: /[^A-Za-z0-9]/ },
  ];

  const checkPasswordConstraint = (password: string, regex: RegExp) => {
    return regex.test(password);
  };

  const displayRole = role === 'EXHIBITOR' ? 'Exhibitor' : 'Visitor';

  useEffect(() => {
    if (!loading && user) {
      switch (user.userType.toLowerCase()) {
        case 'exhibitor':
          navigate('/exhibitor/dashboard');
          break;
        case 'attendee':
          navigate('/attendee/dashboard');
          break;
        case 'staff':
          navigate('/staff/dashboard');
          break;
        default:
          navigate('/');
          break;
      }
    }

  }, [user, loading, navigate]);

  const handleRegister = async(e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      const validatedData = registerSchema.parse(formData);
      const userRole: UserRegistrationRole = role as UserRegistrationRole;

      const registerRequest: RegisterRequest = {
        email: validatedData.email,
        password: validatedData.password,
        user_type: userRole,
        phone: validatedData.phone,
        company_name: formData.company_name,
        local: local,
        referral_code: referralCode || undefined
      };
      
      const result = await userController.register(registerRequest);

      if (result.success && result.data) {
        setShowSuccess(true);
      } else {
        setErrors({ submit: result.error || 'An error occurred during registration' });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<RegisterFormData> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof RegisterFormData] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        setErrors({ submit: error instanceof Error ? error.message : 'An error occurred during registration' });
      }
    } finally {
      setIsLoading(false);
    }
  }

  const handleRedirect = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950 p-4 pt-20">
      <LoadingOverlay isLoading={isLoading} message="Registering your account..." />
      <SuccessDialog 
        isOpen={showSuccess}
        message="Registration successful! You will be redirected to the login page."
        onRedirect={handleRedirect}
      />
      {/* White card */}
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative mx-auto">
        {/* Logo */}
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
          <img
            onClick={() => navigate('/')}
            src="/images/litf_logo.png"
            alt="LITF Logo"
            className="w-20 h-20 rounded-full shadow-md bg-white p-1 hover:cursor-pointer"
          />
        </div>

        {/* Extra space for the logo */}
        <div className="h-12" />

        {/* Referral Banner */}
        {referralCode && (
          <div className="mb-6 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <FaGift className="w-5 h-5 text-green-600 mr-3" />
              <div>
                <h3 className="font-semibold text-green-800">You've been invited!</h3>
                <p className="text-sm text-green-700">
                  A friend has invited you to join LITF 2025. You'll get special benefits!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Registration Form */}
        <div>
          <h2 className="text-2xl font-bold text-primary-600 mb-2">Create Account</h2>
          <p className="text-gray-500 mb-6">Join us as a <span className="font-bold text-primary-600">{displayRole}</span>!!!</p>

          {errors.submit && (
            <div className="text-red-500 text-sm text-center mb-4">{errors.submit}</div>
          )}

          <form className="space-y-4" onSubmit={handleRegister}>
            <div>
              <label className="text-sm text-gray-600">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full border rounded-md px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-primary-400 ${errors.email ? 'border-red-500' : ''}`}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="text-sm text-gray-600">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`w-full border rounded-md px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-primary-400 pr-12 ${
                    errors.password ? 'border-red-500' : ''
                  }`}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-primary-600 p-1"
                >
                  {showPassword ? <FaEye className="w-5 h-5 text-gray-400" /> : <FaEyeSlash className="w-5 h-5 text-gray-300" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              {formData.password && (
                <div className="mt-2 space-y-1">
                  {passwordConstraints.map((constraint, index) => (
                    <p
                      key={index}
                      className={`text-xs ${
                        checkPasswordConstraint(formData.password, constraint.regex)
                          ? 'text-green-600'
                          : 'text-red-500'
                      }`}
                    >
                      {checkPasswordConstraint(formData.password, constraint.regex) ? '✓ ' : '✗ '}
                      {constraint.label}
                    </p>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="text-sm text-gray-600">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                  className={`w-full border rounded-md px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-primary-400 pr-12 ${
                    errors.password ? 'border-red-500' : ''
                  }`}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-primary-600 p-1"
                >
                  {showConfirmPassword ? <FaEye className="w-5 h-5 text-gray-400" /> : <FaEyeSlash className="w-5 h-5 text-gray-300" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              {errors.confirm_password && <p className="text-red-500 text-xs mt-1">{errors.confirm_password}</p>}
              {formData.confirm_password && (
                <p className={`text-xs mt-1 ${formData.password === formData.confirm_password ? 'text-green-600' : 'text-red-500'}`}>
                  {formData.password === formData.confirm_password ? '✓ Passwords match' : '✗ Passwords do not match'}
                </p>
              )}
            </div>

            <PhoneInput
              value={formData.phone}
              onChange={handlePhoneChange}
              error={errors.phone}
            />

            {role === 'EXHIBITOR' && (
              <div>
                <label className="text-sm text-gray-600">Company Name</label>
                <input
                  type="text"
                  name="company_name"
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className="w-full border rounded-md px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-primary-400"
                />
              </div>
            )}

            <div className="flex items-start space-x-2 mt-4">
              <input
                type="checkbox"
                id="terms"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1"
              />
              <label htmlFor="terms" className="text-sm text-gray-600">
                I agree to the{' '}
                <button type="button" className="text-primary-600 hover:text-primary-700 underline" onClick={() => setShowTerms(true)}>
                  Terms and Conditions
                </button>
              </label>
            </div>

            <TermsModal open={showTerms} onClose={() => setShowTerms(false)} />

            <button
              type="submit"
              disabled={!termsAccepted}
              className={`w-full py-2 rounded-md transition ${
                termsAccepted
                  ? 'bg-primary-600 hover:bg-primary-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Create Account
            </button>

            <div className="flex flex-col items-center space-y-2 mt-4">
              <div className="text-sm text-gray-600">
                Already have an account?{' '}
                <button
                  onClick={() => navigate('/login')}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Sign in
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
