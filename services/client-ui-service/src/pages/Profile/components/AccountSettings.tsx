import React from "react";
import { User } from "../../../types/user.type";

interface AccountSettingsProps {
  user: User;
}

const AccountSettings: React.FC<AccountSettingsProps> = ({ user }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-5xl mx-auto space-y-12">
      {/* ACCOUNT SECTION */}
      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-2">Account Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">User Name</label>
            <input
              value={`${user.firstName} ${user.lastName}`}
              readOnly
              className="w-full border rounded-lg px-4 py-2 bg-gray-100 text-gray-700 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
            <input
              value={user.email}
              readOnly
              className="w-full border rounded-lg px-4 py-2 bg-gray-100 text-gray-700 cursor-not-allowed"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-600 mb-2">Verification Options</label>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" className="accent-primary" /> Email
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked readOnly className="accent-primary" /> SMS
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" className="accent-primary" /> Phone
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* SECURITY SECTION */}
      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-2">Security Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Login Verification</label>
            <span className="text-sm text-gray-500">Standard verification enabled</span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Password Verification</label>
            <span className="text-sm text-gray-500">2FA is currently disabled</span>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-600 mb-2">Additional Setup Options</label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" className="accent-primary" /> Require Personal Details
            </label>
          </div>
        </div>
      </section>

      {/* NOTIFICATION SECTION */}
      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-2">Notifications</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-600 mb-2">Notification Preferences</label>
            <div className="flex flex-col gap-3 text-sm text-gray-700">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="accent-primary" /> Allow all Notifications
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="accent-primary" /> Disable all Notifications
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="accent-primary" /> Notification Sounds
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* ACTIONS */}
      <div className="flex justify-end gap-4 border-t pt-6">
        <button className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-lg font-medium">
          Deactivate Account
        </button>
        <button className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-2 rounded-lg font-medium">
          Change Password
        </button>
      </div>
    </div>
  );
};

export default AccountSettings;
