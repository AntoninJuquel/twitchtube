import { Config } from "./types";

import { initConfig } from "./utils";

const config: Config = {
  //// General ////
  INTERVAL: 24,

  //// Twitch ////
  LIMIT: 10,
  PERIOD: 24,
  SEARCH: {
    games: [],
    users: ["Amouranth"],
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

  //// Video ////
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

export default initConfig(config);
