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

import status from "../loadStatus.js";

export default {
  initial(state) {
    state.loadAlert.status = status.INITIAL;
    state.loadAlert.message = "";
  },

  began(state) {
    state.loadAlert.status = status.IN_PROGRESS;
    state.loadAlert.message = "Loading ...";
  },

  failed(state, error) {
    state.loadAlert.status = status.ERROR;
    state.loadAlert.message = `Configuration load failed, error: [${error}]`;
  },

  succeeded(state, example) {
    state.foo = example.foo;
    state.bar = example.bar;
    state.loadAlert.status = status.SUCCESS;
    state.loadAlert.message = "";
  }
};