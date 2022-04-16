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
export * as path from "https://deno.land/std@0.110.0/path/mod.ts";

// @ts-ignore extension
export { log, logger } from "https://deno.land/x/notranspile_logger@1.1.0/mod.ts"

// dayjs
// @ts-ignore extension
import dayjs from "https://deno.land/x/notranspile_dayjs@1.10.7-deno/index.js";
export { dayjs };

// yargs
// @ts-ignore extension
import yargs from "https://deno.land/x/yargs@v17.0.1-deno/deno.ts";
export { yargs };

// js2xml
// @ts-ignore extension
export { js2xml } from "https://deno.land/x/js2xml@1.0.4/mod.ts";

// simple_server
// @ts-ignore extension
export {
  SimpleRequest,
  SimpleServer,
} from "https://deno.land/x/simple_server@1.1.0/mod.ts";

// windows_scm
// @ts-ignore extension
export { winscmStartDispatcher } from "https://deno.land/x/windows_scm@1.1.2/mod.ts";
