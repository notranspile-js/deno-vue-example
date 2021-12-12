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

import { fs, logger, path } from "../deps.js";
import conf from "../conf.js";

export default (workDir) => {
  logger.info("Preparing dist files ...");

  const join = path.join;
  const distDir = join(workDir, "dist");
  Deno.mkdirSync(distDir);

  fs.copySync(join(conf().appdir, "bin"), join(distDir, "bin"));
  fs.copySync(join(conf().appdir, "conf"), join(distDir, "conf"));
  fs.copySync(join(conf().appdir, "server"), join(distDir, "server"));
  fs.copySync(join(conf().appdir, "web"), join(distDir, "web"));
  fs.copySync(join(conf().appdir, "main.js"), join(distDir, "main.js"));

  return distDir;
};
