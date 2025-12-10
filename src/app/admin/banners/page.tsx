'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  MdAdd as Plus,
  MdSearch as Search,
  MdEdit as Edit,
  MdDelete as Trash2,
  MdVisibility as Eye,
  MdImage as Image,
  MdCalendarToday as Calendar,
  MdMouse as MousePointer,
  MdVisibility as EyeIcon,
  MdSwapVert as ArrowUpDown,
  MdRefresh as Refresh,
  MdError as ErrorIcon
} from 'react-icons/md';
import bannerService from '../../../services/bannerService';
import AddBannerModal from '../../../components/admin/AddBannerModal';
import ViewModal from '../../../components/admin/ViewModal';
import EditModal from '../../../components/admin/EditModal';

const positions = ['All', 'hero', 'featured', 'sidebar', 'footer'];
const statuses = ['All', 'Active', 'Inactive', 'Scheduled', 'Expired'];

export default function BannersPage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<any>(null);
  const [editLoading, setEditLoading] = useState(false);

  // Load banners on component mount
  useEffect(() => {
    loadBanners();
  }, []);

  // Load banners from API
  const loadBanners = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await bannerService.getAllBanners();
      
      if (result.success) {
        setBanners(result.data);
      } else {
        setError(result.error || 'Failed to load banners');
      }
    } catch (err) {
      setError('Failed to load banners');
      console.error('Error loading banners:', err);
    } finally {
      setLoading(false);
    }
  };

  // Delete banner
  const handleDeleteBanner = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) {
      return;
    }

    try {
      setDeleteLoading(id);
      const result = await bannerService.deleteBanner(id);
      
      if (result.success) {
        setBanners(prev => prev.filter((banner: any) => banner._id !== id));
      } else {
        alert(result.error || 'Failed to delete banner');
      }
    } catch (err) {
      alert('Failed to delete banner');
      console.error('Error deleting banner:', err);
    } finally {
      setDeleteLoading(null);
    }
  };

  // Refresh banners
  const handleRefresh = () => {
    loadBanners();
  };

  // Handle add banner success
  const handleAddBannerSuccess = () => {
    loadBanners();
  };

  // Handle view banner
  const handleViewBanner = (banner: any) => {
    setSelectedBanner(banner);
    setViewModalOpen(true);
  };

  // Handle edit banner
  const handleEditBanner = (banner: any) => {
    setSelectedBanner(banner);
    setEditModalOpen(true);
  };

  // Handle save banner changes
  const handleSaveBanner = async (updatedData: any) => {
    try {
      setEditLoading(true);
      const result = await bannerService.updateBanner(selectedBanner._id, updatedData);
      
      if (result.success) {
        await loadBanners();
        setEditModalOpen(false);
        setSelectedBanner(null);
        alert('Banner updated successfully!');
      } else {
        if ((result as any).requiresAuth) {
          const shouldReload = confirm(
            result.error + '\n\nWould you like to go to the login page?'
          );
          if (shouldReload) {
            window.location.href = '/auth/login';
          }
        } else {
          alert(result.error || 'Failed to update banner');
        }
      }
    } catch (err) {
      alert('Failed to update banner: ' + (err instanceof Error ? err.message : 'Unknown error'));
      console.error('Error updating banner:', err);
    } finally {
      setEditLoading(false);
    }
  };

  // Handle close modals
  const handleCloseModals = () => {
    setAddModalOpen(false);
    setViewModalOpen(false);
    setEditModalOpen(false);
    setSelectedBanner(null);
  };

  const getBannerStatus = (banner: any) => {
    const now = new Date();
    const startDate = new Date(banner.startDate);
    const endDate = new Date(banner.endDate);
    
    if (!banner.isActive) return 'Inactive';
    if (now < startDate) return 'Scheduled';
    if (now > endDate) return 'Expired';
    return 'Active';
  };

  // Filter and sort banners
  const filteredBanners = bannerService.sortBanners(
    bannerService.filterBanners(banners, {
      searchTerm,
      position: selectedPosition,
      status: selectedStatus
    }),
    sortBy,
    sortOrder
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Inactive': return 'bg-red-100 text-red-800';
      case 'Scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'Expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Banners</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage promotional banners and advertisements
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <Refresh className="h-5 w-5 animate-spin text-blue-600" />
            <span className="text-gray-600">Loading banners...</span>
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
            <h1 className="text-2xl font-bold text-gray-900">Banners</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage promotional banners and advertisements
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <ErrorIcon className="mx-auto h-12 w-12 text-red-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading banners</h3>
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
          <h1 className="text-2xl font-bold text-gray-900">Banners</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage promotional banners and advertisements
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
            Add Banner
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-3 py-4 sm:px-4 sm:py-5 lg:p-6">
          <div className="space-y-4">
            {/* Search */}
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search banners..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            </div>

            {/* Filter Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Position Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Position
                </label>
                <select
                  value={selectedPosition}
                  onChange={(e) => setSelectedPosition(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  {positions.map(position => (
                    <option key={position} value={position}>{position}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              {/* Sort Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="createdAt">Created Date</option>
                  <option value="title">Title</option>
                  <option value="clicks">Clicks</option>
                  <option value="ctr">CTR</option>
                </select>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedPosition('All');
                    setSelectedStatus('All');
                    setSortBy('createdAt');
                    setSortOrder('desc');
                  }}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Banners Grid */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {filteredBanners.map((banner: any) => {
          const status = getBannerStatus(banner);
          const ctr = banner.impressions > 0 ? ((banner.clicks / banner.impressions) * 100).toFixed(2) : 0;
          return (
            <div key={banner._id} className="bg-white shadow rounded-lg overflow-hidden">
              {/* Banner Image */}
              <div className="relative h-40 sm:h-48 bg-gray-200">
                <img
                  className="w-full h-full object-cover"
                  src={banner.image}
                  alt={banner.title}
                />
                <div className="absolute top-2 right-2">
                  <span className={`inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                    {status}
                  </span>
                </div>
                <div className="absolute top-2 left-2">
                  <span className="inline-flex items-center px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-xs font-medium bg-black bg-opacity-50 text-white">
                    {banner.position || 'general'}
                  </span>
                </div>
              </div>

              {/* Banner Content */}
              <div className="p-3 sm:p-4">
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1 sm:mb-2 line-clamp-1">
                  {banner.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4 line-clamp-2">
                  {banner.subtitle || 'No description available'}
                </p>

                {/* Performance Metrics */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-3 sm:mb-4 text-center">
                  <div>
                    <div className="text-sm sm:text-lg font-semibold text-gray-900">
                      {(banner.clicks || 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center justify-center">
                      <MousePointer className="h-3 w-3 mr-1" />
                      Clicks
                    </div>
                  </div>
                  <div>
                    <div className="text-sm sm:text-lg font-semibold text-gray-900">
                      {(banner.impressions || 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center justify-center">
                      <EyeIcon className="h-3 w-3 mr-1" />
                      Views
                    </div>
                  </div>
                  <div>
                    <div className="text-sm sm:text-lg font-semibold text-gray-900">
                      {ctr}%
                    </div>
                    <div className="text-xs text-gray-500">CTR</div>
                  </div>
                </div>

                {/* Date Range */}
                <div className="flex items-center text-xs text-gray-500 mb-3 sm:mb-4">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span className="truncate">
                    {banner.startDate ? new Date(banner.startDate).toLocaleDateString() : 'No start date'} - {banner.endDate ? new Date(banner.endDate).toLocaleDateString() : 'No end date'}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <button
                      onClick={() => handleViewBanner(banner)}
                      className="text-blue-600 hover:text-blue-900 p-1"
                      title="View"
                    >
                      <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                    </button>
                    <button
                      onClick={() => handleEditBanner(banner)}
                      className="text-gray-600 hover:text-gray-900 p-1"
                      title="Edit"
                    >
                      <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteBanner(banner._id)}
                      disabled={deleteLoading === banner._id}
                      className="text-red-600 hover:text-red-900 p-1 disabled:opacity-50"
                      title="Delete"
                    >
                      {deleteLoading === banner._id ? (
                        <Refresh className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      )}
                    </button>
                  </div>
                  <div className="text-xs text-gray-400">
                    Order: {banner.sortOrder || 0}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredBanners.length === 0 && (
        <div className="text-center py-12">
          <Image className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No banners found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search criteria or create a new banner.
          </p>
        </div>
      )}

      {/* Modals */}
      <AddBannerModal
        isOpen={addModalOpen}
        onClose={handleCloseModals}
        onSuccess={handleAddBannerSuccess}
      />

      <ViewModal
        isOpen={viewModalOpen}
        onClose={handleCloseModals}
        data={selectedBanner}
        onEdit={() => {
          setViewModalOpen(false);
          setEditModalOpen(true);
        }}
        type="banner"
      />

      <EditModal
        isOpen={editModalOpen}
        onClose={handleCloseModals}
        data={selectedBanner}
        onSave={handleSaveBanner}
        type="banner"
        loading={editLoading}
      />
    </div>
  );
}
