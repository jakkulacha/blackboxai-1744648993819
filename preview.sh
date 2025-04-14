#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting Learning Management System...${NC}"

# Check if MongoDB is running
echo -e "${BLUE}Checking MongoDB status...${NC}"
if ! mongod --version > /dev/null 2>&1; then
    echo -e "${RED}MongoDB is not installed. Please install MongoDB first.${NC}"
    exit 1
fi

# Create necessary directories if they don't exist
mkdir -p server/uploads
mkdir -p client/build

# Install dependencies
echo -e "${BLUE}Installing dependencies...${NC}"
echo -e "${GREEN}Installing server dependencies...${NC}"
cd server && npm install
echo -e "${GREEN}Installing client dependencies...${NC}"
cd ../client && npm install

# Create .env files if they don't exist
if [ ! -f "../server/.env" ]; then
    echo -e "${BLUE}Creating server .env file...${NC}"
    echo "PORT=5000
MONGODB_URI=mongodb://localhost:27017/lms
JWT_SECRET=your_secret_key" > ../server/.env
fi

if [ ! -f ".env" ]; then
    echo -e "${BLUE}Creating client .env file...${NC}"
    echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
fi

# Start the servers
echo -e "${BLUE}Starting the application...${NC}"
echo -e "${GREEN}Starting backend server...${NC}"
cd ../server && npm run dev &
SERVER_PID=$!

echo -e "${GREEN}Starting frontend server...${NC}"
cd ../client && npm start &
CLIENT_PID=$!

# Create a zip file of the project
echo -e "${BLUE}Creating project ZIP archive...${NC}"
cd ..
zip -r lms-project.zip . -x "node_modules/*" "*/node_modules/*" "build/*" "*/build/*" ".git/*" "*.zip"

echo -e "${GREEN}Project has been zipped to lms-project.zip${NC}"

# Wait for user input before closing
echo -e "${BLUE}Press any key to stop the servers and exit...${NC}"
read -n 1

# Kill the servers
kill $SERVER_PID
kill $CLIENT_PID

echo -e "${GREEN}Servers stopped. You can find the project ZIP at ./lms-project.zip${NC}"
