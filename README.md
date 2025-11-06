# vite-plugin-firebase-config

[![npm version](https://img.shields.io/npm/v/vite-plugin-firebase-config.svg)](https://www.npmjs.com/package/vite-plugin-firebase-config)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A Vite plugin that automatically syncs Firebase configuration from environment variables to static files, solving the common issue of Firebase Auth callbacks requiring static configuration files.

## 🎯 Problem This Solves

When using Firebase Authentication with static hosting (S3, CloudFront, Vercel, etc.), Firebase SDK requires a static `/__/auth/init.json` file for OAuth callbacks. Managing this file across different environments (dev, staging, prod) can be error-prone and lead to configuration drift.

This plugin automatically:
- ✅ Reads Firebase config from environment variables
- ✅ Generates `public/__/auth/init.json` automatically
- ✅ Keeps config in sync between your code and static files
- ✅ Supports multiple environments (dev, staging, production)
- ✅ Validates configuration to catch errors early
- ✅ Hot-reloads during development

## 📦 Installation

```bash
npm install -D vite-plugin-firebase-config
# or
pnpm add -D vite-plugin-firebase-config
# or
yarn add -D vite-plugin-firebase-config
```

## 🚀 Quick Start

### 1. Add to `vite.config.ts`

```typescript
import { defineConfig } from 'vite'
import firebaseConfig from 'vite-plugin-firebase-config'

export default defineConfig({
  plugins: [
    firebaseConfig()
  ]
})
```

### 2. Set Environment Variables

Create `.env` files for different environments:

```env
# .env.development
VITE_FIREBASE_API_KEY=your-dev-api-key
VITE_FIREBASE_AUTH_DOMAIN=localhost:5173
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123:web:abc
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# .env.production
VITE_FIREBASE_API_KEY=your-prod-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-domain.com
# ... other production values
```

### 3. Done! 🎉

The plugin will automatically generate `public/__/auth/init.json` based on your environment variables.

## 🔧 Configuration

### Basic Options

```typescript
firebaseConfig({
  // Configuration source: 'env' or 'inline'
  source: 'env',
  
  // Environment variable prefix
  envPrefix: 'VITE_FIREBASE_',
  
  // Output configuration
  output: {
    path: 'public/__/auth/init.json',
    indent: 2,
    addWarningComment: true
  },
  
  // Enable validation
  validate: true,
  
  // Enable hot reload in dev mode
  watch: true,
  
  // Enable debug logging
  debug: false
})
```

### Inline Configuration

```typescript
firebaseConfig({
  source: 'inline',
  config: {
    apiKey: 'your-api-key',
    authDomain: 'your-domain.com',
    projectId: 'your-project-id',
    storageBucket: 'your-bucket.appspot.com',
    messagingSenderId: '123456789',
    appId: '1:123:web:abc'
  }
})
```

### Environment-Specific Overrides

```typescript
firebaseConfig({
  environments: {
    development: {
      authDomain: 'localhost:5173'
    },
    production: {
      authDomain: 'your-production-domain.com'
    }
  }
})
```

### Custom Transform

```typescript
firebaseConfig({
  transform: (config) => {
    // Modify config before writing
    if (process.env.NODE_ENV === 'development') {
      config.authDomain = 'localhost:5173'
    }
    return config
  }
})
```

## 📖 API Reference

### `PluginOptions`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `source` | `'env' \| 'inline'` | `'env'` | Configuration source |
| `envPrefix` | `string` | `'VITE_FIREBASE_'` | Prefix for environment variables |
| `config` | `FirebaseConfig` | `undefined` | Inline configuration object |
| `output.path` | `string` | `'public/__/auth/init.json'` | Output file path |
| `output.indent` | `number` | `2` | JSON indentation |
| `output.addWarningComment` | `boolean` | `true` | Add warning comment to file |
| `environments` | `Record<string, Partial<FirebaseConfig>>` | `{}` | Environment-specific overrides |
| `validate` | `boolean` | `true` | Validate configuration |
| `watch` | `boolean` | `true` | Enable hot reload |
| `transform` | `(config) => config` | `undefined` | Custom transform function |
| `debug` | `boolean` | `false` | Enable debug logging |

### Environment Variables

The plugin reads these environment variables (with default prefix `VITE_FIREBASE_`):

- `VITE_FIREBASE_API_KEY` → `apiKey` (required)
- `VITE_FIREBASE_AUTH_DOMAIN` → `authDomain` (required)
- `VITE_FIREBASE_PROJECT_ID` → `projectId` (required)
- `VITE_FIREBASE_STORAGE_BUCKET` → `storageBucket` (required)
- `VITE_FIREBASE_MESSAGING_SENDER_ID` → `messagingSenderId` (required)
- `VITE_FIREBASE_APP_ID` → `appId` (required)
- `VITE_FIREBASE_MEASUREMENT_ID` → `measurementId` (optional)
- `VITE_FIREBASE_DATABASE_URL` → `databaseURL` (optional)

## 🧪 Examples

See the [examples](./examples) directory for complete working examples:

- [Basic Usage](./examples/basic) - Simplest configuration
- [Multi-Environment](./examples/multi-env) - Different configs per environment
- [Advanced](./examples/advanced) - Custom transforms and validation

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

## 📄 License

MIT © [vite-plugin-firebase-config contributors](./LICENSE)

## 🙏 Credits

Created to solve Firebase Auth configuration issues in static hosting environments.

## 📚 Related

- [Firebase Documentation](https://firebase.google.com/docs)
- [Vite Plugin API](https://vitejs.dev/guide/api-plugin.html)
