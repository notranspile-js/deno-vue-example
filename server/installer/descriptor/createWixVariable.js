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

export default () => {
  return [{
    _attributes: {
      Id: "WixUILicenseRtf",
      Value: path.join(conf().appdir, "server/installer/resources/LICENSE.rtf"),
    },
  }, {
    _attributes: {
      Id: "WixUIBannerBmp",
      Value: path.join(conf().appdir, "server/installer/resources/top.bmp"),
    },
  }, {
    _attributes: {
      Id: "WixUIDialogBmp",
      Value: path.join(conf().appdir, "server/installer/resources/greetings.bmp"),
    },
  }];
};
