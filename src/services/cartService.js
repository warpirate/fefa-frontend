// Cart Service for FEFA Jewelry Frontend
import API_CONFIG, { API_HELPERS } from '@/config/api';

class CartService {
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

  // Get user cart
  async getCart() {
    try {
      const response = await fetch(`${this.baseUrl}${this.endpoints.CART}`, {
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
      // Error('Failed to fetch cart:', error);
      throw error;
    }
  }

  // Add item to cart
  async addToCart(productId, quantity = 1, variantId = undefined) {
    try {
      const response = await fetch(`${this.baseUrl}${this.endpoints.CART}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          productId,
          quantity,
          ...(variantId && { variantId })
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
      // Error('Failed to add to cart:', error);
      throw error;
    }
  }

  // Update cart item quantity
  async updateCartItem(productId, quantity) {
    try {
      const response = await fetch(`${this.baseUrl}${this.endpoints.CART}/${productId}`, {
        method: 'PUT',
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
      // Error('Failed to update cart item:', error);
      throw error;
    }
  }

  // Remove item from cart
  async removeFromCart(productId) {
    try {
      const response = await fetch(`${this.baseUrl}${this.endpoints.CART}/${productId}`, {
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
      // Error('Failed to remove from cart:', error);
      throw error;
    }
  }

  // Clear entire cart
  async clearCart() {
    try {
      const response = await fetch(`${this.baseUrl}${this.endpoints.CART}`, {
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
      // Error('Failed to clear cart:', error);
      throw error;
    }
  }

  // Get cart summary (for header display)
  async getCartSummary() {
    try {
      const cartData = await this.getCart();
      if (cartData.success && cartData.data) {
        const cart = cartData.data;
        return {
          itemCount: cart.items.length,
          totalQuantity: cart.items.reduce((sum, item) => sum + item.quantity, 0),
          subtotal: cart.subtotal,
          total: cart.total,
          currency: cart.currency
        };
      }
      return {
        itemCount: 0,
        totalQuantity: 0,
        subtotal: 0,
        total: 0,
        currency: 'INR'
      };
    } catch (error) {
      // Error('Failed to get cart summary:', error);
      return {
        itemCount: 0,
        totalQuantity: 0,
        subtotal: 0,
        total: 0,
        currency: 'INR'
      };
    }
  }
}

// Create and export singleton instance
const cartService = new CartService();
export default cartService;
