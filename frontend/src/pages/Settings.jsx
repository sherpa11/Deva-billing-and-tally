import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, 
  Lock, 
  Users, 
  Save, 
  Trash2, 
  CheckCircle, 
  AlertCircle 
} from 'lucide-react';

const Settings = () => {
  const { settings, updateSettings } = useSettings();
  const { user } = useAuth();

  // Store Profile State
  const [storeName, setStoreName] = useState(settings.storeName || '');
  const [tagline, setTagline] = useState(settings.tagline || '');
  const [proprietor, setProprietor] = useState(settings.proprietor || '');
  const [address, setAddress] = useState(settings.address || '');
  const [phone1, setPhone1] = useState(settings.phones?.[0] || '');
  const [phone2, setPhone2] = useState(settings.phones?.[1] || '');
  const [footerNote, setFooterNote] = useState(settings.footerNote || '');
  const [defaultCommissionRate, setDefaultCommissionRate] = useState(settings.defaultCommissionRate || 10);
  const [profileMsg, setProfileMsg] = useState('');

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Staff State
  const [staffUsers, setStaffUsers] = useState([]);
  const [newStaffUsername, setNewStaffUsername] = useState('');
  const [newStaffPassword, setNewStaffPassword] = useState('');
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('ACCOUNTANT');
  const [staffMsg, setStaffMsg] = useState('');

  useEffect(() => {
    if (settings) {
      setStoreName(settings.storeName || '');
      setTagline(settings.tagline || '');
      setProprietor(settings.proprietor || '');
      setAddress(settings.address || '');
      setPhone1(settings.phones?.[0] || '');
      setPhone2(settings.phones?.[1] || '');
      setFooterNote(settings.footerNote || '');
      setDefaultCommissionRate(settings.defaultCommissionRate || 10);
    }
    fetchStaffUsers();
  }, [settings]);

  const fetchStaffUsers = async () => {
    try {
      const res = await api.get('/auth/users');
      if (res.data.success) {
        setStaffUsers(res.data.users);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMsg('');
    try {
      const phones = [phone1.trim(), phone2.trim()].filter(Boolean);
      await updateSettings({
        storeName: storeName.trim(),
        tagline: tagline.trim(),
        proprietor: proprietor.trim(),
        address: address.trim(),
        phones,
        footerNote: footerNote.trim(),
        defaultCommissionRate: Number(defaultCommissionRate),
      });
      setProfileMsg('Business profile saved successfully.');
      setTimeout(() => setProfileMsg(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to update settings');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMsg('');
    setPasswordError('');
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    try {
      const res = await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      if (res.data.success) {
        setPasswordMsg('Password changed successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordMsg(''), 4000);
      }
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to update password');
    }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setStaffMsg('');
    try {
      const res = await api.post('/auth/users', {
        username: newStaffUsername.trim(),
        password: newStaffPassword.trim(),
        name: newStaffName.trim(),
        role: newStaffRole,
      });
      if (res.data.success) {
        setStaffMsg('New staff user added.');
        setNewStaffUsername('');
        setNewStaffPassword('');
        setNewStaffName('');
        fetchStaffUsers();
        setTimeout(() => setStaffMsg(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create staff account');
    }
  };

  const handleDeleteStaff = async (id) => {
    if (!window.confirm('Are you sure you want to remove this staff user?')) return;
    try {
      const res = await api.delete(`/auth/users/${id}`);
      if (res.data.success) {
        fetchStaffUsers();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-surface-border shadow-subtle">
        <h1 className="text-xl font-bold text-content-main tracking-tight">
          Settings & Administration
        </h1>
        <p className="text-xs text-content-secondary mt-0.5">
          Business profile, billing parameters, security, and staff permissions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mandi Profile */}
        <div className="bg-white p-6 rounded-xl border border-surface-border shadow-subtle">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-surface-border">
            <Building2 className="w-4 h-4 text-forest-600" />
            <h2 className="text-sm font-bold text-content-main">
              Business Profile & Bill Configuration
            </h2>
          </div>

          {profileMsg && (
            <div className="mb-4 p-3 bg-forest-50 border border-forest-200 rounded-lg text-xs text-forest-700 font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-forest-600 shrink-0" /> {profileMsg}
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-content-main mb-1">Mandi / Business Name</label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-surface-border font-tamil font-bold focus:outline-none focus:border-forest-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-content-main mb-1">Business Description / Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-surface-border font-tamil focus:outline-none focus:border-forest-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-content-main mb-1">Proprietor Name</label>
              <input
                type="text"
                value={proprietor}
                onChange={(e) => setProprietor(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-surface-border font-tamil focus:outline-none focus:border-forest-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-content-main mb-1">Market Address</label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-surface-border font-tamil focus:outline-none focus:border-forest-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-content-main mb-1">Phone 1</label>
                <input
                  type="text"
                  value={phone1}
                  onChange={(e) => setPhone1(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-surface-border focus:outline-none focus:border-forest-600"
                />
              </div>
              <div>
                <label className="block font-semibold text-content-main mb-1">Phone 2</label>
                <input
                  type="text"
                  value={phone2}
                  onChange={(e) => setPhone2(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-surface-border focus:outline-none focus:border-forest-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-content-main mb-1">Bill Pad Footer Note</label>
                <input
                  type="text"
                  value={footerNote}
                  onChange={(e) => setFooterNote(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-surface-border font-tamil focus:outline-none focus:border-forest-600"
                />
              </div>
              <div>
                <label className="block font-semibold text-content-main mb-1">Default Mandi Commission (%)</label>
                <input
                  type="number"
                  value={defaultCommissionRate}
                  onChange={(e) => setDefaultCommissionRate(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-surface-border font-semibold focus:outline-none focus:border-forest-600"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 bg-forest-600 hover:bg-forest-700 text-white font-semibold rounded-lg shadow-xs"
              >
                <Save className="w-3.5 h-3.5" /> Save Changes
              </button>
            </div>
          </form>
        </div>

        {/* Security & Staff */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-surface-border shadow-subtle">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-surface-border">
              <Lock className="w-4 h-4 text-forest-600" />
              <h2 className="text-sm font-bold text-content-main">
                Security & Password
              </h2>
            </div>

            {passwordMsg && (
              <div className="mb-4 p-3 bg-forest-50 border border-forest-200 rounded-lg text-xs text-forest-700 font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-forest-600 shrink-0" /> {passwordMsg}
              </div>
            )}

            {passwordError && (
              <div className="mb-4 p-3 bg-status-dangerLight border border-status-danger/20 rounded-lg text-xs text-status-danger font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-status-danger shrink-0" /> {passwordError}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-content-main mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-surface-border focus:outline-none focus:border-forest-600"
                />
              </div>
              <div>
                <label className="block font-semibold text-content-main mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-surface-border focus:outline-none focus:border-forest-600"
                />
              </div>
              <div>
                <label className="block font-semibold text-content-main mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-surface-border focus:outline-none focus:border-forest-600"
                />
              </div>
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-content-main hover:bg-black text-white font-semibold rounded-lg"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>

          {/* Staff Accounts Management */}
          <div className="bg-white p-6 rounded-xl border border-surface-border shadow-subtle">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-surface-border">
              <Users className="w-4 h-4 text-forest-600" />
              <h2 className="text-sm font-bold text-content-main">
                Staff User Accounts
              </h2>
            </div>

            {staffMsg && (
              <div className="mb-4 p-3 bg-forest-50 border border-forest-200 rounded-lg text-xs text-forest-700 font-semibold">
                {staffMsg}
              </div>
            )}

            {/* List */}
            <div className="space-y-2 mb-4 text-xs">
              {staffUsers.map((su) => (
                <div
                  key={su._id}
                  className="flex items-center justify-between p-3 bg-surface-bg rounded-lg border border-surface-border"
                >
                  <div>
                    <div className="font-semibold text-content-main">{su.name} ({su.username})</div>
                    <div className="text-[11px] text-content-secondary">
                      {su.role === 'ADMIN' ? 'Administrator' : 'Accountant'}
                    </div>
                  </div>
                  {su._id !== user?.id && (
                    <button
                      onClick={() => handleDeleteStaff(su._id)}
                      className="text-content-secondary hover:text-status-danger p-1 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add staff form */}
            <form onSubmit={handleCreateStaff} className="pt-3 border-t border-surface-border space-y-2 text-xs">
              <div className="font-semibold text-content-main">Add New Staff User:</div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Username"
                  required
                  value={newStaffUsername}
                  onChange={(e) => setNewStaffUsername(e.target.value)}
                  className="p-2 border border-surface-border rounded-lg bg-surface-bg"
                />
                <input
                  type="password"
                  placeholder="Password"
                  required
                  value={newStaffPassword}
                  onChange={(e) => setNewStaffPassword(e.target.value)}
                  className="p-2 border border-surface-border rounded-lg bg-surface-bg"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Full Name"
                  required
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  className="p-2 border border-surface-border rounded-lg bg-surface-bg"
                />
                <select
                  value={newStaffRole}
                  onChange={(e) => setNewStaffRole(e.target.value)}
                  className="p-2 border border-surface-border rounded-lg bg-surface-bg"
                >
                  <option value="ACCOUNTANT">Accountant</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full mt-2 py-2 bg-content-main hover:bg-black text-white font-semibold rounded-lg"
              >
                + Add Staff Member
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
