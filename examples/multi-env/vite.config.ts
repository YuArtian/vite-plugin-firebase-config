import { defineConfig } from 'vite'
import firebaseConfig from 'vite-plugin-firebase-config'

export default defineConfig({
  plugins: [
    firebaseConfig({
      // Override authDomain based on environment
      environments: {
        development: {
          authDomain: 'localhost:5173',
        },
        staging: {
          authDomain: 'staging.example.com',
        },
        production: {
          authDomain: 'example.com',
        },
      },
      debug: true,
    }),
  ],
})

