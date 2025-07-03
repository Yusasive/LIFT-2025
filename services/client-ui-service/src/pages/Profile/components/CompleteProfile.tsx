import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserController } from "@/controllers/UserController";
import { profileSchema, ProfileFormData } from "@/types/formSchemas";
import { z } from "zod";
import ErrorDialog from "@/components/common/ErrorDialog";
import SuccessDialog from "@/components/common/SuccessDialog";
import { CreateUserProfileRequest } from "../../../repository/UserRepository";
import { useUser } from "@/context/UserContext";
import { User } from "@/types/user.type";
import { countriesList, getStatesForCountry, getCountryCodeByName } from "@/data/countries";


interface CompleteProfileProps {
  onComplete: () => void;
  isExhibitor?: boolean;
}

export default function CompleteProfile({ onComplete, isExhibitor = false }: CompleteProfileProps) {
  const { setUser, user } = useUser();
  const userController = UserController.getInstance();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    country: "Nigeria",
    email: user?.email || "",
    phone: user?.phone || "",
    company: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
  const [errorDialogMessage, setErrorDialogMessage] = useState("");
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [successDialogMessage, setSuccessDialogMessage] = useState("");

  // Get available states based on selected country
  const availableStates = formData.country ? getStatesForCountry(getCountryCodeByName(formData.country)) : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      const validatedData = profileSchema.parse(formData);

      if (!user) {
        setIsErrorDialogOpen(true);
        setErrorDialogMessage("Session expired. Please log in again.");
        return;
      }

      const updatedUser: CreateUserProfileRequest = {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        address: validatedData.address,
        city: validatedData.city,
        state: validatedData.state,
        country: validatedData.country,
        email: user.email,
        phone: user.phone,
        user_type: user.userType,
      };

      const response = await userController.createProfile(updatedUser);

      if (response.success && response.data) {
        const updatedUserData: User = {
          ...response.data,
        };

        setUser(updatedUserData);
        setSuccessDialogMessage("Profile updated successfully");
        setIsSuccessDialogOpen(true);
      } else {
        setErrors({ submit: response.error || "Failed to update profile. Please try again." });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<ProfileFormData> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof ProfileFormData] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        setErrors({ submit: "Failed to update profile. Please try again." });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: value,
      };
      
      // Reset state when country changes
      if (name === 'country') {
        newData.state = '';
      }
      
      return newData;
    });
    
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSuccessDialogClose = () => {
    setIsSuccessDialogOpen(false);
    onComplete();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950 p-4" style={{ paddingTop: 'calc(2rem + 5vh)' }}>
      <ErrorDialog
        message={errorDialogMessage}
        isOpen={isErrorDialogOpen}
        onClose={() => setIsErrorDialogOpen(false)}
      />
      <SuccessDialog
        message={successDialogMessage}
        isOpen={isSuccessDialogOpen}
        onRedirect={handleSuccessDialogClose}
        autoRedirect={true}
        buttonText="Continue"
      />

      <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 relative">
        <div className="absolute left-1/2 transform -translate-x-1/2 z-20" style={{ top: 'calc(-2.5rem - 3vh)' }}>
          <img
            src="/images/litf_logo.png"
            alt="LITF Logo"
            className="w-16 h-16 md:w-20 md:h-20 rounded-full shadow-md bg-white p-1 hover:cursor-pointer"
            onClick={() => navigate("/")}
          />
        </div>

        <div className="col-span-full h-8 md:h-8 lg:h-12" />

        <div className="md:col-span-2">
          <h2 className="text-xl md:text-2xl font-bold text-primary-600 mb-2">Complete Your Profile</h2>
          <p className="text-gray-500 mb-4 md:mb-6 text-sm md:text-base">Please fill in your details to continue.</p>
        </div>

        {/* Left Side Form */}
        <div className="space-y-3 md:space-y-4">
          <div>
            <label className="text-sm text-gray-600">First Name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Enter first name"
              className={`w-full border rounded-md px-3 md:px-4 py-2 md:py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm md:text-base ${
                errors.firstName ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.firstName && (
              <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
            )}
          </div>

          <div>
            <label className="text-sm text-gray-600">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Enter last name"
              className={`w-full border rounded-md px-3 md:px-4 py-2 md:py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm md:text-base ${
                errors.lastName ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.lastName && (
              <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
            )}
          </div>

          <div>
            <label className="text-sm text-gray-600">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              disabled
              className="w-full border rounded-md px-3 md:px-4 py-2 md:py-2 mt-1 bg-gray-100 text-gray-500 text-sm md:text-base"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              disabled
              className="w-full border rounded-md px-3 md:px-4 py-2 md:py-2 mt-1 bg-gray-100 text-gray-500 text-sm md:text-base"
            />
          </div>
        </div>

        {/* Right Side Form */}
        <div className="space-y-3 md:space-y-4">
          <div>
            <label className="text-sm text-gray-600">Street Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter address"
              className={`w-full border rounded-md px-3 md:px-4 py-2 md:py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm md:text-base ${
                errors.address ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.address && (
              <p className="text-red-500 text-xs mt-1">{errors.address}</p>
            )}
          </div>

          <div>
            <label className="text-sm text-gray-600">City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Enter city"
              className={`w-full border rounded-md px-3 md:px-4 py-2 md:py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm md:text-base ${
                errors.city ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
          </div>

          <div>
            <label className="text-sm text-gray-600">State</label>
            {availableStates.length > 0 ? (
              <select
                name="state"
                value={formData.state}
                onChange={handleChange}
                className={`w-full border rounded-md px-3 md:px-4 py-2 md:py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm md:text-base ${
                  errors.state ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Select state</option>
                {availableStates.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder={formData.country ? "Enter state/province" : "Select country first"}
                disabled={!formData.country}
                className={`w-full border rounded-md px-3 md:px-4 py-2 md:py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm md:text-base ${
                  errors.state ? "border-red-500" : "border-gray-300"
                } ${!formData.country ? "bg-gray-100 text-gray-500" : ""}`}
              />
            )}
            {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
          </div>

          <div>
            <label className="text-sm text-gray-600">Country</label>
            <select
              name="country"
              value={formData.country}
              onChange={handleChange}
              className={`w-full border rounded-md px-3 md:px-4 py-2 md:py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm md:text-base ${
                errors.country ? "border-red-500" : "border-gray-300"
              }`}
            >
              {countriesList.map((country) => (
                <option key={country.code} value={country.name}>
                  {country.name}
                </option>
              ))}
            </select>
            {errors.country && (
              <p className="text-red-500 text-xs mt-1">{errors.country}</p>
            )}
          </div>
        </div>
        {isExhibitor && (
          <div className="md:col-span-2">
            <label className="text-sm text-gray-600">Company</label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="Enter company"
              className={`w-full border rounded-md px-3 md:px-4 py-2 md:py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm md:text-base ${
                errors.company ? "border-red-500" : "border-gray-300"
              }`}
            />
          </div>
        )}
        <div className="md:col-span-2 mt-4 md:mt-6">
          {errors.submit && (
            <div className="text-red-500 text-sm text-center mb-4">{errors.submit}</div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 md:py-2 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
            onClick={handleSubmit}
          >
            {isSubmitting ? "Saving..." : "Complete Profile"}
          </button>
        </div>
      </div>
    </div>
  );
}
