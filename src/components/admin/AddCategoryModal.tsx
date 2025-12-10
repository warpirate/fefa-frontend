'use client';

import { useState } from 'react';
import { MdClose as Close, MdCloudUpload as Upload, MdImage as ImageIcon } from 'react-icons/md';
import Modal from './Modal';
import adminService from '../../services/adminService';

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddCategoryModal({ isOpen, onClose, onSuccess }: AddCategoryModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    imageFile: null as File | null,
    isActive: true,
    sortOrder: 0
  });
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        setImagePreview(e.target?.result as string);
        // Store the file object for FormData upload
        setFormData(prev => ({ ...prev, image: e.target?.result as string, imageFile: file }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Category name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.image) newErrors.image = 'Category image is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      // Create FormData if image file exists, otherwise use JSON
      if (formData.imageFile) {
        const formDataToSend = new FormData();
        formDataToSend.append('name', formData.name.trim());
        formDataToSend.append('description', formData.description.trim());
        formDataToSend.append('isActive', formData.isActive.toString());
        formDataToSend.append('sortOrder', formData.sortOrder.toString());
        formDataToSend.append('image', formData.imageFile);

        const result = await adminService.createCategory(formDataToSend);
        
        if (result.success) {
          onSuccess();
          onClose();
          resetForm();
          alert('Category created successfully!');
        } else {
          if (result.requiresAuth) {
            const shouldReload = confirm(
              result.error + '\n\nWould you like to go to the login page?'
            );
            if (shouldReload) {
              window.location.href = '/auth/login';
            }
          } else {
            alert(result.error || 'Failed to create category');
          }
        }
      } else {
        // Fallback to JSON if no image file
        const categoryData = {
          name: formData.name.trim(),
          description: formData.description.trim(),
          isActive: formData.isActive,
          sortOrder: formData.sortOrder
        };

        const result = await adminService.createCategory(categoryData);
        
        if (result.success) {
          onSuccess();
          onClose();
          resetForm();
          alert('Category created successfully!');
        } else {
          if (result.requiresAuth) {
            const shouldReload = confirm(
              result.error + '\n\nWould you like to go to the login page?'
            );
            if (shouldReload) {
              window.location.href = '/auth/login';
            }
          } else {
            alert(result.error || 'Failed to create category');
          }
        }
      }
    } catch (err) {
      console.error('Error creating category:', err);
      alert('Failed to create category: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      image: '',
      imageFile: null,
      isActive: true,
      sortOrder: 0
    });
    setImagePreview(null);
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
      title="Add New Category"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category Image *
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Category preview"
                    className="mx-auto h-32 w-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setFormData(prev => ({ ...prev, image: '', imageFile: null }));
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <Close className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div>
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="category-image-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                    >
                      <span>Upload an image</span>
                      <input
                        id="category-image-upload"
                        name="category-image-upload"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              )}
            </div>
          </div>
          {errors.image && <p className="mt-1 text-sm text-red-600">{errors.image}</p>}
        </div>

        {/* Category Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:border-blue-500 text-sm ${
              errors.name ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter category name"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>

        {/* Description */}
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
            placeholder="Enter category description"
          />
          {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
        </div>

        {/* Sort Order */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sort Order
          </label>
          <input
            type="number"
            name="sortOrder"
            value={formData.sortOrder}
            onChange={handleInputChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:border-blue-500 text-sm"
            placeholder="0"
            min="0"
          />
          <p className="mt-1 text-xs text-gray-500">Lower numbers appear first</p>
        </div>

        {/* Active Status */}
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
            {loading ? 'Creating...' : 'Create Category'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
