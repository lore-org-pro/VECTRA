@echo off
set "REQUESTS_CA_BUNDLE=C:\Users\DELL\AppData\Local\Roblox\logs\cacert.pem"
set "SSL_CERT_FILE=C:\Users\DELL\AppData\Local\Roblox\logs\cacert.pem"
cd /d "C:\Program Files\Jarvis"
Jarvis.exe > "C:\Users\DELL\AppData\Local\Jarvis\run.log" 2>&1
