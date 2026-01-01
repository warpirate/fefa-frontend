// Authentication Service for FEFA Jewelry
// This service connects to the backend API for real authentication

class AuthService {
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  }

  // Helper method to generate mock user data
  generateMockUser(userData) {
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return {
      uid: userId,
      displayName: `${userData.firstName} ${userData.lastName}`,
      email: userData.email,
      phoneNumber: userData.phone,
      photoURL: null,
      role: 'user',
      isEmailVerified: false,
      createdAt: new Date().toISOString()
    };
  }

  // Helper method to generate mock tokens
  generateMockTokens() {
    const accessToken = `access_${Date.now()}_${Math.random().toString(36).substr(2, 20)}`;
    const refreshToken = `refresh_${Date.now()}_${Math.random().toString(36).substr(2, 20)}`;
    return { accessToken, refreshToken };
  }

  // Register a new user with email and password
  async register(userData) {
    try {
      const response = await fetch(`${this.baseURL}/auth/register-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      return data.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Login user with email and password
  async login(email, password) {
    try {
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      // Handle rate limiting (429) before trying to parse JSON
      if (response.status === 429) {
        let errorMessage = 'Too many authentication attempts, please try again later.';
        let retryAfter = '15 minutes';
        
        try {
          const data = await response.json();
          errorMessage = data.message || data.error || errorMessage;
          retryAfter = data.retryAfter || retryAfter;
        } catch (parseError) {
          // If JSON parsing fails, use default message
          console.warn('Failed to parse 429 error response:', parseError);
        }
        
        const error = new Error(errorMessage);
        error.status = 429;
        error.retryAfter = retryAfter;
        throw error;
      }

      // Parse response for other status codes
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(text || 'Login failed');
      }

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Login failed');
      }

      return data.data;
    } catch (error) {
      console.error('Login error:', error);
      // Re-throw the error to preserve the original error message and status
      throw error;
    }
  }

  // Get user profile from backend
  async getProfile(accessToken) {
    try {
      const response = await fetch(`${this.baseURL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get profile');
      }

      return data.data;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }

  // Update user profile
  async updateProfile(accessToken, updateData) {
    try {
      const response = await fetch(`${this.baseURL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      return data.data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  // Refresh access token (local storage only)
  async refreshToken(refreshToken) {
    // Generate new tokens
    const tokens = this.generateMockTokens();
    return { tokens, message: 'Token refreshed successfully' };
  }

  // Logout user
  async logout(accessToken, refreshToken) {
    try {
      const response = await fetch(`${this.baseURL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      // Clear tokens regardless of response
      this.clearTokens();
      
      if (response.ok) {
        const data = await response.json();
        return data;
      }
      
      return { message: 'Logout successful' };
    } catch (error) {
      console.error('Logout error:', error);
      // Clear tokens even if request fails
      this.clearTokens();
      return { message: 'Logout successful' };
    }
  }

  // Request password reset
  async requestPasswordReset(email) {
    try {
      const response = await fetch(`${this.baseURL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send password reset email');
      }

      return data;
    } catch (error) {
      console.error('Password reset request error:', error);
      throw error;
    }
  }

  // Reset password with token
  async resetPassword(token, newPassword) {
    try {
      const response = await fetch(`${this.baseURL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      return data;
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  }

  // Send email OTP
  async sendEmailOTP(email) {
    try {
      const response = await fetch(`${this.baseURL}/auth/send-email-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('Non-JSON response received:', textResponse);
        throw new Error(`Server returned non-JSON response: ${textResponse.substring(0, 100)}...`);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to send email OTP');
      }

      return data.data;
    } catch (error) {
      console.error('Send email OTP error:', error);
      throw error;
    }
  }

  // Verify email OTP
  async verifyEmailOTP(email, otp) {
    try {
      const response = await fetch(`${this.baseURL}/auth/verify-email-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('Non-JSON response received:', textResponse);
        throw new Error(`Server returned non-JSON response: ${textResponse.substring(0, 100)}...`);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Email OTP verification failed');
      }

      return data.data;
    } catch (error) {
      console.error('Verify email OTP error:', error);
      throw error;
    }
  }

  // Verify OTP with backend
  async verifyOTP(idToken, phone, email) {
    try {
      const response = await fetch(`${this.baseURL}/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken, phone, email }),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('Non-JSON response received:', textResponse);
        throw new Error(`Server returned non-JSON response: ${textResponse.substring(0, 100)}...`);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'OTP verification failed');
      }

      return data.data;
    } catch (error) {
      console.error('OTP verification error:', error);
      throw error;
    }
  }

  // Verify Firebase Google ID token with backend
  async verifyGoogleToken(idToken) {
    try {
      const response = await fetch(`${this.baseURL}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('Non-JSON response received:', textResponse);
        throw new Error(`Server returned non-JSON response: ${textResponse.substring(0, 100)}...`);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Google authentication failed');
      }

      return data.data;
    } catch (error) {
      console.error('Google authentication error:', error);
      throw error;
    }
  }

  // Get Google OAuth configuration (local storage only)
  async getGoogleConfig() {
    // Return mock config for demo purposes
    return {
      clientId: 'demo-client-id',
      message: 'Using local authentication only'
    };
  }

  // Store tokens in localStorage
  storeTokens(accessToken, refreshToken) {
    localStorage.setItem('fefa_access_token', accessToken);
    localStorage.setItem('fefa_refresh_token', refreshToken);
  }

  // Get stored tokens
  getStoredTokens() {
    return {
      accessToken: localStorage.getItem('fefa_access_token'),
      refreshToken: localStorage.getItem('fefa_refresh_token'),
    };
  }

  // Address management methods
  async addAddress(accessToken, addressData) {
    try {
      const response = await fetch(`${this.baseURL}/auth/addresses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(addressData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to add address');
      }

      return data.data;
    } catch (error) {
      console.error('Add address error:', error);
      throw error;
    }
  }

  async updateAddress(accessToken, addressId, addressData) {
    try {
      const response = await fetch(`${this.baseURL}/auth/addresses/${addressId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(addressData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update address');
      }

      return data.data;
    } catch (error) {
      console.error('Update address error:', error);
      throw error;
    }
  }

  async deleteAddress(accessToken, addressId) {
    try {
      const response = await fetch(`${this.baseURL}/auth/addresses/${addressId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete address');
      }

      return data;
    } catch (error) {
      console.error('Delete address error:', error);
      throw error;
    }
  }

  // Clear stored tokens
  clearTokens() {
    localStorage.removeItem('fefa_access_token');
    localStorage.removeItem('fefa_refresh_token');
    localStorage.removeItem('fefa_user');
  }

  // Check if user is authenticated
  isAuthenticated() {
    const { accessToken } = this.getStoredTokens();
    return !!accessToken;
  }

  // Get access token
  getAccessToken() {
    return localStorage.getItem('fefa_access_token');
  }

  // Get refresh token
  getRefreshToken() {
    return localStorage.getItem('fefa_refresh_token');
  }

  // Auto-refresh token when it's about to expire (local storage only)
  async autoRefreshToken() {
    const { refreshToken } = this.getStoredTokens();
    
    if (!refreshToken) {
      return null;
    }

    try {
      const response = await this.refreshToken(refreshToken);
      this.storeTokens(response.tokens.accessToken, response.tokens.refreshToken);
      return response.tokens.accessToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearTokens();
      return null;
    }
  }
}

// Create and export a singleton instance
const authService = new AuthService();
export default authService;
