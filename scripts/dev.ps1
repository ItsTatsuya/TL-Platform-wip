# Back-compat wrapper. Prefer launch-demo.ps1 in the project root.
& (Join-Path (Split-Path -Parent $PSScriptRoot) "launch-demo.ps1")
