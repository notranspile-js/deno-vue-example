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

import { yargs } from "./server/deps.js";
import launch from "./server/startup/launch.js";

if (import.meta.main) {
  const parser = yargs(Deno.args)
    .scriptName("-")
    .usage("Usage: deno run -A main.js <command> [options]")
    .command("update-deps", "Update dependencies bundle")
    .option("f", {
      alias: "file",
      demandOption: false,
      default: "/etc/passwd",
      describe: "x marks the spot",
      type: "string",
      nargs: 1,
    })
    .example("count -f foo.js", "count the lines in the given file")
    .help("h")
    .alias("h", "help");

  const args = parser.argv;

  if (args._.length > 1) {
    console.log(
      `Error: one single command must be specified, commands found: [${args._}]\n`,
    );
    console.log(await parser.getHelp());
    Deno.exit(1);
  }

  const cmd = args._.length > 0 ? args._[0] : "";

  await launch(cmd, args);
}
