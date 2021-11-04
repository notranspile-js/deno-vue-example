'
' Copyright 2021, alex at staticlibs.net
'
' Licensed under the Apache License, Version 2.0 (the "License");
' you may not use this file except in compliance with the License.
' You may obtain a copy of the License at
'
' http://www.apache.org/licenses/LICENSE-2.0
'
' Unless required by applicable law or agreed to in writing, software
' distributed under the License is distributed on an "AS IS" BASIS,
' WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
' See the License for the specific language governing permissions and
' limitations under the License.
'

Dim host
Dim fs
Dim path
Dim cmd
Dim res

Set host = CreateObject("WScript.Shell")
Set fs = CreateObject("Scripting.FileSystemObject")
Set path = fs.GetFile(WScript.ScriptFullName)
' https://github.com/denoland/deno/issues/5501
' https://superuser.com/q/198525
cmd = "c:\windows\system32\cmd.exe /c " & Chr(34) & "start /b " & Chr(34) & Chr(34) & " " & Chr(34) & path.ParentFolder & "\restart.bat" & Chr(34) & Chr(34)
'MsgBox(cmd)
res = host.Run(cmd, 0, true)
WScript.Quit(res)
