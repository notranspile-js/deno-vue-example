/*
 * Copyright 2021, alex at staticlibs.net
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { log, logger, path } from "../deps.js";
import conf from "../conf.js";
import createDirs from "../startup/createDirs.js";
import startServer from "../startup/startServer.js";

export default async () => {
  await createDirs();

  await log.setup({
    handlers: {
      console: new log.handlers.ConsoleHandler("INFO", {
        formatter: (rec) => {
          return `[${rec.levelName}] ${rec.msg}`;
        },
      }),
    },
    loggers: {
      default: {
        level: "DEBUG",
        handlers: ["console"],
      },
    },
  });

  const server = startServer();
  logger.info("Server started, running tests ...");

  const status = await Deno.run({
    cmd: [
      Deno.execPath(),
      "test",
      "-A",
      "--fail-fast",
    ],
    cwd: path.join(conf().appdir)
  }).status();
  logger.info(`Test run finished, status code: [${status.code}]`);

  logger.info("Shutting down ...");
  await server.close();
  logger.info("Shutdown complete");
};
