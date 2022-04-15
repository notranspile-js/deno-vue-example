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

import { js2xml, logger } from "../deps.js";
import conf from "../conf.js";
import createDeclaration from "./descriptor/createDeclaration.js";
import createWix from "./descriptor/createWix.js";

export default (workDir, distDir) => {
  logger.info("Creating installer descriptor ...");
  const descPath =
    `${workDir}${conf.installer.msiFileName}_${conf.appversion}.wxs`;

  // create elements
  const declarationEl = createDeclaration();
  const wixEl = createWix(distDir);

  // serialize
  const declaration = js2xml(declarationEl, {
    compact: true,
  });
  const wix = js2xml(wixEl, {
    compact: true,
    spaces: 4,
  });
  const xml = `${declaration}\n${wix}`;

  // write
  Deno.writeTextFileSync(descPath, xml);

  logger.info(`Descriptor written, path: [${descPath}]`);
  return descPath;
};
