import { TwitchConfig, VideoConfig, YoutubeConfig } from "../types";

export type GeneralConfig = {
  /**
   * Interval in hours
   */
  INTERVAL: number;
};

export type Config = GeneralConfig & TwitchConfig & VideoConfig & YoutubeConfig;
