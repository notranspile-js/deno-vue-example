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

Server
------

#### Command-Line interface

[main.js](https://github.com/notranspile-js/deno-vue-example/blob/master/main.js) is used as a single entry point for all operations. [yargs](http://yargs.js.org/) is used for declaring command-line options. A "command" is declared for every operation, typical usage:

    deno run -A main.js some-command --my-option1 arg1 --my-option2

#### Dependency Management

A variation of a [deps.ts approach](https://deno.land/manual@v1.10.2/linking_to_external_code#it-seems-unwieldy-to-import-urls-everywhere) is used for dependency management. All Deno stdlib and third-party dependencies are declared inside [deps_gen.ts](https://github.com/notranspile-js/deno-vue-example/blob/master/server/deps_gen.ts) and bundled into a single `deps.js` file that is cheked into VCS. When additional dependency is introduced this file needs to be re-generated using `update-deps` app command or manually using `deno bundle` directly.

#### HTTP calls

[simple_server](https://deno.land/x/simple_server) is used to serve files and respond to HTTP requests. HTTP handler ([example](https://github.com/notranspile-js/deno-vue-example/blob/5efd11bef476bba0b1041a1de30aade074e2bae4/server/calls/hello.js#L17)) is an async function that needs to be registered in the [root HTTP handler](https://github.com/notranspile-js/deno-vue-example/blob/fba30fa7aed7048dd9e62d6d0e8ebf1612c27eb2/server/calls/_calls.js#L31). It takes [SimpleRequest](https://github.com/notranspile-js/deno-simple-server/blob/22b2020f20d48363907c99ffe1df43f65f26d828/src/SimpleRequest.ts#L21) as an input and needs to return a [SimpleResponse](https://github.com/notranspile-js/deno-simple-server/blob/22b2020f20d48363907c99ffe1df43f65f26d828/src/types.ts#L33) or a standard [Response](https://doc.deno.land/builtin/stable#Response) object.

#### WebSocket broadcast

WebSocket can be used to push data from the server to the web UI, broadcasting it to the all connected WebSocket clients. This can be used for "live" updating UI with the new data available on server. Such broadcasting can be done from any place on backend where [server object](https://github.com/notranspile-js/deno-vue-example/blob/fba30fa7aed7048dd9e62d6d0e8ebf1612c27eb2/server/startup/startServer.js#L44) is available, in [this example](https://github.com/notranspile-js/deno-vue-example/blob/fba30fa7aed7048dd9e62d6d0e8ebf1612c27eb2/server/calls/beginBroadcast.js#L29) periodic broadcast is initiated from the HTTP handler. 

Note, it is also possible to react on WebSocket data coming from clients using [WebSocketConfig](https://github.com/notranspile-js/deno-simple-server/blob/22b2020f20d48363907c99ffe1df43f65f26d828/src/types.ts#L50) callbacks, but it may be more convenient to use HTTP requests for that.

#### Windows SCM

Native module from [windows_scm](https://deno.land/x/windows_scm) is used for integration with Windows [Service Control Manager](https://docs.microsoft.com/en-us/windows/win32/services/service-control-manager). Library is downloaded from the [specified URL](https://github.com/notranspile-js/deno-vue-example/blob/5efd11bef476bba0b1041a1de30aade074e2bae4/conf/config.json#L57) when the installer is bundled.

Note, Deno FFI API ([`Deno.dlopen`](https://doc.deno.land/builtin/unstable#Deno.dlopen)), that is used to load the native library, is not yet stable so SCM Deno process needs to be run with `--unstable` flag.

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