# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-02-17

### Added

- Performance Monitor API module: types, `PerformanceMonitor` class for recording samples, threshold-based warnings, and summary statistics.
- Overdraw Detector API module: types, `analyzeOverdraw` function for view hierarchy overdraw analysis with Vega Studio tint-color classification.
- Example usage modules for Performance Monitor and Overdraw Detector.
- TSDoc annotations on all new public APIs.

## [0.1.0] - 2026-02-16

### Added

- Initial project scaffolding with TypeScript strict mode and ESLint configuration.
- Content Launcher API module: type definitions, `handleLaunchContent` processing logic, payload serialization.
- Media Controls API module: type definitions, `SessionManager` for session lifecycle, `EndpointDiscovery`.
- Example usage modules for Content Launcher, Media Controls handler, and picture-in-picture scenarios.
- TSDoc annotations on all public APIs for documentation generation readiness.
- Property-based tests (fast-check) and unit tests (Jest) for correctness validation.
