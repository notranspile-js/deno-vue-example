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

import conf from "../../server/conf.js";
import { path } from "../../server/deps.js";
import { assert, assertEquals } from "../test_deps.js";

Deno.test("calls/rewriteConfig success", async () => {
  const confPath = path.join(conf.appdir, "conf", "config.json");
  const bkpPath = path.join(conf.appdir, "work", "config_prev.json");

  const confBefore = JSON.parse(Deno.readTextFileSync(confPath));
  assertEquals(confBefore.example.foo, "baz");
  assertEquals(confBefore.example.bar, "boo");

  const resp = await fetch("http://127.0.0.1:8080/api/rewriteConfig", {
    method: "POST",
    body: JSON.stringify({
      foo: "41",
      bar: "42"
    }, null, 4)
  });
  assertEquals(resp.status, 200);
  const obj = await resp.json();
  assert(obj.success);

  const confAfter = JSON.parse(Deno.readTextFileSync(confPath));
  assertEquals(confAfter.example.foo, "41");
  assertEquals(confAfter.example.bar, "42");

  const confBkp = JSON.parse(Deno.readTextFileSync(bkpPath));
  assertEquals(confBkp.example.foo, "baz");
  assertEquals(confBkp.example.bar, "boo");

  Deno.renameSync(bkpPath, confPath);
});