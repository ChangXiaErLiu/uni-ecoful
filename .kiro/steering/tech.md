# Technology Stack

## Framework & Build System

- **uni-app**: Cross-platform development framework for WeChat Mini Program, H5, and mobile apps
- **Vue 3**: Frontend framework with Composition API
- **Vite**: Build tool (implied by uni-app setup)

## State Management & Architecture

- **Pinia**: State management library for Vue 3
- **Composition API**: Vue 3's reactive system for component logic

## UI Components

- **uni-ui**: Official UI component library for uni-app
- Custom components following uni-app conventions

## HTTP & Real-time Communication

- **uni.request**: Unified request API across platforms
- **WebSocket**: Real-time chat streaming (Mini Program)
- **Server-Sent Events (SSE)**: Real-time chat streaming (H5)
- **Fetch API**: HTTP requests with streaming support (H5 only)

## Styling

- **SCSS**: CSS preprocessor
- **rpx units**: Responsive pixel units for cross-platform compatibility
- **CSS Grid & Flexbox**: Modern layout systems

## Platform-Specific Features

- **Conditional compilation**: `#ifdef` directives for platform-specific code
- **Safe area handling**: iOS notch and Android navigation bar support
- **Custom navigation**: Platform-specific navigation implementations

## Development Commands

```bash
# Development (platform-specific)
npm run dev:mp-weixin    # WeChat Mini Program
npm run dev:h5           # H5 Web
npm run dev:app          # Mobile App

# Build (platform-specific)  
npm run build:mp-weixin  # WeChat Mini Program
npm run build:h5         # H5 Web
npm run build:app        # Mobile App
```

## Configuration Files

- `manifest.json`: App configuration and platform settings
- `pages.json`: Page routing and navigation configuration
- `uni.scss`: Global styles and variables