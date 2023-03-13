import path from "path";
import { format, transports, createLogger, Logger } from "winston";
import { Config } from "./types";

export const logger: Logger = createLogger();

function init() {
  const logDir = path.join(__dirname, "..", "logs");

  logger.configure({
    level: "info",
    format: format.combine(
      format.timestamp(),
      format.errors({ stack: true }),
      format.splat(),
      format.json()
    ),
    transports: [
      new transports.File({
        filename: path.join(logDir, "error.log"),
        level: "error",
      }),
      new transports.File({
        filename: path.join(logDir, "combined.log"),
      }),
    ],
  });

  //
  // If we're not in production then log to the `console` with the format:
  // `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
  //
  if (process.env.NODE_ENV !== "production") {
    logger.add(
      new transports.Console({
        format: format.prettyPrint(),
      })
    );
  }
}

export default {
  init,
};
