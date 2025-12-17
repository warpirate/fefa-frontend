'use client';

import { useState, useEffect } from 'react';
import { MdClose as Close, MdCloudUpload as Upload, MdImage as ImageIcon } from 'react-icons/md';
import Modal from './Modal';
import adminService from '../../services/adminService';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddProductModal({ isOpen, onClose, onSuccess }: AddProductModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    sku: '',
    price: '',
    comparePrice: '',
    costPrice: '',
    description: '',
    shortDescription: '',
    category: '',
    stock: '',
    weight: '',
    length: '',
    width: '',
    height: '',
    dimensionUnit: 'cm',
    tags: '',
    isActive: true,
    isFeatured: false,
    isDigital: false,
    image: ''
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<Array<{ file: File; preview: string }>>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load categories when modal opens - always reload to ensure fresh data
  useEffect(() => {
    if (isOpen) {
      // Always reload categories when modal opens to ensure they're available
      loadCategories();
    }
  }, [isOpen]);

  const loadCategories = async () => {
    try {
      const result = await adminService.getAllCategories();
      if (result.success) {
        // Show ALL categories returned from API (admin view shows all)
        // No filtering needed since adminService.getAllCategories() already handles admin=true
        setCategories(result.data);
      }
    } catch (err) {
      // Error loading categories - silent fail, categories may still be available
    }
  };

  // Generate slug from name
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => {
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
      setErrors(prev => ({ ...prev, [name]: '' }));
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
          errorCount++;
          if (loadedCount + errorCount === fileArray.length) {
            alert(`Some files were skipped. Please select only image files.`);
          }
          return;
        }

        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
          errorCount++;
          if (loadedCount + errorCount === fileArray.length) {
            alert(`Some files were skipped. Maximum file size is 10MB.`);
          }
          return;
        }

        const reader = new FileReader();
        reader.onerror = () => {
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
            setImagePreviews(prev => [...prev, ...newImages]);
              }
            }
          } else {
            errorCount++;
          }
        };
        reader.readAsDataURL(file);
      });
    }
    // Reset input to allow selecting same files again
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.slug.trim()) newErrors.slug = 'Slug is required';
    if (!formData.sku.trim()) newErrors.sku = 'SKU is required';
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Valid price is required';
    if (formData.comparePrice && parseFloat(formData.comparePrice) <= 0) newErrors.comparePrice = 'Compare price must be greater than 0';
    if (formData.costPrice && parseFloat(formData.costPrice) < 0) newErrors.costPrice = 'Cost price cannot be negative';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.stock || parseInt(formData.stock) < 0) newErrors.stock = 'Valid stock quantity is required';
    if (formData.weight && parseFloat(formData.weight) < 0) newErrors.weight = 'Weight cannot be negative';
    if (formData.length && parseFloat(formData.length) < 0) newErrors.length = 'Length cannot be negative';
    if (formData.width && parseFloat(formData.width) < 0) newErrors.width = 'Width cannot be negative';
    if (formData.height && parseFloat(formData.height) < 0) newErrors.height = 'Height cannot be negative';
    if (imagePreviews.length === 0) newErrors.image = 'At least one product image is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      // Find category ObjectId
      const selectedCategory = categories.find(cat => cat.name === formData.category || cat._id === formData.category);
      if (!selectedCategory) {
        alert('Selected category not found');
        setLoading(false);
        return;
      }

      // Prepare product data
      const productData: any = {
        name: formData.name.trim(),
        slug: formData.slug.trim().toLowerCase(),
        sku: formData.sku.trim().toUpperCase(),
        price: parseFloat(formData.price),
        description: formData.description.trim(),
        category: selectedCategory._id, // Send ObjectId, not name
        'inventory.quantity': parseInt(formData.stock),
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
        isDigital: formData.isDigital,
      };

      // Add optional fields
      if (formData.shortDescription.trim()) {
        productData.shortDescription = formData.shortDescription.trim();
      }
      if (formData.comparePrice) {
        productData.comparePrice = parseFloat(formData.comparePrice);
      }
      if (formData.costPrice) {
        productData.costPrice = parseFloat(formData.costPrice);
      }
      if (formData.tags.trim()) {
        productData.tags = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      }
      if (formData.weight) {
        productData.weight = parseFloat(formData.weight);
      }
      if (formData.length || formData.width || formData.height) {
        productData.dimensions = {
          length: formData.length ? parseFloat(formData.length) : 0,
          width: formData.width ? parseFloat(formData.width) : 0,
          height: formData.height ? parseFloat(formData.height) : 0,
          unit: formData.dimensionUnit
        };
      }

      // Create FormData for file upload
      const formDataToSend = new FormData();
      
      // Add all product data as JSON string (backend will parse it)
      Object.keys(productData).forEach(key => {
        if (key.includes('.')) {
          // Handle nested fields like 'inventory.quantity'
          formDataToSend.append(key, productData[key].toString());
        } else if (Array.isArray(productData[key])) {
          formDataToSend.append(key, JSON.stringify(productData[key]));
        } else if (typeof productData[key] === 'object') {
          formDataToSend.append(key, JSON.stringify(productData[key]));
        } else {
          formDataToSend.append(key, productData[key].toString());
        }
      });

      // Add image files if available
      imagePreviews.forEach((imageData) => {
        formDataToSend.append('images', imageData.file);
      });

      const result = await (adminService as any).createProductWithImage(formDataToSend);
      
      if (result.success) {
        resetForm();
        onSuccess();
        onClose();
        alert('Product created successfully!');
      } else {
        // Handle authentication errors
        if (result.requiresAuth) {
          const shouldReload = confirm(
            result.error + '\n\nWould you like to go to the login page?'
          );
          if (shouldReload) {
            window.location.href = '/auth/login';
          }
        } else {
          alert(result.error || 'Failed to create product');
        }
      }
    } catch (err) {
      alert('Failed to create product: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      sku: '',
      price: '',
      comparePrice: '',
      costPrice: '',
      description: '',
      shortDescription: '',
      category: '',
      stock: '',
      weight: '',
      length: '',
      width: '',
      height: '',
      dimensionUnit: 'cm',
      tags: '',
      isActive: true,
      isFeatured: false,
      isDigital: false,
      image: ''
    });
    setImagePreviews([]);
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add New Product"
      size="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Images * (Multiple images allowed)
          </label>
          
          {/* Image Previews */}
          {imagePreviews.length > 0 && (
            <div className="mb-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {imagePreviews.map((imageData, index) => (
                <div key={index} className="relative group">
                  <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-100">
                    <div className="relative w-full h-full">
                      <img
                        src={imageData.preview}
                        alt={`Product image ${index + 1}`}
                        className="w-full h-full object-cover bg-white"
                        onError={(e) => {
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
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Close className="h-4 w-4" />
                    </button>
                    {index === 0 && (
                      <span className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-2 py-0.5 rounded">
                        Primary
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Upload Area */}
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="image-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                >
                  <span>Upload images</span>
                  <input
                    id="image-upload"
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
              <p className="text-xs text-gray-400 mt-1">First image will be set as primary</p>
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
              value={formData.name}
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
              value={formData.slug}
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
              value={formData.sku}
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
              value={formData.category}
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price (₹) *
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
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
              value={formData.comparePrice}
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
              value={formData.costPrice}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock Quantity *
            </label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
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
              value={formData.weight}
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Short Description
          </label>
          <textarea
            name="shortDescription"
            value={formData.shortDescription}
            onChange={handleInputChange}
            rows={2}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:border-blue-500 text-sm ${
              errors.shortDescription ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Brief description (optional)"
          />
          {errors.shortDescription && <p className="mt-1 text-sm text-red-600">{errors.shortDescription}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:border-blue-500 text-sm ${
              errors.description ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter product description"
          />
          {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tags
          </label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
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
                value={formData.length}
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
                value={formData.width}
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
                value={formData.height}
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
                value={formData.dimensionUnit}
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
              checked={formData.isActive}
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
              checked={formData.isFeatured}
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
              checked={formData.isDigital}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isDigital" className="ml-2 block text-sm text-gray-900">
              Digital Product
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Product'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
