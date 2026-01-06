class SettingsService {
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

  async getSettings() {
    try {
      const response = await fetch(`${this.baseURL}/settings`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch settings');
      }

      return {
        success: true,
        data: data.data
      };
    } catch (error) {
      console.error('Get settings error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch settings'
      };
    }
  }

  async updateSettings(settingsData) {
    try {
      const response = await fetch(`${this.baseURL}/settings`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(settingsData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update settings');
      }

      return {
        success: true,
        data: data.data,
        message: data.message || 'Settings updated successfully'
      };
    } catch (error) {
      console.error('Update settings error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update settings'
      };
    }
  }

  async sendTestEmail(email) {
    try {
      const response = await fetch(`${this.baseURL}/settings/test-email`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send test email');
      }

      return {
        success: true,
        message: data.message || 'Test email sent successfully'
      };
    } catch (error) {
      console.error('Send test email error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send test email'
      };
    }
  }
}

export default new SettingsService();
