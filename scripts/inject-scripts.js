const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const inject = `  <script src="js/lf-core.js"></script>\n  <script src="js/lf-ui.js"></script>\n`;

fs.readdirSync(root)
  .filter((f) => f.endsWith('.html'))
  .forEach((file) => {
    const filePath = path.join(root, file);
    let html = fs.readFileSync(filePath, 'utf8');
    if (!html.includes('</body>')) return;
    if (!html.includes('js/lf-core.js')) {
      html = html.replace('</body>', `${inject}</body>`);
    } else if (!html.includes('js/lf-ui.js')) {
      html = html.replace('js/lf-core.js"></script>', 'js/lf-core.js"></script>\n  <script src="js/lf-ui.js"></script>');
    } else {
      return;
    }
    fs.writeFileSync(filePath, html);
    console.log('Updated', file);
  });
