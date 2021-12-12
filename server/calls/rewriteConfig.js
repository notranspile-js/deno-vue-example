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

import conf from "../conf.js";
import { fs, logger, path } from "../deps.js";

export default async (req) => {
  if ("POST" !== req.method) {
    throw new Error(`Invalid method: [${req.method}], must be: 'POST'`);
  }

  logger.info("Rewriting config file ...");

  const confPath = path.join(conf().appdir, "conf", "config.json");
  const bkpPath = path.join(conf().appdir, "work", "config_prev.json");

  const confRaw = JSON.parse(Deno.readTextFileSync(confPath));
  confRaw.example = await req.json();
  if (fs.existsSync(confPath)) {
      Deno.renameSync(confPath, bkpPath);
  }
  Deno.writeTextFileSync(confPath, JSON.stringify(confRaw, null, 2));
  logger.info("Config file rewritten successfully");

  return {
    json: {
      success: true
    }
  }
};