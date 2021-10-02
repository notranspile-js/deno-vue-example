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

import { join, uuidv4 } from "../../deps.js";
import conf from "../../conf.js";
import createService from "./createService.js";
import createShortcuts from "./createShortcuts.js";
import genId from "./genId.js";

function addService(compEl) {
  compEl.ServiceInstall = createService.install();
  compEl.ServiceControl = createService.control();
}

function addShortcuts(compEl) {
  compEl.Shortcut = createShortcuts();
}

function processDirRecursive(dirPath, dirEl) {
  const children = Deno.readDirSync(dirPath);
  for (const ch of children) {
    const chPath = join(dirPath, ch.name);
    if (ch.isDirectory) {
      dirEl.Directory.push({
        _attributes: {
          Id: genId(),
          Name: ch.name,
        },
        Directory: [],
        Component: [],
      });
      processDirRecursive(
        chPath,
        dirEl.Directory[dirEl.Directory.length - 1],
      );
    } else {
      dirEl.Component.push({
        _attributes: {
          Id: genId(),
          Guid: uuidv4.generate(),
          Win64: "yes",
        },
        File: {
          _attributes: {
            Id: genId(),
            Name: ch.name,
            KeyPath: "yes",
            DiskId: "1",
            Source: chPath,
          },
        },
      });
      if ("deno.exe" === ch.name) {
        const compEl = dirEl.Component[dirEl.Component.length - 1];
        addService(compEl);
      }
      if ("denow.exe" === ch.name) {
        const compEl = dirEl.Component[dirEl.Component.length - 1];
        compEl.File._attributes.Id = "DENOW_EXE_ID";
        addShortcuts(compEl);
      }
    }
  }
}

export default (distDir) => {
  const installDirEl = {
    _attributes: {
      Id: "INSTALLDIR",
      Name: conf().installer.installDirName + "-" + conf().appversion,
    },
    Directory: [],
    Component: [],
  };

  processDirRecursive(distDir, installDirEl);

  return {
    _attributes: {
      Id: "TARGETDIR",
      Name: "SourceDir",
    },
    Directory: [{
      _attributes: {
        Id: "DesktopFolder",
        Name: "Desktop",
      },
    }, {
      _attributes: {
        Id: "ProgramFiles64Folder",
      },
      Directory: [installDirEl],
    }],
  };
};
