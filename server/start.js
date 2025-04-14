const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Create .env file if it doesn't exist
const envPath = path.join(__dirname, '.env');
const envContent = `PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/elearn
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development

# Email configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password`;

if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, envContent);
    console.log('.env file created successfully');
}

// Start the server
console.log('Starting server...');
console.log('Environment variables:');
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('NODE_ENV:', process.env.NODE_ENV);

const server = spawn('node', ['index.js'], {
    stdio: 'inherit',
    env: {
        ...process.env,
        PORT: '5000',
        MONGODB_URI: 'mongodb://127.0.0.1:27017/elearn',
        NODE_ENV: 'development'
    }
});

server.on('error', (err) => {
    console.error('Failed to start server:', err);
});

server.on('exit', (code, signal) => {
    if (code) console.log(`Server process exited with code ${code}`);
    if (signal) console.log(`Server process killed with signal ${signal}`);
});
