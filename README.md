Example application using Deno and Vue 
======================================

Example application built with [Deno](https://deno.land/) and [Vue](https://v3.vuejs.org/).

Application consists of a HTTP/File/WebSocket server and a web application. On Windows
application can be installed as a Windows Service, web UI can be opened in a default browser
using a Desktop shortcut.

Usage
-----

Run from command line:

    deno run -A main.js
    > [INFO] Server started, url: [http://127.0.0.1:8080/]
    > [INFO] Press Enter to stop

Build Windows MSI installer that registers the app with [SCM](https://docs.microsoft.com/en-us/windows/win32/services/service-control-manager) (required [Wix](https://wixtoolset.org/)):

    deno run -A main.js create-msi-installer --wix-directory path/to/wix

Installer requires [Microsoft Visual C++ Redistributable for Visual Studio 2019](https://aka.ms/vs/16/release/vc_redist.x64.exe) (direct download link) to be installed.

Server
------

#### Command-Line interface

[main.js](https://github.com/notranspile-js/deno-vue-example/blob/master/main.js) is used as a single entry point for all operations. [yargs](http://yargs.js.org/) is used for declaring command-line options. A "command" is declared for every operation, typical usage:

    deno run -A some-command --my-option1 arg1 --my-option2

#### Dependency Management

A variation of a [deps.ts approach](https://deno.land/manual@v1.10.2/linking_to_external_code#it-seems-unwieldy-to-import-urls-everywhere) is used for dependency management. All Deno stdlib and third-party dependencies are declared inside [deps_gen.ts](https://github.com/notranspile-js/deno-vue-example/blob/master/server/deps_gen.ts) and bundled into a single `deps.js` file that is cheked into VCS. When additional dependency is introduced this file needs to be re-generated using `update-deps` app command or manually using `deno bundle` directly.

#### HTTP calls

[deno-simple-server](https://github.com/notranspile-js/deno-simple-server#simple-web-server-for-deno) is used to serve files and respond to HTTP requests. HTTP handler ([example](https://github.com/notranspile-js/deno-vue-example/blob/master/server/calls/hello.js#L17)) is an async function that needs to be registered in the [root HTTP handler](https://github.com/notranspile-js/deno-vue-example/blob/fba30fa7aed7048dd9e62d6d0e8ebf1612c27eb2/server/calls/_calls.js#L31). It takes [SimpleRequest](https://github.com/notranspile-js/deno-simple-server/blob/1af0b9d9da13450f5270dbd9d2641563c0d5d051/SimpleRequest.ts#L23) as an input and needs to return [SimpleResponse](https://github.com/notranspile-js/deno-simple-server/blob/1af0b9d9da13450f5270dbd9d2641563c0d5d051/types.ts#L41). Required resulting object is an extension to the Deno [stdlib http Response](https://doc.deno.land/https/deno.land/std@0.97.0/http/mod.ts#Response) that additionally supports `json` field (can be used instead of `body` field) that takes a JSON object.

#### WebSocket broadcast

WebSocket can be used to push data from the server to the web UI, broadcasting it to the all
connected WebSocket clients. This can be used for "live" updating UI with the new data available on server. Such broadcasting can be done from any place on backend where [server object](https://github.com/notranspile-js/deno-vue-example/blob/fba30fa7aed7048dd9e62d6d0e8ebf1612c27eb2/server/startup/startServer.js#L44) is available, in [this example](https://github.com/notranspile-js/deno-vue-example/blob/fba30fa7aed7048dd9e62d6d0e8ebf1612c27eb2/server/calls/beginBroadcast.js#L29) periodic broadcast is initiated from the HTTP handler. 

Note, it is also possible to react on WebSocket data coming from clients using [WebSocketHandler](https://github.com/notranspile-js/deno-simple-server/blob/master/types.ts#L52), but it may be more convenient to use HTTP requests for that.

#### Windows SCM

Native plugin [deno-windows-scm](https://github.com/notranspile-js/deno-windows-scm) is used for integration with Windows [Service Control Manager](https://docs.microsoft.com/en-us/windows/win32/services/service-control-manager). Plugin is downloaded from the [specified URL](https://github.com/notranspile-js/deno-vue-example/blob/master/conf/config.json#L57) when the installer is bundled.

Note, native plugin API in Deno is not yet stable, supported version of Deno (currently `1.10.x`) is reflected in the plugin version `1.0.0_deno_1.10`.

Web UI
------

[Web frontend](https://github.com/notranspile-js/deno-vue-example/tree/master/web) is built using Vue.js 3.

Templates for [pages](https://github.com/notranspile-js/deno-vue-example/blob/master/web/js/modules/landing/landing.html) and [components](https://github.com/notranspile-js/deno-vue-example/blob/master/web/js/components/header/Header.html) are stored in separate HTML files that [are loaded](https://github.com/notranspile-js/deno-vue-example/blob/master/web/js/modules/landing/landing.js#L22) on application startup.

Application is split into the set of "modules" (pages). Navigation between pages is managed with [Vue Router version 4](https://next.router.vuejs.org/) using one [single central router](https://github.com/notranspile-js/deno-vue-example/blob/master/web/js/router.js).

[Vuex version 4](https://next.vuex.vuejs.org/) is used for state management, separate "local" store with [mutations](https://next.vuex.vuejs.org/guide/mutations.html) and [actions](https://next.vuex.vuejs.org/guide/actions.html) in its [own namespace](https://next.vuex.vuejs.org/guide/modules.html#namespacing) can be added to every page and needs to be registered as a "module" in a [central store](https://github.com/notranspile-js/deno-vue-example/blob/master/web/js/store.js).

[Bootstap version 5](https://getbootstrap.com/docs/5.0/getting-started/introduction/) is used for page layout and styling.

License information
-------------------

This project is released under the [Apache License 2.0](http://www.apache.org/licenses/LICENSE-2.0).