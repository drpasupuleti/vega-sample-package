/**
 * Example demonstrating multi-session management for picture-in-picture (PiP).
 *
 * Shows how to create two independent {@link MediaSession} instances via
 * {@link SessionManager}, update them independently, and use
 * {@link EndpointDiscovery} to register apps and list active endpoints.
 *
 * In a PiP scenario the platform maintains a primary (full-screen) session
 * and a secondary (overlay) session. Each session tracks its own playback
 * state, position, and listener set.
 *
 * @module media-controls/examples/pip-example
 */

import {
  PlaybackState,
  SessionManager,
  EndpointDiscovery,
  type MediaSession,
} from '../';

// ---------------------------------------------------------------------------
// Step 1 — Set up SessionManager and EndpointDiscovery
// ---------------------------------------------------------------------------

const manager = new SessionManager();
const discovery = new EndpointDiscovery();

// Register two media provider apps
discovery.registerApp('com.example.streaming', 'Example Streaming');
discovery.registerApp('com.example.sports', 'Example Sports');

console.log('Registered endpoints:');
for (const ep of discovery.listEndpoints()) {
  console.log(`  • ${ep.appName} (${ep.appId})`);
}
console.log();

// ---------------------------------------------------------------------------
// Step 2 — Create two independent sessions (primary + PiP overlay)
// ---------------------------------------------------------------------------

const primarySession: MediaSession = manager.createSession({
  title: 'Documentary — Deep Ocean',
  playbackState: PlaybackState.PLAYING,
  supportedControls: ['play', 'pause', 'stop', 'seek', 'skipForward', 'skipBackward'],
  capabilities: {
    canSeek: true,
    canSkipForward: true,
    canSkipBackward: true,
    canFastForward: false,
    canRewind: false,
    canSetPlaybackSpeed: true,
  },
  positionMs: 0,
  durationMs: 5_400_000, // 90 minutes
});

const pipSession: MediaSession = manager.createSession({
  title: 'Live — Championship Finals',
  playbackState: PlaybackState.PLAYING,
  supportedControls: ['play', 'pause', 'stop'],
  capabilities: {
    canSeek: false,
    canSkipForward: false,
    canSkipBackward: false,
    canFastForward: false,
    canRewind: false,
    canSetPlaybackSpeed: false,
  },
  positionMs: 0,
  durationMs: 7_200_000, // 2 hours (live)
});

console.log(`Primary session: "${primarySession.sessionId}" — ${primarySession.title}`);
console.log(`PiP session:     "${pipSession.sessionId}" — ${pipSession.title}`);
console.log();

// Associate sessions with their respective app endpoints
discovery.addSessionToEndpoint('com.example.streaming', primarySession.sessionId);
discovery.addSessionToEndpoint('com.example.sports', pipSession.sessionId);

// ---------------------------------------------------------------------------
// Step 3 — Register listeners on each session independently
// ---------------------------------------------------------------------------

manager.addListener(primarySession.sessionId, (updated: MediaSession) => {
  console.log(
    `[Primary] "${updated.title}" → state=${updated.playbackState}, ` +
      `position=${updated.positionMs}ms`,
  );
});

manager.addListener(pipSession.sessionId, (updated: MediaSession) => {
  console.log(
    `[PiP]     "${updated.title}" → state=${updated.playbackState}, ` +
      `position=${updated.positionMs}ms`,
  );
});

// ---------------------------------------------------------------------------
// Step 4 — Update sessions independently to demonstrate isolation
// ---------------------------------------------------------------------------

// Advance primary session — PiP session should NOT be affected
manager.updateSession(primarySession.sessionId, { positionMs: 120_000 });
console.log();

// Pause PiP session — primary session should NOT be affected
manager.updateSession(pipSession.sessionId, { playbackState: PlaybackState.PAUSED });
console.log();

// Verify independence: primary is still PLAYING, PiP is PAUSED
const primaryState = manager.getSession(primarySession.sessionId);
const pipState = manager.getSession(pipSession.sessionId);
console.log(`Primary state: ${primaryState?.playbackState} (expected: ${PlaybackState.PLAYING})`);
console.log(`PiP state:     ${pipState?.playbackState} (expected: ${PlaybackState.PAUSED})`);
console.log();

// ---------------------------------------------------------------------------
// Step 5 — List endpoints and their active sessions
// ---------------------------------------------------------------------------

console.log('Endpoint discovery:');
for (const ep of discovery.listEndpoints()) {
  console.log(`  • ${ep.appName}: sessions=[${ep.activeSessions.join(', ')}]`);
}
console.log();

// ---------------------------------------------------------------------------
// Step 6 — Clean up: destroy sessions and unregister apps
// ---------------------------------------------------------------------------

discovery.removeSessionFromEndpoint('com.example.sports', pipSession.sessionId);
manager.destroySession(pipSession.sessionId);
console.log(`PiP session "${pipSession.sessionId}" destroyed`);

discovery.removeSessionFromEndpoint('com.example.streaming', primarySession.sessionId);
manager.destroySession(primarySession.sessionId);
console.log(`Primary session "${primarySession.sessionId}" destroyed`);

console.log(`Remaining sessions: ${manager.getAllSessions().length}`);
console.log(`Remaining endpoints: ${discovery.listEndpoints().length}`);

// Unregister apps
discovery.unregisterApp('com.example.streaming');
discovery.unregisterApp('com.example.sports');
console.log('All apps unregistered');
