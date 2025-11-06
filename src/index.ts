import type { Plugin, ResolvedConfig } from 'vite'
import { normalizePath } from 'vite'
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
      addWarningComment: options.output?.addWarningComment ?? true,
    },
    environments: options.environments || {},
    validate: options.validate ?? true,
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

  return {
    name: 'vite-plugin-firebase-config',

    // Run early to ensure config is available before other plugins
    enforce: 'pre',

    configResolved(config) {
      viteConfig = config
      outputPath = normalizePath(
        resolvePath(config.root, normalizedOptions.output.path)
      )

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
        const config = resolveConfig(normalizedOptions, viteConfig.mode)

        // Validate configuration
        if (normalizedOptions.validate && !validateConfig(config)) {
          throw new Error('Firebase configuration validation failed')
        }

        // After validation, we can safely cast to FirebaseConfig
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
            const config = resolveConfig(normalizedOptions, viteConfig.mode)

            if (normalizedOptions.validate && !validateConfig(config)) {
              return
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
