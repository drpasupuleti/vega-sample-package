/**
 * Content Launcher processing logic for the Vega Content Launcher API.
 *
 * This module provides the core functions for handling content launch requests
 * from the Fire TV home launcher or Alexa voice commands. It parses incoming
 * {@link IContentSearch} parameters, extracts identifiers, determines the
 * appropriate {@link LaunchIntent}, and produces a {@link ContentLaunchPayload}.
 *
 * @module content-launcher/content-launcher
 */

import {
  ContentLaunchPayload,
  EntityType,
  IContentSearch,
  IContentSearchEntity,
  ILaunchContentOptionalFields,
  LaunchIntent,
} from './types';

/**
 * Extracts the first `amzn_id` value found across all entities in a content search.
 *
 * Iterates through each entity's external ID list and returns the value of the
 * first entry where `name === 'amzn_id'`. If no such entry exists, returns `undefined`.
 *
 * @param entities - The list of content search entities to scan.
 * @returns The `amzn_id` value, or `undefined` if not found.
 *
 * @example
 * ```typescript
 * const entities: IContentSearchEntity[] = [
 *   { type: EntityType.VIDEO, externalIdList: [{ name: 'amzn_id', value: '123' }] },
 * ];
 * const id = extractAmznId(entities); // '123'
 * ```
 */
export function extractAmznId(entities: IContentSearchEntity[]): string | undefined {
  for (const entity of entities) {
    for (const externalId of entity.externalIdList) {
      if (externalId.name === 'amzn_id') {
        return externalId.value;
      }
    }
  }
  return undefined;
}

/**
 * Determines the launch intent based on the autoPlay flag, presence of an
 * `amzn_id`, and the entity types in the content search.
 *
 * Intent determination logic:
 * | autoPlay | amzn_id present | Has EPISODE entity | Result      |
 * |----------|----------------|--------------------|-------------|
 * | false    | any            | any                | "search"    |
 * | true     | yes            | yes                | "playshow"  |
 * | true     | yes            | no                 | "play"      |
 * | true     | no             | any                | "search"    |
 *
 * @param autoPlay - Whether the request is for auto-play (true) or search (false).
 * @param amznId - The extracted Amazon content identifier, if any.
 * @param entities - The content search entities to inspect for EPISODE type.
 * @returns The determined {@link LaunchIntent}.
 *
 * @see {@link EntityType.EPISODE} for the episode entity type constant.
 */
export function determineIntent(
  autoPlay: boolean,
  amznId: string | undefined,
  entities: IContentSearchEntity[],
): LaunchIntent {
  if (!autoPlay) {
    return 'search';
  }

  if (!amznId) {
    return 'search';
  }

  const hasEpisodeEntity = entities.some(
    (entity) => entity.type === EntityType.EPISODE,
  );

  if (hasEpisodeEntity) {
    return 'playshow';
  }

  return 'play';
}

/**
 * Extracts the numeric episode number from the content search entities.
 *
 * @param entities - The content search entities to scan.
 * @returns The episode number as a number, or `undefined` if not found.
 */
function extractEpisodeNumber(entities: IContentSearchEntity[]): number | undefined {
  const episodeEntity = entities.find((e) => e.type === EntityType.EPISODE);
  if (episodeEntity?.value) {
    const parsed = parseInt(episodeEntity.value, 10);
    return isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
}

/**
 * Extracts the numeric season number from the content search entities.
 *
 * @param entities - The content search entities to scan.
 * @returns The season number as a number, or `undefined` if not found.
 */
function extractSeasonNumber(entities: IContentSearchEntity[]): number | undefined {
  const seasonEntity = entities.find((e) => e.type === EntityType.SEASON);
  if (seasonEntity?.value) {
    const parsed = parseInt(seasonEntity.value, 10);
    return isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
}

/**
 * Processes an incoming content launch request from the Fire TV launcher or Alexa.
 *
 * Processing logic:
 * 1. Parse `contentSearch.entities` to extract `amzn_id` from external ID lists.
 * 2. Determine the {@link LaunchIntent} based on the `autoPlay` flag and entity types.
 * 3. For `"playshow"` intents, extract episode and season numbers.
 * 4. Build and return a {@link ContentLaunchPayload}.
 *
 * @param contentSearch - The content search parameters from the launcher or Alexa.
 * @param autoPlay - Whether to auto-play content (`true`) or show search results (`false`).
 * @param _optionalFields - Additional optional parameters (reserved for future use).
 * @returns A {@link ContentLaunchPayload} with the resolved intent and identifiers.
 *
 * @example
 * ```typescript
 * import { handleLaunchContent } from './content-launcher';
 * import { EntityType, IContentSearch } from './types';
 *
 * const search: IContentSearch = {
 *   entities: [
 *     { type: EntityType.VIDEO, externalIdList: [{ name: 'amzn_id', value: '1700000725' }] },
 *   ],
 *   searchKeyword: 'Seabound',
 * };
 *
 * const payload = handleLaunchContent(search, true, {});
 * // payload.launchIntent === 'play'
 * // payload.amzn_id === '1700000725'
 * ```
 */
export function handleLaunchContent(
  contentSearch: IContentSearch,
  autoPlay: boolean,
  _optionalFields: ILaunchContentOptionalFields,
): ContentLaunchPayload {
  const { entities, searchKeyword } = contentSearch;

  const amznId = extractAmznId(entities);
  const launchIntent = determineIntent(autoPlay, amznId, entities);

  const payload: ContentLaunchPayload = {
    launchIntent,
    searchKeyword,
    amzn_id: amznId,
  };

  if (launchIntent === 'playshow') {
    payload.episodeNumber = extractEpisodeNumber(entities);
    payload.seasonNumber = extractSeasonNumber(entities);
  }

  return payload;
}

/**
 * Serializes a {@link ContentLaunchPayload} to a JSON string.
 *
 * Optional fields that are `undefined` are serialized as `null` to ensure
 * the round-trip property holds with {@link deserializePayload}.
 *
 * @param payload - The payload to serialize.
 * @returns A JSON string representation of the payload.
 *
 * @see {@link deserializePayload} for the inverse operation.
 *
 * @example
 * ```typescript
 * const json = serializePayload({ launchIntent: 'play', amzn_id: '123' });
 * // '{"launchIntent":"play","searchKeyword":null,"amzn_id":"123","episodeNumber":null,"seasonNumber":null}'
 * ```
 */
export function serializePayload(payload: ContentLaunchPayload): string {
  return JSON.stringify({
    launchIntent: payload.launchIntent,
    searchKeyword: payload.searchKeyword ?? null,
    amzn_id: payload.amzn_id ?? null,
    episodeNumber: payload.episodeNumber ?? null,
    seasonNumber: payload.seasonNumber ?? null,
  });
}

/**
 * Deserializes a JSON string into a {@link ContentLaunchPayload}.
 *
 * Fields that are `null` in the JSON are restored to `undefined` to match
 * the TypeScript interface. Throws if the JSON is malformed or missing
 * the required `launchIntent` field.
 *
 * @param json - The JSON string to parse.
 * @returns A {@link ContentLaunchPayload} object.
 * @throws {Error} If the JSON is malformed or missing required fields.
 *
 * @see {@link serializePayload} for the inverse operation.
 *
 * @example
 * ```typescript
 * const payload = deserializePayload('{"launchIntent":"play","amzn_id":"123"}');
 * // payload.launchIntent === 'play'
 * ```
 */
export function deserializePayload(json: string): ContentLaunchPayload {
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(json) as Record<string, unknown>;
  } catch (err) {
    throw new Error(
      `Failed to parse ContentLaunchPayload JSON: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  if (!parsed.launchIntent || typeof parsed.launchIntent !== 'string') {
    throw new Error(
      'Invalid ContentLaunchPayload: missing required field "launchIntent"',
    );
  }

  return {
    launchIntent: parsed.launchIntent as ContentLaunchPayload['launchIntent'],
    searchKeyword: parsed.searchKeyword != null ? String(parsed.searchKeyword) : undefined,
    amzn_id: parsed.amzn_id != null ? String(parsed.amzn_id) : undefined,
    episodeNumber: parsed.episodeNumber != null ? Number(parsed.episodeNumber) : undefined,
    seasonNumber: parsed.seasonNumber != null ? Number(parsed.seasonNumber) : undefined,
  };
}
