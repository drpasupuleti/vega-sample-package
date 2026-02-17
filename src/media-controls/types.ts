/**
 * Type definitions for the Vega Media Controls API.
 *
 * The Media Controls API provides functionality for integrating diverse input
 * modalities (remote, voice, touch) for media control on Vega OS devices.
 * It defines interfaces for both client-side command dispatch and provider-side
 * command handling, along with session metadata and capability types.
 *
 * @see {@link https://developer.amazon.com/docs/vega-api/latest/ | Vega API Reference}
 * @module media-controls/types
 */

/**
 * Playback states for a media session.
 *
 * Represents the current state of media playback within a
 * {@link MediaSession}. Transitions between states are driven by
 * control commands sent through {@link IMediaControlClientAsync}.
 *
 * @example
 * ```typescript
 * const session: MediaSession = {
 *   sessionId: 'abc-123',
 *   title: 'My Video',
 *   playbackState: PlaybackState.PLAYING,
 *   supportedControls: ['play', 'pause', 'stop'],
 *   capabilities: {
 *     canSeek: true,
 *     canSkipForward: true,
 *     canSkipBackward: true,
 *     canFastForward: false,
 *     canRewind: false,
 *     canSetPlaybackSpeed: false,
 *   },
 *   positionMs: 30000,
 *   durationMs: 3600000,
 * };
 * ```
 */
export enum PlaybackState {
  /** No media is loaded or ready for playback. */
  IDLE = 'idle',
  /** Media is actively playing. */
  PLAYING = 'playing',
  /** Media playback is paused. */
  PAUSED = 'paused',
  /** Media is loading or buffering before playback can resume. */
  BUFFERING = 'buffering',
  /** Media playback has been stopped. */
  STOPPED = 'stopped',
}

/**
 * Repeat modes for media playback.
 *
 * Controls how the media player handles playback when the current track
 * or playlist reaches its end. Set via
 * {@link IMediaControlClientAsync.setRepeatMode}.
 *
 * @example
 * ```typescript
 * // Loop the current track
 * await client.setRepeatMode('session-1', RepeatMode.ONE);
 * ```
 */
export enum RepeatMode {
  /** No repeat — playback stops at the end. */
  OFF = 'off',
  /** Repeat the current track. */
  ONE = 'one',
  /** Repeat the entire playlist. */
  ALL = 'all',
}

/**
 * The set of media control actions that a session may support.
 *
 * Each value corresponds to a method on {@link IMediaControlClientAsync}.
 * A session advertises its supported controls in
 * {@link MediaSession.supportedControls} so that UI layers can enable or
 * disable buttons accordingly.
 *
 * @see {@link MediaSession.supportedControls}
 * @see {@link IMediaControlClientAsync}
 */
export type SupportedControl =
  | 'play'
  | 'pause'
  | 'stop'
  | 'seek'
  | 'next'
  | 'previous'
  | 'fastForward'
  | 'rewind'
  | 'skipForward'
  | 'skipBackward'
  | 'togglePlayPause'
  | 'startOver';

/**
 * Capability flags describing what a media session can do.
 *
 * These flags allow the platform to adapt its UI and voice-command
 * routing based on the media provider's capabilities.
 *
 * @see {@link MediaSession.capabilities}
 *
 * @example
 * ```typescript
 * const caps: MediaSessionCapabilities = {
 *   canSeek: true,
 *   canSkipForward: true,
 *   canSkipBackward: false,
 *   canFastForward: true,
 *   canRewind: true,
 *   canSetPlaybackSpeed: false,
 * };
 * ```
 */
export interface MediaSessionCapabilities {
  /** Whether the session supports seeking to an arbitrary position. */
  canSeek: boolean;
  /** Whether the session supports skipping forward by a fixed interval. */
  canSkipForward: boolean;
  /** Whether the session supports skipping backward by a fixed interval. */
  canSkipBackward: boolean;
  /** Whether the session supports fast-forward playback. */
  canFastForward: boolean;
  /** Whether the session supports rewind playback. */
  canRewind: boolean;
  /** Whether the session supports changing the playback speed. */
  canSetPlaybackSpeed: boolean;
}

/**
 * Represents metadata and state for a currently active media session.
 *
 * A media session is created by a media provider app and tracks the
 * current playback state, position, duration, and the set of controls
 * the provider supports. The platform uses this information to route
 * control commands and update the system UI.
 *
 * @see {@link PlaybackState} for possible playback states.
 * @see {@link SupportedControl} for the control action values.
 * @see {@link MediaSessionCapabilities} for capability flags.
 *
 * @example
 * ```typescript
 * const session: MediaSession = {
 *   sessionId: 'sess-001',
 *   title: 'Planet Earth II',
 *   playbackState: PlaybackState.PLAYING,
 *   supportedControls: ['play', 'pause', 'stop', 'seek', 'skipForward', 'skipBackward'],
 *   capabilities: {
 *     canSeek: true,
 *     canSkipForward: true,
 *     canSkipBackward: true,
 *     canFastForward: false,
 *     canRewind: false,
 *     canSetPlaybackSpeed: true,
 *   },
 *   positionMs: 120000,
 *   durationMs: 3540000,
 * };
 * ```
 */
export interface MediaSession {
  /** Unique session identifier assigned by the session manager. */
  sessionId: string;
  /** Title of the media being played. */
  title: string;
  /** Current playback state of the session. */
  playbackState: PlaybackState;
  /** Set of controls supported by this session. */
  supportedControls: SupportedControl[];
  /** Capability flags for this session. */
  capabilities: MediaSessionCapabilities;
  /** Current playback position in milliseconds. */
  positionMs: number;
  /** Total duration of the media in milliseconds. */
  durationMs: number;
}

/**
 * Client-side interface for sending media control commands to a session.
 *
 * All methods are asynchronous and accept a `sessionId` as the first
 * parameter to target a specific media session. This interface is used
 * by the platform (remote control, voice, touch) to dispatch commands
 * to the media provider app.
 *
 * @see {@link IMediaControlHandlerAsync} for the provider-side handler.
 * @see {@link MediaSession} for session metadata.
 *
 * @example
 * ```typescript
 * // Resume playback on a session
 * await client.play('sess-001');
 *
 * // Seek to 2 minutes
 * await client.seek('sess-001', 120000);
 *
 * // Set volume to 80%
 * await client.setAudioVolume('sess-001', 80);
 * ```
 */
export interface IMediaControlClientAsync {
  /**
   * Start or resume playback.
   * @param sessionId - The target session identifier.
   * @returns A promise that resolves when the command is acknowledged.
   */
  play(sessionId: string): Promise<void>;

  /**
   * Pause playback.
   * @param sessionId - The target session identifier.
   * @returns A promise that resolves when the command is acknowledged.
   */
  pause(sessionId: string): Promise<void>;

  /**
   * Stop playback and release resources.
   * @param sessionId - The target session identifier.
   * @returns A promise that resolves when the command is acknowledged.
   */
  stop(sessionId: string): Promise<void>;

  /**
   * Seek to a specific position.
   * @param sessionId - The target session identifier.
   * @param positionMs - The target position in milliseconds.
   * @returns A promise that resolves when the command is acknowledged.
   * @see {@link MediaSessionCapabilities.canSeek}
   */
  seek(sessionId: string, positionMs: number): Promise<void>;

  /**
   * Skip to the next track or item.
   * @param sessionId - The target session identifier.
   * @returns A promise that resolves when the command is acknowledged.
   */
  next(sessionId: string): Promise<void>;

  /**
   * Go back to the previous track or item.
   * @param sessionId - The target session identifier.
   * @returns A promise that resolves when the command is acknowledged.
   */
  previous(sessionId: string): Promise<void>;

  /**
   * Begin fast-forward playback.
   * @param sessionId - The target session identifier.
   * @returns A promise that resolves when the command is acknowledged.
   * @see {@link MediaSessionCapabilities.canFastForward}
   */
  fastForward(sessionId: string): Promise<void>;

  /**
   * Begin rewind playback.
   * @param sessionId - The target session identifier.
   * @returns A promise that resolves when the command is acknowledged.
   * @see {@link MediaSessionCapabilities.canRewind}
   */
  rewind(sessionId: string): Promise<void>;

  /**
   * Skip forward by a fixed interval.
   * @param sessionId - The target session identifier.
   * @param intervalMs - The interval to skip forward in milliseconds.
   * @returns A promise that resolves when the command is acknowledged.
   * @see {@link MediaSessionCapabilities.canSkipForward}
   */
  skipForward(sessionId: string, intervalMs: number): Promise<void>;

  /**
   * Skip backward by a fixed interval.
   * @param sessionId - The target session identifier.
   * @param intervalMs - The interval to skip backward in milliseconds.
   * @returns A promise that resolves when the command is acknowledged.
   * @see {@link MediaSessionCapabilities.canSkipBackward}
   */
  skipBackward(sessionId: string, intervalMs: number): Promise<void>;

  /**
   * Toggle between play and pause states.
   * @param sessionId - The target session identifier.
   * @returns A promise that resolves when the command is acknowledged.
   */
  togglePlayPause(sessionId: string): Promise<void>;

  /**
   * Restart playback from the beginning.
   * @param sessionId - The target session identifier.
   * @returns A promise that resolves when the command is acknowledged.
   */
  startOver(sessionId: string): Promise<void>;

  /**
   * Set the audio volume level.
   * @param sessionId - The target session identifier.
   * @param volume - The volume level (0–100).
   * @returns A promise that resolves when the command is acknowledged.
   */
  setAudioVolume(sessionId: string, volume: number): Promise<void>;

  /**
   * Switch to a specific audio track.
   * @param sessionId - The target session identifier.
   * @param trackId - The identifier of the audio track to activate.
   * @returns A promise that resolves when the command is acknowledged.
   */
  setAudioTrack(sessionId: string, trackId: string): Promise<void>;

  /**
   * Enable or disable shuffle mode.
   * @param sessionId - The target session identifier.
   * @param enabled - Whether shuffle should be enabled.
   * @returns A promise that resolves when the command is acknowledged.
   */
  enableShuffle(sessionId: string, enabled: boolean): Promise<void>;

  /**
   * Set the repeat mode for the current playlist or track.
   * @param sessionId - The target session identifier.
   * @param mode - The desired repeat mode.
   * @returns A promise that resolves when the command is acknowledged.
   * @see {@link RepeatMode}
   */
  setRepeatMode(sessionId: string, mode: RepeatMode): Promise<void>;

  /**
   * Set the playback speed multiplier.
   * @param sessionId - The target session identifier.
   * @param speed - The playback speed (e.g., 0.5 for half speed, 2.0 for double).
   * @returns A promise that resolves when the command is acknowledged.
   * @see {@link MediaSessionCapabilities.canSetPlaybackSpeed}
   */
  setPlaybackSpeed(sessionId: string, speed: number): Promise<void>;

  /**
   * Enable a text track (subtitles or closed captions).
   * @param sessionId - The target session identifier.
   * @param trackId - The identifier of the text track to enable.
   * @returns A promise that resolves when the command is acknowledged.
   */
  enableTextTrack(sessionId: string, trackId: string): Promise<void>;

  /**
   * Disable the currently active text track.
   * @param sessionId - The target session identifier.
   * @returns A promise that resolves when the command is acknowledged.
   */
  disableTextTrack(sessionId: string): Promise<void>;
}

/**
 * Handler interface that media provider apps implement to respond to
 * incoming media control commands.
 *
 * Each method corresponds to a control action dispatched by the platform
 * through {@link IMediaControlClientAsync}. The provider app implements
 * this interface to define how it reacts to each command.
 *
 * @see {@link IMediaControlClientAsync} for the client-side dispatch interface.
 * @see {@link MediaSession} for session metadata.
 *
 * @example
 * ```typescript
 * const handler: IMediaControlHandlerAsync = {
 *   async handlePlay() { player.resume(); },
 *   async handlePause() { player.pause(); },
 *   async handleStop() { player.stop(); },
 *   async handleSeek(positionMs) { player.seekTo(positionMs); },
 *   async handleNext() { playlist.next(); },
 *   async handlePrevious() { playlist.previous(); },
 *   async handleFastForward() { player.fastForward(); },
 *   async handleRewind() { player.rewind(); },
 *   async handleSkipForward(intervalMs) { player.skipForward(intervalMs); },
 *   async handleSkipBackward(intervalMs) { player.skipBackward(intervalMs); },
 *   async handleTogglePlayPause() { player.togglePlayPause(); },
 *   async handleStartOver() { player.seekTo(0); },
 * };
 * ```
 */
export interface IMediaControlHandlerAsync {
  /**
   * Handle a play command — start or resume playback.
   * @returns A promise that resolves when the command has been processed.
   */
  handlePlay(): Promise<void>;

  /**
   * Handle a pause command.
   * @returns A promise that resolves when the command has been processed.
   */
  handlePause(): Promise<void>;

  /**
   * Handle a stop command — stop playback and release resources.
   * @returns A promise that resolves when the command has been processed.
   */
  handleStop(): Promise<void>;

  /**
   * Handle a seek command.
   * @param positionMs - The target position in milliseconds.
   * @returns A promise that resolves when the command has been processed.
   */
  handleSeek(positionMs: number): Promise<void>;

  /**
   * Handle a next-track command.
   * @returns A promise that resolves when the command has been processed.
   */
  handleNext(): Promise<void>;

  /**
   * Handle a previous-track command.
   * @returns A promise that resolves when the command has been processed.
   */
  handlePrevious(): Promise<void>;

  /**
   * Handle a fast-forward command.
   * @returns A promise that resolves when the command has been processed.
   */
  handleFastForward(): Promise<void>;

  /**
   * Handle a rewind command.
   * @returns A promise that resolves when the command has been processed.
   */
  handleRewind(): Promise<void>;

  /**
   * Handle a skip-forward command.
   * @param intervalMs - The interval to skip forward in milliseconds.
   * @returns A promise that resolves when the command has been processed.
   */
  handleSkipForward(intervalMs: number): Promise<void>;

  /**
   * Handle a skip-backward command.
   * @param intervalMs - The interval to skip backward in milliseconds.
   * @returns A promise that resolves when the command has been processed.
   */
  handleSkipBackward(intervalMs: number): Promise<void>;

  /**
   * Handle a toggle-play-pause command.
   * @returns A promise that resolves when the command has been processed.
   */
  handleTogglePlayPause(): Promise<void>;

  /**
   * Handle a start-over command — restart from the beginning.
   * @returns A promise that resolves when the command has been processed.
   */
  handleStartOver(): Promise<void>;
}

/**
 * Callback type for monitoring media session state changes.
 *
 * Registered via the session manager's `addListener` method, this callback
 * is invoked whenever the target session's state is updated.
 *
 * @param session - The updated {@link MediaSession} state.
 *
 * @see {@link MediaSession}
 *
 * @example
 * ```typescript
 * const listener: SessionListener = (session) => {
 *   console.log(`Session ${session.sessionId} is now ${session.playbackState}`);
 * };
 * ```
 */
export type SessionListener = (session: MediaSession) => void;
