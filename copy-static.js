// A more robust script to copy static files to the dist folder
import fs from 'fs';
import path from 'path';

const filesToCopy = [
  { source: './public/404.html', target: './dist/404.html' },
  { source: './public/robots.txt', target: './dist/robots.txt' },
  { source: './public/test.html', target: './dist/test.html' },
  { source: './public/standalone.html', target: './dist/standalone.html' }
];

// Create .nojekyll file directly in dist
const createNojekyll = () => {
  const nojekyllPath = './dist/.nojekyll';
  fs.writeFileSync(nojekyllPath, '');
  console.log('Created .nojekyll file in dist folder');
};

// Create dist directory if it doesn't exist
if (!fs.existsSync('./dist')) {
  fs.mkdirSync('./dist', { recursive: true });
}

// Copy each file using copyFileSync which is more reliable for binary files
filesToCopy.forEach(file => {
  if (fs.existsSync(file.source)) {
    // Use copyFileSync for more reliable copying
    fs.copyFileSync(file.source, file.target);
    
    // Verify the file was copied by checking its size
    const fileSize = fs.statSync(file.target).size;
    console.log(`Copied ${path.basename(file.source)} to dist folder (${fileSize} bytes)`);
    
    // Double check content
    const content = fs.readFileSync(file.target, 'utf8');
    if (content.length === 0) {
      console.error(`WARNING: ${file.target} appears to be empty!`);
    } else {
      console.log(`  Content verification: ${content.length} characters`);
    }
  } else {
    console.warn(`Warning: Source file ${file.source} does not exist, skipping`);
  }
});

// Create .nojekyll file
createNojekyll();

// Verify dist folder contents
console.log('\nVerifying dist folder contents:');
const distFiles = fs.readdirSync('./dist');
console.log(distFiles); 