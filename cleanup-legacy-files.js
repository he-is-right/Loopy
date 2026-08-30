// Run this script from the project root: node cleanup-legacy-files.js
const fs = require('fs');
const path = require('path');

const filesToDelete = [
  // Legacy server tutorial files
  'server/server-node.js',
  'server/main.js',
  'server/math.js',
  // Legacy root HTML/CSS/JS (pre-React version)
  'index.html',
  'login.html',
  'signup.html',
  'dashboard.html',
  'feedback.html',
  'about.html',
  'main.css',
  'script.js',
  // Tutorial presentation artifacts
  'generate-presentation.js',
  'Loopy_Backend_Masterclass.pptx',
];

filesToDelete.forEach(f => {
  const fullPath = path.join(__dirname, f);
  try {
    fs.unlinkSync(fullPath);
    console.log('Deleted:', f);
  } catch (e) {
    if (e.code === 'ENOENT') {
      console.log('Already gone:', f);
    } else {
      console.log('Error:', f, e.message);
    }
  }
});

console.log('\nCleanup complete! You can now delete this script: cleanup-legacy-files.js');
