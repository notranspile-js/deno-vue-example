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

import { io, logger } from "../deps.js";
import shutdownFlag from "../service/shutdownFlag.js";
import createDirs from "./createDirs.js";
import intervalTracker from "../service/intervalTracker.js";
import setupLogging from "./setupLogging.js";
import startServer from "./startServer.js";

export default async () => {
  await createDirs();
  await setupLogging();

  const server = startServer();
  logger.info("Press Enter to stop");

  for await (const _ of io.readLines(Deno.stdin)) {
    break;
  }

  logger.info("Shutting down ...")
  shutdownFlag.mark();
  intervalTracker.clear();
  await server.close();
  logger.info("Shutdown complete")
};
