# Project Structure

## Root Level Files

- `App.vue`: Main application component with lifecycle hooks
- `main.js`: Application entry point with platform-specific initialization
- `index.html`: H5 platform HTML template
- `manifest.json`: Cross-platform app configuration
- `pages.json`: Page routing and tabBar configuration
- `uni.scss`: Global SCSS variables and styles

## Core Directories

### `/pages/`
Page components organized by feature:
- `auth/`: Login and registration pages
- `chat/`: AI chat interface
- `compliance/`: Document compliance review
- `doc-generator/`: Report generation tools
- `home/`: Main dashboard with feature cards
- `knowledge/`: Knowledge base management
- `profile/`: User profile and settings
- `reports/`: Specialized report types (acceptance, EIA)

### `/components/`
Reusable Vue components:
- `chat/`: Chat-specific components
- `layout/`: Layout components (AppLayout, NavSider)

### `/api/`
Pinia stores and API logic:
- `index.js`: Store setup and exports
- `chat.js`: Chat-related state management
- `user.js`: User authentication and profile
- `knowledge.js`: Knowledge base operations

### `/utils/`
Utility functions and configurations:
- `config.js`: API base URLs and environment settings
- `request.js`: HTTP request wrapper with streaming support
- `platform.js`: Platform detection utilities
- `safe-area.js`: Safe area handling for mobile devices

### `/stores/`
Additional Pinia stores:
- `navTitle.js`: Navigation title management

### `/static/`
Static assets:
- `avatars/`: User avatar images
- `tabBarIcos/`: Tab bar icons
- Brand logos and images

### `/uni_modules/`
uni-app official component modules (uni-ui library)

## Naming Conventions

- **Pages**: Use `index.vue` for main page components
- **Components**: PascalCase for component names (e.g., `AppLayout.vue`)
- **Stores**: camelCase with descriptive names (e.g., `navTitle.js`)
- **Utilities**: Descriptive names reflecting functionality
- **Assets**: Organized by type in subdirectories

## File Organization Patterns

- Each page directory contains an `index.vue` file as the main component
- Related components are grouped in feature-specific directories
- Shared utilities are centralized in `/utils/`
- API logic is separated into Pinia stores in `/api/`
- Static assets are organized by type and usage

## Platform-Specific Code

Use conditional compilation comments for platform-specific features:
```javascript
// #ifdef H5
// H5-specific code
// #endif

// #ifdef MP-WEIXIN
// WeChat Mini Program specific code
// #endif

// #ifndef H5
// Code for all platforms except H5
// #endif
```