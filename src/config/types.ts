import { TwitchConfig, VideoConfig, YoutubeConfig } from "../types";

export type GeneralConfig = {
  /**
   * Interval in hours
   */
  INTERVAL: number;
  LOG_DIR: string;
};

export type Config = GeneralConfig & TwitchConfig & VideoConfig & YoutubeConfig;
