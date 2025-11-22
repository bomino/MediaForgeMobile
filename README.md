# MediaForge Mobile

A full-featured Progressive Web App (PWA) and Capacitor-ready mobile client for the [MediaForge](https://github.com/bomino/MediaForge) video toolkit.

![MediaForge Mobile](https://img.shields.io/badge/Platform-PWA%20%7C%20Android%20%7C%20iOS-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Alpine.js](https://img.shields.io/badge/Alpine.js-3.x-8BC0D0)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.x-38B2AC)

## Features

### Video Downloads
- **Single URL Download** - Paste a video URL and download with format/quality selection
- **Batch Downloads** - Download multiple videos at once (one URL per line)
- **Platform Support** - YouTube, Twitter/X, TikTok, Facebook, Instagram
- **Format Selection** - MP4, WebM, MKV, MP3, AAC, WAV, FLAC, OGG, Opus
- **Quality Options** - Best, 2160p, 1080p, 720p, 480p, 360p

### Video Processing
- **Trim Videos** - Cut clips with start time and duration
- **Compress Videos** - Reduce file size with quality presets
  - Quality presets (High/Medium/Low/Custom CRF)
  - Resolution scaling (1080p, 720p, 480p, 360p)
  - Codec selection (H.264, H.265/HEVC)
  - Audio bitrate control

### File Management
- **Search & Filter** - Find files quickly across all categories
- **File Actions** - Download, delete with confirmation
- **Categories** - Separate views for Downloads, Trimmed, Compressed

### Real-time Updates
- **WebSocket Support** - Live progress updates
- **Speed & ETA Display** - Monitor download progress
- **Active Downloads Panel** - Track multiple concurrent downloads

### User Experience
- **Dark/Light Theme** - System preference or manual toggle
- **Offline Support** - Service Worker caching for offline UI
- **PWA Installable** - Add to home screen on mobile devices
- **Responsive Design** - Works on phones, tablets, and desktop

### Settings
- **Server Configuration** - Connect to any MediaForge server
- **Download Defaults** - Format, quality, audio/video mode
- **Advanced Options** - Extra yt-dlp arguments, subtitles, thumbnails

## Screenshots

| Home | Downloads | Trim | Settings |
|------|-----------|------|----------|
| Single/Batch URL input | File grid with actions | Trim modal | Full settings |

## Quick Start

### Prerequisites

- Python 3.8+ (for development server) OR Node.js 18+
- [MediaForge Server](https://github.com/bomino/MediaForge) running

### Development (Python)

```bash
# Clone the repository
git clone https://github.com/bomino/MediaForgeMobile.git
cd MediaForgeMobile

# Create virtual environment (optional)
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac

# Start development server
python serve.py
```

Open http://localhost:3000 in your browser.

### Development (Node.js)

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Configure Server URL

1. Open the app in your browser
2. Go to **Settings** tab
3. Enter your MediaForge server URL (e.g., `http://192.168.1.100:5000`)
4. Click **Test Connection** to verify

## PWA Installation

### Android (Chrome)
1. Visit the app URL in Chrome
2. Tap the menu (3 dots)
3. Select **"Add to Home Screen"**

### iOS (Safari)
1. Visit the app URL in Safari
2. Tap the **Share** button
3. Select **"Add to Home Screen"**

### Desktop (Chrome/Edge)
1. Visit the app URL
2. Click the install icon in the address bar
3. Click **"Install"**

## Building Native Apps (Capacitor)

### Initial Setup

```bash
# Install Capacitor dependencies
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios

# Build web assets
npm run build

# Sync to native projects
npx cap sync
```

### Android Build

```bash
# Add Android platform (first time only)
npx cap add android

# Sync web assets
npx cap sync android

# Open in Android Studio
npx cap open android
```

Build APK/AAB from Android Studio.

### iOS Build (macOS only)

```bash
# Add iOS platform (first time only)
npx cap add ios

# Sync web assets
npx cap sync ios

# Open in Xcode
npx cap open ios
```

Build from Xcode.

## Project Structure

```
MediaForgeMobile/
├── src/
│   ├── index.html          # Main SPA with all pages
│   ├── js/
│   │   ├── app.js          # Alpine.js application logic
│   │   └── api.js          # MediaForge API client
│   ├── sw.js               # Service Worker for offline
│   └── icons/
│       └── icon.svg        # App icon source
├── public/
│   └── manifest.json       # PWA manifest
├── scripts/
│   └── build.js            # Build script
├── serve.py                # Python dev server
├── package.json            # NPM configuration
├── capacitor.config.ts     # Capacitor configuration
├── requirements.txt        # Python dependencies
├── CLAUDE.md               # AI assistant guide
└── README.md
```

## Architecture

```
┌─────────────────────────────────────────┐
│        MediaForge Mobile App            │
│   (PWA / Capacitor Native Wrapper)      │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │         Alpine.js App           │    │
│  │  - State Management             │    │
│  │  - UI Components                │    │
│  │  - WebSocket Handler            │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │       API Client (api.js)       │    │
│  │  - REST API calls               │    │
│  │  - Error handling               │    │
│  └─────────────────────────────────┘    │
└────────────────┬────────────────────────┘
                 │ HTTP/WebSocket
                 ▼
┌─────────────────────────────────────────┐
│        MediaForge Server                │
│   (FastAPI + yt-dlp + FFmpeg)           │
│                                         │
│  - Video downloading                    │
│  - Trimming & compression               │
│  - File management                      │
│  - Settings storage                     │
└─────────────────────────────────────────┘
```

The mobile app is a **thin client** - all video processing happens on the MediaForge server.

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **Alpine.js 3.x** | Reactive UI framework |
| **Tailwind CSS 3.x** | Utility-first styling |
| **Lucide Icons** | Beautiful SVG icons |
| **Service Worker** | Offline caching |
| **Capacitor 5.x** | Native app wrapper |

## API Endpoints Used

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Server health check |
| `/api/v1/media/info` | POST | Get video info |
| `/api/v1/downloads` | POST | Start download |
| `/api/v1/downloads/{id}` | GET | Get download status |
| `/api/v1/downloads/trim` | POST | Start trim job |
| `/api/v1/downloads/compress` | POST | Start compress job |
| `/api/v1/files/downloads` | GET | List downloaded files |
| `/api/v1/files/trimmed` | GET | List trimmed files |
| `/api/v1/files/compressed` | GET | List compressed files |
| `/api/v1/settings` | GET/POST | Get/update settings |
| `/ws` | WebSocket | Real-time progress |

## Configuration

### Capacitor Config (`capacitor.config.ts`)

```typescript
const config: CapacitorConfig = {
  appId: 'com.mediaforge.app',
  appName: 'MediaForge',
  webDir: 'src',
  server: {
    // For development hot reload
    url: 'http://192.168.1.100:3000',
    cleartext: true
  }
};
```

### CORS Configuration

The MediaForge server must allow CORS from:
- `http://localhost:3000` (development)
- `capacitor://localhost` (Capacitor Android)
- `ionic://localhost` (Capacitor iOS)

MediaForge server already has `allow_origins=["*"]` configured.

## Known Limitations

### PWA on iOS
- No background downloads (app must stay open)
- Limited storage quota
- Must install from Safari

### App Store Distribution
- Video downloaders are typically rejected by app stores
- Distribute via:
  - Direct APK download (Android)
  - TestFlight (iOS)
  - Enterprise distribution

### WebSocket
- May not work through some proxies
- Falls back to polling if unavailable

## Troubleshooting

### "Cannot connect to server"
1. Check if MediaForge server is running
2. Verify the server URL in Settings
3. Ensure CORS is configured on server

### Downloads not progressing
1. Check server logs for errors
2. Verify yt-dlp is up to date on server
3. Some sites may require cookies

### PWA not installing
1. Must be served over HTTPS (except localhost)
2. Clear browser cache and try again
3. Check manifest.json is accessible

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Related Projects

- [MediaForge](https://github.com/bomino/MediaForge) - The backend server

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Acknowledgments

- [yt-dlp](https://github.com/yt-dlp/yt-dlp) - Video downloading
- [FFmpeg](https://ffmpeg.org/) - Video processing
- [Alpine.js](https://alpinejs.dev/) - Reactive framework
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Capacitor](https://capacitorjs.com/) - Native wrapper
