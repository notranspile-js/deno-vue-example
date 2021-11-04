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

import { fs, log } from "../deps.js";
import bundleInstaller from "./bundleInstaller.js";
import fetchBinaries from "./fetchBinaries.js";
import prepareDist from "./prepareDist.js";
import prepareWorkDir from "./prepareWorkDir.js";
import writeDescriptor from "./writeDescriptor.js";

export default async (wixDir) => {
  const logger = log.getLogger();

  if (null == wixDir) {
    throw new Error("'--wix-directory' parameter must be specified");
  }
  if (!fs.existsSync(wixDir)) {
    throw new Error(`Invalid Wix directory specified, path: [${wixDir}]`);
  }

  // prepare work dir
  const workDir = prepareWorkDir();

  // build native part
  await fetchBinaries();

  // create dist
  const distDir = prepareDist(workDir);

  // create descriptor
  const descriptor = writeDescriptor(workDir, distDir);

  // run wix
  const inst = await bundleInstaller(wixDir, descriptor);

  logger.info(`Installer created successfully, path: [${inst}]`);
};
