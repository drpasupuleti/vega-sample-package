/**
 * Session management for the Media Controls API.
 *
 * Provides lifecycle management for media sessions including creation,
 * updates, destruction, and listener-based state change notifications.
 * Supports multiple concurrent sessions for scenarios like picture-in-picture.
 *
 * @module media-controls/session-manager
 * @see {@link MediaSession}
 * @see {@link SessionListener}
 */

import type { MediaSession, SessionListener } from './types';

/**
 * Manages the lifecycle of media sessions including creation, state updates,
 * destruction, and listener notifications.
 *
 * Each session is identified by a unique session ID generated using a
 * counter-based approach (`session-{counter}`) for deterministic testing.
 * Sessions maintain independent state and listener sets, supporting
 * multi-session scenarios such as picture-in-picture.
 *
 * @example
 * ```typescript
 * const manager = new SessionManager();
 *
 * const session = manager.createSession({
 *   title: 'My Video',
 *   playbackState: PlaybackState.PLAYING,
 *   supportedControls: ['play', 'pause', 'stop'],
 *   capabilities: { canSeek: true, canSkipForward: false, canSkipBackward: false, canFastForward: false, canRewind: false, canSetPlaybackSpeed: false },
 *   positionMs: 0,
 *   durationMs: 120000,
 * });
 *
 * manager.addListener(session.sessionId, (updated) => {
 *   console.log(`Session updated: ${updated.playbackState}`);
 * });
 *
 * manager.updateSession(session.sessionId, { playbackState: PlaybackState.PAUSED });
 * manager.destroySession(session.sessionId);
 * ```
 */
export class SessionManager {
  /** Internal map of session ID to session data. */
  private sessions: Map<string, MediaSession> = new Map();

  /** Internal map of session ID to registered listeners. */
  private listeners: Map<string, SessionListener[]> = new Map();

  /** Counter for generating unique session IDs. */
  private counter = 0;

  /**
   * Creates a new media session with a unique identifier.
   *
   * Generates a deterministic session ID using a counter-based approach
   * (`session-{counter}`) and stores the session for future retrieval.
   *
   * @param metadata - Session metadata excluding the session ID, which is auto-generated.
   * @returns The newly created {@link MediaSession} with a unique `sessionId`.
   *
   * @example
   * ```typescript
   * const session = manager.createSession({
   *   title: 'Breaking Bad S1E1',
   *   playbackState: PlaybackState.IDLE,
   *   supportedControls: ['play', 'pause', 'seek'],
   *   capabilities: { canSeek: true, canSkipForward: false, canSkipBackward: false, canFastForward: false, canRewind: false, canSetPlaybackSpeed: false },
   *   positionMs: 0,
   *   durationMs: 3480000,
   * });
   * console.log(session.sessionId); // "session-1"
   * ```
   */
  createSession(metadata: Omit<MediaSession, 'sessionId'>): MediaSession {
    this.counter += 1;
    const sessionId = `session-${this.counter}`;
    const session: MediaSession = { sessionId, ...metadata };
    this.sessions.set(sessionId, session);
    this.listeners.set(sessionId, []);
    return session;
  }

  /**
   * Retrieves a session by its unique identifier.
   *
   * @param sessionId - The unique session identifier to look up.
   * @returns The {@link MediaSession} if found, or `undefined` if no session exists with the given ID.
   *
   * @example
   * ```typescript
   * const session = manager.getSession('session-1');
   * if (session) {
   *   console.log(session.title);
   * }
   * ```
   */
  getSession(sessionId: string): MediaSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Updates an existing session with partial state changes and notifies all registered listeners.
   *
   * Merges the provided updates into the existing session state. The `sessionId` field
   * in updates is ignored to prevent ID mutation.
   *
   * @param sessionId - The unique session identifier to update.
   * @param updates - Partial session fields to merge into the existing session.
   * @returns The updated {@link MediaSession}.
   * @throws {Error} If no session exists with the given `sessionId`.
   *
   * @example
   * ```typescript
   * const updated = manager.updateSession('session-1', {
   *   playbackState: PlaybackState.PAUSED,
   *   positionMs: 45000,
   * });
   * ```
   */
  updateSession(sessionId: string, updates: Partial<MediaSession>): MediaSession {
    const existing = this.sessions.get(sessionId);
    if (!existing) {
      throw new Error(`Session not found: ${sessionId}`);
    }
    const updated: MediaSession = { ...existing, ...updates, sessionId };
    this.sessions.set(sessionId, updated);

    const sessionListeners = this.listeners.get(sessionId) ?? [];
    for (const listener of sessionListeners) {
      listener(updated);
    }

    return updated;
  }

  /**
   * Destroys a session and removes all associated listeners.
   *
   * This operation is idempotent — calling it with an unknown session ID is a no-op.
   *
   * @param sessionId - The unique session identifier to destroy.
   *
   * @example
   * ```typescript
   * manager.destroySession('session-1');
   * // Subsequent calls are safe no-ops
   * manager.destroySession('session-1');
   * ```
   */
  destroySession(sessionId: string): void {
    this.sessions.delete(sessionId);
    this.listeners.delete(sessionId);
  }

  /**
   * Returns all currently active sessions.
   *
   * @returns An array of all active {@link MediaSession} objects.
   *
   * @example
   * ```typescript
   * const sessions = manager.getAllSessions();
   * console.log(`Active sessions: ${sessions.length}`);
   * ```
   */
  getAllSessions(): MediaSession[] {
    return Array.from(this.sessions.values());
  }

  /**
   * Registers a listener to be notified when a session's state changes.
   *
   * The listener will be called with the updated {@link MediaSession} each time
   * {@link updateSession} is invoked for the specified session.
   *
   * @param sessionId - The unique session identifier to listen to.
   * @param listener - A callback invoked with the updated session state.
   * @throws {Error} If no session exists with the given `sessionId`.
   *
   * @see {@link SessionListener}
   *
   * @example
   * ```typescript
   * manager.addListener('session-1', (session) => {
   *   console.log(`Now ${session.playbackState} at ${session.positionMs}ms`);
   * });
   * ```
   */
  addListener(sessionId: string, listener: SessionListener): void {
    if (!this.sessions.has(sessionId)) {
      throw new Error(`Session not found: ${sessionId}`);
    }
    const sessionListeners = this.listeners.get(sessionId) ?? [];
    sessionListeners.push(listener);
    this.listeners.set(sessionId, sessionListeners);
  }

  /**
   * Removes a specific listener from a session.
   *
   * If the listener is not registered for the session, this is a no-op.
   *
   * @param sessionId - The unique session identifier.
   * @param listener - The listener callback to remove.
   *
   * @example
   * ```typescript
   * const listener: SessionListener = (session) => console.log(session.title);
   * manager.addListener('session-1', listener);
   * manager.removeListener('session-1', listener);
   * ```
   */
  removeListener(sessionId: string, listener: SessionListener): void {
    const sessionListeners = this.listeners.get(sessionId);
    if (!sessionListeners) {
      return;
    }
    const index = sessionListeners.indexOf(listener);
    if (index !== -1) {
      sessionListeners.splice(index, 1);
    }
  }
}
