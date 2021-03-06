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

import { path } from "./deps.js";

const filePath = path.fromFileUrl(import.meta.url);
const serverdir = path.dirname(filePath);
const appdir = path.dirname(serverdir).replaceAll("\\", "/");
const txt = Deno.readTextFileSync(path.join(appdir, "conf/config.json"));
const replaced = txt.replaceAll("{{appdir}}", appdir);
export default JSON.parse(replaced);