@echo off
cd /d "%~dp0"
echo Starting Lost & Found local server...
echo Project: %CD%
echo.
node dev-server.js
echo.
echo Server stopped. If there is an error above, copy that message.
pause
