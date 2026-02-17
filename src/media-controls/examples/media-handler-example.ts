/**
 * Example demonstrating Media Controls API handler implementation.
 *
 * Shows how to implement {@link IMediaControlHandlerAsync}, create a
 * {@link MediaSession} via {@link SessionManager}, respond to control
 * commands, and observe state changes through a listener.
 *
 * @module media-controls/examples/media-handler-example
 */

import {
  type IMediaControlHandlerAsync,
  PlaybackState,
  SessionManager,
  type MediaSession,
} from '../';

// ---------------------------------------------------------------------------
// Step 1 — Implement IMediaControlHandlerAsync
// A media provider app implements this interface to react to incoming
// control commands dispatched by the platform (remote, voice, touch).
// ---------------------------------------------------------------------------

/** Simple in-memory playback position tracker used by the handler. */
let currentPositionMs = 0;
let currentState: PlaybackState = PlaybackState.IDLE;
const DURATION_MS = 3_600_000; // 1 hour
const SKIP_INTERVAL_MS = 30_000; // 30 seconds

const myHandler: IMediaControlHandlerAsync = {
  async handlePlay(): Promise<void> {
    currentState = PlaybackState.PLAYING;
    console.log('[Handler] ▶ Play — resuming playback');
  },

  async handlePause(): Promise<void> {
    currentState = PlaybackState.PAUSED;
    console.log('[Handler] ⏸ Pause');
  },

  async handleStop(): Promise<void> {
    currentState = PlaybackState.STOPPED;
    currentPositionMs = 0;
    console.log('[Handler] ⏹ Stop — position reset to 0');
  },

  async handleSeek(positionMs: number): Promise<void> {
    currentPositionMs = Math.min(Math.max(positionMs, 0), DURATION_MS);
    console.log(`[Handler] ⏩ Seek to ${currentPositionMs}ms`);
  },

  async handleNext(): Promise<void> {
    console.log('[Handler] ⏭ Next track');
  },

  async handlePrevious(): Promise<void> {
    console.log('[Handler] ⏮ Previous track');
  },

  async handleFastForward(): Promise<void> {
    console.log('[Handler] ⏩ Fast forward');
  },

  async handleRewind(): Promise<void> {
    console.log('[Handler] ⏪ Rewind');
  },

  async handleSkipForward(intervalMs: number): Promise<void> {
    currentPositionMs = Math.min(currentPositionMs + intervalMs, DURATION_MS);
    console.log(`[Handler] ⏩ Skip forward ${intervalMs}ms → ${currentPositionMs}ms`);
  },

  async handleSkipBackward(intervalMs: number): Promise<void> {
    currentPositionMs = Math.max(currentPositionMs - intervalMs, 0);
    console.log(`[Handler] ⏪ Skip backward ${intervalMs}ms → ${currentPositionMs}ms`);
  },

  async handleTogglePlayPause(): Promise<void> {
    currentState =
      currentState === PlaybackState.PLAYING
        ? PlaybackState.PAUSED
        : PlaybackState.PLAYING;
    console.log(`[Handler] ⏯ Toggle → ${currentState}`);
  },

  async handleStartOver(): Promise<void> {
    currentPositionMs = 0;
    currentState = PlaybackState.PLAYING;
    console.log('[Handler] 🔄 Start over — position reset, playing');
  },
};

// ---------------------------------------------------------------------------
// Step 2 — Create a MediaSession via SessionManager
// ---------------------------------------------------------------------------

const manager = new SessionManager();

const session: MediaSession = manager.createSession({
  title: 'Planet Earth II — Mountains',
  playbackState: PlaybackState.IDLE,
  supportedControls: [
    'play', 'pause', 'stop', 'seek',
    'next', 'previous',
    'skipForward', 'skipBackward',
    'togglePlayPause', 'startOver',
  ],
  capabilities: {
    canSeek: true,
    canSkipForward: true,
    canSkipBackward: true,
    canFastForward: false,
    canRewind: false,
    canSetPlaybackSpeed: true,
  },
  positionMs: 0,
  durationMs: DURATION_MS,
});

console.log(`Created session "${session.sessionId}" — ${session.title}`);
console.log();

// ---------------------------------------------------------------------------
// Step 3 — Register a listener to observe state changes
// ---------------------------------------------------------------------------

manager.addListener(session.sessionId, (updated: MediaSession) => {
  console.log(
    `[Listener] Session "${updated.sessionId}" → ` +
      `state=${updated.playbackState}, position=${updated.positionMs}ms`,
  );
});

// ---------------------------------------------------------------------------
// Step 4 — Simulate responding to control commands
// Each command invokes the handler, then updates the session so listeners
// are notified of the new state.
// ---------------------------------------------------------------------------

async function simulateCommands(): Promise<void> {
  // Play
  await myHandler.handlePlay();
  manager.updateSession(session.sessionId, {
    playbackState: currentState,
    positionMs: currentPositionMs,
  });
  console.log();

  // Skip forward 30 seconds
  await myHandler.handleSkipForward(SKIP_INTERVAL_MS);
  manager.updateSession(session.sessionId, {
    positionMs: currentPositionMs,
  });
  console.log();

  // Pause
  await myHandler.handlePause();
  manager.updateSession(session.sessionId, {
    playbackState: currentState,
  });
  console.log();

  // Seek to 5 minutes
  await myHandler.handleSeek(300_000);
  manager.updateSession(session.sessionId, {
    positionMs: currentPositionMs,
  });
  console.log();

  // Toggle play/pause (resumes)
  await myHandler.handleTogglePlayPause();
  manager.updateSession(session.sessionId, {
    playbackState: currentState,
  });
  console.log();

  // Start over
  await myHandler.handleStartOver();
  manager.updateSession(session.sessionId, {
    playbackState: currentState,
    positionMs: currentPositionMs,
  });
  console.log();

  // Stop and clean up
  await myHandler.handleStop();
  manager.updateSession(session.sessionId, {
    playbackState: currentState,
    positionMs: currentPositionMs,
  });
  console.log();

  // Destroy the session
  manager.destroySession(session.sessionId);
  console.log(`Session "${session.sessionId}" destroyed`);
}

simulateCommands().catch(console.error);
