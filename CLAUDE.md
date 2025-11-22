# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MediaForge Mobile is a PWA/Capacitor app that serves as a mobile client for the MediaForge video toolkit server. It provides a native-like experience for downloading, trimming, compressing, and managing videos from YouTube, TikTok, Twitter/X, Facebook, and Instagram.

## Development Commands

### Node.js Development
```bash
# Install dependencies
npm install

# Start development server (serves on port 3000)
npm run dev

# Build for production (copies to dist/)
npm run build
```

### Python Development (Alternative)
```bash
# Create and activate virtual environment (optional)
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac

# Start development server
python serve.py
```

### Capacitor Commands
```bash
npm run cap:sync          # Sync web assets to native projects
npm run cap:open:android  # Open Android project in Android Studio
npm run cap:open:ios      # Open iOS project in Xcode
```

## Architecture

### Tech Stack
- **Frontend**: Alpine.js 3.x (reactive state), Tailwind CSS 3.x (styling), Lucide Icons
- **PWA**: Service Worker for offline caching, Web App Manifest
- **Native**: Capacitor 5.x for iOS/Android builds
- **Backend**: Connects to remote MediaForge FastAPI server

### Key Files
- `src/index.html` - Main app shell, single-page application with all UI components
- `src/js/app.js` - Alpine.js application logic, state management, WebSocket handler
- `src/js/api.js` - MediaForge API client class
- `src/sw.js` - Service worker for offline caching
- `public/manifest.json` - PWA manifest
- `capacitor.config.ts` - Native app configuration
- `serve.py` - Python development server (alternative to Node.js)

## Features

### Download Features
- **Single URL Download**: Paste URL, select format/quality, download
- **Batch Downloads**: Multiple URLs (one per line), concurrent processing
- **Active Downloads Panel**: Real-time progress, speed, ETA display
- **Format Selection**: MP4, WebM, MKV, MP3, AAC, WAV, FLAC, OGG, Opus
- **Quality Options**: Best, 2160p, 1080p, 720p, 480p, 360p

### Video Processing
- **Trim Modal**: Cut clips with start time (HH:MM:SS) and duration
- **Compress Modal**: Quality presets (High/Medium/Low/Custom CRF), resolution scaling, codec selection (H.264/H.265), audio bitrate control

### File Management
- **Search/Filter**: Debounced search across all file categories
- **File Actions**: Download, Delete with confirmation
- **Quick Actions**: Trim or Compress directly from file cards
- **Categories**: Downloads, Trimmed, Compressed (separate pages)

### Real-time Updates
- **WebSocket Connection**: Live progress updates from server
- **Auto-reconnect**: Reconnects on disconnect with exponential backoff
- **Fallback Polling**: Falls back to REST polling if WebSocket unavailable

### User Experience
- **Dark/Light Theme**: System preference detection or manual toggle
- **Offline Support**: Service Worker caching for UI
- **PWA Installable**: Add to home screen on mobile
- **Responsive Design**: Mobile-first, works on all screen sizes

## State Management

All state is managed in the Alpine.js `app()` function in `src/js/app.js`:

### Core State
```javascript
currentPage: 'home',           // Navigation state
connected: false,              // Server connection status
serverUrl: '',                 // MediaForge server URL
```

### Download State
```javascript
url: '',                       // Single URL input
format: 'mp4',                 // Selected format
quality: 'best',               // Selected quality
batchMode: false,              // Single vs batch mode
batchUrls: '',                 // Batch URL textarea content
activeDownloads: [],           // Array of in-progress downloads
downloadProgress: {},          // Progress data by download ID
```

### File Lists
```javascript
downloads: [],                 // Downloaded files
trimmedFiles: [],              // Trimmed files
compressedFiles: [],           // Compressed files
searchDownloads: '',           // Search filter for downloads
searchTrimmed: '',             // Search filter for trimmed
searchCompressed: '',          // Search filter for compressed
```

### Modal State
```javascript
showTrimModal: false,          // Trim modal visibility
trimFile: null,                // File being trimmed
trimOptions: {...},            // Trim parameters

showCompressModal: false,      // Compress modal visibility
compressFile: null,            // File being compressed
compressOptions: {...},        // Compress parameters
```

### Settings State
```javascript
serverSettings: {
    download_dir: 'downloads',
    default_format: 'mp4',
    default_quality: 'best',
    fallback_quality: true,
    max_concurrent_downloads: 3,
    default_mode: 'video',
    include_subtitles: false,
    embed_thumbnail: false,
    extra_ytdlp_args: ''
}
```

## API Client

### Usage
```javascript
// Global API instance
window.api.setBaseUrl('http://192.168.1.100:5000');

// Download operations
const info = await window.api.getVideoInfo(url);
const download = await window.api.startDownload(url, options);
const status = await window.api.getDownloadStatus(id);

// File operations
const files = await window.api.listDownloadedFiles();
const trimmed = await window.api.listTrimmedFiles();
const compressed = await window.api.listCompressedFiles();

// Processing operations
await window.api.trimVideo(filename, options);
await window.api.compressVideo(filename, options);

// Deletion
await window.api.deleteDownloadedFile(filename);
await window.api.deleteTrimmedFile(filename);
await window.api.deleteCompressedFile(filename);
```

### API Endpoints Used
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Server health check |
| `/api/v1/media/info` | POST | Get video metadata |
| `/api/v1/downloads` | POST | Start download |
| `/api/v1/downloads/{id}` | GET | Get download status |
| `/api/v1/downloads/trim` | POST | Start trim job |
| `/api/v1/downloads/compress` | POST | Start compress job |
| `/api/v1/files/downloads` | GET | List downloaded files |
| `/api/v1/files/trimmed` | GET | List trimmed files |
| `/api/v1/files/compressed` | GET | List compressed files |
| `/api/v1/files/downloads/{name}` | DELETE | Delete downloaded file |
| `/api/v1/files/trimmed/{name}` | DELETE | Delete trimmed file |
| `/api/v1/files/compressed/{name}` | DELETE | Delete compressed file |
| `/api/v1/settings` | GET/POST | Get/update server settings |
| `/ws` | WebSocket | Real-time progress updates |

## WebSocket Integration

### Connection Management
```javascript
connectWebSocket() {
    const wsUrl = this.serverUrl.replace(/^http/, 'ws') + '/ws';
    this.ws = new WebSocket(wsUrl);
    // Auto-reconnect on close
}
```

### Message Types
- `download_progress`: Progress percentage, speed, ETA
- `download_complete`: Download finished
- `download_error`: Download failed
- `trim_complete`: Trim finished
- `compress_complete`: Compression finished

## Important Notes

### Server Connection
The app requires a running MediaForge server. Configure the URL in Settings tab.

### CORS Requirements
The MediaForge server must allow CORS from:
- `http://localhost:3000` (development)
- `capacitor://localhost` (Capacitor Android)
- `ionic://localhost` (Capacitor iOS)

### No Backend Code
This project contains NO backend code. All video processing happens on the MediaForge server. This app is a pure frontend client.

### Icon Generation
The `src/icons/icon.svg` can be used to generate PNG icons using:
- https://realfavicongenerator.net
- https://www.pwabuilder.com/imageGenerator

## Adding Features

### New Page
1. Add navigation button in bottom nav
2. Add page content div with `x-show="currentPage === 'pagename'"`
3. Add `navigate('pagename')` handler
4. Update `navigate()` function if data loading needed

### New API Endpoint
1. Add method to `MediaForgeAPI` class in `api.js`
2. Call via `window.api.methodName()` in `app.js`

### New Modal
1. Add modal HTML in `index.html` with Alpine directives
2. Add state variables: `showXxxModal`, `xxxFile`, `xxxOptions`
3. Add open/close/submit methods in `app.js`

### Native Feature (Capacitor)
1. Install Capacitor plugin: `npm install @capacitor/plugin-name`
2. Import in `app.js` or create new module
3. Use Capacitor API for native functionality
