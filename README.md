Example application using Deno and Vue 
======================================

Example application built with [Deno](https://deno.land/) and [Vue](https://v3.vuejs.org/).

Run from command line:

    deno run -A main.js

Build Windows MSI installer that registers the app with [SCM](https://docs.microsoft.com/en-us/windows/win32/services/service-control-manager) (required [Wix](https://wixtoolset.org/)):

    deno run -A main.js create-msi-installer --wix-directory path/to/wix

Installer requires [Microsoft Visual C++ Redistributable for Visual Studio 2019](https://aka.ms/vs/16/release/vc_redist.x64.exe) (direct download link) to be installed.

License information
-------------------

This project is released under the [Apache License 2.0](http://www.apache.org/licenses/LICENSE-2.0).