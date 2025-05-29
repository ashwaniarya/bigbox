# BigBox Application - Complete Documentation

## 🚀 Project Overview

**BigBox** is a mobile-first Progressive Web App that enables users to chat with an AI to generate runnable HTML micro-apps ("SandBoxes") that execute in secure iframes. The app provides an Android-style home shell interface optimized for mobile devices with offline capabilities.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│                 BigBox PWA                      │
├─────────────────────────────────────────────────┤
│  HomeShell UI (Android-style Interface)        │
│  ├── App Grid (SandBox Icons)                  │
│  ├── Chat Modal (AI App Generation)            │
│  ├── Settings Modal (Configuration)            │
│  └── Apps Modal (Management)                   │
├─────────────────────────────────────────────────┤
│  SandboxManager SDK (@bigbox/sandbox-manager)  │
│  ├── Database Layer (IndexedDB)                │
│  ├── Event System (Real-time Updates)          │
│  ├── Iframe Management (Secure Execution)      │
│  └── Content Hashing (SHA-256)                 │
├─────────────────────────────────────────────────┤
│  Service Worker (PWA + Offline Caching)        │
├─────────────────────────────────────────────────┤
│  IndexedDB (Local Storage)                     │
└─────────────────────────────────────────────────┘
```

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS + Custom CSS
- **PWA**: Workbox Service Worker + Manifest
- **Database**: IndexedDB with `idb` library
- **Package Manager**: pnpm workspace
- **Build Tool**: Vite with PWA plugin
- **Deployment Target**: Vercel (Edge Functions ready)

## 📁 File Structure

```
BigBox/
├── docs/                                    # Documentation
│   ├── APPLICATION_OVERVIEW.md             # This comprehensive guide
│   ├── detailed_architecture_vite.svg      # Architecture diagram
│   └── index.html                          # Docs homepage
├── packages/
│   ├── bigbox-pwa/                         # Main PWA Application
│   │   ├── public/
│   │   │   ├── vite.svg                    # App icon
│   │   │   └── manifest.json               # PWA manifest
│   │   ├── src/
│   │   │   ├── components/                 # React Components
│   │   │   │   ├── HomeShell.tsx           # Main container component
│   │   │   │   ├── HomeShell.css           # Android-style styling
│   │   │   │   ├── SandboxIcon.tsx         # App icon component
│   │   │   │   ├── SandboxListModal.tsx    # Apps management modal
│   │   │   │   ├── ChatModal.tsx           # AI chat interface
│   │   │   │   └── SettingsModal.tsx       # Configuration modal
│   │   │   ├── App.tsx                     # Root app component
│   │   │   ├── App.css                     # Global app styles
│   │   │   └── main.tsx                    # React entry point
│   │   ├── vite.config.ts                  # Vite + PWA configuration
│   │   └── package.json                    # PWA dependencies
│   └── sandbox-manager/                    # Core SDK Package
│       ├── src/
│       │   ├── db.ts                       # IndexedDB operations
│       │   ├── events.ts                   # Event system
│       │   └── index.ts                    # Main SDK exports
│       ├── package.json                    # SDK dependencies
│       └── tsconfig.json                   # TypeScript config
├── pnpm-workspace.yaml                     # Workspace configuration
└── README.md                               # Project setup guide
```

## 🧩 Component Architecture

### 1. **App.tsx** (`packages/bigbox-pwa/src/App.tsx`)
- **Role**: Root application component
- **Features**: 
  - HomeShell integration
  - Debug panel (hidden by default)
  - SandboxManager event listener setup
  - Global state management
- **Key Functions**: Event handling, debug logging

### 2. **HomeShell.tsx** (`packages/bigbox-pwa/src/components/HomeShell.tsx`)
- **Role**: Main container with Android-style interface
- **Features**:
  - Status bar with time/indicators
  - Wallpaper backgrounds (5 gradient themes)
  - App grid layout (4-column on mobile)
  - Fullscreen sandbox execution
  - Modal management system
  - Fixed footer dock
- **State Management**: Sandboxes list, running sandbox, active modal, wallpaper theme

### 3. **SandboxIcon.tsx** (`packages/bigbox-pwa/src/components/SandboxIcon.tsx`)
- **Role**: Individual app icon representation
- **Features**:
  - Emoji mapping based on app titles
  - Tap-to-launch functionality
  - Title truncation for mobile
- **Icon Mapping**: Calculator (🧮), Todo (📝), Game (🎮), etc.

### 4. **SandboxListModal.tsx** (`packages/bigbox-pwa/src/components/SandboxListModal.tsx`)
- **Role**: Apps dock/management interface
- **Features**:
  - Search functionality
  - Grid view of all apps
  - Delete functionality with confirmation
  - Running app indicators
  - Refresh capability

### 5. **ChatModal.tsx** (`packages/bigbox-pwa/src/components/ChatModal.tsx`)
- **Role**: AI chat interface for app generation
- **Features**:
  - Mock LLM responses (demo mode)
  - Real app generation (Calculator, Todo List)
  - Message history
  - Typing indicators
  - App creation workflow
- **Generated Apps**: Fully functional HTML/CSS/JavaScript applications

### 6. **SettingsModal.tsx** (`packages/bigbox-pwa/src/components/SettingsModal.tsx`)
- **Role**: Configuration and preferences
- **Features**:
  - Wallpaper theme selection
  - API key management
  - Preset prompts management
  - Data export/import
  - Clear all data functionality
  - About information

## 🔧 SandboxManager SDK (`@bigbox/sandbox-manager`)

### **db.ts** - Database Layer
- **IndexedDB Integration**: Uses `idb` library for storage
- **Schema**: `{id, hash, html, meta, createdAt, lastAccessed}`
- **Content Addressing**: SHA-256 hashing for deduplication
- **Functions**: `initDB()`, `saveSandbox()`, `getSandbox()`, `listSandboxes()`, `deleteSandbox()`

### **events.ts** - Event System
- **EventTarget-based**: Custom event emitter
- **Events**: `loaded`, `error`, `storageQuota`, `created`, `destroyed`, `paused`, `resumed`
- **Storage Monitoring**: Quota usage tracking
- **Real-time Updates**: Cross-component communication

### **index.ts** - Main SDK
- **Core Functions**:
  - `create(html, meta)`: Store new sandbox
  - `list()`: Get all sandboxes
  - `get(id)`: Retrieve specific sandbox
  - `destroy(id)`: Delete sandbox
  - `run(id, container)`: Execute in iframe
  - `stop(id)`: Terminate execution
  - `pause(id)` / `resume(id)`: Lifecycle management
  - `getHash(content)`: SHA-256 content hashing
- **Security**: Sandboxed iframes with restricted permissions
- **Logging**: Comprehensive debug logging throughout

## 🎨 Styling System (`HomeShell.css`)

### **Android-Style Design**
- **Status Bar**: Time, battery, signal indicators
- **Wallpaper Themes**: 5 gradient backgrounds (blue, sunset, forest, purple, minimal)
- **App Grid**: 4-column layout with glassmorphism effects
- **Dock**: Fixed footer with 3 buttons (Apps, Chat, Settings)

### **Modal System**
- **Backdrop Blur**: Professional overlay effects
- **Animations**: Slide-in transitions
- **Responsive**: Mobile-first design with breakpoints
- **Glassmorphism**: Translucent design elements

### **Mobile Optimization**
- **Viewport Fitting**: No horizontal/vertical scroll
- **Touch Interactions**: Optimized for mobile devices
- **Responsive Breakpoints**: 768px, 480px
- **Safe Areas**: Proper modal sizing for all screens

## 🔄 PWA Features

### **Service Worker** (Workbox)
- **Offline Caching**: App shell and assets
- **Background Sync**: Future API integration
- **Push Notifications**: Ready for implementation

### **Manifest** (`public/manifest.json`)
- **App Identity**: BigBox branding
- **Icons**: PWA-compliant icon sizes
- **Display Mode**: Standalone app experience
- **Theme Colors**: Consistent branding

## 💾 Data Management

### **IndexedDB Storage**
- **Content-Addressable**: SHA-256 hashing prevents duplicates
- **Metadata**: Title, description, creation date, last accessed
- **Persistence**: Offline-first approach
- **Export/Import**: JSON-based backup system

### **Event-Driven Updates**
- **Real-time Sync**: UI updates across components
- **Storage Monitoring**: Quota usage alerts
- **Lifecycle Events**: App creation, destruction, state changes

## 🤖 AI Integration (Demo Mode)

### **Mock LLM Responses**
- **Calculator App**: Fully functional with arithmetic operations
- **Todo List App**: Add, complete, delete tasks
- **Keyword Matching**: Simple prompt recognition
- **Extensible**: Ready for real LLM API integration

### **Generated Apps Structure**
- **Complete HTML**: DOCTYPE, head, body structure
- **Embedded CSS**: Modern styling with gradients, animations
- **JavaScript**: Interactive functionality
- **Self-contained**: No external dependencies

## 🚀 Development Workflow

### **Local Development**
```bash
cd /Users/arya/Downloads/projects/BigBox
pnpm install                    # Install all dependencies
pnpm --filter bigbox-pwa dev   # Start development server
# Access: http://localhost:5174/
```

### **Build & Deploy**
```bash
pnpm --filter bigbox-pwa build  # Production build
pnpm --filter bigbox-pwa preview # Preview production build
# Deploy to Vercel with Edge Functions support
```

### **Package Management**
- **Workspace**: pnpm workspace for monorepo
- **Linking**: `@bigbox/sandbox-manager` automatically linked
- **Dependencies**: Shared TypeScript, React, Vite configs

## 🔒 Security Model

### **Sandbox Isolation**
- **Iframe Security**: `sandbox="allow-scripts allow-same-origin"`
- **Content Security**: No external resource access
- **PostMessage Communication**: Controlled iframe interaction

### **Data Protection**
- **Local Storage**: All data stays on device
- **No External APIs**: Demo mode for privacy
- **Content Hashing**: Integrity verification

## 📱 Mobile Experience

### **Android-Style Interface**
- **Home Screen**: App grid with wallpaper
- **Status Bar**: System-like indicators
- **Dock**: Fixed bottom navigation
- **Gestures**: Touch-optimized interactions

### **Progressive Enhancement**
- **Offline First**: Works without internet
- **Install Prompt**: Add to home screen
- **App-like Feel**: Fullscreen, no browser chrome
- **Fast Loading**: Service worker caching

## 🎯 Key Features Summary

### ✅ **Completed (M0-M2)**
- **SandboxManager SDK**: Complete with IndexedDB, events, iframe management
- **Android Home Shell**: Mobile-first UI with wallpapers, modals, dock
- **AI Chat**: Demo mode with calculator and todo app generation
- **PWA Foundation**: Service worker, manifest, offline capabilities
- **Mobile Optimization**: No scrollbars, responsive design

### 🔄 **Next Milestones**
- **M3**: Theme editor for wallpaper customization
- **M4**: Real LLM integration (OpenAI API)
- **M5**: Advanced app templates and sharing
- **M6**: Vercel deployment with Edge Functions

## 🧪 Testing & Debugging

### **Debug Features**
- **Debug Panel**: Hidden toggle (🐛 button) for real-time logs
- **Event Logging**: Comprehensive SandboxManager event tracking
- **Console Logging**: Detailed component and SDK logs
- **Error Handling**: Graceful error recovery and user feedback

### **Mobile Testing**
- **Responsive Design**: Tested across breakpoints
- **Touch Interactions**: Optimized for mobile devices
- **Viewport Handling**: No unwanted scrolling
- **Performance**: Smooth animations and transitions

---

## 📊 Application State

**Current Status**: M2 Complete - Android Home Shell fully functional  
**Development Server**: http://localhost:5174/  
**Architecture**: Event-driven, mobile-first PWA  
**Ready For**: M3 theme editor and M4 real LLM integration  

This documentation serves as the single source of truth for understanding the complete BigBox application architecture, components, and development workflow. 