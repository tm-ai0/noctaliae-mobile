/**
 * 🔤 Font Size Bumper for Noctaliæ
 * - Cormorant titles: +2px
 * - Buttons SemiBold → Bold
 * Run: node bump-fonts.js
 */
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

// Files already bumped manually - skip to avoid double-bump
const SKIP_FILES = [
  'SettingsScreen.js',
  'AnimatedDreamCard.js', 
  'MarkdownText.js',
  'ConversationScreen.js',
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  const original = content;
  let changes = [];

  // 1. Bump Cormorant-Bold fontSize +2
  content = content.replace(
    /fontSize:\s*(\d+),([\s\r\n]+)fontFamily:\s*'CormorantUpright-Bold',/g,
    (match, size, ws) => {
      const newSize = parseInt(size) + 2;
      changes.push(`Cormorant ${size}→${newSize}`);
      return `fontSize: ${newSize},${ws}fontFamily: 'CormorantUpright-Bold',`;
    }
  );

  // 2. Bump Cormorant-SemiBold +2 AND upgrade to Bold
  content = content.replace(
    /fontSize:\s*(\d+),([\s\r\n]+)fontFamily:\s*'CormorantUpright-SemiBold',/g,
    (match, size, ws) => {
      const newSize = parseInt(size) + 2;
      changes.push(`CormorantSemi ${size}→${newSize} (→Bold)`);
      return `fontSize: ${newSize},${ws}fontFamily: 'CormorantUpright-Bold',`;
    }
  );

  // 3. Upgrade AtkinsonHyperlegibleNext-SemiBold → Bold
  const semiCount = (content.match(/AtkinsonHyperlegibleNext-SemiBold/g) || []).length;
  if (semiCount > 0) {
    content = content.replace(
      /fontFamily:\s*'AtkinsonHyperlegibleNext-SemiBold'/g,
      "fontFamily: 'AtkinsonHyperlegibleNext-Bold'"
    );
    changes.push(`${semiCount}x SemiBold→Bold`);
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✅ ${path.basename(filePath)}: ${changes.join(', ')}`);
    return true;
  }
  return false;
}

function walkDir(dir) {
  let count = 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.expo') {
      count += walkDir(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      if (SKIP_FILES.includes(entry.name)) {
        console.log(`⏭️  ${entry.name} (déjà bumpé manuellement)`);
        continue;
      }
      if (processFile(fullPath)) count++;
    }
  }
  return count;
}

console.log('🔤 Bumping Cormorant titles +2px & SemiBold→Bold...\n');
const total = walkDir(srcDir);
console.log(`\n🎉 ${total} fichiers modifiés`);
