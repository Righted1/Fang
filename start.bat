@echo off

title Starting...

start "ngrok server" ngrok http --domain=drake-tolerant-lioness.ngrok-free.app 6695
title localhost
node NodeJS/app.js

echo if any errors pop up from this window, then diagnose.

pause