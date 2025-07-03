// components/LoginWithRole.tsx
import React, { useState, useEffect } from 'react';
import { FaUser, FaStore } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { UserController } from '../../controllers/UserController';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import { loginSchema, LoginFormData } from '../../types/formSchemas';
import { z } from 'zod';
import { LoginRequest, UserRole } from '../../repository/UserRepository';
import { useUser } from '@/context/UserContext';

const roleOptions = [
  {
    value: UserRole.ATTENDEE,
    label: 'Visitor',
    description: 'Event participants',
    icon: <FaUser />,
  },
  {
    value: UserRole.EXHIBITOR,
    label: 'Exhibitor',
    description: 'Booth operators',
    icon: <FaStore />,
  },
  // {
  //   value: UserRole.STAFF,
  //   label: 'LITF Staff',
  //   description: 'Official personnel',
  //   icon: <FaShieldAlt />,
  // },
];

const Login: React.FC = () => {
  const { setUser } = useUser();
  const { user, loading } = useUser();
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.ATTENDEE);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const userController = UserController.getInstance();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    staffId: '',
    role: UserRole.ATTENDEE,
  });
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({ submit: '' });
    setIsLoading(true);
    
    try {
      const validatedData = loginSchema.parse({
        ...formData,
        role: selectedRole
      });

      const loginRequest: LoginRequest = {
        email: validatedData.email,
        password: validatedData.password,
        user_type: validatedData.role,
        staffId: validatedData.staffId
      };

      const result = await userController.login(loginRequest);

      if (result.success && result.data) {
        // First set the initial user data from login
        setUser(result.data);
        
        // Then fetch the complete profile
        const profileResult = await userController.getUserProfile();
        if (profileResult.success && profileResult.data) {
          setUser(profileResult.data);
        }

        switch (result.data.userType.toLowerCase()) {
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
      } else {
        setErrors({ submit: result.error || 'Login failed' });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = error.errors.reduce((acc, err) => {
          if (err.path[0]) {
            const field = err.path[0] as keyof Omit<LoginFormData, 'role'>;
            acc[field] = err.message;
          }
          return acc;
        }, {} as Partial<Omit<LoginFormData, 'role'>>);
        setErrors({ ...errors, ...fieldErrors });
      } else {
        setErrors({ submit: error instanceof Error ? error.message : 'An error occurred during login' });
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950 p-4">
      <LoadingOverlay isLoading={isLoading} message="Signing in..." />
      {/* White card */}
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-6 relative">
        {/* Logo spans both columns */}
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
          <img
            onClick={() => navigate('/')}
            src="/images/litf_logo.png"
            alt="LITF Logo"
            className="w-20 h-20 rounded-full shadow-md bg-white p-1 hover:cursor-pointer"
          />
        </div>

        {/* Extra space for the logo */}
        <div className="col-span-full h-8 md:h-12" />

        {/* Role Selection */}
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-3">User Type</h3>
          <p className="text-sm text-gray-500 mb-4">Select your role to continue</p>

          <div className="space-y-3">
            {roleOptions.map((role) => (
              <div
                key={role.value}
                onClick={() => setSelectedRole(role.value as UserRole)}
                className={`cursor-pointer border rounded-md px-4 py-3 flex items-center space-x-4 transition ${
                  selectedRole === role.value
                    ? 'bg-primary-50 border-primary-600'
                    : 'bg-white border-gray-300 hover:border-primary-400'
                }`}
              >
                <input
                  type="radio"
                  name="user_type"
                  value={role.value}
                  checked={selectedRole === role.value}
                  onChange={() => setSelectedRole(role.value as UserRole)}
                  className="form-radio text-primary-600"
                />
                <div className="text-primary-600 text-xl">{role.icon}</div>
                <div>
                  <div
                    className={`text-sm font-semibold ${
                      selectedRole === role.value
                        ? 'text-primary-700'
                        : 'text-gray-800'
                    }`}
                  >
                    {role.label}
                  </div>
                  <div className="text-sm text-gray-500">{role.description}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 bg-primary-50 border border-primary-100 rounded-md p-4 text-sm text-gray-700">
            <div className="font-semibold text-primary-700">
              Selected: {roleOptions.find((r) => r.value === selectedRole)?.label}
            </div>
            <p>
              {selectedRole === UserRole.ATTENDEE &&
                'Access event information, register for sessions, and manage your participation.'}
              {selectedRole === UserRole.EXHIBITOR &&
                'Manage booth information, respond to inquiries, and organize your exhibition setup.'}
              {selectedRole === UserRole.STAFF &&
                'Access administrative tools, coordinate operations, and oversee event logistics.'}
            </p>
          </div>

          <div className="mt-6 text-center">
            <div className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/select-role')}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Sign up
              </button>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <div>
          <h2 className="text-2xl font-bold text-primary-600 mb-2">Welcome back!</h2>
          <p className="text-gray-500 mb-6">Please sign in to continue.</p>

          {errors.submit && (
            <div className="text-red-500 text-sm text-center mb-4">{errors.submit}</div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-sm text-gray-600">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter your email"
                className={`w-full border rounded-md px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-primary-400 ${
                  errors.email ? 'border-red-500' : ''
                }`}
                required
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="text-sm text-gray-600">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter your password"
                className={`w-full border rounded-md px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-primary-400 ${
                  errors.password ? 'border-red-500' : ''
                }`}
                required
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            {selectedRole === UserRole.STAFF && (
              <div>
                <label className="text-sm text-gray-600">Staff ID</label>
                <input
                  type="text"
                  name="staffId"
                  value={formData.staffId}
                  onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                  placeholder="Enter your Staff ID"
                  className={`w-full border rounded-md px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-primary-400 ${
                    errors.staffId ? 'border-red-500' : ''
                  }`}
                  required
                />
                {errors.staffId && <p className="text-red-500 text-xs mt-1">{errors.staffId}</p>}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-md transition"
            >
              Sign In
            </button>

            <div className="text-center">
              <a href="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700">
                Forgot your password?
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
