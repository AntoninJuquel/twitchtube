import shutdown from "@hypercliq/shutdown-cleanup";
import dotenv from "dotenv";
import { hoursToMilliseconds } from "date-fns";

import config from "./config";
import log, { logger } from "./logger";
import ascii from "./ascii";

import * as twitch from "./twitch";
import * as video from "./video-merge";
import * as youtube from "./youtube";
import { File } from "winston/lib/winston/transports";
import fs from "fs";
import path from "path";

async function start() {
  console.log(ascii);

  dotenv.config();
  shutdown.registerHandler(exit);
  log.init();

  logger.info("Loaded environment variables");
  logger.info(`env: ${process.env.NODE_ENV}`);

  logger.info("Initializing modules");
  await twitch.init(config, logger);
  video.init(config, logger);
  youtube.init(config, logger);
  logger.info("Started");
}

async function main() {
  await twitch.downloadClips();
  await video.mergeClips();
  await youtube.uploadVideo();
}

async function end() {
  logger.transports.forEach((t) => {
    if (t instanceof File) {
      fs.writeFileSync(path.join(t.dirname, t.filename), "");
    }
  });
}

async function exit() {
  logger.transports.forEach((t) => {
    if (t instanceof File) {
      fs.writeFileSync(path.join(t.dirname, t.filename), "");
    }
  });
}

start()
  .then(async () => {
    main().then(end);

    await new Promise((resolve, reject) =>
      setInterval(() => {
        main().then(end).catch(reject);
      }, hoursToMilliseconds(config.INTERVAL))
    );
  })
  .finally(() => exit());
