const fs = require('fs');
const path = require('path');

// Create .env file content
const envContent = `PORT=5000
MONGODB_URI=mongodb+srv://chakri:chakri123@elearn.lfqldjo.mongodb.net/?retryWrites=true&w=majority&appName=elearn
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development

# Email configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password`;

// Path to .env file
const envPath = path.join(__dirname, '.env');

// Check if .env exists
if (!fs.existsSync(envPath)) {
    // Create .env file
    fs.writeFileSync(envPath, envContent, 'utf8');
    console.log('.env file created successfully');
} else {
    // Update existing .env file
    fs.writeFileSync(envPath, envContent, 'utf8');
    console.log('.env file updated successfully');
}

console.log('Environment setup complete. You can now run:');
console.log('npm run dev');
