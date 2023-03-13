/**
 * Twitch API Types
 * https://dev.twitch.tv/docs/api/get-started/#get-an-oauth-token
 */
export type OAuthRequest = {
  client_id: string;
  client_secret: string;
  grant_type: "client_credentials";
};

/**
 * Twitch API Types
 * https://dev.twitch.tv/docs/api/get-started/#get-an-oauth-token
 */
export type OAuthResponse = {
  access_token: string;
  expires_in: number;
  token_type: string;
};

/**
 * Twitch API Types
 * https://dev.twitch.tv/docs/api/reference
 */
export type GenericTwitchResponse<T> = {
  data: T[];
  pagination?: {
    cursor: string;
  };
};

/**
 * Twitch API Types
 * https://dev.twitch.tv/docs/api/reference/#get-clips
 */
export type TwitchClipParams = (
  | {
      broadcaster_id: string;
    }
  | {
      game_id: string;
    }
  | {
      id: string;
    }
) & {
  first?: number;
  started_at?: string;
  ended_at?: string;
  after?: string;
  before?: string;
};

/**
 * Twitch API Types
 * https://dev.twitch.tv/docs/api/reference/#get-clips
 */
export type TwitchClip = {
  id: string;
  url: string;
  embed_url: string;
  broadcaster_id: string;
  broadcaster_name: string;
  creator_id: string;
  creator_name: string;
  video_id: string;
  game_id: string;
  language: string;
  title: string;
  view_count: number;
  created_at: string;
  thumbnail_url: string;
  duration: number;
  vod_offset: number;
};

/**
 * Twitch API Types
 * https://dev.twitch.tv/docs/api/reference/#get-users
 */
export type TwitchUser = {
  id: string;
  login: string;
  display_name: string;
  type: string;
  broadcaster_type: string;
  description: string;
  profile_image_url: string;
  offline_image_url: string;
  email: string;
  created_at: string;
};

/**
 * Twitch API Types
 * https://dev.twitch.tv/docs/api/reference/#get-games
 */
export type TwitchGame = {
  id: string;
  name: string;
  box_art_url: string;
  igdb_id: string;
};

export enum Category {
  Games = "games",
  Users = "users",
}

export type TwitchConfig = {
  /**
   * Maximum number of clips to download per category
   * @range 1-100
   * @default 10
   */
  LIMIT: number;
  /**
   * Period of time to search for clips in hours
   * @default 24
   */
  PERIOD: number;
  /**
   * List of games and users to search for clips
   */
  SEARCH: {
    [Category.Games]: string[];
    [Category.Users]: string[];
  };
  /**
   * List of games and users to filter
   */
  FILTER: {
    [Category.Games]: string[];
    [Category.Users]: string[];
  };
  /**
   * List of games and users to exclude
   */
  BLACKLIST: {
    [Category.Games]: string[];
    [Category.Users]: string[];
  };
  CLIPS_DIR: string;
  REMOVE_CLIPS: boolean;
};
