/**
 * Media Controls module — re-exports all types, classes, and interfaces.
 *
 * @module media-controls
 */

export {
  PlaybackState,
  RepeatMode,
  type SupportedControl,
  type MediaSessionCapabilities,
  type MediaSession,
  type IMediaControlClientAsync,
  type IMediaControlHandlerAsync,
  type SessionListener,
} from './types';

export { SessionManager } from './session-manager';

export { EndpointDiscovery, type MediaEndpoint } from './discovery';
