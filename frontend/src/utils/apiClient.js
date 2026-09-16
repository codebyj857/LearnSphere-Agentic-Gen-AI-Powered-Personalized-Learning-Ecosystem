// Bulletproof API Client with retry logic and error handling

class ApiClient {
  constructor(baseURL = '', maxRetries = 2) {
    this.baseURL = baseURL;
    this.maxRetries = maxRetries;
    this.retryDelay = 1000; // 1 second base delay
  }

  // Sleep function for retry delays
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Exponential backoff retry logic
  async retryWithBackoff(fn, retries = this.maxRetries) {
    try {
      return await fn();
    } catch (error) {
      if (retries === 0 || !this.shouldRetry(error)) {
        throw error;
      }

      const delay = this.retryDelay * Math.pow(2, this.maxRetries - retries);
      console.warn(`API request failed, retrying in ${delay}ms... (${this.maxRetries - retries + 1}/${this.maxRetries})`);
      
      await this.sleep(delay);
      return this.retryWithBackoff(fn, retries - 1);
    }
  }

  // Determine if error should be retried
  shouldRetry(error) {
    // Retry on network errors, 5xx server errors, and 429 rate limiting
    if (error.name === 'TypeError' || error.code === 'NETWORK_ERROR') {
      return true; // Network error
    }
    
    if (error.response) {
      const status = error.response.status;
      return status >= 500 || status === 429; // Server errors or rate limiting
    }
    
    return false;
  }

  // Make HTTP request with retry logic
  async request(endpoint, options = {}) {
    const url = this.baseURL ? `${this.baseURL}${endpoint}` : endpoint;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers
      },
      ...options
    };

    const makeRequest = async () => {
      const response = await fetch(url, config);
      let responseData = null;
      let responseText = null;
      
      // Read response body once
      try {
        responseText = await response.text();
        if (responseText) {
          responseData = JSON.parse(responseText);
        }
      } catch (e) {
        responseData = { data: responseText };
      }
      
      // Handle non-2xx responses
      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
        error.response = response;
        error.status = response.status;
        error.data = responseData || responseText;
        throw error;
      }

      // Return parsed response
      return responseData || { data: responseText };
    };

    try {
      return await this.retryWithBackoff(makeRequest);
    } catch (error) {
      // Final error after all retries
      console.error('API request failed after retries:', error);
      
      // Return standardized error response
      return {
        error: true,
        message: this.getErrorMessage(error),
        status: error.status || 500,
        details: error.data || error.message
      };
    }
  }

  // Get user-friendly error message
  getErrorMessage(error) {
    if (error.name === 'TypeError' || error.code === 'NETWORK_ERROR') {
      return 'Network connection failed. Please check your internet connection.';
    }
    
    if (error.status === 404) {
      return 'The requested resource was not found.';
    }
    
    if (error.status === 429) {
      return 'Too many requests. Please try again later.';
    }
    
    if (error.status >= 500) {
      return 'Server error. Please try again later.';
    }
    
    return error.message || 'An unexpected error occurred.';
  }

  // HTTP methods
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // Health check
  async healthCheck() {
    return this.get('/');
  }

  // User Feedback endpoints
  async getFeedbacks() {
    return this.get('/api/user-feedbacks');
  }

  async addFeedback(feedbackData) {
    return this.post('/api/user-feedback', feedbackData);
  }

  async getFeedbackStats() {
    return this.get('/api/user-feedback-stats');
  }

  async loadSampleData() {
    return this.post('/load-sample-data');
  }

  // Chat endpoint
  async chat(message) {
    return this.post('/api/chat', { message });
  }

  // Auth endpoints
  async login(credentials) {
    return this.post('/api/auth/login', credentials);
  }

  async register(userData) {
    return this.post('/api/auth/register', userData);
  }
}

// Create singleton instance
const apiClient = new ApiClient();

export default apiClient;
