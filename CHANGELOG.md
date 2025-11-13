# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.1] - 2025-11-13

### Fixed

- Fixed issue where init.json file was not generated when no initial configuration or environment variables were present
- Improved validation logic to ensure file generation continues in non-strict mode even when configuration is missing
- Enhanced warning messages to clearly indicate when empty fields are being filled in non-strict mode

## [0.2.0] - 2025-11-10

### Added

- New `strictValidation` option for flexible validation mode (defaults to `false`)
  - When `false`: Shows warnings for missing required fields but allows build to continue
  - When `true`: Throws errors and stops build for missing required fields
- New `fillMissingFields` function to auto-fill missing required fields with empty strings in non-strict mode
- Comprehensive test coverage for `strictValidation` feature
- Documentation for validation modes in README

### Changed

- Default validation behavior is now non-strict (warnings instead of errors)
- Missing required fields are automatically filled with empty strings in non-strict mode

### Improved

- Better developer experience during development by not blocking builds when Firebase config is incomplete
- More flexible configuration management across different environments

## [0.1.0] - 2025-11-10

### Added

- Initial release
- Automatic Firebase configuration sync from environment variables to static files
- Support for multiple environments (dev, staging, production)
- Configuration validation
- Hot reload in development mode
- Custom transform functions
- Debug logging
- TypeScript support
