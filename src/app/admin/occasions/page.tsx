'use client';

import { useState, useEffect } from 'react';
import { 
  MdAdd as Plus,
  MdSearch as Search,
  MdEdit as Edit,
  MdDelete as Trash2,
  MdVisibility as Eye,
  MdRefresh as Refresh,
  MdError as ErrorIcon,
  MdSwapVert as ArrowUpDown
} from 'react-icons/md';
import adminService from '../../../services/adminService';
import ViewModal from '../../../components/admin/ViewModal';
import EditModal from '../../../components/admin/EditModal';
import AddOccasionModal from '../../../components/admin/AddOccasionModal';

export default function OccasionsPage() {
  const [occasions, setOccasions] = useState<any[]>([]);
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
  const [selectedOccasion, setSelectedOccasion] = useState<any>(null);
  const [editLoading, setEditLoading] = useState(false);

  // Load occasions on component mount
  useEffect(() => {
    loadOccasions();
  }, []);

  // Load occasions from API
  const loadOccasions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await adminService.getAllOccasions();
      
      if (result.success) {
        // Handle empty data gracefully
        const occasionsData = result.data || [];
        setOccasions(occasionsData.map(adminService.formatOccasionForDisplay));
        
        // If no occasions found, show a helpful message
        if (occasionsData.length === 0) {
          console.log('No occasions found. You may need to migrate occasions from JSON or create new ones.');
        }
      } else {
        // If API returns error but has data, still use the data
        if (result.data && Array.isArray(result.data)) {
          setOccasions(result.data.map(adminService.formatOccasionForDisplay));
        } else {
          setError(result.error || 'Failed to load occasions');
        }
      }
    } catch (err: any) {
      console.error('Error loading occasions:', err);
      // If it's a network error, show a helpful message
      if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
        setError('Unable to connect to the server. Please check your connection and try again.');
      } else {
        setError(err.message || 'Failed to load occasions');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle occasion deletion
  const handleDeleteOccasion = async (id: string) => {
    if (!confirm('Are you sure you want to delete this occasion?')) {
      return;
    }

    try {
      setDeleteLoading(id);
      const result = await adminService.deleteOccasion(id);
      
      if (result.success) {
        setOccasions(prev => prev.filter(occasion => occasion.id !== id));
      } else {
        alert(result.error || 'Failed to delete occasion');
      }
    } catch (err) {
      alert('Failed to delete occasion');
      console.error('Error deleting occasion:', err);
    } finally {
      setDeleteLoading(null);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    loadOccasions();
  };

  // Handle view occasion
  const handleViewOccasion = (occasion: any) => {
    setSelectedOccasion(occasion);
    setViewModalOpen(true);
  };

  // Handle edit occasion
  const handleEditOccasion = (occasion: any) => {
    // Convert display format back to edit format
    const editOccasion = {
      id: occasion.id,
      name: occasion.name,
      value: occasion.value,
      description: occasion.description,
      sortOrder: occasion.sortOrder,
      isActive: occasion.isActive,
      image: occasion.image
    };
    setSelectedOccasion(editOccasion);
    setEditModalOpen(true);
  };

  // Handle save occasion changes
  const handleSaveOccasion = async (updatedData: any) => {
    try {
      setEditLoading(true);
      const result = await adminService.updateOccasion(selectedOccasion.id, updatedData);
      
      if (result.success) {
        // Reload occasions to get updated data from server
        await loadOccasions();
        setEditModalOpen(false);
        setSelectedOccasion(null);
        alert('Occasion updated successfully!');
      } else {
        if (result.requiresAuth) {
          const shouldReload = confirm(
            result.error + '\n\nWould you like to go to the login page?'
          );
          if (shouldReload) {
            window.location.href = '/auth/login';
          }
        } else {
          alert(result.error || 'Failed to update occasion');
        }
      }
    } catch (err) {
      alert('Failed to update occasion: ' + (err instanceof Error ? err.message : 'Unknown error'));
      console.error('Error updating occasion:', err);
    } finally {
      setEditLoading(false);
    }
  };

  // Handle close modals
  const handleCloseModals = () => {
    setViewModalOpen(false);
    setEditModalOpen(false);
    setAddModalOpen(false);
    setSelectedOccasion(null);
  };

  // Handle add occasion success
  const handleAddOccasionSuccess = () => {
    loadOccasions();
  };

  const filteredOccasions = occasions
    .filter(occasion => {
      const matchesSearch = !searchTerm || 
        occasion.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        occasion.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (occasion.description && occasion.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = showInactive || occasion.isActive;
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
            <h1 className="text-2xl font-bold text-gray-900">Occasions</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage product occasions and collections
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <Refresh className="h-5 w-5 animate-spin text-blue-600" />
            <span className="text-gray-600">Loading occasions...</span>
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
            <h1 className="text-2xl font-bold text-gray-900">Occasions</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage product occasions and collections
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
            <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading occasions</h3>
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
          <h1 className="text-2xl font-bold text-gray-900">Occasions</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage product occasions and collections (Wedding, Anniversary, Gift, etc.)
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
            Add Occasion
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
                  placeholder="Search occasions..."
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

      {/* Occasions Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Occasions ({filteredOccasions.length})
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
                    <span>Occasion</span>
                    <ArrowUpDown className="h-4 w-4" />
                    {getSortIcon('name')}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
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
              {filteredOccasions.map((occasion) => (
                <tr key={occasion.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        <img
                          className="h-12 w-12 rounded-lg object-cover"
                          src={occasion.image}
                          alt={occasion.name}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder-occasion.png';
                          }}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {occasion.name}
                        </div>
                        {occasion.description && (
                          <p className="text-sm text-gray-500 truncate max-w-xs">
                            {occasion.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <code className="px-2 py-1 bg-gray-100 rounded text-xs">
                        {occasion.value}
                      </code>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {occasion.sortOrder}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      occasion.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {occasion.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(occasion.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleViewOccasion(occasion)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditOccasion(occasion)}
                        className="text-gray-600 hover:text-gray-900"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteOccasion(occasion.id)}
                        disabled={deleteLoading === occasion.id}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        title="Delete"
                      >
                        {deleteLoading === occasion.id ? (
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
      {filteredOccasions.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">🎁</div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No occasions found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search criteria or create a new occasion.
          </p>
        </div>
      )}

      {/* Modals */}
      <ViewModal
        isOpen={viewModalOpen}
        onClose={handleCloseModals}
        data={selectedOccasion}
        onEdit={() => {
          setViewModalOpen(false);
          setEditModalOpen(true);
        }}
        type="occasion"
      />

      <EditModal
        isOpen={editModalOpen}
        onClose={handleCloseModals}
        data={selectedOccasion}
        onSave={handleSaveOccasion}
        type="occasion"
        loading={editLoading}
      />

      <AddOccasionModal
        isOpen={addModalOpen}
        onClose={handleCloseModals}
        onSuccess={handleAddOccasionSuccess}
      />
    </div>
  );
}
