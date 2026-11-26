const fs = require('fs');
const path = require('path');

const sourceDir = 'src/assets';
const targetDir = 'dist/assets';

const copyFiles = (source, target) => {
  const files = fs.readdirSync(source);

  for (const file of files) {
    const sourcePath = path.join(source, file);
    const targetPath = path.join(target, file);

    if (fs.statSync(sourcePath).isDirectory()) {
      fs.mkdirSync(targetPath, { recursive: true });
      copyFiles(sourcePath, targetPath);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
  }
};

copyFiles(sourceDir, targetDir);
