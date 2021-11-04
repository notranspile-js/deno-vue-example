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

import fetchTemplate from "../../common/utils/fetchTemplate.js";

const template = await fetchTemplate(import.meta.url);

const styles = {
  PRIMARY: Symbol("PRIMARY"),
  SECONDARY: Symbol("SECONDARY"),
  LIGHT: Symbol("LIGHT"),
  INFO: Symbol("INFO"),
  SUCCESS: Symbol("SUCCESS"),
  WARN: Symbol("WARN"),
  DANGER: Symbol("DANGER"),
};

export default class {
  constructor(closableStyles = []) {
    this.template = template;

    this.computed = {
      alertCss() {
        return {
          "alert": true,
          "alert-dismissible": true,
          "alert-primary": styles.PRIMARY === this.alertStyle,
          "alert-secondary": styles.SECONDARY === this.alertStyle,
          "alert-light": styles.LIGHT === this.alertStyle,
          "alert-info": styles.INFO === this.alertStyle,
          "alert-success": styles.SUCCESS === this.alertStyle,
          "alert-danger": styles.DANGER === this.alertStyle,
        };
      },

      showButton() {
        return closableStyles.includes(this.alertStyle);
      },
    };

    this.methods = {
      closeButtonClicked() {
        this.$emit("close-button-clicked");
      },
    };

    this.props = {
      message: String,
      alertStyle: Symbol,
    };
  }

  static styles = styles;
};
