import { TwitchConfig, VideoConfig, YoutubeConfig } from "../types";

export type GeneralConfig = {
  /**
   * Interval in hours
   */
  INTERVAL: number;
  /**
   * Length of video in minutes
   */
  VIDEO_LENGTH: number;
  /**
   * Directory to store metadata
   */
  METADATA_DIR: string;
};

export type Config = GeneralConfig & TwitchConfig & VideoConfig & YoutubeConfig;
