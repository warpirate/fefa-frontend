'use client';

import { useState } from 'react';
import { 
  MdSave as Save,
  MdCloudUpload as Upload,
  MdPublic as Globe,
  MdEmail as Mail,
  MdSecurity as Shield,
  MdCreditCard as CreditCard,
  MdPalette as Palette,
  MdNotifications as Bell,
  MdStorage as Database,
  MdVpnKey as Key,
  MdWarning as AlertTriangle
} from 'react-icons/md';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    // General Settings
    storeName: 'FEFA Jewelry',
    storeDescription: 'Premium jewelry for every occasion',
    storeEmail: 'info@fefajewelry.com',
    storePhone: '+91 98765 43210',
    storeAddress: '123 Jewelry Street, Mumbai, Maharashtra 400001',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    language: 'en',
    
    // Appearance Settings
    primaryColor: '#3B82F6',
    secondaryColor: '#1E40AF',
    logo: '',
    favicon: '',
    theme: 'light',
    
    // Email Settings
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUsername: 'noreply@fefajewelry.com',
    smtpPassword: '',
    fromEmail: 'noreply@fefajewelry.com',
    fromName: 'FEFA Jewelry',
    
    // Payment Settings
    razorpayKeyId: '',
    razorpayKeySecret: '',
    paypalClientId: '',
    paypalClientSecret: '',
    stripePublishableKey: '',
    stripeSecretKey: '',
    
    // Security Settings
    enableTwoFactor: false,
    sessionTimeout: '24',
    passwordMinLength: '8',
    maxLoginAttempts: '5',
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    orderNotifications: true,
    customerNotifications: true,
    adminNotifications: true,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSave = () => {
    // Handle save logic
  };

  const tabs = [
    { id: 'general', name: 'General', icon: Globe },
    { id: 'appearance', name: 'Appearance', icon: Palette },
    { id: 'email', name: 'Email', icon: Mail },
    { id: 'payment', name: 'Payment', icon: CreditCard },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'advanced', name: 'Advanced', icon: Database },
  ];

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Store Information</h3>
        <p className="mt-1 text-sm text-gray-500">Basic information about your store</p>
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Store Name</label>
          <input
            type="text"
            name="storeName"
            value={settings.storeName}
            onChange={handleInputChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Store Email</label>
          <input
            type="email"
            name="storeEmail"
            value={settings.storeEmail}
            onChange={handleInputChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Store Phone</label>
          <input
            type="tel"
            name="storePhone"
            value={settings.storePhone}
            onChange={handleInputChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Currency</label>
          <select
            name="currency"
            value={settings.currency}
            onChange={handleInputChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="INR">Indian Rupee (INR)</option>
            <option value="USD">US Dollar (USD)</option>
            <option value="EUR">Euro (EUR)</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Store Description</label>
          <textarea
            name="storeDescription"
            rows={3}
            value={settings.storeDescription}
            onChange={handleInputChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Store Address</label>
          <textarea
            name="storeAddress"
            rows={2}
            value={settings.storeAddress}
            onChange={handleInputChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Theme & Branding</h3>
        <p className="mt-1 text-sm text-gray-500">Customize the look and feel of your store</p>
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Primary Color</label>
          <div className="mt-1 flex items-center space-x-2">
            <input
              type="color"
              name="primaryColor"
              value={settings.primaryColor}
              onChange={handleInputChange}
              className="h-10 w-20 border border-gray-300 rounded-md"
            />
            <input
              type="text"
              value={settings.primaryColor}
              onChange={handleInputChange}
              className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Secondary Color</label>
          <div className="mt-1 flex items-center space-x-2">
            <input
              type="color"
              name="secondaryColor"
              value={settings.secondaryColor}
              onChange={handleInputChange}
              className="h-10 w-20 border border-gray-300 rounded-md"
            />
            <input
              type="text"
              value={settings.secondaryColor}
              onChange={handleInputChange}
              className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Theme</label>
          <select
            name="theme"
            value={settings.theme}
            onChange={handleInputChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="auto">Auto</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Language</label>
          <select
            name="language"
            value={settings.language}
            onChange={handleInputChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="ta">Tamil</option>
            <option value="te">Telugu</option>
          </select>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Store Logo</label>
        <div className="mt-1 flex items-center space-x-4">
          <div className="h-20 w-20 bg-gray-100 rounded-lg flex items-center justify-center">
            {settings.logo ? (
              <img src={settings.logo} alt="Logo" className="h-16 w-16 object-contain" />
            ) : (
              <Upload className="h-8 w-8 text-gray-400" />
            )}
          </div>
          <div>
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              <Upload className="h-4 w-4 mr-2" />
              Upload Logo
            </button>
            <p className="mt-1 text-xs text-gray-500">PNG, JPG up to 2MB</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEmailSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Email Configuration</h3>
        <p className="mt-1 text-sm text-gray-500">Configure SMTP settings for sending emails</p>
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">SMTP Host</label>
          <input
            type="text"
            name="smtpHost"
            value={settings.smtpHost}
            onChange={handleInputChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">SMTP Port</label>
          <input
            type="number"
            name="smtpPort"
            value={settings.smtpPort}
            onChange={handleInputChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">SMTP Username</label>
          <input
            type="text"
            name="smtpUsername"
            value={settings.smtpUsername}
            onChange={handleInputChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">SMTP Password</label>
          <input
            type="password"
            name="smtpPassword"
            value={settings.smtpPassword}
            onChange={handleInputChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">From Email</label>
          <input
            type="email"
            name="fromEmail"
            value={settings.fromEmail}
            onChange={handleInputChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">From Name</label>
          <input
            type="text"
            name="fromName"
            value={settings.fromName}
            onChange={handleInputChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Test Email Configuration</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>Click the button below to send a test email to verify your configuration.</p>
              <button className="mt-2 inline-flex items-center px-3 py-2 border border-blue-300 shadow-sm text-sm leading-4 font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50">
                Send Test Email
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPaymentSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Payment Gateways</h3>
        <p className="mt-1 text-sm text-gray-500">Configure payment methods for your store</p>
      </div>
      
      <div className="space-y-6">
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="text-md font-medium text-gray-900 mb-4">Razorpay</h4>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Key ID</label>
              <input
                type="text"
                name="razorpayKeyId"
                value={settings.razorpayKeyId}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Key Secret</label>
              <input
                type="password"
                name="razorpayKeySecret"
                value={settings.razorpayKeySecret}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
        
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="text-md font-medium text-gray-900 mb-4">Stripe</h4>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Publishable Key</label>
              <input
                type="text"
                name="stripePublishableKey"
                value={settings.stripePublishableKey}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Secret Key</label>
              <input
                type="password"
                name="stripeSecretKey"
                value={settings.stripeSecretKey}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Security Settings</h3>
        <p className="mt-1 text-sm text-gray-500">Configure security options for your admin panel</p>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h4>
            <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
          </div>
          <input
            type="checkbox"
            name="enableTwoFactor"
            checked={settings.enableTwoFactor}
            onChange={handleInputChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        </div>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Session Timeout (hours)</label>
            <input
              type="number"
              name="sessionTimeout"
              value={settings.sessionTimeout}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password Min Length</label>
            <input
              type="number"
              name="passwordMinLength"
              value={settings.passwordMinLength}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Max Login Attempts</label>
            <input
              type="number"
              name="maxLoginAttempts"
              value={settings.maxLoginAttempts}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Notification Preferences</h3>
        <p className="mt-1 text-sm text-gray-500">Choose which notifications you want to receive</p>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
            <p className="text-sm text-gray-500">Receive notifications via email</p>
          </div>
          <input
            type="checkbox"
            name="emailNotifications"
            checked={settings.emailNotifications}
            onChange={handleInputChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">SMS Notifications</h4>
            <p className="text-sm text-gray-500">Receive notifications via SMS</p>
          </div>
          <input
            type="checkbox"
            name="smsNotifications"
            checked={settings.smsNotifications}
            onChange={handleInputChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Push Notifications</h4>
            <p className="text-sm text-gray-500">Receive push notifications in browser</p>
          </div>
          <input
            type="checkbox"
            name="pushNotifications"
            checked={settings.pushNotifications}
            onChange={handleInputChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        </div>
        
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-4">Specific Notifications</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Order Notifications</span>
              <input
                type="checkbox"
                name="orderNotifications"
                checked={settings.orderNotifications}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Customer Notifications</span>
              <input
                type="checkbox"
                name="customerNotifications"
                checked={settings.customerNotifications}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Admin Notifications</span>
              <input
                type="checkbox"
                name="adminNotifications"
                checked={settings.adminNotifications}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAdvancedSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Advanced Settings</h3>
        <p className="mt-1 text-sm text-gray-500">System configuration and maintenance options</p>
      </div>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Warning</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>These settings can affect the functionality of your store. Please be careful when making changes.</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-4">Database</h4>
          <div className="space-y-3">
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              <Database className="h-4 w-4 mr-2" />
              Backup Database
            </button>
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              <Key className="h-4 w-4 mr-2" />
              Clear Cache
            </button>
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-4">System</h4>
          <div className="space-y-3">
            <div className="text-sm text-gray-600">
              <p>Server Status: <span className="text-green-600 font-medium">Online</span></p>
              <p>Last Backup: 2024-01-15 10:30:00</p>
              <p>Database Size: 45.2 MB</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general': return renderGeneralSettings();
      case 'appearance': return renderAppearanceSettings();
      case 'email': return renderEmailSettings();
      case 'payment': return renderPaymentSettings();
      case 'security': return renderSecuritySettings();
      case 'notifications': return renderNotificationSettings();
      case 'advanced': return renderAdvancedSettings();
      default: return renderGeneralSettings();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your store configuration and preferences
        </p>
      </div>

      <div className="flex flex-col lg:flex-row lg:space-x-8">
        {/* Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              {renderTabContent()}
            </div>
            
            {/* Save Button */}
            <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
              <button
                onClick={handleSave}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
