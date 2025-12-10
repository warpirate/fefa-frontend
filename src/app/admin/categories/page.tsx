'use client';

import { useState, useEffect } from 'react';
import { 
  MdAdd as Plus,
  MdSearch as Search,
  MdEdit as Edit,
  MdDelete as Trash2,
  MdVisibility as Eye,
  MdFolderOpen as FolderOpen,
  MdMoreHoriz as MoreHorizontal,
  MdSwapVert as ArrowUpDown,
  MdRefresh as Refresh,
  MdError as ErrorIcon
} from 'react-icons/md';
import adminService from '../../../services/adminService';
import ViewModal from '../../../components/admin/ViewModal';
import EditModal from '../../../components/admin/EditModal';
import AddCategoryModal from '../../../components/admin/AddCategoryModal';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showInactive, setShowInactive] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  
  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [editLoading, setEditLoading] = useState(false);

  // Load categories on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Load categories from API
  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await adminService.getAllCategories();
      
      if (result.success) {
        setCategories(result.data.map(adminService.formatCategoryForDisplay));
      } else {
        setError(result.error || 'Failed to load categories');
      }
    } catch (err) {
      setError('Failed to load categories');
      console.error('Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle category deletion
  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      setDeleteLoading(id);
      const result = await adminService.deleteCategory(id);
      
      if (result.success) {
        setCategories(prev => prev.filter(category => category.id !== id));
      } else {
        alert(result.error || 'Failed to delete category');
      }
    } catch (err) {
      alert('Failed to delete category');
      console.error('Error deleting category:', err);
    } finally {
      setDeleteLoading(null);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    loadCategories();
  };

  // Handle view category
  const handleViewCategory = (category: any) => {
    setSelectedCategory(category);
    setViewModalOpen(true);
  };

  // Handle edit category
  const handleEditCategory = (category: any) => {
    // Convert display format back to edit format
    const editCategory = {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      sortOrder: category.sortOrder,
      isActive: category.isActive,
      image: category.image
    };
    setSelectedCategory(editCategory);
    setEditModalOpen(true);
  };

  // Handle save category changes
  const handleSaveCategory = async (updatedData: any) => {
    try {
      setEditLoading(true);
      const result = await adminService.updateCategory(selectedCategory.id, updatedData);
      
      if (result.success) {
        // Reload categories to get updated data from server
        await loadCategories();
        setEditModalOpen(false);
        setSelectedCategory(null);
        alert('Category updated successfully!');
      } else {
        if (result.requiresAuth) {
          const shouldReload = confirm(
            result.error + '\n\nWould you like to go to the login page?'
          );
          if (shouldReload) {
            window.location.href = '/auth/login';
          }
        } else {
          alert(result.error || 'Failed to update category');
        }
      }
    } catch (err) {
      alert('Failed to update category: ' + (err instanceof Error ? err.message : 'Unknown error'));
      console.error('Error updating category:', err);
    } finally {
      setEditLoading(false);
    }
  };

  // Handle close modals
  const handleCloseModals = () => {
    setViewModalOpen(false);
    setEditModalOpen(false);
    setAddModalOpen(false);
    setSelectedCategory(null);
  };

  // Handle add category success
  const handleAddCategorySuccess = () => {
    loadCategories();
  };

  const filteredCategories = categories
    .filter(category => {
      const matchesSearch = !searchTerm || 
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = showInactive || category.status === 'active';
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aValue: any = a[sortBy as keyof typeof a];
      let bValue: any = b[sortBy as keyof typeof b];
      
      // Handle null/undefined values
      if (aValue == null) aValue = '';
      if (bValue == null) bValue = '';
      
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
            <p className="mt-1 text-sm text-gray-500">
              Organize your jewelry products into categories
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <Refresh className="h-5 w-5 animate-spin text-blue-600" />
            <span className="text-gray-600">Loading categories...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
            <p className="mt-1 text-sm text-gray-500">
              Organize your jewelry products into categories
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Refresh className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <ErrorIcon className="mx-auto h-12 w-12 text-red-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading categories</h3>
            <p className="mt-1 text-sm text-gray-500">{error}</p>
            <button
              onClick={handleRefresh}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Refresh className="h-4 w-4 mr-2" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="mt-1 text-sm text-gray-500">
            Organize your jewelry products into categories
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Refresh className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={() => setAddModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            {/* Search */}
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showInactive}
                  onChange={(e) => setShowInactive(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Show inactive</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Categories ({filteredCategories.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => toggleSort('name')}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>Category</span>
                    <ArrowUpDown className="h-4 w-4" />
                    {getSortIcon('name')}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => toggleSort('productCount')}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>Products</span>
                    <ArrowUpDown className="h-4 w-4" />
                    {getSortIcon('productCount')}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => toggleSort('sortOrder')}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>Sort Order</span>
                    <ArrowUpDown className="h-4 w-4" />
                    {getSortIcon('sortOrder')}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCategories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        <img
                          className="h-12 w-12 rounded-lg object-cover"
                          src={category.image}
                          alt={category.name}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <h4 className="text-sm font-medium text-gray-900">
                            {category.parent && (
                              <span className="text-gray-400 mr-2">↳</span>
                            )}
                            {category.name}
                          </h4>
                        </div>
                        <p className="text-sm text-gray-500 truncate max-w-xs">
                          {category.description}
                        </p>
                        <p className="text-xs text-gray-400">
                          /{category.slug}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <FolderOpen className="h-4 w-4 mr-1 text-gray-400" />
                      {category.productCount} products
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {category.sortOrder}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      category.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {category.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(category.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleViewCategory(category)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="text-gray-600 hover:text-gray-900"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        disabled={deleteLoading === category.id}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        title="Delete"
                      >
                        {deleteLoading === category.id ? (
                          <Refresh className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredCategories.length === 0 && (
        <div className="text-center py-12">
          <FolderOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No categories found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search criteria or create a new category.
          </p>
        </div>
      )}

      {/* Modals */}
      <ViewModal
        isOpen={viewModalOpen}
        onClose={handleCloseModals}
        data={selectedCategory}
        onEdit={() => {
          setViewModalOpen(false);
          setEditModalOpen(true);
        }}
        type="category"
      />

      <EditModal
        isOpen={editModalOpen}
        onClose={handleCloseModals}
        data={selectedCategory}
        onSave={handleSaveCategory}
        type="category"
        loading={editLoading}
      />

      <AddCategoryModal
        isOpen={addModalOpen}
        onClose={handleCloseModals}
        onSuccess={handleAddCategorySuccess}
      />
    </div>
  );
}
