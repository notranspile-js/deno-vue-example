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

import status from "../restartStatus.js";

export default {
  initial(state) {
    state.restartAlert.status = status.INITIAL;
    state.restartAlert.message = "";
  },

  began(state) {
    state.restartAlert.status = status.IN_PROGRESS;
    state.restartAlert.message = "Is due to restart the service ...";
  },

  failed(state, error) {
    state.restartAlert.status = status.ERROR;
    state.restartAlert.message = `Restart failed, error: [${error}]`;
  },

  succeeded(state) {
    state.restartAlert.status = status.SUCCESS;
    state.restartAlert.message = "Service restartted, this page will be reloaded in a moment ...";
  }
};