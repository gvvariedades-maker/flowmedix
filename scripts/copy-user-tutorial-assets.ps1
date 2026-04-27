# Copia as capturas do workspace Cursor para public/tutorial/seq-01.png … seq-10.png
# Uso: pwsh -File scripts/copy-user-tutorial-assets.ps1
$ErrorActionPreference = "Stop"
$Base = "C:\Users\TecnoInfo\.cursor\projects\c-AVANT\assets"
$Dest = Join-Path (Split-Path -Parent $PSScriptRoot) "public\tutorial"
New-Item -ItemType Directory -Path $Dest -Force | Out-Null

$Map = [ordered]@{
  "seq-01.png" = "c__Users_TecnoInfo_AppData_Roaming_Cursor_User_workspaceStorage_42fdde70b83a77a7e20ceb5c54b48b35_images_Captura_de_Tela_01-3fce9d37-2cae-4845-a50d-80fd0c1ee999.png"
  "seq-02.png" = "c__Users_TecnoInfo_AppData_Roaming_Cursor_User_workspaceStorage_42fdde70b83a77a7e20ceb5c54b48b35_images_Captura_de_Tela_02-94043b19-22c0-40a8-aeee-83cf41c7f5ab.png"
  "seq-03.png" = "c__Users_TecnoInfo_AppData_Roaming_Cursor_User_workspaceStorage_42fdde70b83a77a7e20ceb5c54b48b35_images_Captura_de_Tela_03-b400a082-dc32-447a-a24d-85fde58456e5.png"
  "seq-04.png" = "c__Users_TecnoInfo_AppData_Roaming_Cursor_User_workspaceStorage_42fdde70b83a77a7e20ceb5c54b48b35_images_Captura_de_Tela_04-a0cefbce-5bfe-4a8c-8a63-71837594307f.png"
  "seq-05.png" = "c__Users_TecnoInfo_AppData_Roaming_Cursor_User_workspaceStorage_42fdde70b83a77a7e20ceb5c54b48b35_images_Captura_de_Tela_05-c1fd24eb-0863-4eca-9b54-6f09e32e1e39.png"
  "seq-06.png" = "c__Users_TecnoInfo_AppData_Roaming_Cursor_User_workspaceStorage_42fdde70b83a77a7e20ceb5c54b48b35_images_Captura_de_Tela_08-71bf94eb-41f3-4446-86a6-42a597939a6f.png"
  "seq-07.png" = "c__Users_TecnoInfo_AppData_Roaming_Cursor_User_workspaceStorage_42fdde70b83a77a7e20ceb5c54b48b35_images_Captura_de_Tela_09-e4e0a9a0-4d97-4e26-9e3c-32a48a84349f.png"
  "seq-08.png" = "c__Users_TecnoInfo_AppData_Roaming_Cursor_User_workspaceStorage_42fdde70b83a77a7e20ceb5c54b48b35_images_Captura_de_Tela_11-5bb519d1-0e3d-45af-8a20-f89f59e0b4b2.png"
  "seq-09.png" = "c__Users_TecnoInfo_AppData_Roaming_Cursor_User_workspaceStorage_42fdde70b83a77a7e20ceb5c54b48b35_images_Captura_de_Tela_12-a019e3f7-e92b-480a-b442-c6168d32abf9.png"
  "seq-10.png" = "c__Users_TecnoInfo_AppData_Roaming_Cursor_User_workspaceStorage_42fdde70b83a77a7e20ceb5c54b48b35_images_Captura_de_Tela_14-df22d09c-c986-4ca1-a32a-ce0f568e348e.png"
}
foreach ($k in $Map.Keys) {
  $src = Join-Path $Base $Map[$k]
  if (Test-Path $src) {
    Copy-Item $src (Join-Path $Dest $k) -Force
    Write-Host "OK $k"
  } else { Write-Warning "Falta: $src" }
}
Write-Host "Destino: $Dest"
