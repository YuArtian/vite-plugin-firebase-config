import type { FirebaseOptions } from 'firebase/app'

/**
 * Firebase configuration object (re-export from Firebase SDK)
 */
export type FirebaseConfig = FirebaseOptions

/**
 * Output configuration
 */
export interface OutputConfig {
  /**
   * Output file path relative to project root
   * @default 'public/__/auth/init.json'
   */
  path?: string

  /**
   * JSON indentation (spaces)
   * @default 2
   */
  indent?: number

  /**
   * Whether to add a warning comment in the generated file
   * @default true
   */
  addWarningComment?: boolean
}

/**
 * Environment-specific configuration overrides
 */
export interface EnvironmentConfig {
  [key: string]: Partial<FirebaseConfig>
}

/**
 * Plugin options
 */
export interface PluginOptions {
  /**
   * Configuration source
   * - 'env': Read from environment variables (default)
   * - 'inline': Use inline config object
   * @default 'env'
   */
  source?: 'env' | 'inline'

  /**
   * Prefix for environment variables
   * @default 'VITE_FIREBASE_'
   */
  envPrefix?: string

  /**
   * Inline Firebase configuration (used when source is 'inline')
   */
  config?: FirebaseConfig

  /**
   * Output configuration
   */
  output?: OutputConfig

  /**
   * Environment-specific configuration overrides
   * Merged with base config based on current NODE_ENV or Vite mode
   */
  environments?: EnvironmentConfig

  /**
   * Validate Firebase configuration
   * @default true
   */
  validate?: boolean

  /**
   * Enable hot reload in development mode
   * @default true
   */
  watch?: boolean

  /**
   * Custom transform function to modify config before writing
   */
  transform?: TransformFunction

  /**
   * Enable debug logging
   * @default false
   */
  debug?: boolean
}

/**
 * Normalized plugin options with defaults applied
 */
export interface NormalizedPluginOptions
  extends Required<Omit<PluginOptions, 'transform'>> {
  output: Required<OutputConfig>
  transform?: TransformFunction
}

/**
 * Transform function type
 * @param config - Firebase configuration object to transform
 * @returns Transformed Firebase configuration
 */
// eslint-disable-next-line no-unused-vars
export type TransformFunction = (config: FirebaseConfig) => FirebaseConfig
