const fs = require('fs');
const path = require('path');

const fileList = [
  'metadata.json',
  'openapi.json',
  'package.json',
  'tsconfig.json',
  'vite.config.ts',
  'supabase/migrations/0001_gatherum_schema.sql',
  'supabase/migrations/0002_realtime_counters.sql'
];

function getFiles(dir, extArray) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) { 
      results = results.concat(getFiles(fullPath, extArray));
    } else { 
      if (extArray.includes(path.extname(fullPath))) {
        results.push(fullPath);
      }
    }
  });
  return results;
}

const srcFiles = getFiles('src', ['.ts', '.tsx', '.css']);
fileList.push(...srcFiles);

let output = '# Gatherum Full Source Code\n\n';

fileList.forEach(f => {
  if (fs.existsSync(f)) {
    output += `## \`${f.replace(/\\/g, '/')}\`\n`;
    const ext = path.extname(f).slice(1);
    const lang = ext === 'tsx' ? 'tsx' : ext === 'ts' ? 'typescript' : ext === 'sql' ? 'sql' : ext === 'json' ? 'json' : '';
    output += `\`\`\`${lang}\n`;
    output += fs.readFileSync(f, 'utf8');
    output += `\n\`\`\`\n\n`;
  }
});

fs.writeFileSync('full_code.md', output);
console.log('full_code.md generated successfully');
