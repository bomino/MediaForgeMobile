/**
 * MediaForge Mobile App
 * Main Alpine.js application
 */

function app() {
    return {
        // Navigation
        currentPage: 'home',

        // Connection state
        online: navigator.onLine,
        connected: false,
        apiUrl: window.api.getBaseUrl(),

        // Theme
        darkMode: localStorage.getItem('darkMode') === 'true',

        // PWA Install
        installPrompt: null,

        // Home page state
        downloadUrl: '',
        videoInfo: null,
        fetchingInfo: false,
        selectedFormat: 'mp4',
        selectedQuality: 'best',
        downloading: false,
        downloadProgress: 0,
        currentDownloadId: null,

        // Batch downloads
        batchMode: false,
        batchUrls: '',
        batchLoading: false,
        activeDownloads: [],

        // File lists
        downloads: [],
        trimmedFiles: [],
        compressedFiles: [],

        // Search filters
        searchDownloads: '',
        searchTrimmed: '',
        searchCompressed: '',

        // Trim modal
        showTrimModal: false,
        trimFile: null,
        trimming: false,
        trimOptions: {
            start_time: '00:00:00',
            duration: 30,
            output_format: 'mp4'
        },

        // Compress modal
        showCompressModal: false,
        compressFile: null,
        compressing: false,
        compressOptions: {
            preset: 'medium',
            crf: 28,
            resolution: '',
            codec: 'libx264',
            audio_bitrate: '128k'
        },

        // WebSocket
        ws: null,

        // Server settings (synced with MediaForge server)
        serverSettings: {
            default_format: 'mp4',
            default_quality: 'best',
            default_mode: 'video',
            quality_fallback: 'best_available',
            theme: 'system',
            show_thumbnails: true,
            auto_clear_completed: 0,
            max_concurrent_downloads: 2,
            download_subtitles: false,
            embed_thumbnail: false,
            available_formats: ['mp4', 'webm', 'mkv', 'mp3', 'aac', 'wav', 'flac', 'ogg', 'opus'],
            available_qualities: ['best', '2160p', '1080p', '720p', '480p', '360p', 'worst'],
            extra_ytdlp_args: ''
        },
        settingsDirty: false,

        // Computed: batch URL count
        get batchUrlCount() {
            if (!this.batchUrls.trim()) return 0;
            return this.batchUrls.split('\n').filter(url => url.trim()).length;
        },

        // Initialize
        async init() {
            // Set up online/offline listeners
            window.addEventListener('online', () => {
                this.online = true;
                this.checkConnection();
            });
            window.addEventListener('offline', () => {
                this.online = false;
                this.connected = false;
            });

            // Listen for PWA install prompt
            window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                this.installPrompt = e;
            });

            // Check server connection
            await this.checkConnection();

            // Initialize icons
            this.$nextTick(() => lucide.createIcons());

            // Load initial data and connect WebSocket
            if (this.connected) {
                this.loadDownloads();
                this.loadServerSettings();
                this.connectWebSocket();
            }
        },

        // Navigation
        navigate(page) {
            this.currentPage = page;
            this.$nextTick(() => lucide.createIcons());

            // Load data for the page
            if (page === 'downloads') this.loadDownloads();
            if (page === 'trimmed') this.loadTrimmed();
            if (page === 'compressed') this.loadCompressed();
            if (page === 'settings' && this.connected) this.loadServerSettings();
        },

        // Theme
        toggleDarkMode() {
            this.darkMode = !this.darkMode;
            localStorage.setItem('darkMode', this.darkMode);
        },

        setDarkMode(value) {
            this.darkMode = value;
            localStorage.setItem('darkMode', this.darkMode);
        },

        // Connection
        async checkConnection() {
            const result = await window.api.checkConnection();
            this.connected = result.connected;
            return result.connected;
        },

        // Local Settings (mobile app specific - stored in localStorage)
        saveLocalSettings() {
            window.api.setBaseUrl(this.apiUrl);
            this.checkConnection();
            this.showToast('Server URL saved', 'success');
        },

        // Server Settings (synced with MediaForge server)
        async loadServerSettings() {
            try {
                const settings = await window.api.getSettings();
                if (settings) {
                    this.serverSettings = { ...this.serverSettings, ...settings };
                    this.settingsDirty = false;
                    // Apply theme from server settings
                    this.applyTheme();
                    this.$nextTick(() => lucide.createIcons());
                }
            } catch (error) {
                console.error('Failed to load server settings:', error);
            }
        },

        markSettingsDirty() {
            this.settingsDirty = true;
        },

        async saveServerSettings() {
            try {
                const settings = await window.api.updateSettings(this.serverSettings);
                if (settings) {
                    this.serverSettings = { ...this.serverSettings, ...settings };
                }
                this.settingsDirty = false;
                this.showToast('Settings saved', 'success');
            } catch (error) {
                this.showToast('Failed to save settings', 'error');
            }
        },

        async resetServerSettings() {
            if (!confirm('Reset all settings to defaults?')) return;

            try {
                const settings = await window.api.resetSettings();
                if (settings) {
                    this.serverSettings = { ...this.serverSettings, ...settings };
                }
                this.settingsDirty = false;
                this.applyTheme();
                this.showToast('Settings reset to defaults', 'success');
                this.$nextTick(() => lucide.createIcons());
            } catch (error) {
                this.showToast('Failed to reset settings', 'error');
            }
        },

        applyTheme() {
            const theme = this.serverSettings.theme;
            if (theme === 'dark') {
                this.darkMode = true;
            } else if (theme === 'light') {
                this.darkMode = false;
            } else {
                // System preference
                this.darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
            }
            localStorage.setItem('darkMode', this.darkMode);
        },

        // PWA Install
        async installPWA() {
            if (!this.installPrompt) return;

            this.installPrompt.prompt();
            const { outcome } = await this.installPrompt.userChoice;

            if (outcome === 'accepted') {
                this.showToast('App installed!', 'success');
            }
            this.installPrompt = null;
        },

        // Video Info
        async fetchVideoInfo() {
            if (!this.downloadUrl) return;

            this.fetchingInfo = true;
            this.videoInfo = null;

            try {
                const data = await window.api.getVideoInfo(this.downloadUrl);
                this.videoInfo = data;
                this.$nextTick(() => lucide.createIcons());
            } catch (error) {
                this.showToast(error.message, 'error');
            } finally {
                this.fetchingInfo = false;
            }
        },

        // Start Download
        async startDownload() {
            if (!this.videoInfo) return;

            this.downloading = true;
            this.downloadProgress = 0;

            try {
                const data = await window.api.createDownload({
                    url: this.downloadUrl,
                    format: this.selectedFormat,
                    quality: this.selectedQuality,
                });

                this.currentDownloadId = data.id;
                this.showToast('Download started', 'info');

                // Poll for progress
                this.pollDownloadProgress();
            } catch (error) {
                this.showToast(error.message, 'error');
                this.downloading = false;
            }
        },

        async pollDownloadProgress() {
            if (!this.currentDownloadId) return;

            try {
                const download = await window.api.getDownload(this.currentDownloadId);
                this.downloadProgress = download.progress || 0;

                if (download.status === 'completed') {
                    this.showToast('Download completed!', 'success');
                    this.downloading = false;
                    this.downloadProgress = 0;
                    this.videoInfo = null;
                    this.downloadUrl = '';
                    this.currentDownloadId = null;
                } else if (download.status === 'failed') {
                    this.showToast(download.error_message || 'Download failed', 'error');
                    this.downloading = false;
                    this.downloadProgress = 0;
                    this.currentDownloadId = null;
                } else {
                    // Still in progress
                    setTimeout(() => this.pollDownloadProgress(), 1000);
                }
            } catch (error) {
                console.error('Error polling download:', error);
                setTimeout(() => this.pollDownloadProgress(), 2000);
            }
        },

        // Load files with search
        async loadDownloads() {
            try {
                const data = await window.api.listDownloadedFiles(this.searchDownloads);
                this.downloads = data.items || [];
                this.$nextTick(() => lucide.createIcons());
            } catch (error) {
                console.error('Error loading downloads:', error);
            }
        },

        async loadTrimmed() {
            try {
                const data = await window.api.listTrimmedFiles(this.searchTrimmed);
                this.trimmedFiles = data.items || [];
                this.$nextTick(() => lucide.createIcons());
            } catch (error) {
                console.error('Error loading trimmed files:', error);
            }
        },

        async loadCompressed() {
            try {
                const data = await window.api.listCompressedFiles(this.searchCompressed);
                this.compressedFiles = data.items || [];
                this.$nextTick(() => lucide.createIcons());
            } catch (error) {
                console.error('Error loading compressed files:', error);
            }
        },

        // Delete files
        async deleteDownloadedFile(filename) {
            if (!confirm(`Delete "${filename}"?`)) return;
            try {
                await window.api.deleteDownloadedFile(filename);
                this.showToast('File deleted', 'success');
                this.loadDownloads();
            } catch (error) {
                this.showToast('Failed to delete file', 'error');
            }
        },

        async deleteTrimmedFile(filename) {
            if (!confirm(`Delete "${filename}"?`)) return;
            try {
                await window.api.deleteTrimmedFile(filename);
                this.showToast('File deleted', 'success');
                this.loadTrimmed();
            } catch (error) {
                this.showToast('Failed to delete file', 'error');
            }
        },

        async deleteCompressedFile(filename) {
            if (!confirm(`Delete "${filename}"?`)) return;
            try {
                await window.api.deleteCompressedFile(filename);
                this.showToast('File deleted', 'success');
                this.loadCompressed();
            } catch (error) {
                this.showToast('Failed to delete file', 'error');
            }
        },

        // Batch downloads
        async startBatchDownload() {
            const urls = this.batchUrls.split('\n').map(u => u.trim()).filter(u => u);
            if (urls.length === 0) return;

            this.batchLoading = true;

            try {
                // Start downloads one by one and track them
                for (const url of urls) {
                    const data = await window.api.createDownload({
                        url: url,
                        format: this.selectedFormat,
                        quality: this.selectedQuality,
                    });

                    this.activeDownloads.push({
                        id: data.id,
                        title: `Download ${this.activeDownloads.length + 1}`,
                        progress: 0,
                        speed: '',
                        eta: ''
                    });
                }

                this.showToast(`Started ${urls.length} downloads`, 'success');
                this.batchUrls = '';

                // Start polling for all active downloads
                this.pollActiveDownloads();
            } catch (error) {
                this.showToast(error.message, 'error');
            } finally {
                this.batchLoading = false;
            }
        },

        async pollActiveDownloads() {
            if (this.activeDownloads.length === 0) return;

            for (const dl of this.activeDownloads) {
                try {
                    const data = await window.api.getDownload(dl.id);
                    dl.progress = data.progress || 0;
                    dl.title = data.title || dl.title;
                    dl.speed = data.speed || '';
                    dl.eta = data.eta || '';

                    if (data.status === 'completed') {
                        this.showToast(`Downloaded: ${dl.title}`, 'success');
                        this.activeDownloads = this.activeDownloads.filter(d => d.id !== dl.id);
                        this.loadDownloads();
                    } else if (data.status === 'failed') {
                        this.showToast(`Failed: ${data.error_message || 'Unknown error'}`, 'error');
                        this.activeDownloads = this.activeDownloads.filter(d => d.id !== dl.id);
                    }
                } catch (error) {
                    console.error('Error polling download:', error);
                }
            }

            if (this.activeDownloads.length > 0) {
                setTimeout(() => this.pollActiveDownloads(), 1000);
            }
        },

        // Trim modal
        openTrimModal(file) {
            this.trimFile = file;
            this.trimOptions = {
                start_time: '00:00:00',
                duration: 30,
                output_format: 'mp4'
            };
            this.showTrimModal = true;
            this.$nextTick(() => lucide.createIcons());
        },

        async submitTrim() {
            if (!this.trimFile) return;

            this.trimming = true;

            try {
                await window.api.trimVideo({
                    filename: this.trimFile.name,
                    start_time: this.trimOptions.start_time,
                    duration: parseInt(this.trimOptions.duration),
                    output_format: this.trimOptions.output_format
                });

                this.showToast('Trim job started', 'success');
                this.showTrimModal = false;

                // Poll for completion
                setTimeout(() => this.loadTrimmed(), 3000);
            } catch (error) {
                this.showToast(error.message || 'Failed to start trim', 'error');
            } finally {
                this.trimming = false;
            }
        },

        // Compress modal
        openCompressModal(file) {
            this.compressFile = file;
            this.compressOptions = {
                preset: 'medium',
                crf: 28,
                resolution: '',
                codec: 'libx264',
                audio_bitrate: '128k'
            };
            this.showCompressModal = true;
            this.$nextTick(() => lucide.createIcons());
        },

        async submitCompress() {
            if (!this.compressFile) return;

            this.compressing = true;

            // Determine CRF based on preset
            let crf = this.compressOptions.crf;
            if (this.compressOptions.preset === 'high') crf = 23;
            else if (this.compressOptions.preset === 'medium') crf = 28;
            else if (this.compressOptions.preset === 'low') crf = 32;

            try {
                await window.api.compressVideo({
                    filename: this.compressFile.name,
                    crf: crf,
                    resolution: this.compressOptions.resolution || null,
                    codec: this.compressOptions.codec,
                    audio_bitrate: this.compressOptions.audio_bitrate
                });

                this.showToast('Compression job started', 'success');
                this.showCompressModal = false;

                // Poll for completion
                setTimeout(() => this.loadCompressed(), 5000);
            } catch (error) {
                this.showToast(error.message || 'Failed to start compression', 'error');
            } finally {
                this.compressing = false;
            }
        },

        // WebSocket connection
        connectWebSocket() {
            const wsProtocol = this.apiUrl.startsWith('https') ? 'wss:' : 'ws:';
            const wsUrl = this.apiUrl.replace(/^https?:/, wsProtocol) + '/ws';

            try {
                this.ws = new WebSocket(wsUrl);

                this.ws.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    this.handleWebSocketMessage(data);
                };

                this.ws.onclose = () => {
                    // Reconnect after 3 seconds
                    setTimeout(() => {
                        if (this.connected) this.connectWebSocket();
                    }, 3000);
                };

                this.ws.onerror = (error) => {
                    console.error('WebSocket error:', error);
                };
            } catch (error) {
                console.error('Failed to connect WebSocket:', error);
            }
        },

        handleWebSocketMessage(data) {
            // Handle download progress updates
            if (data.type === 'download_progress' || data.type === 'progress') {
                const downloadId = data.download_id || data.job_id;
                const download = this.activeDownloads.find(d => d.id === downloadId);
                if (download) {
                    download.progress = data.progress || 0;
                    download.speed = data.speed || '';
                    download.eta = data.eta || '';
                }

                // Also update legacy single download
                if (this.currentDownloadId === downloadId) {
                    this.downloadProgress = data.progress || 0;
                }
            }

            // Handle status updates
            if (data.type === 'download_status' || data.type === 'completed' || data.type === 'error') {
                const downloadId = data.download_id || data.job_id;
                const download = this.activeDownloads.find(d => d.id === downloadId);

                if (download) {
                    if (data.title) download.title = data.title;

                    if (data.status === 'completed' || data.type === 'completed') {
                        download.progress = 100;
                        this.showToast(`Downloaded: ${download.title}`, 'success');
                        setTimeout(() => {
                            this.activeDownloads = this.activeDownloads.filter(d => d.id !== downloadId);
                            this.loadDownloads();
                        }, 1500);
                    } else if (data.status === 'failed' || data.type === 'error') {
                        this.showToast(`Failed: ${data.error || 'Unknown error'}`, 'error');
                        setTimeout(() => {
                            this.activeDownloads = this.activeDownloads.filter(d => d.id !== downloadId);
                        }, 3000);
                    }
                }
            }
        },

        // Toast notifications
        showToast(message, type = 'info') {
            window.dispatchEvent(new CustomEvent('show-toast', {
                detail: { message, type }
            }));
        }
    };
}

// Helper function for global toast
function showToast(message, type = 'info') {
    window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message, type }
    }));
}
