'use client';

import { useState } from 'react';
import Modal from './Modal';
import { 
  MdPerson as User,
  MdEmail as Mail,
  MdPhone as Phone,
  MdCalendarToday as Calendar,
  MdSecurity as Shield,
  MdVerifiedUser as ShieldCheck,
  MdShoppingCart as ShoppingCart,
  MdAttachMoney as DollarSign,
  MdLocationOn as Location,
  MdEdit as Edit
} from 'react-icons/md';

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
  profileImage: string;
  orderCount: number;
  totalSpent: number;
  lastLogin: string;
  createdAt: string;
  addresses?: Array<{
    id: string;
    type: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  }>;
}

interface ViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: UserData | null;
  onEdit?: () => void;
  type: 'user' | 'product' | 'category' | 'order' | 'banner';
}

export default function ViewModal({ isOpen, onClose, data, onEdit, type }: ViewModalProps) {
  if (!data) return null;

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-blue-100 text-blue-800';
      case 'user': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin': return <ShieldCheck className="h-4 w-4" />;
      case 'admin': return <Shield className="h-4 w-4" />;
      case 'user': return <User className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const renderUserDetails = () => (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <img
            className="h-20 w-20 rounded-full object-cover"
            src={data.profileImage}
            alt={`${data.firstName} ${data.lastName}`}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-semibold text-gray-900">
            {data.firstName} {data.lastName}
          </h2>
          <p className="text-sm text-gray-500">ID: {data.id}</p>
          <div className="mt-2 flex items-center space-x-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(data.role)}`}>
              {getRoleIcon(data.role)}
              <span className="ml-1">
                {data.role === 'super_admin' ? 'Super Admin' : 
                 data.role === 'admin' ? 'Admin' : 
                 data.role.charAt(0).toUpperCase() + data.role.slice(1)}
              </span>
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              data.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {data.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <Mail className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">Email</p>
              <p className="text-sm text-gray-500">{data.email}</p>
            </div>
          </div>
          {data.phone && (
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Phone</p>
                <p className="text-sm text-gray-500">{data.phone}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Activity Information */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Activity</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <ShoppingCart className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">Orders</p>
              <p className="text-sm text-gray-500">{data.orderCount} orders</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <DollarSign className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">Total Spent</p>
              <p className="text-sm text-gray-500">₹{data.totalSpent.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Calendar className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">Last Login</p>
              <p className="text-sm text-gray-500">{new Date(data.lastLogin).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Addresses */}
      {data.addresses && data.addresses.length > 0 && (
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Addresses</h3>
          <div className="space-y-4">
            {data.addresses.map((address, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Location className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 capitalize">{address.type}</p>
                    <p className="text-sm text-gray-500">
                      {address.street}, {address.city}, {address.state} {address.zipCode}, {address.country}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Account Information */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-900">Member Since</p>
            <p className="text-sm text-gray-500">{new Date(data.createdAt).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Account Status</p>
            <p className={`text-sm ${data.isActive ? 'text-green-600' : 'text-red-600'}`}>
              {data.isActive ? 'Active' : 'Inactive'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProductDetails = () => {
    const product = data as any;
    
    return (
      <div className="space-y-6">
        {/* Product Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Images
          </label>
          {(() => {
            // Get images array - could be from images array or single image field
            const images = product.images && Array.isArray(product.images) && product.images.length > 0
              ? product.images
              : product.image
              ? [{ url: product.image, isPrimary: true }]
              : [];
            
            if (images.length === 0) {
              return (
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md bg-gray-50">
                  <div className="text-center text-gray-400">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-500">No images available</p>
                  </div>
                </div>
              );
            }
            
            return (
              <div className="mt-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {images.map((img: any, index: number) => {
                  const imageUrl = img.url || img;
                  const isPrimary = img.isPrimary || index === 0;
                  
                  return (
                    <div key={index} className="relative group">
                      <div className={`relative aspect-square rounded-lg overflow-hidden border-2 ${
                        isPrimary ? 'border-blue-500' : 'border-gray-200'
                      }`}>
                        <img
                          src={imageUrl}
                          alt={img.alt || product.name || `Product image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {isPrimary && (
                          <span className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-2 py-0.5 rounded">
                            Primary
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name
            </label>
            <div className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-900">
              {product.name || 'N/A'}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slug
            </label>
            <div className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-900">
              {product.slug || 'N/A'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SKU
            </label>
            <div className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-900">
              {product.sku || 'N/A'}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <div className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-900">
              {product.category || 'N/A'}
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price (₹)
            </label>
            <div className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-900">
              {product.price ? `₹${product.price.toLocaleString()}` : 'N/A'}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Compare Price (₹)
            </label>
            <div className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-900">
              {product.comparePrice ? `₹${product.comparePrice.toLocaleString()}` : 'N/A'}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cost Price (₹)
            </label>
            <div className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-900">
              {product.costPrice ? `₹${product.costPrice.toLocaleString()}` : 'N/A'}
            </div>
          </div>
        </div>

        {/* Stock & Weight */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock Quantity
            </label>
            <div className={`block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm ${
              product.stock > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {product.stock !== undefined ? product.stock : 'N/A'} {product.stock !== undefined && 'in stock'}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Weight (grams)
            </label>
            <div className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-900">
              {product.weight ? `${product.weight} g` : 'N/A'}
            </div>
          </div>
        </div>

        {/* Short Description */}
        {product.shortDescription && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Short Description
            </label>
            <div className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-900 min-h-[60px]">
              {product.shortDescription}
            </div>
          </div>
        )}

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <div className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-900 min-h-[100px] whitespace-pre-wrap">
            {product.description || 'N/A'}
          </div>
        </div>

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <div className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-900">
              {Array.isArray(product.tags) ? product.tags.join(', ') : product.tags}
            </div>
          </div>
        )}

        {/* Dimensions */}
        {(product.length || product.width || product.height) && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dimensions
            </label>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Length</label>
                <div className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-900">
                  {product.length || '0'} {product.dimensionUnit || 'cm'}
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Width</label>
                <div className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-900">
                  {product.width || '0'} {product.dimensionUnit || 'cm'}
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Height</label>
                <div className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-900">
                  {product.height || '0'} {product.dimensionUnit || 'cm'}
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Unit</label>
                <div className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-900">
                  {product.dimensionUnit || 'cm'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status & Flags */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                product.status === 'active' || product.isActive
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {product.status || (product.isActive ? 'Active' : 'Inactive')}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Featured
            </label>
            <div className="flex items-center">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                product.featured || product.isFeatured
                  ? 'bg-yellow-100 text-yellow-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {product.featured || product.isFeatured ? 'Yes' : 'No'}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Digital Product
            </label>
            <div className="flex items-center">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                product.isDigital
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {product.isDigital ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-200 pt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rating
            </label>
            <div className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-900">
              {product.rating ? `${product.rating} stars` : 'N/A'}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Created Date
            </label>
            <div className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-900">
              {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'N/A'}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCategoryDetails = () => (
    <div className="space-y-6">
      {/* Category Header */}
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <img
            className="h-24 w-24 rounded-lg object-cover"
            src={(data as any).image}
            alt={(data as any).name}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-semibold text-gray-900">
            {(data as any).name}
          </h2>
          <p className="text-sm text-gray-500">/{(data as any).slug}</p>
          <div className="mt-2 flex items-center space-x-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              (data as any).isActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {(data as any).isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>

      {/* Category Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-900">Products</p>
              <p className="text-sm text-gray-500">{(data as any).productCount} products</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Sort Order</p>
              <p className="text-sm text-gray-500">{(data as any).sortOrder}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Created</p>
              <p className="text-sm text-gray-500">{new Date((data as any).createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Description</h3>
          <p className="text-sm text-gray-500">{(data as any).description || 'No description available'}</p>
        </div>
      </div>
    </div>
  );

  const renderBannerDetails = () => {
    const banner = data as any;
    const ctr = banner.impressions > 0 ? ((banner.clicks / banner.impressions) * 100).toFixed(2) : '0';
    
    return (
      <div className="space-y-6">
        {/* Banner Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Banner Image
          </label>
          <img
            className="w-full h-64 object-cover rounded-lg border-2 border-gray-200"
            src={banner.image}
            alt={banner.title}
          />
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <div className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-900">
              {banner.title || 'N/A'}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subtitle
            </label>
            <div className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-900">
              {banner.subtitle || 'N/A'}
            </div>
          </div>
        </div>

        {/* Button Information */}
        {(banner.buttonText || banner.buttonLink) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Button Text
              </label>
              <div className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-900">
                {banner.buttonText || 'N/A'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Button Link
              </label>
              <div className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-900">
                {banner.buttonLink ? (
                  <a href={banner.buttonLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {banner.buttonLink}
                  </a>
                ) : 'N/A'}
              </div>
            </div>
          </div>
        )}

        {/* Status & Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                banner.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {banner.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort Order
            </label>
            <div className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-900">
              {banner.sortOrder || 0}
            </div>
          </div>
        </div>

        {/* Date Range */}
        {(banner.startDate || banner.endDate) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <div className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-900">
                {banner.startDate ? new Date(banner.startDate).toLocaleDateString() : 'No start date'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <div className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-900">
                {banner.endDate ? new Date(banner.endDate).toLocaleDateString() : 'No end date'}
              </div>
            </div>
          </div>
        )}

        {/* Performance Metrics */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Clicks
              </label>
              <div className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-900">
                {(banner.clicks || 0).toLocaleString()}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Impressions
              </label>
              <div className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-900">
                {(banner.impressions || 0).toLocaleString()}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CTR (Click-Through Rate)
              </label>
              <div className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-900">
                {ctr}%
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-200 pt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Created Date
            </label>
            <div className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-900">
              {banner.createdAt ? new Date(banner.createdAt).toLocaleDateString() : 'N/A'}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Updated
            </label>
            <div className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-900">
              {banner.updatedAt ? new Date(banner.updatedAt).toLocaleDateString() : 'N/A'}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (type) {
      case 'user':
        return renderUserDetails();
      case 'product':
        return renderProductDetails();
      case 'category':
        return renderCategoryDetails();
      case 'banner':
        return renderBannerDetails();
      default:
        return <div>No data available</div>;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`View ${type.charAt(0).toUpperCase() + type.slice(1)} Details`}
      size="2xl"
    >
      <div className="space-y-6">
        {renderContent()}
        
        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Close
          </button>
          {onEdit && (
            <button
              onClick={onEdit}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Edit className="h-4 w-4 mr-2 inline" />
              Edit
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
