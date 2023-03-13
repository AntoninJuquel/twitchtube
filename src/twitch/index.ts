import { Logger } from "winston";
import {
  hoursToMilliseconds,
  minutesToSeconds,
  secondsToMinutes,
} from "date-fns";
import MultiProgress from "multi-progress";
import axios from "axios";
import fs from "fs";
import path from "path";

import {
  Config,
  Metadata,
  TwitchClip,
  TwitchClipParams,
  TwitchGame,
} from "../types";
import Twitch from "./api";

let config: Config;
let twitch: Twitch;
let logger: Logger;

export async function init(c: Config, l: Logger) {
  config = c;
  logger = l;
  twitch = await new Twitch(
    process.env.TWITCH_CLIENT_ID as string,
    process.env.TWITCH_CLIENT_SECRET as string
  ).init();
}

export async function downloadClips() {
  const games = (
    await Promise.all(
      config.SEARCH.games.map(async (name) => {
        const game = await twitch.getGameByName(name);
        if (!game) {
          logger.warn(`Game '${name}' not found`);
        } else {
          logger.info(`Game '${name}' found`);
        }
        return game;
      })
    )
  ).filter((defined) => defined);
  const broadcasters = (
    await Promise.all(
      config.SEARCH.users.map(async (name) => {
        const user = await twitch.getUserByName(name);
        if (!user) {
          logger.warn(`User '${name}' not found`);
        } else {
          logger.info(`User '${name}' found`);
        }
        return user;
      })
    )
  ).filter((defined) => defined);

  // Filters
  const filteredGames = (
    await Promise.all(
      config.FILTER.games.map(async (name) => {
        const game = await twitch.getGameByName(name);
        if (!game) {
          logger.warn(`Game '${name}' not found`);
        } else {
          logger.info(`Game '${name}' found`);
        }
        return game;
      })
    )
  ).filter((defined) => defined);
  const filteredBroadcasters = (
    await Promise.all(
      config.FILTER.users.map(async (name) => {
        const user = await twitch.getUserByName(name);
        if (!user) {
          logger.warn(`User '${name}' not found`);
        } else {
          logger.info(`User '${name}' found`);
        }
        return user;
      })
    )
  ).filter((defined) => defined);

  // Blacklist
  const blacklistedGames = (
    await Promise.all(
      config.BLACKLIST.games.map(async (name) => {
        const game = await twitch.getGameByName(name);
        if (!game) {
          logger.warn(`Game '${name}' not found`);
        } else {
          logger.info(`Game '${name}' found`);
        }
        return game;
      })
    )
  ).filter((defined) => defined);
  const blacklistedBroadcasters = (
    await Promise.all(
      config.BLACKLIST.users.map(async (name) => {
        const user = await twitch.getUserByName(name);
        if (!user) {
          logger.warn(`User '${name}' not found`);
        } else {
          logger.info(`User '${name}' found`);
        }
        return user;
      })
    )
  ).filter((defined) => defined);

  const clips: TwitchClip[] = [];

  await Promise.all(
    games.map(async (game) => {
      const params: TwitchClipParams = {
        game_id: game.id,
        first: config.LIMIT,
      };

      if (config.PERIOD) {
        params["started_at"] = new Date(
          new Date().getTime() - hoursToMilliseconds(config.PERIOD)
        ).toISOString();
        params["ended_at"] = new Date().toISOString();
      }

      return await twitch.getClips(params).then((twitchClips) => {
        logger.info(
          `Found ${twitchClips.length} clips for game '${game.name}'`
        );
        clips.push(...twitchClips);
      });
    })
  );

  await Promise.all(
    broadcasters.map(async (broadcaster) => {
      const params: TwitchClipParams = {
        broadcaster_id: broadcaster.id,
        first: config.LIMIT,
      };

      if (config.PERIOD) {
        params["started_at"] = new Date(
          new Date().getTime() - hoursToMilliseconds(config.PERIOD)
        ).toISOString();
        params["ended_at"] = new Date().toISOString();
      }

      return await twitch.getClips(params).then((twitchClips) => {
        logger.info(
          `Found ${twitchClips.length} clips for broadcaster '${broadcaster.display_name}'`
        );
        clips.push(...twitchClips);
      });
    })
  );

  logger.info(`Found ${clips.length} clips before filtering and blacklisting`);

  const filteredClips = clips.filter((clip) => {
    return (
      (filteredGames.length === 0 ||
        filteredGames.some((game) => game.id === clip.game_id)) &&
      (filteredBroadcasters.length === 0 ||
        filteredBroadcasters.some(
          (broadcaster) => broadcaster.id === clip.broadcaster_id
        )) &&
      (blacklistedGames.length === 0 ||
        !blacklistedGames.some((game) => game.id === clip.game_id)) &&
      (blacklistedBroadcasters.length === 0 ||
        !blacklistedBroadcasters.some(
          (broadcaster) => broadcaster.id === clip.broadcaster_id
        ))
    );
  });

  filteredClips.sort((a, b) => {
    return b.view_count - a.view_count;
  });

  logger.info(
    `Found ${filteredClips.length} clips after filtering and blacklisting`
  );

  const totalVideoLength = minutesToSeconds(config.VIDEO_LENGTH);

  let videoLength = 0;
  let videoClips: TwitchClip[] = [];

  for (let i = 0; i < filteredClips.length; i++) {
    const clip = filteredClips[i];
    if (videoLength <= totalVideoLength) {
      videoLength += clip.duration;
      videoClips.push(clip);
    } else {
      logger.info(
        `Selected ${
          videoClips.length
        } clips for video of length ${secondsToMinutes(videoLength)} minutes`
      );
      break;
    }
  }

  const broadcasterList = Array.from(
    videoClips
      .reduce((current: Map<string, number>, clip) => {
        const { broadcaster_name, view_count } = clip;
        const totalViews = current.get(broadcaster_name) ?? 0;
        current.set(broadcaster_name, totalViews + view_count);
        return current;
      }, new Map<string, number>())
      .entries()
  )
    .sort((a, b) => b[1] - a[1])
    .map(([broadcaster]) => broadcaster);

  const gameList = await Promise.all(
    Array.from(
      videoClips
        .reduce((current: Map<string, number>, clip) => {
          const { game_id, view_count } = clip;
          const totalViews = current.get(game_id) ?? 0;
          current.set(game_id, totalViews + view_count);
          return current;
        }, new Map<string, number>())
        .entries()
    )
      .sort((a, b) => b[1] - a[1])
      .map(
        async ([game]) => (await twitch.getById<TwitchGame>("games", game)).name
      )
  );

  const metadata: Metadata = {
    broadcasters: broadcasterList,
    games: gameList,
    clipCount: videoClips.length,
  };

  fs.writeFileSync(
    path.join(config.METADATA_DIR, "metadata.json"),
    JSON.stringify(metadata, null, 4)
  );

  logger.info(`Downloading ${videoClips.length} clips`);
  const multiProgressBars = new MultiProgress(process.stderr);
  await Promise.all(
    videoClips.map(async (clip) => {
      const clipPath = path.join(config.CLIPS_DIR, `${clip.id}.mp4`);
      const slicePoint = clip.thumbnail_url.indexOf("-preview-");
      const videoUrl = clip.thumbnail_url.slice(0, slicePoint) + ".mp4";

      const { data, headers } = await axios.get(videoUrl, {
        responseType: "stream",
      });

      const contentLength = headers["content-length"];

      const progressBar = multiProgressBars.newBar(
        `-> downloading ${clipPath} [:bar] :percent :etas`,
        {
          width: 40,
          complete: "=",
          incomplete: " ",
          total: parseInt(contentLength),
        }
      );
      data.on("data", (chunk: any) => progressBar.tick(chunk.length));
      const writer = fs.createWriteStream(clipPath);
      data.pipe(writer);
      return new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });
    })
  );

  logger.info("Downloading clips complete");
}
