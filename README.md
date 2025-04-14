# Learning Management System

A modern learning management system built with React, Node.js, and MongoDB.

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── context/      # React context providers
│   │   ├── hooks/        # Custom React hooks
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   └── styles/       # CSS styles
│   └── package.json
│
└── server/                # Backend Node.js application
    ├── config/           # Configuration files
    ├── controllers/      # Route controllers
    ├── middleware/       # Custom middleware
    ├── models/          # MongoDB models
    ├── routes/          # API routes
    ├── utils/           # Utility functions
    └── package.json
```

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd learning-management-system
```

2. Install server dependencies:
```bash
cd server
npm install
```

3. Install client dependencies:
```bash
cd ../client
npm install
```

## Configuration

1. Create a `.env` file in the server directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/lms
JWT_SECRET=your_jwt_secret
```

2. Create a `.env` file in the client directory:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## Running the Application

1. Start the MongoDB server:
```bash
mongod
```

2. Start the backend server:
```bash
cd server
npm run dev
```

3. Start the frontend development server:
```bash
cd client
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Preview the Application

1. Start both servers as described above
2. Open http://localhost:3000 in your browser
3. Register a new account or use these demo credentials:
   - Student: student@example.com / password123
   - Instructor: instructor@example.com / password123

## Key Features

- User authentication (students and instructors)
- Course management
- YouTube course integration
- Analytics dashboard
- Progress tracking
- Interactive learning interface

## Development

To run the application in Visual Studio Code:

1. Open the project folder in VS Code:
```bash
code .
```

2. Install recommended VS Code extensions:
   - ESLint
   - Prettier
   - ES7+ React/Redux/React-Native snippets

3. Use the integrated terminal to run the servers:
   - Terminal 1: `cd server && npm run dev`
   - Terminal 2: `cd client && npm start`

## Creating a ZIP Archive

To download all files as a ZIP:

1. Using command line:
```bash
# On Linux/Mac
zip -r lms-project.zip . -x "node_modules/*" "build/*" ".git/*"

# On Windows PowerShell
Compress-Archive -Path * -DestinationPath lms-project.zip -Force
```

2. Or using GUI:
   - Right-click the project folder
   - Select "Compress" or "Send to > Compressed folder"
   - Make sure to exclude node_modules and build directories

## Running in Local Visual Studio

1. Open Visual Studio
2. Select "Open a local folder"
3. Navigate to the project directory
4. Open the folder
5. Use the integrated terminal to run:
```bash
# Install dependencies
cd server && npm install
cd ../client && npm install

# Start the servers
cd ../server && npm run dev
cd ../client && npm start
```

## Troubleshooting

If you encounter any issues:

1. Port conflicts:
   - Change server port in server/.env
   - Change client port using `PORT=3001 npm start`

2. MongoDB connection:
   - Ensure MongoDB is running
   - Check connection string in server/.env

3. Dependencies issues:
   - Delete node_modules and package-lock.json
   - Run `npm install` again

For more help, check the documentation or raise an issue.
