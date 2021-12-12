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

import { dayjs, logger } from "../deps.js";
import intervalTracker from "../service/intervalTracker.js";

let active = false;

export default async (req) => {
  if ("POST" !== req.method) {
    throw new Error(`Invalid method: [${req.method}], must be: 'POST'`);
  }

  const obj = await req.json();

  if (active) {
    return {
      status: 400,
      json: {
        error: "Broadcast is already running"
      }
    };
  }

  logger.info(`Initiating broadcast, message: [${obj.message}]`);
  active = true;
  const intervalId = setInterval(() => {
    req.server.broadcastWebsocket({
      message: `${dayjs().format()} ${obj.message}`,
    });
  }, 1000);
  intervalTracker.track(intervalId);

  return {
    json: {
      success: true
    }
  };
};
