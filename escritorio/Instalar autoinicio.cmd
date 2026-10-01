@echo off
rem Hace que MediBot arranque solo al encender la computadora (carpeta Inicio del usuario, sin permisos de administrador).
rem Ejecutar desde la carpeta donde esté MediBot.exe (por ejemplo C:\MediBot\MediBot.exe). Para quitarlo: borrar "MediBot.lnk" de shell:startup.
setlocal
set "EXE=%~dp0MediBot.exe"
if not exist "%EXE%" (echo No encuentro MediBot.exe junto a este archivo. & pause & exit /b 1)
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ws = New-Object -ComObject WScript.Shell;" ^
  "$ini = [Environment]::GetFolderPath('Startup');" ^
  "$s = $ws.CreateShortcut((Join-Path $ini 'MediBot.lnk'));" ^
  "$s.TargetPath = '%EXE%'; $s.WorkingDirectory = '%~dp0'; $s.Description = 'MediBot (arranque automatico)'; $s.Save();" ^
  "$d = $ws.CreateShortcut((Join-Path ([Environment]::GetFolderPath('Desktop')) 'MediBot.lnk'));" ^
  "$d.TargetPath = '%EXE%'; $d.WorkingDirectory = '%~dp0'; $d.Description = 'MediBot: orientacion en salud (no diagnostica)'; $d.Save();" ^
  "Write-Output ('Listo: MediBot arrancara al iniciar sesion y hay acceso directo en el Escritorio. Salir de la app: Ctrl+Alt+Shift+Q')"
pause
endlocal
