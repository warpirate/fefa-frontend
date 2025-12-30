'use client';

import { useState, useEffect } from 'react';
import Modal from './Modal';
import { 
  MdPerson as User,
  MdEmail as Mail,
  MdPhone as Phone,
  MdSecurity as Shield,
  MdVerifiedUser as ShieldCheck,
  MdSave as Save,
  MdCancel as Cancel,
  MdClose as Close,
  MdImage as ImageIcon
} from 'react-icons/md';
import adminService from '../../services/adminService';

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
  profileImage: string;
}

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any; // Can be UserData, Product, Category, Collection, or Order
  onSave: (updatedData: any) => void;
  type: 'user' | 'product' | 'category' | 'collection' | 'order' | 'banner';
  loading?: boolean;
}

export default function EditModal({ isOpen, onClose, data, onSave, type, loading = false }: EditModalProps) {
  const [formData, setFormData] = useState<any>({});
  const [categories, setCategories] = useState<any[]>([]);
  const [existingImages, setExistingImages] = useState<Array<{ url: string; publicId?: string; isPrimary?: boolean; _id?: string }>>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<Array<{ file: File; preview: string }>>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [failedImageUrls, setFailedImageUrls] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (data) {
      // Convert display format to edit format
      const editData: any = {
        id: data.id,
        name: data.name || '',
        slug: data.slug || '',
        sku: data.sku || '',
        price: data.price || '',
        comparePrice: data.comparePrice || '',
        costPrice: data.costPrice || '',
        description: data.description || '',
        shortDescription: data.shortDescription || '',
        category: data.category || '',
        stock: data.stock || '',
        weight: data.weight || '',
        length: data.length || '',
        width: data.width || '',
        height: data.height || '',
        dimensionUnit: data.dimensionUnit || 'cm',
        tags: Array.isArray(data.tags) ? data.tags.join(', ') : (data.tags || ''),
        isActive: data.status === 'active' || data.isActive !== false,
        isFeatured: data.featured || data.isFeatured || false,
        isDigital: data.isDigital || false,
        image: data.image || '',
        sortOrder: data.sortOrder || 0,
        imageFile: null as File | null,
        position: data.position || '',
        buttonText: data.buttonText || '',
        buttonLink: data.buttonLink || '',
        startDate: data.startDate ? new Date(data.startDate).toISOString().split('T')[0] : '',
        endDate: data.endDate ? new Date(data.endDate).toISOString().split('T')[0] : ''
      };
      setFormData(editData);
      
      // Handle images - could be array or single image
      if (data.images && Array.isArray(data.images) && data.images.length > 0) {
        // Ensure all images have proper URL structure
        const formattedImages = data.images.map((img: any, index: number) => {
          if (typeof img === 'string') {
            return { url: img, isPrimary: index === 0 };
          }
          const imageUrl = img.url || img;
          return {
            url: imageUrl,
            publicId: img.publicId,
            isPrimary: img.isPrimary || index === 0,
            _id: img._id
          };
        });
        setExistingImages(formattedImages);
      } else if (data.image) {
        setExistingImages([{ url: data.image, isPrimary: true }]);
      } else {
        setExistingImages([]);
      }
      setNewImagePreviews([]);
      setFailedImageUrls(new Set()); // Reset failed images when data changes
    }
  }, [data]);

  useEffect(() => {
    if (isOpen && type === 'product') {
      loadCategories();
    }
  }, [isOpen, type]);

  const loadCategories = async () => {
    try {
      const result = await adminService.getAllCategories();
      if (result.success) {
        // Show ALL categories returned from API (admin view shows all)
        // No filtering needed since adminService.getAllCategories() already handles admin=true
        console.log('Loaded categories:', result.data.map((cat: any) => ({ name: cat.name, isActive: cat.isActive })));
        setCategories(result.data);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  // Generate slug from name
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev: any) => {
        const updated = { ...prev, [name]: checked };
        return updated;
      });
    } else {
      setFormData((prev: any) => {
        const updated = { ...prev, [name]: value };
        // Auto-generate slug from name if slug is empty or name changed
        if (name === 'name' && (!prev.slug || prev.slug === generateSlug(prev.name))) {
          updated.slug = generateSlug(value);
        }
        return updated;
      });
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: '' }));
    }
  };

  // Helper function for direct value updates (used in user form)
  const handleDirectInputChange = (name: string, value: any) => {
    setFormData((prev: any) => {
      const updated = { ...prev, [name]: value };
      return updated;
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      const newImages: Array<{ file: File; preview: string }> = [];
      let loadedCount = 0;
      let errorCount = 0;
      
      fileArray.forEach((file) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          console.error('Invalid file type:', file.type);
          errorCount++;
          if (loadedCount + errorCount === fileArray.length) {
            alert(`Some files were skipped. Please select only image files.`);
          }
          return;
        }

        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
          console.error('File too large:', file.name, file.size);
          errorCount++;
          if (loadedCount + errorCount === fileArray.length) {
            alert(`Some files were skipped. Maximum file size is 10MB.`);
          }
          return;
        }

        const reader = new FileReader();
        reader.onerror = (error) => {
          console.error('FileReader error:', error);
          errorCount++;
          if (loadedCount + errorCount === fileArray.length) {
            if (newImages.length === 0) {
              alert('Failed to load images. Please try again.');
            }
          }
        };
        
        reader.onload = (event) => {
          const result = event.target?.result;
          if (result && typeof result === 'string') {
            newImages.push({
              file,
              preview: result
            });
            loadedCount++;
            
            // When all files are read, update state
            if (loadedCount + errorCount === fileArray.length) {
              if (newImages.length > 0) {
                setNewImagePreviews(prev => [...prev, ...newImages]);
              }
            }
          } else {
            console.error('Invalid preview result');
            errorCount++;
          }
        };
        reader.readAsDataURL(file);
      });
    }
    e.target.value = '';
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const setPrimaryImage = (index: number) => {
    setExistingImages(prev => 
      prev.map((img, i) => ({ ...img, isPrimary: i === index }))
    );
  };

  const handleImageError = (url: string) => {
    console.error('Image failed to load:', url);
    console.error('Image error details:', {
      url,
      isValidUrl: isValidImageUrl(url),
      urlType: typeof url,
      urlLength: url?.length
    });
    setFailedImageUrls(prev => new Set(prev).add(url));
  };

  const isValidImageUrl = (url: string): boolean => {
    if (!url || typeof url !== 'string') return false;
    // Check if it's a valid URL (http/https) or a data URL
    return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('/');
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) newErrors.name = 'Product name is required';
    if (!formData.slug?.trim()) newErrors.slug = 'Slug is required';
    if (!formData.sku?.trim()) newErrors.sku = 'SKU is required';
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Valid price is required';
    if (formData.comparePrice && parseFloat(formData.comparePrice) <= 0) newErrors.comparePrice = 'Compare price must be greater than 0';
    if (formData.costPrice && parseFloat(formData.costPrice) < 0) newErrors.costPrice = 'Cost price cannot be negative';
    if (!formData.description?.trim()) newErrors.description = 'Description is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.stock || parseInt(formData.stock) < 0) newErrors.stock = 'Valid stock quantity is required';
    if (formData.weight && parseFloat(formData.weight) < 0) newErrors.weight = 'Weight cannot be negative';
    if (formData.length && parseFloat(formData.length) < 0) newErrors.length = 'Length cannot be negative';
    if (formData.width && parseFloat(formData.width) < 0) newErrors.width = 'Width cannot be negative';
    if (formData.height && parseFloat(formData.height) < 0) newErrors.height = 'Height cannot be negative';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (type === 'product' && !validateForm()) {
      return;
    }
    
    // Handle category with image upload
    if (type === 'category' && formData.imageFile) {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('slug', formData.slug.trim());
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('isActive', formData.isActive.toString());
      formDataToSend.append('sortOrder', (formData.sortOrder || 0).toString());
      formDataToSend.append('image', formData.imageFile);
      
      onSave(formDataToSend);
      return;
    }

    // Handle collection with image upload
    if (type === 'collection' && formData.imageFile) {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('slug', formData.slug.trim());
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('isActive', formData.isActive.toString());
      formDataToSend.append('sortOrder', (formData.sortOrder || 0).toString());
      formDataToSend.append('image', formData.imageFile);
      
      onSave(formDataToSend);
      return;
    }

    // Handle banner with image upload
    if (type === 'banner' && formData.imageFile) {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title.trim());
      formDataToSend.append('subtitle', formData.subtitle || '');
      formDataToSend.append('buttonText', formData.buttonText || '');
      formDataToSend.append('buttonLink', formData.buttonLink || '');
      formDataToSend.append('isActive', formData.isActive.toString());
      formDataToSend.append('sortOrder', (formData.sortOrder || 0).toString());
      if (formData.startDate) formDataToSend.append('startDate', formData.startDate);
      if (formData.endDate) formDataToSend.append('endDate', formData.endDate);
      formDataToSend.append('image', formData.imageFile);
      
      onSave(formDataToSend);
      return;
    }
    
    // Prepare data for submission
    const updatedData: any = { ...formData };
    
    // Remove imageFile from category/collection/banner data if no new image
    if (type === 'category' || type === 'collection' || type === 'banner') {
      delete updatedData.imageFile;
    }
    
    // Convert tags from string to array if needed
    if (updatedData.tags && typeof updatedData.tags === 'string') {
      updatedData.tags = updatedData.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0);
    }
    
    // Handle dimensions
    if (updatedData.length || updatedData.width || updatedData.height) {
      updatedData.dimensions = {
        length: updatedData.length ? parseFloat(updatedData.length) : 0,
        width: updatedData.width ? parseFloat(updatedData.width) : 0,
        height: updatedData.height ? parseFloat(updatedData.height) : 0,
        unit: updatedData.dimensionUnit || 'cm'
      };
    }
    
    // Add image data for product type
    if (type === 'product') {
      updatedData.existingImages = existingImages;
      updatedData.newImageFiles = newImagePreviews.map(img => img.file);
    }
    
    onSave(updatedData);
  };

  const renderUserForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Profile Image */}
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          <img
            className="h-16 w-16 rounded-full object-cover"
            src={formData.profileImage || '/images/default-avatar.png'}
            alt="Profile"
          />
        </div>
        <div>
          <button
            type="button"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Change Photo
          </button>
        </div>
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            First Name *
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName || ''}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Last Name *
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName || ''}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email || ''}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone || ''}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Role and Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role *
          </label>
          <select
            name="role"
            value={formData.role || 'user'}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status *
          </label>
          <select
            name="isActive"
            value={formData.isActive ? 'active' : 'inactive'}
            onChange={(e) => handleDirectInputChange('isActive', e.target.value === 'active')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
    </form>
  );

  const renderProductForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Product Images */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Product Images (Multiple images allowed)
        </label>
        
        {/* Existing Images */}
        {existingImages.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-600 mb-2">Existing Images:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {existingImages.map((img, index) => {
                const imageFailed = failedImageUrls.has(img.url);
                const isValidUrl = isValidImageUrl(img.url);
                
                return (
                <div key={index} className="relative group">
                  <div className={`relative aspect-square rounded-lg overflow-hidden border-2 bg-gray-100 ${
                    img.isPrimary ? 'border-blue-500' : 'border-gray-200'
                  }`}>
                    {!isValidUrl || imageFailed ? (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <div className="text-center p-4">
                          <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                          <p className="text-xs text-gray-500">
                            {!isValidUrl ? 'Invalid image URL' : 'Image failed to load'}
                          </p>
                          {img.url && (
                            <p className="text-xs text-gray-400 mt-1 truncate max-w-full px-2" title={img.url}>
                              {img.url.length > 30 ? `${img.url.substring(0, 30)}...` : img.url}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="relative w-full h-full">
                        <img
                          src={img.url}
                          alt={`Product image ${index + 1}`}
                          className="w-full h-full object-cover bg-white"
                          onError={(e) => {
                            console.error('Image load error event:', e);
                            handleImageError(img.url);
                          }}
                          onLoad={(e) => {
                            const imgElement = e.target as HTMLImageElement;
                            imgElement.style.opacity = '1';
                            imgElement.style.display = 'block';
                          }}
                          loading="lazy"
                          style={{ 
                            backgroundColor: '#ffffff',
                            display: 'block',
                            opacity: '1'
                          }}
                        />
                        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity pointer-events-none" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Close className="h-4 w-4" />
                    </button>
                    {img.isPrimary ? (
                      <span className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-2 py-0.5 rounded">
                        Primary
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setPrimaryImage(index)}
                        className="absolute bottom-1 left-1 bg-gray-600 text-white text-xs px-2 py-0.5 rounded hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Set Primary
                      </button>
                    )}
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        )}

        {/* New Image Previews */}
        {newImagePreviews.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-600 mb-2">New Images to Upload:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {newImagePreviews.map((imageData, index) => (
                <div key={index} className="relative group">
                  <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-100">
                    <div className="relative w-full h-full">
                      <img
                        src={imageData.preview}
                        alt={`New product image ${index + 1}`}
                        className="w-full h-full object-cover bg-white"
                        onError={(e) => {
                          console.error('Preview image failed to load:', imageData.preview?.substring(0, 50));
                          e.currentTarget.style.display = 'none';
                        }}
                        onLoad={(e) => {
                          const imgElement = e.target as HTMLImageElement;
                          imgElement.style.opacity = '1';
                          imgElement.style.display = 'block';
                        }}
                        style={{
                          backgroundColor: '#ffffff',
                          display: 'block',
                          opacity: '1'
                        }}
                      />
                      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity pointer-events-none" />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Close className="h-4 w-4" />
                    </button>
                    <span className="absolute bottom-1 left-1 bg-green-500 text-white text-xs px-2 py-0.5 rounded">
                      New
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Area */}
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
          <div className="space-y-1 text-center">
            <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
            <div className="flex text-sm text-gray-600">
              <label
                htmlFor="image-upload-edit"
                className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
              >
                <span>Upload images</span>
                <input
                  id="image-upload-edit"
                  name="image-upload"
                  type="file"
                  className="sr-only"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB each (max 10 images)</p>
          </div>
        </div>
        {errors.image && <p className="mt-1 text-sm text-red-600">{errors.image}</p>}
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name || ''}
            onChange={handleInputChange}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:border-blue-500 text-sm ${
              errors.name ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter product name"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Slug *
          </label>
          <input
            type="text"
            name="slug"
            value={formData.slug || ''}
            onChange={handleInputChange}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:border-blue-500 text-sm ${
              errors.slug ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="product-slug"
          />
          <p className="mt-1 text-xs text-gray-500">Auto-generated from name, can be edited</p>
          {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            SKU *
          </label>
          <input
            type="text"
            name="sku"
            value={formData.sku || ''}
            onChange={handleInputChange}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:border-blue-500 text-sm ${
              errors.sku ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter SKU"
          />
          {errors.sku && <p className="mt-1 text-sm text-red-600">{errors.sku}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category *
          </label>
          <select
            name="category"
            value={formData.category || ''}
            onChange={handleInputChange}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:border-blue-500 text-sm ${
              errors.category ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
        </div>
      </div>

      {/* Pricing */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price (₹) *
          </label>
          <input
            type="number"
            name="price"
            value={formData.price || ''}
            onChange={handleInputChange}
            min="0"
            step="0.01"
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:border-blue-500 text-sm ${
              errors.price ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="0.00"
          />
          {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Compare Price (₹)
          </label>
          <input
            type="number"
            name="comparePrice"
            value={formData.comparePrice || ''}
            onChange={handleInputChange}
            min="0"
            step="0.01"
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:border-blue-500 text-sm ${
              errors.comparePrice ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="0.00"
          />
          <p className="mt-1 text-xs text-gray-500">Original price (for discount display)</p>
          {errors.comparePrice && <p className="mt-1 text-sm text-red-600">{errors.comparePrice}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cost Price (₹)
          </label>
          <input
            type="number"
            name="costPrice"
            value={formData.costPrice || ''}
            onChange={handleInputChange}
            min="0"
            step="0.01"
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:border-blue-500 text-sm ${
              errors.costPrice ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="0.00"
          />
          <p className="mt-1 text-xs text-gray-500">Internal cost (not shown to customers)</p>
          {errors.costPrice && <p className="mt-1 text-sm text-red-600">{errors.costPrice}</p>}
        </div>
      </div>

      {/* Stock & Weight */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Stock Quantity *
          </label>
          <input
            type="number"
            name="stock"
            value={formData.stock || ''}
            onChange={handleInputChange}
            min="0"
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:border-blue-500 text-sm ${
              errors.stock ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="0"
          />
          {errors.stock && <p className="mt-1 text-sm text-red-600">{errors.stock}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Weight (grams)
          </label>
          <input
            type="number"
            name="weight"
            value={formData.weight || ''}
            onChange={handleInputChange}
            min="0"
            step="0.01"
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:border-blue-500 text-sm ${
              errors.weight ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="0.00"
          />
          {errors.weight && <p className="mt-1 text-sm text-red-600">{errors.weight}</p>}
        </div>
      </div>

      {/* Short Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Short Description
        </label>
        <textarea
          name="shortDescription"
          value={formData.shortDescription || ''}
          onChange={handleInputChange}
          rows={2}
          className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:border-blue-500 text-sm ${
            errors.shortDescription ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="Brief description (optional)"
        />
        {errors.shortDescription && <p className="mt-1 text-sm text-red-600">{errors.shortDescription}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description *
        </label>
        <textarea
          name="description"
          value={formData.description || ''}
          onChange={handleInputChange}
          rows={4}
          className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:border-blue-500 text-sm ${
            errors.description ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="Enter product description"
        />
        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tags
        </label>
        <input
          type="text"
          name="tags"
          value={formData.tags || ''}
          onChange={handleInputChange}
          className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:border-blue-500 text-sm ${
            errors.tags ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="tag1, tag2, tag3 (comma separated)"
        />
        <p className="mt-1 text-xs text-gray-500">Separate tags with commas</p>
        {errors.tags && <p className="mt-1 text-sm text-red-600">{errors.tags}</p>}
      </div>

      {/* Dimensions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Dimensions (Optional)
        </label>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Length</label>
            <input
              type="number"
              name="length"
              value={formData.length || ''}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:border-blue-500 text-sm ${
                errors.length ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="0"
            />
            {errors.length && <p className="mt-1 text-xs text-red-600">{errors.length}</p>}
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Width</label>
            <input
              type="number"
              name="width"
              value={formData.width || ''}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:border-blue-500 text-sm ${
                errors.width ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="0"
            />
            {errors.width && <p className="mt-1 text-xs text-red-600">{errors.width}</p>}
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Height</label>
            <input
              type="number"
              name="height"
              value={formData.height || ''}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:border-blue-500 text-sm ${
                errors.height ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="0"
            />
            {errors.height && <p className="mt-1 text-xs text-red-600">{errors.height}</p>}
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Unit</label>
            <select
              name="dimensionUnit"
              value={formData.dimensionUnit || 'cm'}
              onChange={handleInputChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:border-blue-500 text-sm"
            >
              <option value="cm">cm</option>
              <option value="inch">inch</option>
            </select>
          </div>
        </div>
      </div>

      {/* Checkboxes */}
      <div className="flex space-x-6">
        <div className="flex items-center">
          <input
            id="isActive"
            name="isActive"
            type="checkbox"
            checked={formData.isActive !== false}
            onChange={handleInputChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
            Active
          </label>
        </div>
        <div className="flex items-center">
          <input
            id="isFeatured"
            name="isFeatured"
            type="checkbox"
            checked={formData.isFeatured || false}
            onChange={handleInputChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-900">
            Featured
          </label>
        </div>
        <div className="flex items-center">
          <input
            id="isDigital"
            name="isDigital"
            type="checkbox"
            checked={formData.isDigital || false}
            onChange={handleInputChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isDigital" className="ml-2 block text-sm text-gray-900">
            Digital Product
          </label>
        </div>
      </div>
    </form>
  );

  const handleCategoryImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select only image files');
        return;
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        alert('Image size must be less than 10MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData((prev: any) => ({ ...prev, image: e.target?.result as string, imageFile: file }));
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleCollectionImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select only image files');
        return;
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        alert('Image size must be less than 10MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData((prev: any) => ({ ...prev, image: e.target?.result as string, imageFile: file }));
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleBannerImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select only image files');
        return;
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        alert('Image size must be less than 10MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData((prev: any) => ({ ...prev, image: e.target?.result as string, imageFile: file }));
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const renderBannerForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Banner Image */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Banner Image
        </label>
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <img
              className="h-32 w-48 rounded-lg object-cover border-2 border-gray-200"
              src={formData.image || '/images/default-banner.png'}
              alt="Banner"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/default-banner.png';
              }}
            />
          </div>
          <div className="flex-1">
            <label
              htmlFor="banner-image-upload-edit"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              {formData.imageFile ? 'Change Image' : 'Upload Image'}
            </label>
            <input
              id="banner-image-upload-edit"
              name="banner-image-upload"
              type="file"
              className="sr-only"
              accept="image/*"
              onChange={handleBannerImageChange}
            />
            {formData.imageFile && (
              <p className="mt-2 text-xs text-green-600">New image selected</p>
            )}
            <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title || ''}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subtitle
          </label>
          <input
            type="text"
            name="subtitle"
            value={formData.subtitle || ''}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Button Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Button Text
          </label>
          <input
            type="text"
            name="buttonText"
            value={formData.buttonText || ''}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Shop Now"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Button Link
          </label>
          <input
            type="url"
            name="buttonLink"
            value={formData.buttonLink || ''}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="https://example.com"
          />
        </div>
      </div>

      {/* Sort Order and Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sort Order *
          </label>
          <input
            type="number"
            name="sortOrder"
            value={formData.sortOrder || ''}
            onChange={(e) => handleDirectInputChange('sortOrder', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status *
          </label>
          <select
            name="isActive"
            value={formData.isActive ? 'active' : 'inactive'}
            onChange={(e) => handleDirectInputChange('isActive', e.target.value === 'active')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate || ''}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            name="endDate"
            value={formData.endDate || ''}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </form>
  );

  const renderCategoryForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Category Image */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category Image
        </label>
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <img
              className="h-24 w-24 rounded-lg object-cover border-2 border-gray-200"
              src={formData.image || '/images/default-category.png'}
              alt="Category"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/default-category.png';
              }}
            />
          </div>
          <div className="flex-1">
            <label
              htmlFor="category-image-upload-edit"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              {formData.imageFile ? 'Change Image' : 'Upload Image'}
            </label>
            <input
              id="category-image-upload-edit"
              name="category-image-upload"
              type="file"
              className="sr-only"
              accept="image/*"
              onChange={handleCategoryImageChange}
            />
            {formData.imageFile && (
              <p className="mt-2 text-xs text-green-600">New image selected</p>
            )}
            <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name || ''}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Slug *
          </label>
          <input
            type="text"
            name="slug"
            value={formData.slug || ''}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
      </div>

      {/* Sort Order and Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sort Order *
          </label>
          <input
            type="number"
            name="sortOrder"
            value={formData.sortOrder || ''}
            onChange={(e) => handleDirectInputChange('sortOrder', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status *
          </label>
          <select
            name="isActive"
            value={formData.isActive ? 'active' : 'inactive'}
            onChange={(e) => handleDirectInputChange('isActive', e.target.value === 'active')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description || ''}
          onChange={handleInputChange}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </form>
  );

  const renderCollectionForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Collection Image */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Collection Image
        </label>
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <img
              className="h-24 w-24 rounded-lg object-cover border-2 border-gray-200"
              src={formData.image || '/placeholder-collection.png'}
              alt="Collection"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder-collection.png';
              }}
            />
          </div>
          <div className="flex-1">
            <label
              htmlFor="collection-image-upload-edit"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              {formData.imageFile ? 'Change Image' : 'Upload Image'}
            </label>
            <input
              id="collection-image-upload-edit"
              name="collection-image-upload"
              type="file"
              className="sr-only"
              accept="image/*"
              onChange={handleCollectionImageChange}
            />
            {formData.imageFile && (
              <p className="mt-2 text-xs text-green-600">New image selected</p>
            )}
            <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Collection Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name || ''}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Slug *
          </label>
          <input
            type="text"
            name="slug"
            value={formData.slug || ''}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
      </div>

      {/* Sort Order and Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sort Order *
          </label>
          <input
            type="number"
            name="sortOrder"
            value={formData.sortOrder || ''}
            onChange={(e) => handleDirectInputChange('sortOrder', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status *
          </label>
          <select
            name="isActive"
            value={formData.isActive ? 'active' : 'inactive'}
            onChange={(e) => handleDirectInputChange('isActive', e.target.value === 'active')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description || ''}
          onChange={handleInputChange}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </form>
  );

  const renderForm = () => {
    switch (type) {
      case 'user':
        return renderUserForm();
      case 'product':
        return renderProductForm();
      case 'category':
        return renderCategoryForm();
      case 'collection':
        return renderCollectionForm();
      case 'banner':
        return renderBannerForm();
      default:
        return <div>Form not available for this type</div>;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit ${type.charAt(0).toUpperCase() + type.slice(1)}`}
      size="2xl"
    >
      <div className="space-y-6">
        {renderForm()}
        
        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={loading}
          >
            <Cancel className="h-4 w-4 mr-2 inline" />
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="h-4 w-4 mr-2 inline animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Save className="h-4 w-4 mr-2 inline" />
            )}
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
