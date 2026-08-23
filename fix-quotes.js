const fs = require('fs');
const file = 'app/exams/[examId]/introduction/page.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/\\"/g, '"');
fs.writeFileSync(file, content);
console.log('Done');
