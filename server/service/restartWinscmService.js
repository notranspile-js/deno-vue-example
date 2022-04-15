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

export default async () => {
  // prepare dir
  const dir = path.join(conf.appdir, "work/restart");
  if (!fs.existsSync(dir)) {
    Deno.mkdirSync(dir);
  }
  fs.emptyDirSync(dir);

  // prepare script
  const templatePath = path.fromFileUrl(import.meta.url).replace(/.js$/, ".bat");
  const vbsSrcPath = path.fromFileUrl(import.meta.url).replace(/.js$/, ".vbs");
  const template = Deno.readTextFileSync(templatePath);
  const dirBackSlash = dir.replaceAll("/", "\\");
  const script = template
        .replaceAll("{{serviceName}}", conf.winscm.name)
        .replaceAll("{{startOutput}}", `${dirBackSlash}\\start_out.txt`)
        .replaceAll("{{stopOutput}}", `${dirBackSlash}\\stop_out.txt`);
  const batPath = path.join(dir, "restart.bat");
  Deno.writeTextFileSync(batPath, script);
  const vbsPath = path.join(dir, "restart.vbs")
  Deno.copyFileSync(vbsSrcPath, vbsPath);

  // spawn restart process
  const status = await Deno.run({
    cmd: [
      "c:\\windows\\system32\\wscript.exe",
      vbsPath.replaceAll("/", "\\")
    ]
  }).status();
  logger.critical("Restart process spawned, code: [" + status.code + "]");

  return status;
};
