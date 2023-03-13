export type YoutubeConfig = {
  /**
   * Title of the video
   * @use {count} to include clips count
   * @use {streamer} to include top streamer names
   * @use {game} to include top game names
   * @example
   * "[{game}] Top {count} Clips of the Week ({streamer}, {streamer}, {streamer}, ...)"
   * "[Fortnite] Top 10 Clips of the Week (Ninja, Shroud, DrDisrespect, ...)"
   */
  TITLE: string;
  /**
   * List of streamers will be included in the description
   */
  DESCRIPTION: {
    HEADER: string;
    FOOTER: string;
  };
  PLAYLIST: string;
  CHANNEL_NAME: string;
  HEADLESS: boolean;
  REMOVE_VIDEO: boolean;
};
