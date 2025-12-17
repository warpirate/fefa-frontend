// Banner Service for FEFA Jewelry Admin
// This service handles all banner-related API operations for the admin panel

class BannerService {
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  }

  // Helper method to get auth headers
  getAuthHeaders() {
    const token = localStorage.getItem('fefa_access_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  }

  // Get all banners (admin view - includes inactive)
  async getAllBanners() {
    try {
      const response = await fetch(`${this.baseURL}/banners`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch banners');
      }

      return {
        success: true,
        data: data.data || []
      };
    } catch (error) {
      console.error('Get all banners error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch banners'
      };
    }
  }

  // Get active banners only
  async getActiveBanners() {
    try {
      const response = await fetch(`${this.baseURL}/banners/active`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch active banners');
      }

      return {
        success: true,
        data: data.data || []
      };
    } catch (error) {
      console.error('Get active banners error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch active banners'
      };
    }
  }

  // Get single banner by ID
  async getBannerById(id) {
    try {
      const response = await fetch(`${this.baseURL}/banners/${id}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch banner');
      }

      return {
        success: true,
        data: data.data
      };
    } catch (error) {
      console.error('Get banner by ID error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch banner'
      };
    }
  }

  // Create new banner
  async createBanner(bannerData) {
    try {
      const response = await fetch(`${this.baseURL}/banners`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(bannerData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create banner');
      }

      return {
        success: true,
        data: data.data
      };
    } catch (error) {
      console.error('Create banner error:', error);
      return {
        success: false,
        error: error.message || 'Failed to create banner'
      };
    }
  }

  // Update banner (supports FormData for image upload)
  async updateBanner(id, bannerData) {
    try {
      // Check if bannerData is FormData (for image upload) or regular object
      const isFormData = bannerData instanceof FormData;
      
      const headers = this.getAuthHeaders();
      
      // Remove Content-Type header for FormData (browser will set it with boundary)
      if (isFormData) {
        delete headers['Content-Type'];
      }

      const response = await fetch(`${this.baseURL}/banners/${id}`, {
        method: 'PUT',
        headers: headers,
        body: isFormData ? bannerData : JSON.stringify(bannerData)
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle authentication errors
        if (response.status === 401 || response.status === 403) {
          return {
            success: false,
            requiresAuth: true,
            error: data.message || 'Authentication required'
          };
        }
        throw new Error(data.message || 'Failed to update banner');
      }

      return {
        success: true,
        data: data.data
      };
    } catch (error) {
      console.error('Update banner error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update banner'
      };
    }
  }

  // Delete banner
  async deleteBanner(id) {
    try {
      const response = await fetch(`${this.baseURL}/banners/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete banner');
      }

      return {
        success: true,
        message: data.message || 'Banner deleted successfully'
      };
    } catch (error) {
      console.error('Delete banner error:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete banner'
      };
    }
  }

  // Track banner click
  async trackClick(id) {
    try {
      const response = await fetch(`${this.baseURL}/banners/${id}/click`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to track click');
      }

      return {
        success: true,
        message: data.message || 'Click tracked successfully'
      };
    } catch (error) {
      console.error('Track click error:', error);
      return {
        success: false,
        error: error.message || 'Failed to track click'
      };
    }
  }

  // Track banner impression
  async trackImpression(id) {
    try {
      const response = await fetch(`${this.baseURL}/banners/${id}/impression`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to track impression');
      }

      return {
        success: true,
        message: data.message || 'Impression tracked successfully'
      };
    } catch (error) {
      console.error('Track impression error:', error);
      return {
        success: false,
        error: error.message || 'Failed to track impression'
      };
    }
  }

  // Helper method to determine banner status
  getBannerStatus(banner) {
    if (!banner.isActive) return 'Inactive';
    
    const now = new Date();
    const startDate = banner.startDate ? new Date(banner.startDate) : null;
    const endDate = banner.endDate ? new Date(banner.endDate) : null;
    
    if (startDate && now < startDate) return 'Scheduled';
    if (endDate && now > endDate) return 'Expired';
    return 'Active';
  }

  // Helper method to format banner data for display
  formatBannerForDisplay(banner) {
    return {
      ...banner,
      status: this.getBannerStatus(banner),
      ctr: banner.impressions > 0 ? ((banner.clicks / banner.impressions) * 100).toFixed(2) : 0,
      createdAt: new Date(banner.createdAt).toLocaleDateString(),
      startDate: banner.startDate ? new Date(banner.startDate).toLocaleDateString() : 'N/A',
      endDate: banner.endDate ? new Date(banner.endDate).toLocaleDateString() : 'N/A'
    };
  }

  // Filter banners based on search criteria
  filterBanners(banners, filters) {
    const { searchTerm, position, status } = filters;
    
    return banners.filter(banner => {
      const matchesSearch = !searchTerm || 
        banner.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (banner.subtitle && banner.subtitle.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesPosition = position === 'All' || banner.position === position;
      
      const bannerStatus = this.getBannerStatus(banner);
      const matchesStatus = status === 'All' || bannerStatus === status;
      
      return matchesSearch && matchesPosition && matchesStatus;
    });
  }

  // Sort banners
  sortBanners(banners, sortBy, sortOrder) {
    return banners.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      // Handle virtual fields
      if (sortBy === 'ctr') {
        aValue = a.impressions > 0 ? (a.clicks / a.impressions) * 100 : 0;
        bValue = b.impressions > 0 ? (b.clicks / b.impressions) * 100 : 0;
      }
      
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }
}

// Create and export a singleton instance
const bannerService = new BannerService();
export default bannerService;
