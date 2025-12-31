'use client';

import { useState, useEffect } from 'react';
import {
  MdAdd as Plus,
  MdSearch as Search,
  MdFilterList as Filter,
  MdEdit as Edit,
  MdDelete as Trash2,
  MdVisibility as Eye,
  MdMoreHoriz as MoreHorizontal,
  MdInventory as Package,
  MdStar as Star,
  MdAttachMoney as DollarSign,
  MdRefresh as Refresh,
  MdError as ErrorIcon,
  MdCheckCircle as CheckCircle,
  MdCancel as Cancel,
  MdBugReport as BugReport,
  MdChevronLeft as ChevronLeft,
  MdChevronRight as ChevronRight
} from 'react-icons/md';
import adminService from '../../../services/adminService';
import ViewModal from '../../../components/admin/ViewModal';
import EditModal from '../../../components/admin/EditModal';
import AddProductModal from '../../../components/admin/AddProductModal';

const statuses = ['All', 'Active', 'Inactive'];

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState(['All']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [editLoading, setEditLoading] = useState(false);
  
  // Test panel state
  const [showTestPanel, setShowTestPanel] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [testing, setTesting] = useState<Record<string, boolean>>({});

  // Load categories on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Load products when filters or pagination changes
  useEffect(() => {
    loadProducts();
  }, [currentPage, itemsPerPage, searchTerm, selectedCategory, selectedStatus]);

  // Load products from API
  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await adminService.getAllProducts({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm || undefined,
        category: selectedCategory === 'All' ? null : selectedCategory,
        status: selectedStatus === 'All' ? null : selectedStatus.toLowerCase()
      });
      
      if (result.success) {
        setProducts(result.data.map(adminService.formatProductForDisplay));
        
        // Update pagination info from API response
        if (result.pagination) {
          setTotalPages(result.pagination.totalPages || 1);
          setTotalItems(result.pagination.totalProducts || result.data.length);
        }
      } else {
        setError(result.error || 'Failed to load products');
      }
    } catch (err) {
      setError('Failed to load products');
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load categories from API
  const loadCategories = async () => {
    try {
      const result = await adminService.getAllCategories();
      if (result.success) {
        const categoryNames = ['All', ...result.data.map((cat: any) => cat.name)];
        setCategories(categoryNames);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  // Handle product deletion
  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      setDeleteLoading(id);
      const result = await adminService.deleteProduct(id);
      
      if (result.success) {
        setProducts(prev => prev.filter(product => product.id !== id));
      } else {
        alert(result.error || 'Failed to delete product');
      }
    } catch (err) {
      alert('Failed to delete product');
      console.error('Error deleting product:', err);
    } finally {
      setDeleteLoading(null);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    setCurrentPage(1);
    loadProducts();
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle items per page change
  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Handle view product
  const handleViewProduct = (product: any) => {
    setSelectedProduct(product);
    setViewModalOpen(true);
  };

  // Handle edit product
  const handleEditProduct = async (product: any) => {
    try {
      // Fetch full product data with all images from backend
      const result = await adminService.getProductById(product.id);
      
      if (result.success && result.data) {
        // Use the full product data from backend which includes the images array
        const fullProduct = result.data;
        console.log('Full product data from backend:', {
          id: fullProduct._id || fullProduct.id,
          name: fullProduct.name,
          occasions: fullProduct.occasions,
          occasionsType: typeof fullProduct.occasions,
          occasionsIsArray: Array.isArray(fullProduct.occasions)
        });
        const editProduct = {
          id: fullProduct._id || fullProduct.id,
          name: fullProduct.name,
          slug: fullProduct.slug,
          sku: fullProduct.sku,
          price: fullProduct.price,
          comparePrice: fullProduct.comparePrice,
          costPrice: fullProduct.costPrice,
          description: fullProduct.description,
          shortDescription: fullProduct.shortDescription,
          stock: fullProduct.inventory?.quantity || fullProduct.stock || 0,
          category: fullProduct.category?._id || fullProduct.category?.id || fullProduct.category,
          weight: fullProduct.weight,
          length: fullProduct.dimensions?.length,
          width: fullProduct.dimensions?.width,
          height: fullProduct.dimensions?.height,
          dimensionUnit: fullProduct.dimensions?.unit || 'cm',
          tags: fullProduct.tags,
          occasions: fullProduct.occasions || [], // Include occasions from backend
          isActive: fullProduct.isActive !== false,
          isFeatured: fullProduct.isFeatured || false,
          isDigital: fullProduct.isDigital || false,
          image: fullProduct.image, // Single image fallback
          images: fullProduct.images || [] // Full images array - THIS IS CRITICAL
        };
        setSelectedProduct(editProduct);
        setEditModalOpen(true);
      } else {
        // Fallback to display format if fetch fails
        const editProduct = {
          id: product.id,
          name: product.name,
          slug: product.slug || '',
          sku: product.sku,
          price: product.price,
          comparePrice: product.comparePrice,
          costPrice: product.costPrice,
          description: product.description,
          shortDescription: product.shortDescription,
          stock: product.stock,
          category: product.category,
          weight: product.weight,
          length: product.length,
          width: product.width,
          height: product.height,
          dimensionUnit: product.dimensionUnit || 'cm',
          tags: product.tags,
          occasions: product.occasions || [], // Include occasions from product data
          isActive: product.status === 'active',
          isFeatured: product.featured,
          isDigital: product.isDigital,
          image: product.image,
          images: product.images || [] // Try to preserve images if available
        };
        setSelectedProduct(editProduct);
        setEditModalOpen(true);
      }
    } catch (error) {
      console.error('Error fetching product for edit:', error);
      // Fallback to basic product data
    const editProduct = {
      id: product.id,
      name: product.name,
      sku: product.sku,
      price: product.price,
      stock: product.stock,
      category: product.category,
      isActive: product.status === 'active',
      description: product.description,
      isFeatured: product.featured,
        image: product.image,
        images: product.images || []
    };
    setSelectedProduct(editProduct);
    setEditModalOpen(true);
    }
  };

  // Handle save product changes
  const handleSaveProduct = async (updatedData: any) => {
    try {
      setEditLoading(true);
      
      // Extract image data
      const { existingImages, newImageFiles, ...productData } = updatedData;
      
      // Transform data to match Product model
      const productUpdateData: any = {
        name: productData.name,
        slug: productData.slug,
        sku: productData.sku,
        price: productData.price,
        description: productData.description,
        shortDescription: productData.shortDescription,
        comparePrice: productData.comparePrice,
        costPrice: productData.costPrice,
        isActive: productData.isActive,
        isFeatured: productData.isFeatured,
        isDigital: productData.isDigital,
        // Map stock to inventory.quantity
        'inventory.quantity': productData.stock,
        weight: productData.weight,
        dimensions: productData.dimensions,
        tags: productData.tags,
        occasions: productData.occasions || []
      };
      
      // Update images array if existing images were modified (only if provided)
      if (existingImages !== undefined) {
        productUpdateData.images = existingImages;
      }
      
      
      // Update product data
      const result = await adminService.updateProduct(selectedProduct.id, productUpdateData);
      
      if (!result.success) {
        alert(result.error || 'Failed to update product');
        return;
      }
      
      // Add new images if any
      if (newImageFiles && newImageFiles.length > 0) {
        const imageResult = await (adminService as any).addProductImages(selectedProduct.id, newImageFiles);
        if (!imageResult.success) {
          console.error('Failed to add new images:', imageResult.error);
          // Continue anyway - product was updated successfully
        }
      }
      
      // Reload products to get updated data
      await loadProducts();
      
      setEditModalOpen(false);
      setSelectedProduct(null);
      alert('Product updated successfully!');
    } catch (err) {
      alert('Failed to update product: ' + (err instanceof Error ? err.message : 'Unknown error'));
      console.error('Error updating product:', err);
    } finally {
      setEditLoading(false);
    }
  };

  // Handle close modals
  const handleCloseModals = () => {
    setViewModalOpen(false);
    setEditModalOpen(false);
    setAddModalOpen(false);
    setSelectedProduct(null);
  };

  // Handle add product success
  const handleAddProductSuccess = () => {
    loadProducts();
  };

  // Products are already filtered by backend, so we use them directly
  const filteredProducts = products;

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold script-font" style={{ color: 'var(--primary)' }}>Products</h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--dark-gray)' }}>
              Manage your jewelry products and inventory
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <Refresh className="h-5 w-5 animate-spin text-blue-600" />
            <span className="text-gray-600">Loading products...</span>
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
            <h1 className="text-2xl font-bold script-font" style={{ color: 'var(--primary)' }}>Products</h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--dark-gray)' }}>
              Manage your jewelry products and inventory
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-all hover:opacity-90"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            <Refresh className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <ErrorIcon className="mx-auto h-12 w-12 text-red-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading products</h3>
            <p className="mt-1 text-sm text-gray-500">{error}</p>
            <button
              onClick={handleRefresh}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-all hover:opacity-90"
              style={{ backgroundColor: 'var(--primary)' }}
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
          <h1 className="text-2xl font-bold script-font" style={{ color: 'var(--primary)' }}>Products</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--dark-gray)' }}>
            Manage your jewelry products and inventory
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
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-all hover:opacity-90"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-3 py-4 sm:px-4 sm:py-5 lg:p-6">
          <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
            {/* Search */}
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1); // Reset to first page when search changes
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      loadProducts();
                    }
                  }}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:border-purple-500 text-sm"
                  style={{ '--tw-ring-color': 'var(--primary)' } as React.CSSProperties}
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {showFilters && (
                <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Active
                </span>
              )}
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setCurrentPage(1); // Reset to first page when filter changes
                    }}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => {
                      setSelectedStatus(e.target.value);
                      setCurrentPage(1); // Reset to first page when filter changes
                    }}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2 lg:col-span-2 flex items-end">
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('All');
                      setSelectedStatus('All');
                      setCurrentPage(1);
                    }}
                    className="w-full sm:w-auto inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-3 py-4 sm:px-4 sm:py-5 lg:px-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900">
              Products ({totalItems})
            </h3>
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-700">Items per page:</label>
              <select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Mobile Card View */}
        <div className="block lg:hidden">
          <div className="divide-y divide-gray-200">
            {filteredProducts.map((product) => (
              <div key={product.id} className="p-3 sm:p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 h-16 w-16">
                    <img
                      className="h-16 w-16 rounded-lg object-cover"
                      src={product.image}
                      alt={product.name}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {product.name}
                          </h4>
                          {product.featured && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Featured
                            </span>
                          )}
                        </div>
                        <div className="mt-1 space-y-1">
                          <div className="flex items-center text-xs text-gray-500">
                            <Package className="h-3 w-3 mr-1" />
                            {product.sku} • {product.category}
                          </div>
                          <div className="flex items-center text-sm text-gray-900">
                            <DollarSign className="h-3 w-3 mr-1" />
                            ₹{product.price.toLocaleString()}
                            <span className={`ml-2 text-xs ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {product.stock} in stock
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center text-xs text-gray-500">
                              <Star className="h-3 w-3 mr-1 text-yellow-400" />
                              {product.rating}
                            </div>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              product.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {product.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleViewProduct(product)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="View Product"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="text-gray-600 hover:text-gray-900 p-1"
                          title="Edit Product"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(product.id)}
                          disabled={deleteLoading === product.id}
                          className="text-red-600 hover:text-red-900 p-1 disabled:opacity-50"
                          title="Delete Product"
                        >
                          {deleteLoading === product.id ? (
                            <Refresh className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block">
          <ul className="divide-y divide-gray-200">
            {filteredProducts.map((product) => (
              <li key={product.id}>
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-16 w-16">
                        <img
                          className="h-16 w-16 rounded-lg object-cover"
                          src={product.image}
                          alt={product.name}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <h4 className="text-sm font-medium text-gray-900">
                            {product.name}
                          </h4>
                          {product.featured && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Featured
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <Package className="h-4 w-4 mr-1" />
                          {product.sku}
                          <span className="mx-2">•</span>
                          <span>{product.category}</span>
                        </div>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <DollarSign className="h-4 w-4 mr-1" />
                          ₹{product.price.toLocaleString()}
                          <span className="mx-2">•</span>
                          <span className={product.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                            {product.stock} in stock
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <Star className="h-4 w-4 mr-1 text-yellow-400" />
                        {product.rating}
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.status}
                      </span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewProduct(product)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Product"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="text-gray-600 hover:text-gray-900"
                          title="Edit Product"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(product.id)}
                          disabled={deleteLoading === product.id}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          title="Delete Product"
                        >
                          {deleteLoading === product.id ? (
                            <Refresh className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && !loading && (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * itemsPerPage, totalItems)}
                </span>{' '}
                of <span className="font-medium">{totalItems}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="h-5 w-5" />
                </button>
                
                {/* Page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === pageNum
                          ? 'z-10 bg-primary border-primary text-white'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                      style={currentPage === pageNum ? { backgroundColor: 'var(--primary)' } : {}}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <ViewModal
        isOpen={viewModalOpen}
        onClose={handleCloseModals}
        data={selectedProduct}
        onEdit={() => {
          setViewModalOpen(false);
          setEditModalOpen(true);
        }}
        type="product"
      />

      <EditModal
        isOpen={editModalOpen}
        onClose={handleCloseModals}
        data={selectedProduct}
        onSave={handleSaveProduct}
        type="product"
        loading={editLoading}
      />

      <AddProductModal
        isOpen={addModalOpen}
        onClose={handleCloseModals}
        onSuccess={handleAddProductSuccess}
      />
    </div>
  );
}
