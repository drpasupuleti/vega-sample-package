/**
 * Vega Sample Package
 *
 * A reference implementation demonstrating two Vega OS APIs:
 * - **Content Launcher API**: Enables apps to integrate with the Fire TV home launcher
 *   and Alexa voice commands for content search and playback.
 * - **Media Controls API**: Provides functionality for integrating diverse input
 *   modalities (remote, voice, touch) for media control.
 *
 * This package is intended as input for documentation generation tooling.
 *
 * @packageDocumentation
 */

/** The current version of the vega-sample-package, matching package.json. */
export const VERSION = '0.1.0';

export * from './content-launcher';
export * from './media-controls';
