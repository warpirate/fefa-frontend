'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import authService from '@/services/authService';
import MainLayout from '@/components/layout/MainLayout';
import Button from '@/components/ui/Button';
import '@/styles/components/account/Settings.css';

// Type definitions
interface Address {
  _id: string;
  type: 'home' | 'work' | 'other';
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  profileImage?: string;
  addresses?: Address[];
  preferences?: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    newsletter: boolean;
  };
  lastLogin?: string;
  createdAt: string;
}

function SettingsPageContent() {
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [userData, setUserData] = useState<UserData | null>(null);

  // Set default tab based on URL parameters
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['profile', 'notifications', 'privacy', 'security', 'preferences', 'addresses'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Fetch user data from backend when profile tab is active
  useEffect(() => {
    const fetchUserData = async () => {
      // Only fetch when profile tab is active
      if (activeTab !== 'profile') return;
      if (!isAuthenticated || !user) return;
      
      try {
        setIsLoading(true);
        const { accessToken } = authService.getStoredTokens();
        if (accessToken) {
          const response = await authService.getProfile(accessToken);
          setUserData(response.user);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [activeTab, isAuthenticated, user]);

  const [settings, setSettings] = useState({
    // Profile Settings
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: 'prefer-not-to-say',
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    orderUpdates: true,
    promotionalEmails: false,
    priceAlerts: true,
    newProductAlerts: true,
    
    // Privacy Settings
    profileVisibility: 'private',
    showWishlist: false,
    allowReviews: true,
    dataSharing: false,
    
    // Security Settings
    twoFactorAuth: false,
    loginAlerts: true,
    sessionTimeout: '30',
    
    // Preferences
    currency: 'INR',
    language: 'en',
    theme: 'light',
    timezone: 'Asia/Kolkata'
  });

  // Update settings when user data is loaded
  useEffect(() => {
    if (userData) {
      setSettings(prev => ({
        ...prev,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        phone: userData.phone || '',
        dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth).toISOString().split('T')[0] : '',
        gender: userData.gender || 'prefer-not-to-say',
        emailNotifications: userData.preferences?.emailNotifications ?? true,
        smsNotifications: userData.preferences?.smsNotifications ?? false,
      }));
      
      // Set addresses from user data
      setAddresses(userData.addresses || []);
    }
  }, [userData]);

  const [isEditing, setIsEditing] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Address management state
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState({
    type: 'home',
    firstName: '',
    lastName: '',
    company: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    phone: '',
    isDefault: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setSettings(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    if (!isAuthenticated || !user) {
      console.error('User not authenticated');
      return;
    }

    try {
      setIsSaving(true);
      setSaveStatus('saving');
      
      const { accessToken } = authService.getStoredTokens();
      if (!accessToken) {
        throw new Error('No access token found');
      }

      // Prepare profile data for backend
      const profileData = {
        firstName: settings.firstName,
        lastName: settings.lastName,
        phone: settings.phone,
        dateOfBirth: settings.dateOfBirth ? new Date(settings.dateOfBirth) : undefined,
        gender: settings.gender !== 'prefer-not-to-say' ? settings.gender : undefined,
        preferences: {
          emailNotifications: settings.emailNotifications,
          smsNotifications: settings.smsNotifications,
          newsletter: settings.promotionalEmails,
        }
      };

      // Update profile in backend
      await authService.updateProfile(accessToken, profileData);
      
      // Update local user data
      const updatedUserData: UserData = {
        ...userData!,
        firstName: settings.firstName,
        lastName: settings.lastName,
        phone: settings.phone,
        dateOfBirth: settings.dateOfBirth ? new Date(settings.dateOfBirth).toISOString() : undefined,
        gender: settings.gender !== 'prefer-not-to-say' ? settings.gender : undefined,
        preferences: {
          ...userData?.preferences,
          emailNotifications: settings.emailNotifications,
          smsNotifications: settings.smsNotifications,
          newsletter: settings.promotionalEmails,
        }
      };
      
      setUserData(updatedUserData);
      setSaveStatus('saved');
      setIsEditing(false);
      
      // Reset save status after 3 seconds
      setTimeout(() => setSaveStatus('idle'), 3000);
      
    } catch (error) {
      console.error('Error saving profile:', error);
      setSaveStatus('error');
      // Reset error status after 5 seconds
      setTimeout(() => setSaveStatus('idle'), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    // Here you would typically update the password
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // Here you would typically delete the account
    }
  };

  // Address management functions
  const handleAddressInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setAddressForm(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setAddressForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAddAddress = () => {
    setAddressForm({
      type: 'home',
      firstName: settings.firstName,
      lastName: settings.lastName,
      company: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
      phone: settings.phone,
      isDefault: addresses.length === 0
    });
    setIsEditingAddress(true);
    setEditingAddressId(null);
  };

  const handleEditAddress = (address: Address) => {
    setAddressForm({
      type: address.type,
      firstName: address.firstName,
      lastName: address.lastName,
      company: address.company || '',
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      phone: address.phone,
      isDefault: address.isDefault
    });
    setIsEditingAddress(true);
    setEditingAddressId(address._id);
  };

  const handleSaveAddress = async () => {
    try {
      setIsSaving(true);
      const { accessToken } = authService.getStoredTokens();
      if (!accessToken) {
        throw new Error('No access token found');
      }

      // Prepare address data for backend
      const addressData = {
        type: addressForm.type,
        firstName: addressForm.firstName,
        lastName: addressForm.lastName,
        company: addressForm.company,
        addressLine1: addressForm.addressLine1,
        addressLine2: addressForm.addressLine2,
        city: addressForm.city,
        state: addressForm.state,
        postalCode: addressForm.postalCode,
        country: addressForm.country,
        phone: addressForm.phone,
        isDefault: addressForm.isDefault
      };

      if (editingAddressId) {
        // Update existing address
        const updatedAddress = await authService.updateAddress(accessToken, editingAddressId, addressData);
        
        // Update local state
        setAddresses(prev => prev.map(addr => 
          addr._id === editingAddressId ? updatedAddress.address : addr
        ));
      } else {
        // Add new address
        const newAddress = await authService.addAddress(accessToken, addressData);
        
        // Update local state
        setAddresses(prev => [...prev, newAddress.address]);
      }

      // Refresh user data to get updated addresses
      const response = await authService.getProfile(accessToken);
      setUserData(response.user);
      setAddresses(response.user.addresses || []);

      setIsEditingAddress(false);
      setEditingAddressId(null);
      setAddressForm({
        type: 'home',
        firstName: '',
        lastName: '',
        company: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India',
        phone: '',
        isDefault: false
      });
    } catch (error) {
      console.error('Error saving address:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save address. Please try again.';
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (confirm('Are you sure you want to delete this address?')) {
      try {
        setIsSaving(true);
        const { accessToken } = authService.getStoredTokens();
        if (!accessToken) {
          throw new Error('No access token found');
        }

        // Delete address from backend
        await authService.deleteAddress(accessToken, addressId);
        
        // Refresh user data to get updated addresses
        const response = await authService.getProfile(accessToken);
        setUserData(response.user);
        setAddresses(response.user.addresses || []);
      } catch (error) {
        console.error('Error deleting address:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete address. Please try again.';
        alert(`Error: ${errorMessage}`);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    try {
      setIsSaving(true);
      const { accessToken } = authService.getStoredTokens();
      if (!accessToken) {
        throw new Error('No access token found');
      }

      // Update address to set as default
      await authService.updateAddress(accessToken, addressId, { isDefault: true });
      
      // Refresh user data to get updated addresses
      const response = await authService.getProfile(accessToken);
      setUserData(response.user);
      setAddresses(response.user.addresses || []);
    } catch (error) {
      console.error('Error setting default address:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to set default address. Please try again.';
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'addresses', label: 'Addresses', icon: '📍' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'privacy', label: 'Privacy', icon: '🔒' },
    { id: 'security', label: 'Security', icon: '🛡️' },
    { id: 'preferences', label: 'Preferences', icon: '⚙️' }
  ];

  // Show loading state while checking authentication
  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-soft-pink-100 to-soft-pink-200 py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center px-4">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-script text-primary mb-3 sm:mb-4">Access Denied</h1>
                <p className="text-dark-gray text-base sm:text-lg mb-6 sm:mb-8">
                  Please log in to access your account settings.
                </p>
                <Button href="/" className="w-full sm:w-auto">
                  Go to Home
                </Button>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Show loading state while fetching user data (only for profile tab)
  if (isLoading && activeTab === 'profile') {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-soft-pink-100 to-soft-pink-200 py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center px-4">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3 sm:mb-4"></div>
                <p className="text-dark-gray text-base sm:text-lg">Loading your profile...</p>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-soft-pink-100 to-soft-pink-200 py-4 sm:py-6 md:py-8">
        <div className="container mx-auto px-3 sm:px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-script text-primary mb-2 sm:mb-4">Account Settings</h1>
              <p className="text-dark-gray text-base sm:text-lg px-4">
                Manage your account preferences and security settings
              </p>
            </div>

            <div className="settings-container">
              {/* Settings Sidebar */}
              <div className="settings-sidebar">
                <nav className="settings-nav">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      className={`settings-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      <span className="nav-icon">{tab.icon}</span>
                      <span className="nav-label">{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Settings Content */}
              <div className="settings-content">
                {/* Profile Settings */}
                {activeTab === 'profile' && (
                  <div className="settings-section">
                    <div className="section-header">
                      <h2 className="section-title">Profile Information</h2>
                      <p className="section-description">
                        Update your personal information and contact details
                      </p>
                    </div>

                    {isLoading ? (
                      <div className="text-center py-12">
                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-dark-gray">Loading profile data...</p>
                      </div>
                    ) : (
                    <div className="settings-form">
                      <div className="form-grid">
                        <div className="form-group">
                          <label className="form-label">First Name</label>
                          <input
                            type="text"
                            name="firstName"
                            value={settings.firstName}
                            onChange={handleInputChange}
                            className="form-input"
                            disabled={!isEditing}
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Last Name</label>
                          <input
                            type="text"
                            name="lastName"
                            value={settings.lastName}
                            onChange={handleInputChange}
                            className="form-input"
                            disabled={!isEditing}
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Email Address</label>
                          <input
                            type="email"
                            name="email"
                            value={settings.email}
                            onChange={handleInputChange}
                            className="form-input"
                            disabled={!isEditing}
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Phone Number</label>
                          <input
                            type="tel"
                            name="phone"
                            value={settings.phone}
                            onChange={handleInputChange}
                            className="form-input"
                            disabled={!isEditing}
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Date of Birth</label>
                          <input
                            type="date"
                            name="dateOfBirth"
                            value={settings.dateOfBirth}
                            onChange={handleInputChange}
                            className="form-input"
                            disabled={!isEditing}
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Gender</label>
                          <select
                            name="gender"
                            value={settings.gender}
                            onChange={handleInputChange}
                            className="form-select"
                            disabled={!isEditing}
                          >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                            <option value="prefer-not-to-say">Prefer not to say</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-actions">
                        {!isEditing ? (
                          <Button onClick={() => setIsEditing(true)}>
                            Edit Profile
                          </Button>
                        ) : (
                          <div className="action-buttons">
                            <Button 
                              onClick={handleSave} 
                              className="save-btn"
                              disabled={isSaving}
                            >
                              {isSaving ? 'Saving...' : 
                               saveStatus === 'saved' ? 'Saved!' :
                               saveStatus === 'error' ? 'Error - Try Again' :
                               'Save Changes'}
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => setIsEditing(false)}
                              disabled={isSaving}
                            >
                              Cancel
                            </Button>
                          </div>
                        )}
                        {saveStatus === 'error' && (
                          <p className="text-red-500 text-sm mt-2">
                            Failed to save changes. Please try again.
                          </p>
                        )}
                      </div>
                    </div>
                    )}
                  </div>
                )}

                {/* Address Settings */}
                {activeTab === 'addresses' && (
                  <div className="settings-section">
                    <div className="section-header">
                      <h2 className="section-title">Address Management</h2>
                      <p className="section-description">
                        Manage your shipping and billing addresses
                      </p>
                    </div>

                    <div className="settings-form">
                      {/* Address List */}
                      <div className="address-list">
                        {addresses.length > 0 ? (
                          <div className="address-grid">
                            {addresses.map((address) => (
                              <div key={address._id} className="address-card">
                                <div className="address-header">
                                  <h4 className="address-type">
                                    {address.type.charAt(0).toUpperCase() + address.type.slice(1)} Address
                                    {address.isDefault && <span className="default-badge">Default</span>}
                                  </h4>
                                  <div className="address-actions">
                                    <button
                                      onClick={() => handleEditAddress(address)}
                                      className="edit-address-btn"
                                      disabled={isSaving}
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeleteAddress(address._id)}
                                      className="delete-address-btn"
                                      disabled={isSaving}
                                    >
                                      {isSaving ? 'Deleting...' : 'Delete'}
                                    </button>
                                  </div>
                                </div>
                                <div className="address-details">
                                  <p className="address-name">
                                    {address.firstName} {address.lastName}
                                  </p>
                                  <p className="address-company">{address.company}</p>
                                  <p className="address-line">{address.addressLine1}</p>
                                  {address.addressLine2 && (
                                    <p className="address-line">{address.addressLine2}</p>
                                  )}
                                  <p className="address-location">
                                    {address.city}, {address.state} {address.postalCode}
                                  </p>
                                  <p className="address-country">{address.country}</p>
                                  <p className="address-phone">{address.phone}</p>
                                </div>
                                {!address.isDefault && (
                                  <button
                                    onClick={() => handleSetDefaultAddress(address._id)}
                                    className="set-default-btn"
                                    disabled={isSaving}
                                  >
                                    {isSaving ? 'Setting...' : 'Set as Default'}
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="no-addresses">
                            <p className="no-addresses-text">No addresses saved yet</p>
                            <p className="no-addresses-subtext">
                              Add an address to make checkout faster
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Add Address Button */}
                      <div className="add-address-section">
                        <Button 
                          onClick={handleAddAddress} 
                          className="add-address-btn"
                          disabled={isSaving}
                        >
                          {isSaving ? 'Loading...' : '+ Add New Address'}
                        </Button>
                      </div>

                      {/* Address Form Modal */}
                      {isEditingAddress && (
                        <div className="address-form-modal">
                          <div className="modal-overlay" onClick={() => setIsEditingAddress(false)}></div>
                          <div className="modal-content">
                            <div className="modal-header">
                              <h3 className="modal-title">
                                {editingAddressId ? 'Edit Address' : 'Add New Address'}
                              </h3>
                              <button
                                onClick={() => setIsEditingAddress(false)}
                                className="modal-close"
                              >
                                ×
                              </button>
                            </div>
                            <div className="modal-body">
                              <div className="address-form-grid">
                                <div className="form-group">
                                  <label className="form-label">Address Type</label>
                                  <select
                                    name="type"
                                    value={addressForm.type}
                                    onChange={handleAddressInputChange}
                                    className="form-select"
                                  >
                                    <option value="home">Home</option>
                                    <option value="work">Work</option>
                                    <option value="other">Other</option>
                                  </select>
                                </div>

                                <div className="form-group">
                                  <label className="form-label">First Name</label>
                                  <input
                                    type="text"
                                    name="firstName"
                                    value={addressForm.firstName}
                                    onChange={handleAddressInputChange}
                                    className="form-input"
                                    required
                                  />
                                </div>

                                <div className="form-group">
                                  <label className="form-label">Last Name</label>
                                  <input
                                    type="text"
                                    name="lastName"
                                    value={addressForm.lastName}
                                    onChange={handleAddressInputChange}
                                    className="form-input"
                                    required
                                  />
                                </div>

                                <div className="form-group">
                                  <label className="form-label">Company (Optional)</label>
                                  <input
                                    type="text"
                                    name="company"
                                    value={addressForm.company}
                                    onChange={handleAddressInputChange}
                                    className="form-input"
                                  />
                                </div>

                                <div className="form-group full-width">
                                  <label className="form-label">Address Line 1</label>
                                  <input
                                    type="text"
                                    name="addressLine1"
                                    value={addressForm.addressLine1}
                                    onChange={handleAddressInputChange}
                                    className="form-input"
                                    required
                                  />
                                </div>

                                <div className="form-group full-width">
                                  <label className="form-label">Address Line 2 (Optional)</label>
                                  <input
                                    type="text"
                                    name="addressLine2"
                                    value={addressForm.addressLine2}
                                    onChange={handleAddressInputChange}
                                    className="form-input"
                                  />
                                </div>

                                <div className="form-group">
                                  <label className="form-label">City</label>
                                  <input
                                    type="text"
                                    name="city"
                                    value={addressForm.city}
                                    onChange={handleAddressInputChange}
                                    className="form-input"
                                    required
                                  />
                                </div>

                                <div className="form-group">
                                  <label className="form-label">State</label>
                                  <input
                                    type="text"
                                    name="state"
                                    value={addressForm.state}
                                    onChange={handleAddressInputChange}
                                    className="form-input"
                                    required
                                  />
                                </div>

                                <div className="form-group">
                                  <label className="form-label">Postal Code</label>
                                  <input
                                    type="text"
                                    name="postalCode"
                                    value={addressForm.postalCode}
                                    onChange={handleAddressInputChange}
                                    className="form-input"
                                    required
                                  />
                                </div>

                                <div className="form-group">
                                  <label className="form-label">Country</label>
                                  <select
                                    name="country"
                                    value={addressForm.country}
                                    onChange={handleAddressInputChange}
                                    className="form-select"
                                  >
                                    <option value="India">India</option>
                                    <option value="United States">United States</option>
                                    <option value="United Kingdom">United Kingdom</option>
                                    <option value="Canada">Canada</option>
                                    <option value="Australia">Australia</option>
                                  </select>
                                </div>

                                <div className="form-group">
                                  <label className="form-label">Phone Number</label>
                                  <input
                                    type="tel"
                                    name="phone"
                                    value={addressForm.phone}
                                    onChange={handleAddressInputChange}
                                    className="form-input"
                                    required
                                  />
                                </div>

                                <div className="form-group checkbox-group">
                                  <label className="checkbox-label">
                                    <input
                                      type="checkbox"
                                      name="isDefault"
                                      checked={addressForm.isDefault}
                                      onChange={handleAddressInputChange}
                                    />
                                    <span className="checkbox-text">Set as default address</span>
                                  </label>
                                </div>
                              </div>
                            </div>
                            <div className="modal-footer">
                              <Button
                                variant="outline"
                                onClick={() => setIsEditingAddress(false)}
                                disabled={isSaving}
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={handleSaveAddress}
                                disabled={isSaving}
                                className="save-address-btn"
                              >
                                {isSaving ? 'Saving...' : editingAddressId ? 'Update Address' : 'Add Address'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Notification Settings */}
                {activeTab === 'notifications' && (
                  <div className="settings-section">
                    <div className="section-header">
                      <h2 className="section-title">Notification Preferences</h2>
                      <p className="section-description">
                        Choose how you want to be notified about updates and offers
                      </p>
                    </div>

                    <div className="settings-form">
                      <div className="notification-group">
                        <h3 className="notification-title">Communication Channels</h3>
                        
                        <div className="notification-item">
                          <div className="notification-info">
                            <h4 className="notification-name">Email Notifications</h4>
                            <p className="notification-description">Receive updates via email</p>
                          </div>
                          <label className="toggle-switch">
                            <input
                              type="checkbox"
                              name="emailNotifications"
                              checked={settings.emailNotifications}
                              onChange={handleInputChange}
                            />
                            <span className="toggle-slider"></span>
                          </label>
                        </div>

                        <div className="notification-item">
                          <div className="notification-info">
                            <h4 className="notification-name">SMS Notifications</h4>
                            <p className="notification-description">Receive updates via text message</p>
                          </div>
                          <label className="toggle-switch">
                            <input
                              type="checkbox"
                              name="smsNotifications"
                              checked={settings.smsNotifications}
                              onChange={handleInputChange}
                            />
                            <span className="toggle-slider"></span>
                          </label>
                        </div>

                        <div className="notification-item">
                          <div className="notification-info">
                            <h4 className="notification-name">Push Notifications</h4>
                            <p className="notification-description">Receive browser push notifications</p>
                          </div>
                          <label className="toggle-switch">
                            <input
                              type="checkbox"
                              name="pushNotifications"
                              checked={settings.pushNotifications}
                              onChange={handleInputChange}
                            />
                            <span className="toggle-slider"></span>
                          </label>
                        </div>
                      </div>

                      <div className="notification-group">
                        <h3 className="notification-title">Notification Types</h3>
                        
                        <div className="notification-item">
                          <div className="notification-info">
                            <h4 className="notification-name">Order Updates</h4>
                            <p className="notification-description">Get notified about order status changes</p>
                          </div>
                          <label className="toggle-switch">
                            <input
                              type="checkbox"
                              name="orderUpdates"
                              checked={settings.orderUpdates}
                              onChange={handleInputChange}
                            />
                            <span className="toggle-slider"></span>
                          </label>
                        </div>

                        <div className="notification-item">
                          <div className="notification-info">
                            <h4 className="notification-name">Promotional Emails</h4>
                            <p className="notification-description">Receive special offers and discounts</p>
                          </div>
                          <label className="toggle-switch">
                            <input
                              type="checkbox"
                              name="promotionalEmails"
                              checked={settings.promotionalEmails}
                              onChange={handleInputChange}
                            />
                            <span className="toggle-slider"></span>
                          </label>
                        </div>

                        <div className="notification-item">
                          <div className="notification-info">
                            <h4 className="notification-name">Price Alerts</h4>
                            <p className="notification-description">Get notified when items on your wishlist go on sale</p>
                          </div>
                          <label className="toggle-switch">
                            <input
                              type="checkbox"
                              name="priceAlerts"
                              checked={settings.priceAlerts}
                              onChange={handleInputChange}
                            />
                            <span className="toggle-slider"></span>
                          </label>
                        </div>

                        <div className="notification-item">
                          <div className="notification-info">
                            <h4 className="notification-name">New Product Alerts</h4>
                            <p className="notification-description">Be the first to know about new jewelry collections</p>
                          </div>
                          <label className="toggle-switch">
                            <input
                              type="checkbox"
                              name="newProductAlerts"
                              checked={settings.newProductAlerts}
                              onChange={handleInputChange}
                            />
                            <span className="toggle-slider"></span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Privacy Settings */}
                {activeTab === 'privacy' && (
                  <div className="settings-section">
                    <div className="section-header">
                      <h2 className="section-title">Privacy Settings</h2>
                      <p className="section-description">
                        Control your privacy and data sharing preferences
                      </p>
                    </div>

                    <div className="settings-form">
                      <div className="form-group">
                        <label className="form-label">Profile Visibility</label>
                        <select
                          name="profileVisibility"
                          value={settings.profileVisibility}
                          onChange={handleInputChange}
                          className="form-select"
                        >
                          <option value="public">Public</option>
                          <option value="private">Private</option>
                          <option value="friends">Friends Only</option>
                        </select>
                      </div>

                      <div className="privacy-group">
                        <div className="privacy-item">
                          <div className="privacy-info">
                            <h4 className="privacy-name">Show Wishlist</h4>
                            <p className="privacy-description">Allow others to see your wishlist</p>
                          </div>
                          <label className="toggle-switch">
                            <input
                              type="checkbox"
                              name="showWishlist"
                              checked={settings.showWishlist}
                              onChange={handleInputChange}
                            />
                            <span className="toggle-slider"></span>
                          </label>
                        </div>

                        <div className="privacy-item">
                          <div className="privacy-info">
                            <h4 className="privacy-name">Allow Reviews</h4>
                            <p className="privacy-description">Let others see your product reviews</p>
                          </div>
                          <label className="toggle-switch">
                            <input
                              type="checkbox"
                              name="allowReviews"
                              checked={settings.allowReviews}
                              onChange={handleInputChange}
                            />
                            <span className="toggle-slider"></span>
                          </label>
                        </div>

                        <div className="privacy-item">
                          <div className="privacy-info">
                            <h4 className="privacy-name">Data Sharing</h4>
                            <p className="privacy-description">Share data with partners for better recommendations</p>
                          </div>
                          <label className="toggle-switch">
                            <input
                              type="checkbox"
                              name="dataSharing"
                              checked={settings.dataSharing}
                              onChange={handleInputChange}
                            />
                            <span className="toggle-slider"></span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Security Settings */}
                {activeTab === 'security' && (
                  <div className="settings-section">
                    <div className="section-header">
                      <h2 className="section-title">Security Settings</h2>
                      <p className="section-description">
                        Manage your account security and authentication
                      </p>
                    </div>

                    <div className="settings-form">
                      {/* Change Password */}
                      <div className="security-group">
                        <h3 className="security-title">Change Password</h3>
                        <form onSubmit={handlePasswordSubmit} className="password-form">
                          <div className="form-group">
                            <label className="form-label">Current Password</label>
                            <input
                              type="password"
                              name="currentPassword"
                              value={passwordForm.currentPassword}
                              onChange={handlePasswordChange}
                              className="form-input"
                              required
                            />
                          </div>

                          <div className="form-group">
                            <label className="form-label">New Password</label>
                            <input
                              type="password"
                              name="newPassword"
                              value={passwordForm.newPassword}
                              onChange={handlePasswordChange}
                              className="form-input"
                              required
                            />
                          </div>

                          <div className="form-group">
                            <label className="form-label">Confirm New Password</label>
                            <input
                              type="password"
                              name="confirmPassword"
                              value={passwordForm.confirmPassword}
                              onChange={handlePasswordChange}
                              className="form-input"
                              required
                            />
                          </div>

                          <Button type="submit" className="password-btn">
                            Update Password
                          </Button>
                        </form>
                      </div>

                      {/* Two-Factor Authentication */}
                      <div className="security-group">
                        <h3 className="security-title">Two-Factor Authentication</h3>
                        <div className="security-item">
                          <div className="security-info">
                            <h4 className="security-name">Enable 2FA</h4>
                            <p className="security-description">Add an extra layer of security to your account</p>
                          </div>
                          <label className="toggle-switch">
                            <input
                              type="checkbox"
                              name="twoFactorAuth"
                              checked={settings.twoFactorAuth}
                              onChange={handleInputChange}
                            />
                            <span className="toggle-slider"></span>
                          </label>
                        </div>
                      </div>

                      {/* Login Alerts */}
                      <div className="security-group">
                        <h3 className="security-title">Login Security</h3>
                        <div className="security-item">
                          <div className="security-info">
                            <h4 className="security-name">Login Alerts</h4>
                            <p className="security-description">Get notified when someone logs into your account</p>
                          </div>
                          <label className="toggle-switch">
                            <input
                              type="checkbox"
                              name="loginAlerts"
                              checked={settings.loginAlerts}
                              onChange={handleInputChange}
                            />
                            <span className="toggle-slider"></span>
                          </label>
                        </div>

                        <div className="form-group">
                          <label className="form-label">Session Timeout (minutes)</label>
                          <select
                            name="sessionTimeout"
                            value={settings.sessionTimeout}
                            onChange={handleInputChange}
                            className="form-select"
                          >
                            <option value="15">15 minutes</option>
                            <option value="30">30 minutes</option>
                            <option value="60">1 hour</option>
                            <option value="120">2 hours</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Preferences Settings */}
                {activeTab === 'preferences' && (
                  <div className="settings-section">
                    <div className="section-header">
                      <h2 className="section-title">Preferences</h2>
                      <p className="section-description">
                        Customize your experience and display preferences
                      </p>
                    </div>

                    <div className="settings-form">
                      <div className="form-grid">
                        <div className="form-group">
                          <label className="form-label">Currency</label>
                          <select
                            name="currency"
                            value={settings.currency}
                            onChange={handleInputChange}
                            className="form-select"
                          >
                            <option value="INR">Indian Rupee (₹)</option>
                            <option value="USD">US Dollar ($)</option>
                            <option value="EUR">Euro (€)</option>
                            <option value="GBP">British Pound (£)</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label className="form-label">Language</label>
                          <select
                            name="language"
                            value={settings.language}
                            onChange={handleInputChange}
                            className="form-select"
                          >
                            <option value="en">English</option>
                            <option value="hi">Hindi</option>
                            <option value="es">Spanish</option>
                            <option value="fr">French</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label className="form-label">Theme</label>
                          <select
                            name="theme"
                            value={settings.theme}
                            onChange={handleInputChange}
                            className="form-select"
                          >
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                            <option value="auto">Auto</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label className="form-label">Timezone</label>
                          <select
                            name="timezone"
                            value={settings.timezone}
                            onChange={handleInputChange}
                            className="form-select"
                          >
                            <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                            <option value="America/New_York">America/New_York (EST)</option>
                            <option value="Europe/London">Europe/London (GMT)</option>
                            <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Danger Zone */}
                <div className="danger-zone">
                  <h3 className="danger-title">Danger Zone</h3>
                  <div className="danger-item">
                    <div className="danger-info">
                      <h4 className="danger-name">Delete Account</h4>
                      <p className="danger-description">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                    </div>
                    <Button 
                      onClick={handleDeleteAccount}
                      className="danger-btn"
                    >
                      Delete Account
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-soft-pink-100 to-soft-pink-200 py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-dark-gray text-lg">Loading settings...</p>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    }>
      <SettingsPageContent />
    </Suspense>
  );
}
