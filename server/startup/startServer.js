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

import { logger, SimpleServer } from "../deps.js";
import conf from "../conf.js";
import httpHandler from "../calls/_calls.js";

export default () => {
  const cs = conf.server;

  const server = new SimpleServer({
    listen: {
      port: cs.tcpPort,
      hostname: cs.ipAddress,
    },
    logger: {
      info: (msg) => logger.debug(`server: ${msg}`),
      error: (msg) => logger.warning(`server: ${msg}`),
    },
    http: {
      path: cs.http.path,
      handler: httpHandler
    },
    files: cs.files,
    websocket: cs.websocket,
    rootRedirectLocation: cs.rootRedirectLocation
  });

  logger.info(`Server started, url: [http://${cs.ipAddress}:${cs.tcpPort}/]`);
  return server;
};
