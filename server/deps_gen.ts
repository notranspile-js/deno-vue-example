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

// This file is used to declare all external dependencies,
// see: https://deno.land/manual@v1.10.2/linking_to_external_code#it-seems-unwieldy-to-import-urls-everywhere
//
// After changing this file run the following to re-generate deps.js:
// deno bundle --unstable deps_gen.ts deps.js
//
// note 1: --unstable flag is required for timestamps,
// see: https://stackoverflow.com/a/61719370
//
// note 2: @ts-ignore before each export is required to suppress Typescript warning,
// see: https://github.com/Microsoft/TypeScript/issues/27481

// stdlib

// @ts-ignore extension
export * as fs from "https://deno.land/std@0.110.0/fs/mod.ts";

// @ts-ignore extension
export * as io from "https://deno.land/std@0.110.0/io/mod.ts";

// @ts-ignore extension
import * as log from "https://deno.land/std@0.110.0/log/mod.ts";
export { log };

// @ts-ignore extension
export * as path from "https://deno.land/std@0.110.0/path/mod.ts";

// @ts-ignore extension
export { v4 as uuidv4 } from "https://deno.land/std@0.110.0/uuid/mod.ts";

// dayjs
//import dayjs from "https://deno.land/x/dayjs@v1.10.5/src/index.js";
import dayjs from "https://cdn.skypack.dev/dayjs@1.10.5";
import "https://cdn.skypack.dev/dayjs@1.10.5/locale/en";
export { dayjs };

// yargs
// @ts-ignore extension
import yargs from "https://deno.land/x/yargs@v17.0.1-deno/deno.ts";
export { yargs };

// deno-js2xml
import js2xml from "https://raw.githubusercontent.com/notranspile-js/deno-js2xml/1.0.0/js2xml.js";
export { js2xml };

// deno-simple-server
// @ts-ignore extension
export { SimpleServer, SimpleRequest } from "https://deno.land/x/simple_server@1.1.0/mod.ts";

// deno-windows-scm
// @ts-ignore extension
export { winscmStartDispatcher } from "https://deno.land/x/windows_scm@1.1.1/mod.ts";
