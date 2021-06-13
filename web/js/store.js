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

import fetchConf from "./common/actions/fetchConf.js";
import aboutStore from "./modules/about/aboutStore.js";
import landingStore from "./modules/landing/landingStore.js";

export default async () => {
  return {
    strict: true,

    modules: {
      about: await aboutStore(),
      landing: await landingStore(),
    },

    state() {
      return {
        conf: null
      }
    },

    actions: {
      fetchConf
    },

    mutations: {
      setConf: (state, val) => state.conf = val
    },
  };
};