class AnalyticsService {
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  }

  getAuthHeaders() {
    const token = localStorage.getItem('fefa_access_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  async getOverview() {
    try {
      const response = await fetch(`${this.baseURL}/analytics/overview`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch overview analytics');
      }

      return {
        success: true,
        data: data.data
      };
    } catch (error) {
      console.error('Get overview analytics error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch overview analytics'
      };
    }
  }

  async getRevenue(period = 'month') {
    try {
      const response = await fetch(`${this.baseURL}/analytics/revenue?period=${period}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch revenue analytics');
      }

      return {
        success: true,
        data: data.data
      };
    } catch (error) {
      console.error('Get revenue analytics error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch revenue analytics'
      };
    }
  }

  async getTopProducts(limit = 10) {
    try {
      const response = await fetch(`${this.baseURL}/analytics/top-products?limit=${limit}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch top products');
      }

      return {
        success: true,
        data: data.data
      };
    } catch (error) {
      console.error('Get top products error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch top products'
      };
    }
  }

  async getCustomers() {
    try {
      const response = await fetch(`${this.baseURL}/analytics/customers`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch customer analytics');
      }

      return {
        success: true,
        data: data.data
      };
    } catch (error) {
      console.error('Get customer analytics error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch customer analytics'
      };
    }
  }

  async getConversion() {
    try {
      const response = await fetch(`${this.baseURL}/analytics/conversion`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch conversion analytics');
      }

      return {
        success: true,
        data: data.data
      };
    } catch (error) {
      console.error('Get conversion analytics error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch conversion analytics'
      };
    }
  }
}

export default new AnalyticsService();
