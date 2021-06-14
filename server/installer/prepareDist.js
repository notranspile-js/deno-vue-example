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

import { copySync, join, log } from "../deps.js";
import conf from "../conf.js";

export default (workDir) => {
  const logger = log.getLogger();
  logger.info("Preparing dist files ...");

  const distDir = join(workDir, "dist");
  Deno.mkdirSync(distDir);

  copySync(join(conf().appdir, "bin"), join(distDir, "bin"));
  copySync(join(conf().appdir, "conf"), join(distDir, "conf"));
  copySync(join(conf().appdir, "server"), join(distDir, "server"));
  copySync(join(conf().appdir, "web"), join(distDir, "web"));
  copySync(join(conf().appdir, "main.js"), join(distDir, "main.js"));

  return distDir;
};
