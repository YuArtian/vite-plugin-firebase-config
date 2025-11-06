import { defineConfig } from 'vite'
import firebaseConfig from 'vite-plugin-firebase-config'

export default defineConfig({
  plugins: [
    // Basic usage - reads from VITE_FIREBASE_* environment variables
    firebaseConfig(),
  ],
})

