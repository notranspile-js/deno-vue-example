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

import conf from "../../../common/conf.js";

async function ping(start, resolve, reject) {
  try {
    const resp = await fetch("/api/restartStatus");
    await resp.json();
    if (resp.ok) {
      resolve(null);
    } else {
      if (Date.now() < start + conf().restartTimeoutMillis) {
        setTimeout(() => ping(start, resolve, reject), 1000);
      } else if (503 === resp.status) {
        reject(
          "Service stop failed, please restart the service manually in SCM panel",
        );
      } else {
        reject(
          "Service has stopped, but hasn't started," +
            ` timeout: [${conf.restartTimeoutMillis / 1000}],` +
            " please check the service status in SCM panel",
        );
      }
    }
  } catch (e) {
    reject(String(e));
  }
}

export default async (context) => {
  context.commit("restart_began");
  try {
    {
      const resp = await fetch("/api/rewriteConfig", {
        method: "POST",
        body: JSON.stringify(
          {
            foo: context.state.foo,
            bar: context.state.bar,
          },
          null,
          4,
        ),
      });
      const obj = await resp.json();
      if (!resp.ok) {
        setTimeout(() => {
          context.commit("restart_failed", obj.error ?? "N/A");
        }, 500);
        return;
      }
    }
    {
      const resp = await fetch("/api/restart", {
        method: "POST",
      });
      const obj = await resp.json();
      if (!resp.ok) {
        setTimeout(() => {
          context.commit("restart_failed", obj.error ?? "N/A");
        }, 500);
        return;
      }
    }
    const pr = new Promise((resolve, reject) => {
      setTimeout(async () => {
        await ping(Date.now(), resolve, reject);
      });
    });
    await pr;
    context.commit("restart_succeeded");
    setTimeout(() => window.location.reload(), 3000);
  } catch (e) {
    context.commit("restart_failed", String(e));
  }
};
