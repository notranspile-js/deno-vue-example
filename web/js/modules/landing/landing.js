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
import Header from "../../components/header/Header.js";

const template = await fetchTemplate(import.meta.url);

export default {
  template,

  components: {
    "example-header": new Header(),
  },

  computed: {
    counter() {
      return this.$store.state.landing.count;
    },
    anotherField: {
      get() {
        return this.$store.state.landing.anotherVal;
      },
      set(val) {
        this.$store.commit("landing/setAnotherVal", val);
      },
    },
  },

  methods: {
    toAbout() {
      this.$router.push("/about");
    },

    toSetup() {
      this.$router.push("/setup");
    },

    incrementCounter() {
      this.$store.commit("landing/increment");
    },
  },
};
