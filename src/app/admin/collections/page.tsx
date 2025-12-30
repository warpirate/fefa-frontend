'use client';

import { useState, useEffect } from 'react';
import { 
  MdAdd as Plus,
  MdSearch as Search,
  MdEdit as Edit,
  MdDelete as Trash2,
  MdVisibility as Eye,
  MdGridOn as CollectionsIcon,
  MdMoreHoriz as MoreHorizontal,
  MdSwapVert as ArrowUpDown,
  MdRefresh as Refresh,
  MdError as ErrorIcon
} from 'react-icons/md';
import adminService from '../../../services/adminService';
import ViewModal from '../../../components/admin/ViewModal';
import EditModal from '../../../components/admin/EditModal';
import AddCollectionModal from '../../../components/admin/AddCollectionModal';

export default function CollectionsPage() {
  const [collections, setCollections] = useState<any[]>([]);
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
  const [selectedCollection, setSelectedCollection] = useState<any>(null);
  const [editLoading, setEditLoading] = useState(false);

  // Load collections on component mount
  useEffect(() => {
    loadCollections();
  }, []);

  // Load collections from API
  const loadCollections = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await adminService.getAllCollections();
      
      if (result.success) {
        setCollections(result.data.map(adminService.formatCollectionForDisplay));
      } else {
        setError(result.error || 'Failed to load collections');
      }
    } catch (err) {
      setError('Failed to load collections');
      console.error('Error loading collections:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle collection deletion
  const handleDeleteCollection = async (id: string) => {
    if (!confirm('Are you sure you want to delete this collection?')) {
      return;
    }

    try {
      setDeleteLoading(id);
      const result = await adminService.deleteCollection(id);
      
      if (result.success) {
        setCollections(prev => prev.filter(collection => collection.id !== id));
      } else {
        alert(result.error || 'Failed to delete collection');
      }
    } catch (err) {
      alert('Failed to delete collection');
      console.error('Error deleting collection:', err);
    } finally {
      setDeleteLoading(null);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    loadCollections();
  };

  // Handle view collection
  const handleViewCollection = (collection: any) => {
    setSelectedCollection(collection);
    setViewModalOpen(true);
  };

  // Handle edit collection
  const handleEditCollection = (collection: any) => {
    // Convert display format back to edit format
    const editCollection = {
      id: collection.id,
      name: collection.name,
      slug: collection.slug,
      description: collection.description,
      sortOrder: collection.sortOrder,
      isActive: collection.isActive,
      image: collection.image
    };
    setSelectedCollection(editCollection);
    setEditModalOpen(true);
  };

  // Handle save collection changes
  const handleSaveCollection = async (updatedData: any) => {
    try {
      setEditLoading(true);
      const result = await adminService.updateCollection(selectedCollection.id, updatedData);
      
      if (result.success) {
        // Reload collections to get updated data from server
        await loadCollections();
        setEditModalOpen(false);
        setSelectedCollection(null);
        alert('Collection updated successfully!');
      } else {
        if (result.requiresAuth) {
          const shouldReload = confirm(
            result.error + '\n\nWould you like to go to the home page?'
          );
          if (shouldReload) {
            window.location.href = '/';
          }
        } else {
          alert(result.error || 'Failed to update collection');
        }
      }
    } catch (err) {
      alert('Failed to update collection: ' + (err instanceof Error ? err.message : 'Unknown error'));
      console.error('Error updating collection:', err);
    } finally {
      setEditLoading(false);
    }
  };

  // Handle close modals
  const handleCloseModals = () => {
    setViewModalOpen(false);
    setEditModalOpen(false);
    setAddModalOpen(false);
    setSelectedCollection(null);
  };

  // Handle add collection success
  const handleAddCollectionSuccess = () => {
    loadCollections();
  };

  const filteredCollections = collections
    .filter(collection => {
      const matchesSearch = !searchTerm || 
        collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (collection.description && collection.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = showInactive || collection.status === 'active';
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
            <h1 className="text-2xl font-bold text-gray-900">Collections</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your jewelry collections
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <Refresh className="h-5 w-5 animate-spin text-blue-600" />
            <span className="text-gray-600">Loading collections...</span>
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
            <h1 className="text-2xl font-bold text-gray-900">Collections</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your jewelry collections
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
            <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading collections</h3>
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
          <h1 className="text-2xl font-bold text-gray-900">Collections</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your jewelry collections
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
            Add Collection
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
                  placeholder="Search collections..."
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

      {/* Collections Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Collections ({filteredCollections.length})
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
                    <span>Collection</span>
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
              {filteredCollections.map((collection) => (
                <tr key={collection.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        <img
                          className="h-12 w-12 rounded-lg object-cover"
                          src={collection.image || '/placeholder-collection.png'}
                          alt={collection.name}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <h4 className="text-sm font-medium text-gray-900">
                            {collection.name}
                          </h4>
                        </div>
                        <p className="text-sm text-gray-500 truncate max-w-xs">
                          {collection.description}
                        </p>
                        <p className="text-xs text-gray-400">
                          /{collection.slug}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <CollectionsIcon className="h-4 w-4 mr-1 text-gray-400" />
                      {collection.productCount || 0} products
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {collection.sortOrder || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      collection.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {collection.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {collection.createdAt ? new Date(collection.createdAt).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleViewCollection(collection)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditCollection(collection)}
                        className="text-gray-600 hover:text-gray-900"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCollection(collection.id)}
                        disabled={deleteLoading === collection.id}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        title="Delete"
                      >
                        {deleteLoading === collection.id ? (
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
      {filteredCollections.length === 0 && (
        <div className="text-center py-12">
          <CollectionsIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No collections found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search criteria or create a new collection.
          </p>
        </div>
      )}

      {/* Modals */}
      <ViewModal
        isOpen={viewModalOpen}
        onClose={handleCloseModals}
        data={selectedCollection}
        onEdit={() => {
          setViewModalOpen(false);
          setEditModalOpen(true);
        }}
        type="collection"
      />

      <EditModal
        isOpen={editModalOpen}
        onClose={handleCloseModals}
        data={selectedCollection}
        onSave={handleSaveCollection}
        type="collection"
        loading={editLoading}
      />

      <AddCollectionModal
        isOpen={addModalOpen}
        onClose={handleCloseModals}
        onSuccess={handleAddCollectionSuccess}
      />
    </div>
  );
}

