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

export default {
  actions() {
    return [{
      _attributes: {
        Id: "uninstall_cleanup_immediate",
        Property: "uninstall_cleanup_deferred",
        Value: "&quot;[SystemFolder]cmd.exe&quot; /c" +
          " rd /s /q &quot;[INSTALLDIR]&quot;",
      },
    }, {
      _attributes: {
        Id: "uninstall_cleanup_deferred",
        BinaryKey: "WixCA",
        DllEntry: "WixQuietExec",
        Return: "ignore",
        Execute: "deferred",
        Impersonate: "no",
      },
    }, {
      _attributes: {
        Id: "sanity_check",
        FileKey: "DENO_EXE_ID",
        Return: "check",
        Execute: "deferred",
        Impersonate: "no",
        ExeCommand: "run -A" +
          " &quot;[INSTALLDIR]main.js&quot;" +
          " check-sanity",
      },
    }, {
      _attributes: {
        Id: "postinstall",
        FileKey: "DENO_EXE_ID",
        Return: "asyncNoWait",
        Impersonate: "yes",
        ExeCommand: "run -A" +
          " &quot;[INSTALLDIR]main.js&quot;" +
          " launch-system-browser" +
          " --url /web/index.html#/postinstall",
      },
    }];
  },

  executeSequence() {
    return {
      Custom: [{
        _attributes: {
          Action: "uninstall_cleanup_immediate",
          Before: "InstallInitialize",
        },
        _cdata: "REMOVE AND (NOT UPGRADINGPRODUCTCODE)",
      }, {
        _attributes: {
          Action: "uninstall_cleanup_deferred",
          Before: "InstallFinalize",
        },
        _cdata: "REMOVE AND (NOT UPGRADINGPRODUCTCODE)",
      }, {
        _attributes: {
          Action: "sanity_check",
          Before: "InstallServices",
        },
        _cdata: "NOT REMOVE",
      }],
    };
  },
};
