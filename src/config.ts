import { TwitchConfig, VideoConfig, YoutubeConfig } from "./types";
const config: TwitchConfig & VideoConfig & YoutubeConfig = {
  LIMIT: 10,
  PERIOD: 24,
  DATA: {
    games: ["Fortnite"],
    users: [],
  },
  FILTER: {
    games: [],
    users: [],
  },
  BLACKLIST: {
    games: [],
    users: [],
  },
  REMOVE_CLIPS: true,
  CLIPS_DIR: "F:\\Videos\\clips",
  LOG_DIR: "logs",

  RESOLUTION: {
    WIDTH: 1920,
    HEIGHT: 1080,
  },
  FRAMERATE: 60,
  TEMP_DIR: "F:\\Documents\\TEMP",
  OUTPUT_DIR: "F:\\Videos\\rendered",
  TRANSITION: {
    NAME: "fade",
    DURATION: 500,
  },
  INTRO_PATH: "",
  OUTRO_PATH: "",

  TITLE:
    "[{game}] Top {count} Clips of the Week, ({streamer}, {streamer}, {streamer})",
  DESCRIPTION: {
    HEADER: "Twitch Highlights",
    FOOTER: "Twitch Highlights",
  },
  PLAYLIST: "",
  CHANNEL_NAME: "",
  HEADLESS: false,
};
export default config;
