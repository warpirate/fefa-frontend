// Review Service for FEFA Jewelry Frontend
import API_CONFIG, { API_HELPERS } from '@/config/api';

class ReviewService {
  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
    this.endpoints = API_CONFIG.ENDPOINTS;
  }

  // Get authorization headers
  getAuthHeaders() {
    const token = localStorage.getItem('fefa_access_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  }

  // Get reviews for a product
  async getProductReviews(productId, page = 1, limit = 10, rating = null) {
    try {
      let url = `${this.baseUrl}/reviews/product/${productId}?page=${page}&limit=${limit}`;
      if (rating) {
        url += `&rating=${rating}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch product reviews:', error);
      throw error;
    }
  }

  // Create a new review
  async createReview(reviewData) {
    try {
      const response = await fetch(`${this.baseUrl}/reviews`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(reviewData)
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to create review:', error);
      throw error;
    }
  }

  // Update a review
  async updateReview(reviewId, reviewData) {
    try {
      const response = await fetch(`${this.baseUrl}/reviews/${reviewId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(reviewData)
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to update review:', error);
      throw error;
    }
  }

  // Delete a review
  async deleteReview(reviewId) {
    try {
      const response = await fetch(`${this.baseUrl}/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to delete review:', error);
      throw error;
    }
  }

  // Mark review as helpful
  async markHelpful(reviewId) {
    try {
      const response = await fetch(`${this.baseUrl}/reviews/${reviewId}/helpful`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to mark review as helpful:', error);
      throw error;
    }
  }

  // Remove helpful mark from review
  async unmarkHelpful(reviewId) {
    try {
      const response = await fetch(`${this.baseUrl}/reviews/${reviewId}/helpful`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to remove helpful mark:', error);
      throw error;
    }
  }
}

const reviewService = new ReviewService();
export default reviewService;
