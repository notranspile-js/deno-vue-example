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
import Alert from "../../components/alert/Alert.js";
import Header from "../../components/header/Header.js";
import loadStatus from "./loadStatus.js";
import restartStatus from "./restartStatus.js";

const template = await fetchTemplate(import.meta.url);

export default {
  template,

  components: {
    "example-header": new Header(),
    "example-load-alert": new Alert([Alert.styles.DANGER]),
    "example-restart-alert": new Alert([Alert.styles.DANGER]),
  },

  created() {
    this.$store.commit("setup/reset");
    this.$store.commit("setup/load_initial");
    this.$store.commit("setup/restart_initial");
    this.$store.dispatch("setup/loadExampleConfig");
  },

  computed: {
    foo: {
      get() {
        return this.$store.state.setup.foo;
      },
      set(val) {
        this.$store.commit("setup/setFoo", val);
      },
    },
    bar: {
      get() {
        return this.$store.state.setup.bar;
      },
      set(val) {
        this.$store.commit("setup/setBar", val);
      },
    },

    // load alert

    loadAlertMessage() {
      return this.$store.state.setup.loadAlert.message;
    },

    loadAlertStyle() {
      switch (this.$store.state.setup.loadAlert.status) {
        case loadStatus.IN_PROGRESS:
          return Alert.styles.SECONDARY;
        case loadStatus.ERROR:
          return Alert.styles.DANGER;
        default:
          return Alert.styles.LIGHT;
      }
    },

    loadAlertVisible() {
      switch (this.$store.state.setup.loadAlert.status) {
        case loadStatus.IN_PROGRESS:
        case loadStatus.ERROR:
          return true;
        default:
          return false;
      }
    },

    // restart alert

    restartAlertMessage() {
      return this.$store.state.setup.restartAlert.message;
    },

    restartAlertStyle() {
      switch (this.$store.state.setup.restartAlert.status) {
        case restartStatus.IN_PROGRESS:
          return Alert.styles.SECONDARY;
        case restartStatus.SUCCESS:
          return Alert.styles.SUCCESS;
        case restartStatus.ERROR:
          return Alert.styles.DANGER;
        default:
          return Alert.styles.LIGHT;
      }
    },

    restartAlertVisible() {
      switch (this.$store.state.setup.restartAlert.status) {
        case restartStatus.IN_PROGRESS:
        case restartStatus.SUCCESS:
        case restartStatus.ERROR:
          return true;
        default:
          return false;
      }
    },
  },

  methods: {
    toLanding() {
      this.$router.push("/landing");
    },

    closeLoadAlert() {
      this.$store.commit("setup/load_initial");
    },

    closeRestartAlert() {
      this.$store.commit("setup/restart_initial");
    },

    restart() {
      this.$store.dispatch("setup/rewriteConfigAndRestart");
    }
  },
};
