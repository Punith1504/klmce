import axios from 'axios';

// Initialize the global Axios instance configured for the Next.js App Router environment
const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
    withCredentials: true, // Critical: Enforces transmission of HttpOnly JWT & CSRF cookies
    headers: {
        'Content-Type': 'application/json'
    }
});

// ==========================================
// REQUEST INTERCEPTOR: CSRF Protection
// ==========================================
apiClient.interceptors.request.use((config) => {
    // Extracts the CSRF token from browser cookies and attaches it to mutating requests
    if (typeof document !== 'undefined') {
        const csrfToken = document.cookie
            .split('; ')
            .find(row => row.startsWith('csrf_token='))
            ?.split('=')[1];
            
        if (csrfToken && config.headers) {
            config.headers['X-CSRF-Token'] = csrfToken;
        }
    }
    return config;
}, (error) => Promise.reject(error));

// ==========================================
// RESPONSE INTERCEPTOR: Silent JWT Refresh
// ==========================================
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        // Intercept 401 Unauthorized responses (Access Token Expired)
        // Ensure we don't get stuck in an infinite retry loop
        if (error.response?.status === 401 && !originalRequest._isRetry) {
            originalRequest._isRetry = true;
            
            try {
                // Fire a silent background request to the FastAPI refresh endpoint.
                // The browser will automatically send the HttpOnly Refresh Token cookie.
                await axios.post(
                    `${apiClient.defaults.baseURL}/auth/refresh`, 
                    {}, 
                    { withCredentials: true }
                );
                
                // If successful, the backend rotates the Access Token cookie.
                // Re-fire the original failed request seamlessly.
                return apiClient(originalRequest);
                
            } catch (refreshError) {
                // If the refresh token itself is expired or invalid, the session is entirely dead.
                // Force a hard redirect back to the 2FA login screen.
                if (typeof window !== 'undefined') {
                    window.location.href = '/login?expired=true';
                }
                return Promise.reject(refreshError);
            }
        }
        
        return Promise.reject(error);
    }
);

export default apiClient;
