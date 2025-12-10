// Wishlist Service for FEFA Jewelry Frontend
import API_CONFIG, { API_HELPERS } from '@/config/api';

class WishlistService {
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

  // Get user wishlist
  async getWishlist() {
    try {
      const response = await fetch(`${this.baseUrl}${this.endpoints.WISHLIST}`, {
        method: 'GET',
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
      console.error('Failed to fetch wishlist:', error);
      throw error;
    }
  }

  // Add item to wishlist
  async addToWishlist(productId, variantId = undefined, notes = undefined) {
    try {
      const response = await fetch(`${this.baseUrl}${this.endpoints.WISHLIST}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          productId,
          ...(variantId && { variantId }),
          ...(notes && { notes })
        })
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
      console.error('Failed to add to wishlist:', error);
      throw error;
    }
  }

  // Update wishlist item notes
  async updateWishlistItem(productId, notes) {
    try {
      const response = await fetch(`${this.baseUrl}${this.endpoints.WISHLIST}/${productId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ notes })
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
      console.error('Failed to update wishlist item:', error);
      throw error;
    }
  }

  // Remove item from wishlist
  async removeFromWishlist(productId) {
    try {
      const response = await fetch(`${this.baseUrl}${this.endpoints.WISHLIST}/${productId}`, {
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
      console.error('Failed to remove from wishlist:', error);
      throw error;
    }
  }

  // Clear entire wishlist
  async clearWishlist() {
    try {
      const response = await fetch(`${this.baseUrl}${this.endpoints.WISHLIST}`, {
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
      console.error('Failed to clear wishlist:', error);
      throw error;
    }
  }

  // Move item from wishlist to cart
  async moveToCart(productId, quantity = 1) {
    try {
      const response = await fetch(`${this.baseUrl}${this.endpoints.WISHLIST}/${productId}/move-to-cart`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ quantity })
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
      console.error('Failed to move to cart:', error);
      throw error;
    }
  }

  // Check if product is in wishlist
  async isInWishlist(productId) {
    try {
      const wishlistData = await this.getWishlist();
      if (wishlistData.success && wishlistData.data) {
        const wishlist = wishlistData.data;
        return wishlist.items.some(item => item.product._id === productId);
      }
      return false;
    } catch (error) {
      console.error('Failed to check wishlist status:', error);
      return false;
    }
  }

  // Get wishlist summary (for header display)
  async getWishlistSummary() {
    try {
      const wishlistData = await this.getWishlist();
      if (wishlistData.success && wishlistData.data) {
        const wishlist = wishlistData.data;
        return {
          itemCount: wishlist.items.length,
          items: wishlist.items
        };
      }
      return {
        itemCount: 0,
        items: []
      };
    } catch (error) {
      console.error('Failed to get wishlist summary:', error);
      return {
        itemCount: 0,
        items: []
      };
    }
  }
}

// Create and export singleton instance
const wishlistService = new WishlistService();
export default wishlistService;
