const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Paths
const SVG_DIR = path.join(__dirname, '../public/images');
const PNG_DIR = path.join(__dirname, '../public/images/png');

console.log('SVG Directory:', SVG_DIR);
console.log('PNG Directory:', PNG_DIR);

// Make sure the PNG directory exists
if (!fs.existsSync(PNG_DIR)) {
  fs.mkdirSync(PNG_DIR, { recursive: true });
  console.log('Created PNG directory');
}

// Install sharp if not already installed
try {
  console.log('Checking if sharp is installed...');
  require.resolve('sharp');
  console.log('sharp is already installed');
} catch (err) {
  console.log('Installing sharp package...');
  try {
    execSync('npm install sharp --save-dev', { stdio: 'inherit' });
    console.log('sharp installed successfully');
  } catch (error) {
    console.error('Failed to install sharp:', error.message);
    process.exit(1);
  }
}

// Get all SVG files
const svgFiles = fs.readdirSync(SVG_DIR)
  .filter(file => file.toLowerCase().endsWith('.svg'));

console.log(`Found ${svgFiles.length} SVG files to convert:`, svgFiles);

// Now that we're sure sharp is installed, require it
const sharp = require('sharp');

// Use a simpler approach with promises
const promises = svgFiles.map(svgFile => {
  const svgPath = path.join(SVG_DIR, svgFile);
  const pngFile = svgFile.replace('.svg', '.png');
  const pngPath = path.join(PNG_DIR, pngFile);
  
  console.log(`Converting ${svgFile} to PNG...`);
  
  // Read SVG file
  const svgBuffer = fs.readFileSync(svgPath);
  
  // Convert using sharp
  return sharp(svgBuffer)
    .resize(500) // Width of 500px (maintain aspect ratio)
    .png()
    .toFile(pngPath)
    .then(() => {
      console.log(`Successfully converted ${svgFile} to ${pngFile}`);
    })
    .catch(err => {
      console.error(`Error converting ${svgFile}:`, err);
    });
});

// Run all conversions
Promise.all(promises)
  .then(() => {
    console.log('All conversions completed');
    
    // List the generated PNG files
    const pngFiles = fs.readdirSync(PNG_DIR);
    console.log(`Generated ${pngFiles.length} PNG files:`, pngFiles);
  })
  .catch(err => {
    console.error('Error in conversion process:', err);
  }); 