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
  fs,
  log,
  path,
  io,
} from "../deps.js";
import conf from "../conf.js";

export default async () => {
  const logger = log.getLogger();

  const binDir = path.join(conf().appdir, "bin");
  if (!fs.existsSync(binDir)) {
    Deno.mkdirSync(binDir);
  }
  const denoExe = path.join(conf().appdir, "bin/deno.exe");
  if (!fs.existsSync(denoExe)) {
    logger.info(`Fetching deno.exe, path: [${Deno.execPath()}] ...`);
    Deno.copyFileSync(Deno.execPath(), denoExe);
  }

  const launcherExeName = path.basename(conf().installer.launcherExeUrl);
  const launcherExe = path.join(conf().appdir, `bin/${launcherExeName}`);
  if (!fs.existsSync(launcherExe)) {
    logger.info(
      `Fetching Windows launcher, url: [${conf().installer.launcherExeUrl}] ...`,
    );
    const rsp = await fetch(conf().installer.launcherExeUrl);
    const reader = io.readerFromStreamReader(rsp.body?.getReader());
    const file = Deno.openSync(launcherExe, {
      create: true,
      write: true,
    });
    try {
      await io.copy(reader, file);
    } finally {
      file.close();
    }
  }

  const pluginDllName = path.basename(conf().installer.pluginDllUrl);
  const pluginDll = path.join(conf().appdir, `bin/${pluginDllName}`);
  if (!fs.existsSync(pluginDll)) {
    logger.info(
      `Fetching WinSCM plugin, url: [${conf().installer.pluginDllUrl}] ...`,
    );
    const rsp = await fetch(conf().installer.pluginDllUrl);
    const reader = io.readerFromStreamReader(rsp.body?.getReader());
    const file = Deno.openSync(pluginDll, {
      create: true,
      write: true,
    });
    try {
      await io.copy(reader, file);
    } finally {
      file.close();
    }
  }
};
