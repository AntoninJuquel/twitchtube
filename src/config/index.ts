import { Config } from "./types";

const config: Config = {
  //// General ////
  INTERVAL: 24,
  VIDEO_LENGTH: 10,
  METADATA_DIR: "F:\\Documents\\metadata",

  //// Twitch ////
  CLIPS_DIR: "F:\\Videos\\clips",
  LIMIT: 2,
  PERIOD: 24,
  SEARCH: {
    games: ["League of Legends"],
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

  //// Video ////
  TEMP_DIR: "F:\\Documents\\TEMP",
  OUTPUT_DIR: "F:\\Videos\\rendered",
  RESOLUTION: {
    WIDTH: 1920,
    HEIGHT: 1080,
  },
  FRAMERATE: 60,
  TRANSITION: {
    NAME: "fade",
    DURATION: 500,
  },
  INTRO_PATH: "",
  OUTRO_PATH: "",

  //// Youtube ////
  TITLE:
    "[{game}] Top {count} Clips of the Week, ({streamer}, {streamer}, {streamer})",
  DESCRIPTION: {
    HEADER: "Twitch Highlights",
    FOOTER: "Twitch Highlights",
  },
  PLAYLIST: "",
  CHANNEL_NAME: "",
  HEADLESS: false,
  REMOVE_VIDEO: true,
};

export default config;
