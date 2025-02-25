// A script to copy static files to the dist folder
import fs from 'fs';
import path from 'path';

const filesToCopy = [
  { source: './public/404.html', target: './dist/404.html' },
  { source: './public/robots.txt', target: './dist/robots.txt' },
  { source: './public/test.html', target: './dist/test.html' },
  { source: './public/standalone.html', target: './dist/standalone.html' },
  { source: './public/.nojekyll', target: './dist/.nojekyll' }
];

// Create dist directory if it doesn't exist
if (!fs.existsSync('./dist')) {
  fs.mkdirSync('./dist', { recursive: true });
}

// Copy each file
filesToCopy.forEach(file => {
  if (fs.existsSync(file.source)) {
    // Read the content of the source file
    const content = fs.readFileSync(file.source, 'utf8');
    
    // Write the content to the target file
    fs.writeFileSync(file.target, content);
    
    console.log(`Successfully copied ${path.basename(file.source)} to dist folder (${fs.statSync(file.target).size} bytes)`);
  } else {
    console.warn(`Warning: Source file ${file.source} does not exist, skipping`);
  }
}); 