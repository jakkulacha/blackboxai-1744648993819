@echo off
setlocal

echo Starting Learning Management System...

REM Check if MongoDB is installed
mongod --version >nul 2>&1
if errorlevel 1 (
    echo MongoDB is not installed. Please install MongoDB first.
    pause
    exit /b 1
)

REM Create necessary directories
mkdir server\uploads 2>nul
mkdir client\build 2>nul

REM Install dependencies
echo Installing dependencies...
cd server
call npm install
cd ..\client
call npm install

REM Create .env files if they don't exist
cd ..\server
if not exist .env (
    echo Creating server .env file...
    (
        echo PORT=5000
        echo MONGODB_URI=mongodb://localhost:27017/lms
        echo JWT_SECRET=your_secret_key
    ) > .env
)

cd ..\client
if not exist .env (
    echo Creating client .env file...
    echo REACT_APP_API_URL=http://localhost:5000/api > .env
)

REM Start the servers
echo Starting the application...
start "Backend Server" cmd /c "cd ..\server && npm run dev"
start "Frontend Server" cmd /c "cd ..\client && npm start"

REM Create ZIP file
echo Creating project ZIP archive...
cd ..
powershell Compress-Archive -Path * -DestinationPath lms-project.zip -Force -Exclude node_modules,*/node_modules,build,*/build,.git,*.zip

echo Project has been zipped to lms-project.zip

echo Servers are running. Press any key to stop the servers and exit...
pause >nul

REM Kill the servers
taskkill /F /IM node.exe >nul 2>&1

echo Servers stopped. You can find the project ZIP at ./lms-project.zip
pause
