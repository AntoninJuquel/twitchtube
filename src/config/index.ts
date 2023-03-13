import { Config } from "./types";

const config: Config = {
  //// General ////
  INTERVAL: 24,
  LOG_DIR: "F:\\Documents\\logs",

  //// Twitch ////
  TWITCH_AUTH_DIR: "F:\\Documents\\twitch-auth",
  CLIPS_DIR: "F:\\Videos\\clips",
  LIMIT: 10,
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
};

export default config;
