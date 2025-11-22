/**
 * MediaForge API Client
 * Handles all communication with the MediaForge backend server
 */

class MediaForgeAPI {
    constructor(baseUrl = 'http://localhost:5000') {
        this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    }

    setBaseUrl(url) {
        this.baseUrl = url.replace(/\/$/, '');
        localStorage.setItem('mediaforge_api_url', this.baseUrl);
    }

    getBaseUrl() {
        return this.baseUrl;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;

        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const config = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers,
            },
        };

        try {
            const response = await fetch(url, config);

            if (!response.ok) {
                const error = await response.json().catch(() => ({ detail: 'Request failed' }));
                throw new Error(error.detail || `HTTP ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Cannot connect to server. Check if MediaForge is running.');
            }
            throw error;
        }
    }

    // Health check
    async checkConnection() {
        try {
            const data = await this.request('/health');
            return { connected: true, data };
        } catch (error) {
            return { connected: false, error: error.message };
        }
    }

    // Media info extraction
    async getVideoInfo(url) {
        return this.request('/api/v1/media/info', {
            method: 'POST',
            body: JSON.stringify({ url }),
        });
    }

    // Downloads
    async createDownload(data) {
        return this.request('/api/v1/downloads', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async listDownloads(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `/api/v1/downloads?${queryString}` : '/api/v1/downloads';
        return this.request(endpoint);
    }

    async getDownload(id) {
        return this.request(`/api/v1/downloads/${id}`);
    }

    async deleteDownload(id) {
        return this.request(`/api/v1/downloads/${id}`, {
            method: 'DELETE',
        });
    }

    async retryDownload(id) {
        return this.request(`/api/v1/downloads/${id}/retry`, {
            method: 'POST',
        });
    }

    // Files
    async listDownloadedFiles(search = '') {
        const params = search ? `?search=${encodeURIComponent(search)}` : '';
        return this.request(`/api/v1/files/downloads${params}`);
    }

    async listTrimmedFiles(search = '') {
        const params = search ? `?search=${encodeURIComponent(search)}` : '';
        return this.request(`/api/v1/files/trimmed${params}`);
    }

    async listCompressedFiles(search = '') {
        const params = search ? `?search=${encodeURIComponent(search)}` : '';
        return this.request(`/api/v1/files/compressed${params}`);
    }

    async deleteDownloadedFile(filename) {
        return this.request(`/api/v1/files/downloads/${encodeURIComponent(filename)}`, {
            method: 'DELETE',
        });
    }

    async deleteTrimmedFile(filename) {
        return this.request(`/api/v1/files/trimmed/${encodeURIComponent(filename)}`, {
            method: 'DELETE',
        });
    }

    async deleteCompressedFile(filename) {
        return this.request(`/api/v1/files/compressed/${encodeURIComponent(filename)}`, {
            method: 'DELETE',
        });
    }

    // File URLs (for display/download)
    getDownloadedFileUrl(filename) {
        return `${this.baseUrl}/api/v1/files/downloads/${encodeURIComponent(filename)}`;
    }

    getTrimmedFileUrl(filename) {
        return `${this.baseUrl}/api/v1/files/trimmed/${encodeURIComponent(filename)}`;
    }

    getCompressedFileUrl(filename) {
        return `${this.baseUrl}/api/v1/files/compressed/${encodeURIComponent(filename)}`;
    }

    // Trim
    async trimVideo(data) {
        return this.request('/api/v1/downloads/trim', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // Compress
    async compressVideo(data) {
        return this.request('/api/v1/downloads/compress', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // Jobs
    async getJobStatus(jobId) {
        return this.request(`/api/v1/jobs/${jobId}`);
    }

    // Settings
    async getSettings() {
        return this.request('/api/v1/settings');
    }

    async updateSettings(settings) {
        return this.request('/api/v1/settings', {
            method: 'POST',
            body: JSON.stringify(settings),
        });
    }

    async resetSettings() {
        return this.request('/api/v1/settings/reset', {
            method: 'POST',
        });
    }
}

// Create global API instance
const savedUrl = localStorage.getItem('mediaforge_api_url') || 'http://localhost:5000';
window.api = new MediaForgeAPI(savedUrl);
