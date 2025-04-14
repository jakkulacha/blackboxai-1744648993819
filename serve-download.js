const express = require('express');
const archiver = require('archiver');
const fs = require('fs');
const path = require('path');
const app = express();

// Serve static files
app.use(express.static(__dirname));

// Generate ZIP file
function generateZip() {
    const output = fs.createWriteStream(path.join(__dirname, 'lms-project.zip'));
    const archive = archiver('zip', {
        zlib: { level: 9 }
    });

    output.on('close', () => {
        console.log('ZIP file created successfully');
    });

    archive.on('error', (err) => {
        throw err;
    });

    archive.pipe(output);

    // Add files and directories
    const filesToExclude = [
        'node_modules',
        '.git',
        'build',
        'dist',
        'lms-project.zip'
    ];

    archive.glob('**/*', {
        ignore: filesToExclude.map(item => `**/${item}/**`),
        dot: true
    });

    archive.finalize();
}

// Generate ZIP on startup
generateZip();

// Start server
const port = 8000;
app.listen(port, () => {
    console.log(`
Download page is available at: http://localhost:${port}/download.html

1. Open the URL in your browser
2. Click "Download Project (ZIP)" to get all files
3. Follow the setup instructions in the README.md

Press Ctrl+C to stop the server
`);
});
