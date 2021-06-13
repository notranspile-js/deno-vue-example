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

import updateDeps from "../service/updateDeps.js";
import createDirs from "./createDirs.js";
import launchDefault from "./launchDefault.js";
import launchSystemBrowser from "./launchSystemBrowser.js";
import launchWinscmService from "./launchWinscmService.js";
import setupLogging from "./setupLogging.js";

export default async (cmd, args, parser) => {
  await createDirs();
  await setupLogging();

  switch (cmd) {
    case "update-deps": return await updateDeps();
    case "launch-system-browser": return await launchSystemBrowser(args.url);
    case "launch-winscm-service": return await launchWinscmService();
    default: {
      if (cmd.length > 0) {
        console.log(
          `Error: invalid unsupprted command specified, name: [${cmd}]\n`,
        );
        console.log(await parser.getHelp());
        Deno.exit(1);
      }
      return await launchDefault();
    }
  }
};
