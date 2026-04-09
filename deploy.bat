@echo off
echo ============================================
echo   CPA Office - GitHub + Vercel Deploy
echo ============================================
echo.

:: Check git
git --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Git not found. Install from https://git-scm.com
    pause
    exit /b
)

:: Check node
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found. Install from https://nodejs.org
    pause
    exit /b
)

echo [1/5] Installing dependencies...
call npm install
if errorlevel 1 (
    echo [ERROR] npm install failed
    pause
    exit /b
)

echo.
echo [2/5] Initializing git repository...
git init
git add .
git commit -m "Initial commit: CPA Office platform"

echo.
echo [3/5] Creating GitHub repository...
:: Try GitHub CLI first
gh --version >nul 2>&1
if not errorlevel 1 (
    echo Using GitHub CLI...
    gh repo create cpa-office --private --source=. --push
    echo [OK] Repository created and pushed via GitHub CLI
    goto :vercel
)

:: Fallback: open GitHub and give instructions
echo GitHub CLI not found. Opening GitHub to create repo manually...
start https://github.com/new
echo.
echo ============================================
echo  MANUAL STEP NEEDED:
echo  1. On GitHub: name the repo "cpa-office"
echo  2. Click "Create repository"
echo  3. Copy the repo URL (e.g. https://github.com/aboadeeb10-arch/cpa-office.git)
echo  4. Come back here and press any key
echo ============================================
pause

set /p REPO_URL="Paste your GitHub repo URL: "
git remote add origin %REPO_URL%
git branch -M main
git push -u origin main
echo [OK] Code pushed to GitHub!

:vercel
echo.
echo [4/5] Opening Vercel to import the project...
start https://vercel.com/new/import?s=https://github.com/aboadeeb10-arch/cpa-office

echo.
echo [5/5] Done!
echo ============================================
echo  Next steps on Vercel:
echo  1. Select the "cpa-office" repository
echo  2. Framework: Next.js (auto-detected)
echo  3. Add Environment Variables:
echo     - DATABASE_URL  (from neon.tech)
echo     - JWT_SECRET    (any long random string)
echo     - BLOB_READ_WRITE_TOKEN  (from Vercel Storage)
echo     - SHIKLOLET_AGENT_SECRET (any random string)
echo  4. Click Deploy!
echo ============================================
echo.
pause
