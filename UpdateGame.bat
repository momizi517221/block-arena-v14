@echo off
setlocal
cd /d "%~dp0"
where git >nul 2>&1
if errorlevel 1 goto nogit
if not exist ".git" goto norepo
git remote get-url origin >nul 2>&1
if errorlevel 1 goto norepo
for /f "delims=" %%B in ('git branch --show-current') do set "BRANCH=%%B"
if /i not "%BRANCH%"=="main" goto wrongbranch
if not exist "package.json" goto nofiles
if not exist "server.js" goto nofiles
if not exist "public\index.html" goto nofiles
echo.
echo === BLOCK ARENA UPDATE ===
git remote -v
git status --short
if errorlevel 1 goto failed
echo.
echo Review the files above. Do not upload secrets or unrelated files.
choice /c YN /m "Commit game changes and push to origin/main"
if errorlevel 2 goto cancelled
git add -- package.json server.js simulation.js public test UpdateGame.bat
if errorlevel 1 goto failed
for %%F in (package-lock.json render.yaml .gitignore README.md) do if exist "%%F" (
  git add -- "%%F"
  if errorlevel 1 goto failed
)
git diff --cached --quiet
if errorlevel 2 goto failed
if errorlevel 1 (
  git commit -m "Update BLOCK ARENA"
  if errorlevel 1 goto failed
)
git push origin main
if errorlevel 1 goto failed
echo.
echo GitHub push completed. Check Render for deployment status.
pause
exit /b 0
:nogit
echo Git was not found. Install Git for Windows first.
goto failed
:norepo
echo Put this file in the cloned BLOCK ARENA Git repository.
goto failed
:wrongbranch
echo Switch to the main branch before running this script.
goto failed
:nofiles
echo The game server files are missing. Install the V14 project first.
goto failed
:cancelled
echo Cancelled. No changes were staged by this script.
pause
exit /b 0
:failed
echo Update stopped. Review the error above. No force push was used.
pause
exit /b 1
