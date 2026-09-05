@echo off
setlocal
cd /d "%~dp0"

echo ==========================================================
echo  soclab - news boards patch
echo ==========================================================
echo  Folder: %CD%
echo.

where git >nul 2>nul
if errorlevel 1 (
  echo [ERROR] git was not found in PATH.
  goto :end
)

if not exist "soclab-news-boards.patch" (
  echo [ERROR] soclab-news-boards.patch not found in this folder.
  goto :end
)

if not exist "news.json" (
  echo [ERROR] news.json not found in this folder.
  goto :end
)

echo [1/2] Checking whether the patch applies cleanly...
git apply --check "soclab-news-boards.patch"
if errorlevel 1 (
  echo.
  echo [WARN] Plain check failed. Retrying with --3way ...
  git apply --3way "soclab-news-boards.patch"
  if errorlevel 1 (
    echo.
    echo [ERROR] The patch could not be applied. No file was changed.
    echo         Run "git status" and "git diff" to inspect local edits.
    goto :end
  )
  goto :done
)

echo [2/2] Applying the patch...
git apply "soclab-news-boards.patch"
if errorlevel 1 (
  echo.
  echo [ERROR] The patch failed while being applied.
  goto :end
)

:done
echo.
echo [OK] Patch applied successfully.
echo.
echo  Modified : index.html
echo             script.js
echo             style.css
echo             international-journals.html
echo             domestic-journals.html
echo  Added    : news.json  (453 items, already in this folder)
echo.
echo  Preview locally:
echo    python -m http.server 8000
echo    then open http://localhost:8000/index.html
echo.
echo  Publish:
echo    git add -A
echo    git commit -m "Split news into research/notice boards and rename journal tabs"
echo    git push

:end
echo.
pause
endlocal
