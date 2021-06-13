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

export default async () => {
  return {
    template: await fetchTemplate(import.meta.url),

    async created() {
      await this.$store.dispatch("fetchConf");
      this.$store.dispatch("about/listenToBroadcasts");
    },

    components: {
      "example-header": new (await Header())(),
    },

    computed: {
      broadcasts() {
        const arr = this.$store.state.about.broadcasts.slice();
        arr.reverse();
        return arr; 
      }
    },

    methods: {
      toLanding() {
        this.$router.push("/landing");
      },
    },
  };
};
