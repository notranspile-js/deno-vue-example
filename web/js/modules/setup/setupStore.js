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

import loadExampleConfig from "./actions/loadExampleConfig.js";
import rewriteConfigAndRestart from "./actions/rewriteConfigAndRestart.js";
import load from "./mutations/load.js";
import restart from "./mutations/restart.js";

export default {
  namespaced: true,

  state() {
    return {
      loadAlert: {
        status: null,
        message: null,
      },

      restartAlert: {
        status: null,
        message: null,
      },

      foo: null,
      bar: null,
    };
  },

  mutations: {
    setFoo: (state, val) => state.foo = val,
    setBar: (state, val) => state.bar = val,
    reset(state) {
      state.foo = "";
      state.bar = "";
    },

    load_initial: load.initial,
    load_began: load.began,
    load_failed: load.failed,
    load_succeeded: load.succeeded,

    restart_initial: restart.initial,
    restart_began: restart.began,
    restart_failed: restart.failed,
    restart_succeeded: restart.succeeded,
  },

  actions: {
    loadExampleConfig,
    rewriteConfigAndRestart,
  },
};