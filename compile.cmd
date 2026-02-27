@echo off
setlocal enableextensions

cd /d "%~dp0"

where npm >nul 2>nul
if errorlevel 1 (
  echo ERRO: npm nao encontrado. Instale Node.js e npm.
  exit /b 1
)

if not exist "node_modules" (
  npm install
  if errorlevel 1 exit /b 1
)

npm run build
if errorlevel 1 exit /b 1

if not exist "dist" (
  echo ERRO: Pasta dist nao encontrada.
  exit /b 1
)

if not exist "site" mkdir "site"

robocopy "dist" "site" /MIR
set RC=%errorlevel%
if %RC% GEQ 8 (
  echo ERRO: Falha ao copiar arquivos para site.
  exit /b %RC%
)

if not exist "site\.htaccess" (
  > "site\.htaccess" (
    echo RewriteEngine On
    echo RewriteCond %%{REQUEST_FILENAME} !-f
    echo RewriteCond %%{REQUEST_FILENAME} !-d
    echo RewriteRule . /index.html [L]
    echo Header set X-Frame-Options "SAMEORIGIN"
    echo Header set X-XSS-Protection "1; mode=block"
    echo Header set X-Content-Type-Options "nosniff"
    echo ^<FilesMatch "^\\.env"^>
    echo   Require all denied
    echo ^</FilesMatch^>
    echo ^<FilesMatch "\.(js^|css^|png^|jpg^|jpeg^|gif^|ico^|svg^|woff^|woff2^|ttf^|eot)$"^>
    echo   Header set Cache-Control "max-age=31536000, public"
    echo ^</FilesMatch^>
  )
)

echo Compilacao concluida. Arquivos disponiveis em .\site
exit /b 0
