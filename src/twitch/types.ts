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
 * https://dev.twitch.tv/docs/api/reference/#get-clips
 */
export type Params =
  | {
      first: number;
      started_at?: string;
      ended_at?: string;
      [CategoryId.GameId]?: string;
    }
  | {
      first: number;
      started_at?: string;
      ended_at?: string;
      [CategoryId.BroadcasterId]?: string;
    };

export type Broadcaster = {
  id: string;
  name: string;
  url: string;
  clips: Clip[];
};

export type Game = {
  id: string;
  name: string;
  clips: Clip[];
};

export type Clip = {
  id: string;
  path: string;
  title: string;
  view_count: number;
  duration: number;
  video_url: string;
  broadcaster_name: string;
  broadcaster_url: string;
  broadcaster_id: string;
  game_name: string;
  game_id: string;
};

export enum Category {
  Games = "games",
  Users = "users",
  Clips = "clips",
}

export enum CategoryId {
  GameId = "game_id",
  BroadcasterId = "broadcaster_id",
}

export type CategoryIdMap = {
  [CategoryId.GameId]: string[];
  [CategoryId.BroadcasterId]: string[];
};

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
  LOG_DIR: string;
  CLIPS_DIR: string;
  REMOVE_CLIPS: boolean;
};
