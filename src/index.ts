import shutdown from "@hypercliq/shutdown-cleanup";
import dotenv from "dotenv";

import config from "./config";
import log, { logger } from "./logger";

dotenv.config();
shutdown.registerHandler(exit);
log.config(config);

async function main() {
  //logger.info("Main", { service: 1 });
  await new Promise((resolve) => setTimeout(resolve, 30000));
}

async function exit() {
  // logger.info("exit");
  // logger.error("exit error");
}

main().then(() => exit());
