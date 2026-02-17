/**
 * Type definitions for the Vega Content Launcher API.
 *
 * The Content Launcher API enables Vega apps to integrate with the Fire TV
 * home launcher and Alexa voice commands, allowing users to search and play
 * content directly through these interfaces.
 *
 * @see {@link https://developer.amazon.com/docs/vega-api/latest/ | Vega API Reference}
 * @module content-launcher/types
 */

/**
 * Content entity types as defined by the Vega Content Launcher API.
 * Each value corresponds to a specific content category used in
 * {@link IContentSearchEntity} to classify search parameters.
 *
 * @example
 * ```typescript
 * const videoEntity: IContentSearchEntity = {
 *   type: EntityType.VIDEO,
 *   externalIdList: [{ name: 'amzn_id', value: '1700000725' }],
 * };
 * ```
 */
export enum EntityType {
  /** Actor or performer search (e.g., "Sean Connery movies"). */
  ACTOR = 0,
  /** Genre-based search (e.g., "comedy movies"). */
  GENRE = 6,
  /** Video content — movies, shows, or general video search. */
  VIDEO = 13,
  /** Season of a TV show for episodic content. */
  SEASON = 14,
  /** Episode of a TV show for episodic content. */
  EPISODE = 15,
}

/**
 * Possible launch intents for content launch requests.
 *
 * - `"play"`: Direct playback of identified content.
 * - `"search"`: Navigate to search results for the given query.
 * - `"playshow"`: Episodic playback requiring season and episode resolution.
 *
 * @see {@link ContentLaunchPayload} for the payload that carries this intent.
 */
export type LaunchIntent = 'play' | 'search' | 'playshow';

/**
 * An external identifier used to match content across systems.
 *
 * External IDs are provided by the Fire TV launcher or Alexa to identify
 * specific content items. The most common identifier is `amzn_id`, which
 * maps to a content catalog entry.
 *
 * @example
 * ```typescript
 * const id: IExternalId = { name: 'amzn_id', value: '1700000725' };
 * ```
 *
 * @see {@link IContentSearchEntity} for usage within a content search entity.
 */
export interface IExternalId {
  /** The identifier namespace (e.g., `"amzn_id"`, `"catalogContentId"`). */
  name: string;
  /** The identifier value (e.g., a catalog ID or launch ID). */
  value: string;
}

/**
 * A single entity within a content search request.
 *
 * Each entity represents one dimension of the search — for example, a VIDEO
 * entity carries the content ID, while SEASON and EPISODE entities carry
 * numeric values for episodic content.
 *
 * @see {@link EntityType} for the possible entity type values.
 * @see {@link IExternalId} for the external identifier format.
 *
 * @example
 * ```typescript
 * const entity: IContentSearchEntity = {
 *   type: EntityType.VIDEO,
 *   externalIdList: [{ name: 'amzn_id', value: '1700000725' }],
 * };
 * ```
 */
export interface IContentSearchEntity {
  /** The type of content entity. */
  type: EntityType;
  /** The search value (e.g., content title, season number, episode number). */
  value?: string;
  /** External identifiers for cross-system content matching. */
  externalIdList: IExternalId[];
}

/**
 * Parameters for a content search request from the Fire TV launcher or Alexa.
 *
 * This interface represents the `contentSearch` parameter passed to the
 * {@link handleLaunchContent} callback. It contains a list of search entities
 * and an optional free-text search keyword.
 *
 * @see {@link IContentSearchEntity} for individual entity structure.
 *
 * @example
 * ```typescript
 * const search: IContentSearch = {
 *   entities: [
 *     { type: EntityType.VIDEO, externalIdList: [{ name: 'amzn_id', value: '1700000725' }] },
 *   ],
 *   searchKeyword: 'Seabound',
 * };
 * ```
 */
export interface IContentSearch {
  /** List of content entities to search for. */
  entities: IContentSearchEntity[];
  /** Optional free-text search keyword from the user's voice utterance or input. */
  searchKeyword?: string;
}

/**
 * Optional fields that may accompany a content launch request.
 *
 * These fields provide additional context but are not required for
 * determining the launch intent.
 *
 * @see {@link handleLaunchContent} for usage in the launch callback.
 */
export interface ILaunchContentOptionalFields {
  /** Brand or provider name associated with the request. */
  brandName?: string;
  /** Additional metadata as key-value pairs. */
  metadata?: Record<string, string>;
}

/**
 * The processed payload produced after parsing a content launch request.
 *
 * This is the output of the {@link handleLaunchContent} processing logic.
 * It contains the resolved launch intent, extracted identifiers, and any
 * episodic content information.
 *
 * @see {@link LaunchIntent} for the possible intent values.
 * @see {@link handleLaunchContent} for the function that produces this payload.
 *
 * @example
 * ```typescript
 * // Direct playback payload
 * const playPayload: ContentLaunchPayload = {
 *   launchIntent: 'play',
 *   searchKeyword: 'Seabound',
 *   amzn_id: '1700000725',
 * };
 *
 * // Episodic playback payload
 * const episodicPayload: ContentLaunchPayload = {
 *   launchIntent: 'playshow',
 *   searchKeyword: 'The SeaShow season one episode five',
 *   amzn_id: '1700000123',
 *   episodeNumber: 5,
 *   seasonNumber: 1,
 * };
 * ```
 */
export interface ContentLaunchPayload {
  /** The determined launch intent. */
  launchIntent: LaunchIntent;
  /** The search keyword from the original request, if any. */
  searchKeyword?: string;
  /** The Amazon content identifier extracted from external IDs. */
  amzn_id?: string;
  /** Episode number for episodic content. */
  episodeNumber?: number;
  /** Season number for episodic content. */
  seasonNumber?: number;
}
