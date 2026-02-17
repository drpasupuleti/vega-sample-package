/**
 * Example demonstrating Content Launcher API integration.
 *
 * Shows how to process incoming launch requests from the Fire TV launcher
 * or Alexa voice commands using {@link handleLaunchContent}, covering
 * different intent scenarios: play, search, and playshow.
 *
 * @module content-launcher/examples/launch-content-example
 */

import {
  EntityType,
  type IContentSearch,
  type ILaunchContentOptionalFields,
  handleLaunchContent,
  serializePayload,
} from '../';

// ---------------------------------------------------------------------------
// Scenario 1 — "Alexa, Watch Seabound" → play intent
// autoPlay=true, amzn_id present, no EPISODE entity → intent is "play"
// ---------------------------------------------------------------------------

const watchSearch: IContentSearch = {
  entities: [
    {
      type: EntityType.VIDEO,
      externalIdList: [{ name: 'amzn_id', value: '1700000725' }],
    },
  ],
  searchKeyword: 'Seabound',
};

const watchOptional: ILaunchContentOptionalFields = {
  brandName: 'StreamCo',
};

const watchPayload = handleLaunchContent(watchSearch, true, watchOptional);
console.log('Scenario 1 — "Alexa, Watch Seabound"');
console.log('  Intent:', watchPayload.launchIntent); // "play"
console.log('  Payload:', watchPayload);
console.log();

// ---------------------------------------------------------------------------
// Scenario 2 — "Alexa, Find Seabound" → search intent
// autoPlay=false → intent is always "search"
// ---------------------------------------------------------------------------

const findSearch: IContentSearch = {
  entities: [
    {
      type: EntityType.VIDEO,
      externalIdList: [{ name: 'amzn_id', value: '1700000725' }],
    },
  ],
  searchKeyword: 'Seabound',
};

const findPayload = handleLaunchContent(findSearch, false, {});
console.log('Scenario 2 — "Alexa, Find Seabound"');
console.log('  Intent:', findPayload.launchIntent); // "search"
console.log('  Payload:', findPayload);
console.log();

// ---------------------------------------------------------------------------
// Scenario 3 — "Alexa, Play Season 1 Episode 5 from The SeaShow" → playshow
// autoPlay=true, amzn_id present, EPISODE + SEASON entities → "playshow"
// ---------------------------------------------------------------------------

const playShowSearch: IContentSearch = {
  entities: [
    {
      type: EntityType.VIDEO,
      externalIdList: [{ name: 'amzn_id', value: '1700000123' }],
    },
    {
      type: EntityType.EPISODE,
      value: '5',
      externalIdList: [],
    },
    {
      type: EntityType.SEASON,
      value: '1',
      externalIdList: [],
    },
  ],
  searchKeyword: 'The SeaShow season one episode five',
};

const playShowPayload = handleLaunchContent(playShowSearch, true, {});
console.log('Scenario 3 — "Alexa, Play Season 1 Episode 5 from The SeaShow"');
console.log('  Intent:', playShowPayload.launchIntent); // "playshow"
console.log('  Episode:', playShowPayload.episodeNumber); // 5
console.log('  Season:', playShowPayload.seasonNumber);   // 1
console.log('  Payload:', playShowPayload);
console.log();

// ---------------------------------------------------------------------------
// Scenario 4 — "Alexa, Find comedy movies" → search intent (genre-based)
// autoPlay=false, no amzn_id → intent is "search"
// ---------------------------------------------------------------------------

const genreSearch: IContentSearch = {
  entities: [
    {
      type: EntityType.GENRE,
      externalIdList: [],
    },
  ],
  searchKeyword: 'comedy movies',
};

const genrePayload = handleLaunchContent(genreSearch, false, {});
console.log('Scenario 4 — "Alexa, Find comedy movies"');
console.log('  Intent:', genrePayload.launchIntent); // "search"
console.log('  Payload:', genrePayload);
console.log();

// ---------------------------------------------------------------------------
// Serialization demo — round-trip a payload through JSON
// ---------------------------------------------------------------------------

const serialized = serializePayload(playShowPayload);
console.log('Serialized playshow payload:');
console.log(' ', serialized);
