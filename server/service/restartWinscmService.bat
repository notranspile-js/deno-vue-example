@echo off
rem
rem Copyright 2021, alex at staticlibs.net
rem
rem Licensed under the Apache License, Version 2.0 (the "License");
rem you may not use this file except in compliance with the License.
rem You may obtain a copy of the License at
rem
rem http://www.apache.org/licenses/LICENSE-2.0
rem
rem Unless required by applicable law or agreed to in writing, software
rem distributed under the License is distributed on an "AS IS" BASIS,
rem WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
rem See the License for the specific language governing permissions and
rem limitations under the License.
rem

C:\Windows\System32\cmd.exe /c net stop {{serviceName}} > "{{stopOutput}}" 2>&1 
C:\Windows\System32\cmd.exe /c net start {{serviceName}} > "{{startOutput}}" 2>&1