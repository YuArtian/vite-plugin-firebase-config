import type { Plugin, ResolvedConfig } from 'vite'
import { normalizePath, loadEnv } from 'vite'
import type {
  PluginOptions,
  NormalizedPluginOptions,
  FirebaseConfig,
} from './types'
import { resolveConfig, applyTransform } from './config'
import { validateConfig } from './validator'
import {
  generateConfigFile,
  getDefaultOutputPath,
  validateOutputPath,
} from './generator'
import { resolvePath, logger } from './utils'

/**
 * Normalize plugin options with defaults
 */
function normalizeOptions(
  options: PluginOptions = {}
): NormalizedPluginOptions {
  return {
    source: options.source || 'env',
    envPrefix: options.envPrefix || 'VITE_FIREBASE_',
    config: options.config || ({} as FirebaseConfig),
    output: {
      path: options.output?.path || getDefaultOutputPath(),
      indent: options.output?.indent ?? 2,
    },
    environments: options.environments || {},
    validate: options.validate ?? true,
    strictValidation: options.strictValidation ?? false,
    watch: options.watch ?? true,
    transform: options.transform,
    debug: options.debug ?? false,
  }
}

/**
 * Vite plugin to sync Firebase configuration
 */
export default function firebaseConfig(options: PluginOptions = {}): Plugin {
  const normalizedOptions = normalizeOptions(options)
  let viteConfig: ResolvedConfig
  let outputPath: string
  let loadedEnvVars: Record<string, string> | undefined

  return {
    name: 'vite-plugin-firebase-config',

    // Run early to ensure config is available before other plugins
    enforce: 'pre',

    configResolved(config) {
      viteConfig = config
      outputPath = normalizePath(
        resolvePath(config.root, normalizedOptions.output.path)
      )

      // Load environment variables from .env files if using env source
      if (normalizedOptions.source === 'env') {
        loadedEnvVars = loadEnv(config.mode, config.root, '')

        logger.debug(
          `Loaded environment variables for mode: ${config.mode}`,
          normalizedOptions.debug
        )
      }

      logger.debug(
        `Vite config resolved (mode: ${config.mode}, command: ${config.command})`,
        normalizedOptions.debug
      )
    },

    buildStart() {
      try {
        // Validate output path
        validateOutputPath(normalizedOptions.output.path)

        // Resolve configuration
        // In non-strict mode, fillEmptyFields=true will ensure all required fields exist
        const config = resolveConfig(
          normalizedOptions,
          viteConfig.mode,
          loadedEnvVars,
          !normalizedOptions.strictValidation
        )

        // Validate configuration
        // In non-strict mode, validation will always return true even with errors
        if (normalizedOptions.validate) {
          validateConfig(config, normalizedOptions.strictValidation)
        }

        // After validation, cast to FirebaseConfig
        // In non-strict mode, missing fields are filled with empty strings
        const validatedConfig = config as FirebaseConfig

        // Apply custom transform
        const transformedConfig = applyTransform(
          validatedConfig,
          normalizedOptions.transform
        )

        // Generate config file
        generateConfigFile(
          transformedConfig,
          outputPath,
          normalizedOptions.output,
          normalizedOptions.debug
        )
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        logger.error(`Plugin initialization failed: ${message}`)
        throw error
      }
    },

    // Handle file serving in dev mode
    configureServer(server) {
      if (!normalizedOptions.watch) {
        return
      }

      // Watch for environment variable changes (if using dotenv files)
      server.watcher.on('change', (file) => {
        const normalizedFile = normalizePath(file)
        if (
          normalizedFile.endsWith('.env') ||
          normalizedFile.includes('.env.')
        ) {
          logger.info('Environment file changed, regenerating config...')

          try {
            // Reload env vars when .env files change
            loadedEnvVars = loadEnv(viteConfig.mode, viteConfig.root, '')

            const config = resolveConfig(
              normalizedOptions,
              viteConfig.mode,
              loadedEnvVars,
              !normalizedOptions.strictValidation
            )

            // Validate configuration
            // In non-strict mode, validation will always return true
            if (normalizedOptions.validate) {
              validateConfig(config, normalizedOptions.strictValidation)
            }

            const validatedConfig = config as FirebaseConfig

            const transformedConfig = applyTransform(
              validatedConfig,
              normalizedOptions.transform
            )

            generateConfigFile(
              transformedConfig,
              outputPath,
              normalizedOptions.output,
              normalizedOptions.debug
            )

            // Trigger HMR
            server.ws.send({
              type: 'full-reload',
              path: '*',
            })
          } catch (error) {
            const message =
              error instanceof Error ? error.message : String(error)
            logger.error(`Failed to regenerate config: ${message}`)
          }
        }
      })
    },
  }
}

// Export types for TypeScript users
export type { PluginOptions, FirebaseConfig, OutputConfig } from './types'
