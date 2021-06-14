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

import {
  basename,
  existsSync,
  join,
  log,
  readerFromStreamReader,
} from "../deps.js";
import conf from "../conf.js";

export default async () => {
  const logger = log.getLogger();

  const binDir = join(conf().appdir, "bin");
  if (!existsSync(binDir)) {
    Deno.mkdirSync(binDir);
  }
  const denoExe = join(conf().appdir, "bin/deno.exe");
  if (!existsSync(denoExe)) {
    logger.info(`Fetching deno.exe, path: [${Deno.execPath()}] ...`);
    Deno.copyFileSync(Deno.execPath(), denoExe);
  }

  const pluginDllName = basename(conf().installer.pluginDllUrl);
  const pluginDll = join(conf().appdir, `bin/${pluginDllName}`);
  if (!existsSync(pluginDll)) {
    logger.info(
      `Fetching WinSCM plugin, url: [${conf().installer.pluginDllUrl}] ...`,
    );
    const rsp = await fetch(conf().installer.pluginDllUrl);
    const reader = readerFromStreamReader(rsp.body?.getReader());
    const file = Deno.openSync(pluginDll, {
      create: true,
      write: true,
    });
    try {
      await Deno.copy(reader, file);
    } finally {
      file.close();
    }
  }
};
