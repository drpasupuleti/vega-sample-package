/**
 * Endpoint discovery for the Media Controls API.
 *
 * Provides a registry of integrated media provider apps and their active
 * sessions. The platform uses this to enumerate available media endpoints
 * and route control commands to the correct provider.
 *
 * @module media-controls/discovery
 * @see {@link SessionManager} for session lifecycle management.
 * @see {@link MediaSession} for session metadata.
 */

/**
 * Describes a registered media provider app and its active sessions.
 *
 * Each endpoint represents a single app that has integrated with the
 * Media Controls API. The `activeSessions` array tracks which sessions
 * are currently owned by this app.
 *
 * @see {@link EndpointDiscovery} for the registry that manages endpoints.
 *
 * @example
 * ```typescript
 * const endpoint: MediaEndpoint = {
 *   appId: 'com.example.player',
 *   appName: 'Example Player',
 *   activeSessions: ['session-1', 'session-2'],
 * };
 * ```
 */
export interface MediaEndpoint {
  /** Unique application identifier. */
  appId: string;
  /** Human-readable application name. */
  appName: string;
  /** List of active session IDs owned by this app. */
  activeSessions: string[];
}

/**
 * Registry for discovering integrated media provider apps and their sessions.
 *
 * Apps register themselves via {@link registerApp} and can be queried
 * through {@link listEndpoints} or {@link getEndpoint}. Sessions are
 * associated with endpoints via {@link addSessionToEndpoint} and removed
 * via {@link removeSessionFromEndpoint}.
 *
 * @see {@link MediaEndpoint} for the endpoint data structure.
 * @see {@link SessionManager} for managing individual session lifecycles.
 *
 * @example
 * ```typescript
 * const discovery = new EndpointDiscovery();
 *
 * discovery.registerApp('com.example.player', 'Example Player');
 * discovery.addSessionToEndpoint('com.example.player', 'session-1');
 *
 * const endpoints = discovery.listEndpoints();
 * console.log(endpoints[0].activeSessions); // ['session-1']
 *
 * discovery.removeSessionFromEndpoint('com.example.player', 'session-1');
 * discovery.unregisterApp('com.example.player');
 * ```
 */
export class EndpointDiscovery {
  /** Internal map of app ID to endpoint data. */
  private endpoints: Map<string, MediaEndpoint> = new Map();

  /**
   * Registers a new media provider app as an available endpoint.
   *
   * Creates an endpoint entry with an empty active sessions list.
   * If an app with the same ID is already registered, it is overwritten.
   *
   * @param appId - Unique application identifier.
   * @param appName - Human-readable application name.
   *
   * @see {@link MediaEndpoint}
   *
   * @example
   * ```typescript
   * discovery.registerApp('com.example.player', 'Example Player');
   * ```
   */
  registerApp(appId: string, appName: string): void {
    this.endpoints.set(appId, { appId, appName, activeSessions: [] });
  }

  /**
   * Removes a media provider app from the registry.
   *
   * This operation is idempotent — calling it with an unknown app ID is a no-op.
   *
   * @param appId - The unique application identifier to remove.
   *
   * @see {@link registerApp}
   *
   * @example
   * ```typescript
   * discovery.unregisterApp('com.example.player');
   * // Safe to call again
   * discovery.unregisterApp('com.example.player');
   * ```
   */
  unregisterApp(appId: string): void {
    this.endpoints.delete(appId);
  }

  /**
   * Returns all currently registered media provider endpoints.
   *
   * @returns An array of all registered {@link MediaEndpoint} objects.
   *
   * @see {@link MediaEndpoint}
   *
   * @example
   * ```typescript
   * const endpoints = discovery.listEndpoints();
   * for (const ep of endpoints) {
   *   console.log(`${ep.appName}: ${ep.activeSessions.length} sessions`);
   * }
   * ```
   */
  listEndpoints(): MediaEndpoint[] {
    return Array.from(this.endpoints.values());
  }

  /**
   * Retrieves a specific endpoint by its application ID.
   *
   * Returns `undefined` if no endpoint is registered with the given ID.
   *
   * @param appId - The unique application identifier to look up.
   * @returns The {@link MediaEndpoint} if found, or `undefined`.
   *
   * @see {@link registerApp}
   *
   * @example
   * ```typescript
   * const endpoint = discovery.getEndpoint('com.example.player');
   * if (endpoint) {
   *   console.log(`${endpoint.appName} has ${endpoint.activeSessions.length} sessions`);
   * }
   * ```
   */
  getEndpoint(appId: string): MediaEndpoint | undefined {
    return this.endpoints.get(appId);
  }

  /**
   * Adds a session ID to an endpoint's active sessions list.
   *
   * If the app ID is not registered, this is a no-op. Duplicate session
   * IDs are not added.
   *
   * @param appId - The unique application identifier.
   * @param sessionId - The session ID to associate with the endpoint.
   *
   * @see {@link removeSessionFromEndpoint}
   *
   * @example
   * ```typescript
   * discovery.registerApp('com.example.player', 'Example Player');
   * discovery.addSessionToEndpoint('com.example.player', 'session-1');
   * ```
   */
  addSessionToEndpoint(appId: string, sessionId: string): void {
    const endpoint = this.endpoints.get(appId);
    if (!endpoint) {
      return;
    }
    if (!endpoint.activeSessions.includes(sessionId)) {
      endpoint.activeSessions.push(sessionId);
    }
  }

  /**
   * Removes a session ID from an endpoint's active sessions list.
   *
   * If the app ID is not registered or the session ID is not in the list,
   * this is a no-op.
   *
   * @param appId - The unique application identifier.
   * @param sessionId - The session ID to disassociate from the endpoint.
   *
   * @see {@link addSessionToEndpoint}
   *
   * @example
   * ```typescript
   * discovery.removeSessionFromEndpoint('com.example.player', 'session-1');
   * ```
   */
  removeSessionFromEndpoint(appId: string, sessionId: string): void {
    const endpoint = this.endpoints.get(appId);
    if (!endpoint) {
      return;
    }
    const index = endpoint.activeSessions.indexOf(sessionId);
    if (index !== -1) {
      endpoint.activeSessions.splice(index, 1);
    }
  }
}
