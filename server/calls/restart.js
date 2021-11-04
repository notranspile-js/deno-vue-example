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
import restartWinscmService from "../service/restartWinscmService.js";
import shutdownFlag from "../service/shutdownFlag.js";

export default (req) => {
  const logger = log.getLogger();

  if ("POST" !== req.method) {
    throw new Error(`Invalid method: [${req.method}], must be: 'POST'`);
  }

  shutdownFlag.mark();

  const reqDonePromise = req.done;
  setTimeout(async () => { // allow response to be sent
    try {
      await reqDonePromise;
      await restartWinscmService();
    } catch(e) {
      logger.critical(e);
    }
  });

  return {
    json: {
      success: true,
    },
  };
}