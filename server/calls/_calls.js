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

import { log } from "../deps.js";
import conf from "../conf.js";
import beginBroadcast from "./beginBroadcast.js";
import config from "./config.js";
import exampleConfig from "./exampleConfig.js";
import hello from "./hello.js"
import restart from "./restart.js";
import restartStatus from "./restartStatus.js";
import rewriteConfig from "./rewriteConfig.js";

export default async (req) => {
  const logger = log.getLogger();

  const name = req.path.substring(conf().server.http.path.length);
  switch (name) {

    case "beginBroadcast": return await beginBroadcast(req);
    case "config": return await config(req);
    case "exampleConfig": return await exampleConfig(req);
    case "hello": return await hello(req);
    case "restart": return await restart(req);
    case "restartStatus": return await restartStatus(req);
    case "rewriteConfig": return await rewriteConfig(req);

    default:
      return {
        status: 404,
        json: {
          error: "404 Not Found",
          path: req.url,
          httpCallName: name,
        },
      };
  }
};