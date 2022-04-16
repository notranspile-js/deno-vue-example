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

import { path } from "../../deps.js";
import conf from "../../conf.js";
import createDirectory from "./createDirectory.js";
import createFeature from "./createFeature.js";
import createCustomActions from "./createCustomActions.js";
import createPostInstallUI from "./createPostInstallUI.js";
import createProperty from "./createProperty.js";
import createWixVariable from "./createWixVariable.js";

export default (distDir) => {
  const dirEl = createDirectory(distDir);
  return {
    Wix: {
      _attributes: {
        xmlns: "http://schemas.microsoft.com/wix/2006/wi",
      },
      Product: {
        _attributes: {
          Id: crypto.randomUUID(),
          Codepage: "1252",
          Language: "1033",
          Manufacturer: conf.installer.manufacturer,
          Name: conf.installer.productName,
          UpgradeCode: conf.installer.upgradeCode,
          Version: conf.appversion,
        },
        Package: {
          _attributes: {
            Compressed: "yes",
            InstallerVersion: "200",
            InstallScope: "perMachine",
            Languages: "1033",
            Platform: "x64",
            SummaryCodepage: "1252",
          },
        },
        Media: {
          _attributes: {
            Id: "1",
            Cabinet: "Application.cab",
            EmbedCab: "yes",
          },
        },
        Directory: dirEl,
        Feature: createFeature(dirEl),
        CustomAction: createCustomActions.actions(),
        InstallExecuteSequence: createCustomActions.executeSequence(),
        Property: createProperty(),
        UIRef: [{
          _attributes: {
            Id: "WixUI_InstallDir",
          },
        }, {
          _attributes: {
            Id: "WixUI_ErrorProgressText",
          },
        }],
        UI: createPostInstallUI(),
        Icon: {
          _attributes: {
            Id: "icon.exe",
            SourceFile: path.join(conf.appdir, "server/installer/resources/icon.ico"),
          },
        },
        MajorUpgrade: {
          _attributes: {
            AllowDowngrades: "no",
            AllowSameVersionUpgrades: "yes",
            DowngradeErrorMessage:
              "A later version of [ProductName] is already installed. Setup will now exit.",
            IgnoreRemoveFailure: "no",
          },
        },
        WixVariable: createWixVariable(),
      },
    },
  };
};
