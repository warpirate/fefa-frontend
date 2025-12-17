// Admin Service for FEFA Jewelry Admin Panel
// This service handles all admin-related API operations

class AdminService {
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

  // ==================== DASHBOARD STATS ====================
  
  // Get dashboard statistics
  async getDashboardStats() {
    try {
      const [productsRes, categoriesRes, usersRes, ordersRes, bannersRes] = await Promise.all([
        this.getAllProducts({ limit: 1 }),
        this.getAllCategories({ limit: 1 }),
        this.getAllUsers({ limit: 1 }),
        this.getAllOrders({ limit: 1 }),
        this.getAllBanners({ limit: 1 })
      ]);

      const stats = {
        totalProducts: productsRes.success ? productsRes.pagination?.totalProducts || 0 : 0,
        totalCategories: categoriesRes.success ? categoriesRes.pagination?.totalCategories || 0 : 0,
        totalUsers: usersRes.success ? usersRes.pagination?.totalUsers || 0 : 0,
        totalOrders: ordersRes.success ? ordersRes.pagination?.totalOrders || 0 : 0,
        totalBanners: bannersRes.success ? bannersRes.pagination?.totalBanners || 0 : 0,
        totalRevenue: ordersRes.success ? ordersRes.totalRevenue || 0 : 0,
        activeBanners: bannersRes.success ? bannersRes.activeBanners || 0 : 0,
        pendingReviews: 0 // This would need a reviews endpoint
      };

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch dashboard statistics'
      };
    }
  }

  // Get recent orders
  async getRecentOrders(limit = 5) {
    try {
      const response = await fetch(`${this.baseURL}/orders?limit=${limit}&sortBy=createdAt&sortOrder=desc`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch recent orders');
      }

      return {
        success: true,
        data: data.data || []
      };
    } catch (error) {
      console.error('Get recent orders error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch recent orders'
      };
    }
  }

  // Get recent users
  async getRecentUsers(limit = 5) {
    try {
      const response = await fetch(`${this.baseURL}/users?limit=${limit}&sortBy=createdAt&sortOrder=desc`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch recent users');
      }

      return {
        success: true,
        data: data.data || []
      };
    } catch (error) {
      console.error('Get recent users error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch recent users'
      };
    }
  }

  // ==================== PRODUCTS ====================

  // Get all products (admin view)
  async getAllProducts(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      // Add pagination
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      
      // Add filters
      if (params.search) queryParams.append('search', params.search);
      if (params.category) queryParams.append('category', params.category);
      if (params.status) queryParams.append('isActive', params.status === 'active');
      if (params.featured) queryParams.append('isFeatured', params.featured === 'true');
      
      // Add sorting
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      
      // Remove isActive filter for admin view to show all products
      queryParams.append('admin', 'true');

      const response = await fetch(`${this.baseURL}/products?${queryParams}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch products');
      }

      return {
        success: true,
        data: data.data || [],
        pagination: data.pagination
      };
    } catch (error) {
      console.error('Get all products error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch products'
      };
    }
  }

  // Get single product
  async getProductById(id) {
    try {
      const response = await fetch(`${this.baseURL}/products/${id}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch product');
      }

      return {
        success: true,
        data: data.data
      };
    } catch (error) {
      console.error('Get product by ID error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch product'
      };
    }
  }

  // Create product
  async createProduct(productData) {
    try {
      const token = localStorage.getItem('fefa_access_token');
      
      if (!token) {
        return {
          success: false,
          error: 'Authentication required. Please log in again.',
          requiresAuth: true
        };
      }

      const response = await fetch(`${this.baseURL}/products`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(productData)
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle token expiration
        if (response.status === 401) {
          // Clear expired token
          localStorage.removeItem('fefa_access_token');
          localStorage.removeItem('fefa_refresh_token');
          localStorage.removeItem('fefa_user');
          
          return {
            success: false,
            error: 'Your session has expired. Please log in again.',
            requiresAuth: true
          };
        }
        
        throw new Error(data.message || data.error || 'Failed to create product');
      }

      return {
        success: true,
        data: data.data
      };
    } catch (error) {
      console.error('Create product error:', error);
      return {
        success: false,
        error: error.message || 'Failed to create product'
      };
    }
  }

  // Create product with image upload (FormData)
  async createProductWithImage(formData) {
    try {
      const token = localStorage.getItem('fefa_access_token');
      
      if (!token) {
        return {
          success: false,
          error: 'Authentication required. Please log in again.',
          requiresAuth: true
        };
      }

      const headers = {
        'Authorization': `Bearer ${token}`
        // Don't set Content-Type - browser will set it with boundary for FormData
      };

      const response = await fetch(`${this.baseURL}/products`, {
        method: 'POST',
        headers: headers,
        body: formData
      });

      // Handle network errors (CORS, connection issues, etc.)
      if (!response.ok && response.status === 0) {
        return {
          success: false,
          error: 'Network error: Unable to connect to server. Please check your connection and try again.',
          requiresAuth: false
        };
      }

      // Try to parse JSON response
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        // If response is not JSON, it's likely a network/CORS error
        return {
          success: false,
          error: `Server error (${response.status}): ${response.statusText}. Please check if CORS is configured correctly.`,
          requiresAuth: false
        };
      }

      if (!response.ok) {
        // Handle token expiration
        if (response.status === 401) {
          // Clear expired token
          localStorage.removeItem('fefa_access_token');
          localStorage.removeItem('fefa_refresh_token');
          localStorage.removeItem('fefa_user');
          
          return {
            success: false,
            error: 'Your session has expired. Please log in again.',
            requiresAuth: true
          };
        }

        // Handle 403 Forbidden (not admin)
        if (response.status === 403) {
          return {
            success: false,
            error: 'Access denied. Admin privileges required.',
            requiresAuth: false
          };
        }

        // Handle validation errors (400)
        if (response.status === 400) {
          return {
            success: false,
            error: data.message || data.error || 'Validation error. Please check your input.',
            requiresAuth: false
          };
        }
        
        throw new Error(data.message || data.error || `Failed to create product (${response.status})`);
      }

      return {
        success: true,
        data: data.data
      };
    } catch (error) {
      console.error('Create product with image error:', error);
      
      // Handle fetch errors (network, CORS, etc.)
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return {
          success: false,
          error: 'Network error: Unable to reach server. Please check your connection and CORS configuration.',
          requiresAuth: false
        };
      }
      
      return {
        success: false,
        error: error.message || 'Failed to create product'
      };
    }
  }

  // Update product
  async updateProduct(id, productData) {
    try {
      const headers = this.getAuthHeaders();
      headers['Content-Type'] = 'application/json';
      
      
      const response = await fetch(`${this.baseURL}/products/${id}`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(productData)
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Product update failed:', {
          status: response.status,
          statusText: response.statusText,
          data: data
        });
        
        throw new Error(data.message || `Failed to update product (${response.status})`);
      }

      return {
        success: true,
        data: data.data
      };
    } catch (error) {
      console.error('Product update error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update product'
      };
    }
  }

  // Add images to existing product
  async addProductImages(id, imageFiles) {
    try {
      const token = localStorage.getItem('fefa_access_token');
      
      if (!token) {
        return {
          success: false,
          error: 'Authentication required. Please log in again.',
          requiresAuth: true
        };
      }

      const formData = new FormData();
      imageFiles.forEach((file) => {
        formData.append('images', file);
      });

      const headers = {
        'Authorization': `Bearer ${token}`
      };

      const response = await fetch(`${this.baseURL}/products/${id}/images`, {
        method: 'POST',
        headers: headers,
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('fefa_access_token');
          localStorage.removeItem('fefa_refresh_token');
          localStorage.removeItem('fefa_user');
          
          return {
            success: false,
            error: 'Your session has expired. Please log in again.',
            requiresAuth: true
          };
        }
        
        throw new Error(data.message || data.error || 'Failed to add images');
      }

      return {
        success: true,
        data: data.data
      };
    } catch (error) {
      console.error('Add product images error:', error);
      return {
        success: false,
        error: error.message || 'Failed to add images'
      };
    }
  }

  // Delete product
  async deleteProduct(id) {
    try {
      const response = await fetch(`${this.baseURL}/products/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete product');
      }

      return {
        success: true,
        message: data.message || 'Product deleted successfully'
      };
    } catch (error) {
      console.error('Delete product error:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete product'
      };
    }
  }

  // ==================== CATEGORIES ====================

  // Get all categories (admin view)
  async getAllCategories(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      // Add pagination
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      
      // Add filters
      if (params.search) queryParams.append('search', params.search);
      if (params.status) queryParams.append('isActive', params.status === 'active');
      
      // Add sorting
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      
      // Remove isActive filter for admin view to show all categories
      queryParams.append('admin', 'true');

      const response = await fetch(`${this.baseURL}/categories?${queryParams}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch categories');
      }

      return {
        success: true,
        data: data.data || [],
        pagination: data.pagination
      };
    } catch (error) {
      console.error('Get all categories error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch categories'
      };
    }
  }

  // Get single category
  async getCategoryById(id) {
    try {
      const response = await fetch(`${this.baseURL}/categories/${id}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch category');
      }

      return {
        success: true,
        data: data.data
      };
    } catch (error) {
      console.error('Get category by ID error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch category'
      };
    }
  }

  // Create category (supports FormData for image upload)
  async createCategory(categoryData) {
    try {
      // Check if categoryData is FormData (for image upload) or regular object
      const isFormData = categoryData instanceof FormData;
      
      const headers = this.getAuthHeaders();
      
      // Remove Content-Type header for FormData (browser will set it with boundary)
      if (isFormData) {
        delete headers['Content-Type'];
      }

      const response = await fetch(`${this.baseURL}/categories`, {
        method: 'POST',
        headers: headers,
        body: isFormData ? categoryData : JSON.stringify(categoryData)
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
        throw new Error(data.message || 'Failed to create category');
      }

      return {
        success: true,
        data: data.data
      };
    } catch (error) {
      console.error('Create category error:', error);
      return {
        success: false,
        error: error.message || 'Failed to create category'
      };
    }
  }

  // Update category (supports FormData for image upload)
  async updateCategory(id, categoryData) {
    try {
      // Check if categoryData is FormData (for image upload) or regular object
      const isFormData = categoryData instanceof FormData;
      
      const headers = this.getAuthHeaders();
      
      // Remove Content-Type header for FormData (browser will set it with boundary)
      if (isFormData) {
        delete headers['Content-Type'];
      }

      const response = await fetch(`${this.baseURL}/categories/${id}`, {
        method: 'PUT',
        headers: headers,
        body: isFormData ? categoryData : JSON.stringify(categoryData)
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
        console.error('Category update failed:', {
          status: response.status,
          statusText: response.statusText,
          data: data
        });
        throw new Error(data.message || `Failed to update category (${response.status})`);
      }

      return {
        success: true,
        data: data.data
      };
    } catch (error) {
      console.error('Update category error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update category'
      };
    }
  }

  // Delete category
  async deleteCategory(id) {
    try {
      const response = await fetch(`${this.baseURL}/categories/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete category');
      }

      return {
        success: true,
        message: data.message || 'Category deleted successfully'
      };
    } catch (error) {
      console.error('Delete category error:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete category'
      };
    }
  }

  // ==================== USERS ====================

  // Get all users (admin view)
  async getAllUsers(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      // Add pagination
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      
      // Add filters
      if (params.search) queryParams.append('search', params.search);
      if (params.role) queryParams.append('role', params.role);
      if (params.status) queryParams.append('isActive', params.status === 'active');
      
      // Add sorting
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const response = await fetch(`${this.baseURL}/users?${queryParams}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch users');
      }

      return {
        success: true,
        data: data.data || [],
        pagination: data.pagination
      };
    } catch (error) {
      console.error('Get all users error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch users'
      };
    }
  }

  // Get single user
  async getUserById(id) {
    try {
      const response = await fetch(`${this.baseURL}/users/${id}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch user');
      }

      return {
        success: true,
        data: data.data
      };
    } catch (error) {
      console.error('Get user by ID error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch user'
      };
    }
  }

  // Create user (admin)
  async createUser(userData) {
    try {
      const token = localStorage.getItem('fefa_access_token');
      
      if (!token) {
        return {
          success: false,
          error: 'Authentication required. Please log in again.',
          requiresAuth: true
        };
      }

      // Try to create user via register endpoint with admin privileges
      // Note: This assumes the backend supports admin user creation
      // If backend doesn't support this, you may need to implement a POST /api/users endpoint
      const response = await fetch(`${this.baseURL}/auth/register-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone,
          role: userData.role || 'user'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle token expiration
        if (response.status === 401) {
          localStorage.removeItem('fefa_access_token');
          localStorage.removeItem('fefa_refresh_token');
          localStorage.removeItem('fefa_user');
          
          return {
            success: false,
            error: 'Your session has expired. Please log in again.',
            requiresAuth: true
          };
        }
        
        throw new Error(data.message || data.error || 'Failed to create user');
      }

      // If user was created, optionally update role and status if needed
      if (data.data && data.data.id) {
        const userId = data.data.id;
        
        // Update role and status if different from default
        if (userData.role !== 'user' || userData.isActive === false) {
          const updateResult = await this.updateUser(userId, {
            role: userData.role,
            isActive: userData.isActive !== false
          });
          
          if (!updateResult.success) {
            console.warn('User created but failed to update role/status:', updateResult.error);
          }
        }
      }

      return {
        success: true,
        data: data.data
      };
    } catch (error) {
      console.error('Create user error:', error);
      return {
        success: false,
        error: error.message || 'Failed to create user'
      };
    }
  }

  // Update user
  async updateUser(id, userData) {
    try {
      const response = await fetch(`${this.baseURL}/users/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('User update failed:', {
          status: response.status,
          statusText: response.statusText,
          data: data
        });
        throw new Error(data.message || `Failed to update user (${response.status})`);
      }

      return {
        success: true,
        data: data.data
      };
    } catch (error) {
      console.error('Update user error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update user'
      };
    }
  }

  // Delete user
  async deleteUser(id) {
    try {
      const response = await fetch(`${this.baseURL}/users/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete user');
      }

      return {
        success: true,
        message: data.message || 'User deleted successfully'
      };
    } catch (error) {
      console.error('Delete user error:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete user'
      };
    }
  }

  // ==================== ORDERS ====================

  // Get all orders (admin view)
  async getAllOrders(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      // Add pagination
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      
      // Add filters
      if (params.search) queryParams.append('search', params.search);
      if (params.status) queryParams.append('status', params.status);
      
      // Add sorting
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const response = await fetch(`${this.baseURL}/orders?${queryParams}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch orders');
      }

      return {
        success: true,
        data: data.data || [],
        pagination: data.pagination,
        totalRevenue: data.totalRevenue || 0
      };
    } catch (error) {
      console.error('Get all orders error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch orders'
      };
    }
  }

  // ==================== BANNERS ====================

  // Get all banners (admin view)
  async getAllBanners(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      // Add pagination
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      
      // Add filters
      if (params.search) queryParams.append('search', params.search);
      if (params.position) queryParams.append('position', params.position);
      if (params.status) queryParams.append('isActive', params.status === 'active');
      
      // Add sorting
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      
      // Remove isActive filter for admin view to show all banners
      queryParams.append('admin', 'true');

      const response = await fetch(`${this.baseURL}/banners?${queryParams}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch banners');
      }

      return {
        success: true,
        data: data.data || [],
        pagination: data.pagination,
        activeBanners: data.activeBanners || 0
      };
    } catch (error) {
      console.error('Get all banners error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch banners'
      };
    }
  }

  // ==================== HELPER METHODS ====================

  // Format product for display
  formatProductForDisplay(product) {
    // Get primary image or first image
    let primaryImage = '/images/placeholder.jpg';
    if (product.images && product.images.length > 0) {
      const primaryImg = product.images.find(img => img.isPrimary);
      primaryImage = primaryImg ? primaryImg.url : product.images[0].url;
    }

    return {
      ...product,
      id: product._id,
      status: product.isActive ? 'active' : 'inactive',
      featured: product.isFeatured || false,
      category: product.category?.name || 'Uncategorized',
      image: primaryImage,
      images: product.images || [], // Preserve full images array
      stock: product.inventory?.quantity || 0,
      rating: product.ratings?.average || 0,
      createdAt: new Date(product.createdAt).toLocaleDateString()
    };
  }

  // Format category for display
  formatCategoryForDisplay(category) {
    return {
      ...category,
      id: category._id,
      status: category.isActive ? 'active' : 'inactive',
      image: category.image || '/images/placeholder.jpg',
      productCount: category.productCount || 0,
      createdAt: new Date(category.createdAt).toLocaleDateString()
    };
  }

  // Format user for display
  formatUserForDisplay(user) {
    return {
      ...user,
      id: user._id,
      status: user.isActive ? 'active' : 'inactive',
      profileImage: user.profileImage || '/images/placeholder.jpg',
      orderCount: user.orderCount || 0, // This will be 0 since it's not in the User model
      totalSpent: user.totalSpent || 0, // This will be 0 since it's not in the User model
      createdAt: new Date(user.createdAt).toLocaleDateString(),
      lastLogin: user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'
    };
  }

  // Filter data based on search criteria
  filterData(data, filters) {
    const { searchTerm, ...otherFilters } = filters;
    
    return data.filter(item => {
      const matchesSearch = !searchTerm || 
        Object.values(item).some(value => 
          typeof value === 'string' && 
          value.toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      const matchesOtherFilters = Object.entries(otherFilters).every(([key, value]) => {
        if (value === 'All' || !value) return true;
        return item[key] === value || item[key]?.toString().toLowerCase() === value.toLowerCase();
      });
      
      return matchesSearch && matchesOtherFilters;
    });
  }

  // Sort data
  sortData(data, sortBy, sortOrder) {
    return data.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
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
const adminService = new AdminService();
export default adminService;
